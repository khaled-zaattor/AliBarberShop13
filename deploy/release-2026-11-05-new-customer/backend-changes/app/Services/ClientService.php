<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\ClientIdentifier;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ClientService
{
    /** Appointment statuses that count as a client visit. */
    public const COUNTED_STATUSES = ['pending', 'confirmed', 'completed'];

    public function __construct(
        private readonly ClientIdentifierNormalizer $normalizer
    ) {}

    /**
     * Find the client owning this email or phone, or create one. A client is
     * "new" only when no earlier booking exists for either identifier.
     *
     * @return array{client: ?Client, is_new: bool}
     */
    public function resolveForBooking(
        string $name,
        ?string $email,
        ?string $phone,
        ?CarbonInterface $bookedAt = null
    ): array {
        $identifiers = $this->identifiersFor($email, $phone);

        if ($identifiers === []) {
            return ['client' => null, 'is_new' => true];
        }

        $existing = $this->findExisting($identifiers);

        if ($existing) {
            $this->addMissingIdentifiers($existing, $identifiers);

            return ['client' => $existing, 'is_new' => false];
        }

        try {
            // Savepoint so a concurrent duplicate does not abort the outer booking transaction.
            $client = DB::transaction(function () use ($name, $identifiers, $bookedAt) {
                $client = Client::create([
                    'name'            => $name,
                    'first_booked_at' => $bookedAt ?? now(),
                ]);

                foreach ($identifiers as $type => $identifier) {
                    $client->identifiers()->create([
                        'identifier_type'       => $type,
                        'normalized_identifier' => $identifier,
                    ]);
                }

                return $client;
            });
        } catch (UniqueConstraintViolationException) {
            $existing = $this->findExisting($identifiers);
            $this->addMissingIdentifiers($existing, $identifiers);

            return ['client' => $existing, 'is_new' => false];
        }

        return ['client' => $client, 'is_new' => true];
    }

    /**
     * Count a newly created appointment toward its client's visits.
     */
    public function recordBooking(Appointment $appointment): void
    {
        $this->adjustVisitCounts($appointment, $this->isCounted($appointment->status) ? 1 : 0);
    }

    /**
     * Keep the visit counts in step when an appointment moves between counted
     * and uncounted statuses (e.g. cancelled, no_show, re-activated).
     */
    public function recordStatusChange(Appointment $appointment, string $previousStatus): void
    {
        $delta = (int) $this->isCounted($appointment->status) - (int) $this->isCounted($previousStatus);

        $this->adjustVisitCounts($appointment, $delta);
    }

    /**
     * Attach every appointment without a client, oldest first, so the first
     * booking per client is flagged as new and counted visits are added.
     */
    public function linkUnassignedAppointments(): int
    {
        $linked = 0;

        Appointment::query()
            ->whereNull('client_id')
            ->orderBy('id')
            ->chunkById(200, function (EloquentCollection $appointments) use (&$linked) {
                foreach ($appointments as $appointment) {
                    DB::transaction(function () use ($appointment, &$linked) {
                        ['client' => $client, 'is_new' => $isNew] = $this->resolveForBooking(
                            $appointment->customer_name,
                            $appointment->customer_email,
                            $appointment->customer_phone,
                            $appointment->created_at
                        );

                        if (! $client) {
                            return;
                        }

                        $appointment->forceFill([
                            'client_id'       => $client->id,
                            'is_new_customer' => $isNew,
                        ])->saveQuietly();
                        $this->recordBooking($appointment);
                        $linked++;
                    });
                }
            });

        return $linked;
    }

    /**
     * Carry counts over from the retired client_visit_counts ledger. Visits whose
     * appointments were deleted only exist there, so each count keeps the higher
     * of the two values, and clients whose appointments are all gone get recreated.
     *
     * @param  Collection  $ledger  counted_appointment_visits rows
     * @param  Collection  $summaries  client_visit_counts rows
     */
    public function importLegacyCounts(Collection $ledger, Collection $summaries): void
    {
        DB::transaction(function () use ($ledger, $summaries) {
            $existingIds = Appointment::pluck('id')->flip();

            $ledger
                ->reject(fn ($row) => $existingIds->has($row->source_appointment_id))
                ->sortBy('source_appointment_id')
                ->groupBy('source_appointment_id')
                ->each(function (Collection $rows) {
                    $email = $rows->firstWhere('identifier_type', 'email')?->normalized_identifier;
                    $phone = $rows->firstWhere('identifier_type', 'phone')?->normalized_identifier;

                    $this->resolveForBooking(
                        $email ?? $phone,
                        $email,
                        $phone,
                        Carbon::parse($rows->min('counted_at'))
                    );
                });

            foreach ($summaries as $summary) {
                $identifier = ClientIdentifier::with('client')
                    ->where('identifier_type', $summary->identifier_type)
                    ->where('normalized_identifier', $summary->normalized_identifier)
                    ->first();

                if (! $identifier) {
                    continue;
                }

                $identifier->update(['visit_count' => max($identifier->visit_count, (int) $summary->visit_count)]);
                $identifier->client->update([
                    'visit_count' => max($identifier->client->visit_count, (int) $summary->visit_count),
                ]);
            }
        });
    }

    /**
     * Set phone_visit_count / email_visit_count on each appointment from the
     * stored count for that phone or email.
     */
    public function attachVisitCounts(Collection $appointments): void
    {
        if ($appointments->isEmpty()) {
            return;
        }

        $normalized = $appointments->mapWithKeys(fn (Appointment $appointment) => [
            $appointment->id => $this->identifiersFor($appointment->customer_email, $appointment->customer_phone),
        ]);

        $phones = $normalized->pluck('phone')->filter()->unique()->values();
        $emails = $normalized->pluck('email')->filter()->unique()->values();

        $counts = ClientIdentifier::query()
            ->where(fn ($query) => $query->where('identifier_type', 'phone')->whereIn('normalized_identifier', $phones))
            ->orWhere(fn ($query) => $query->where('identifier_type', 'email')->whereIn('normalized_identifier', $emails))
            ->get()
            ->keyBy(fn (ClientIdentifier $row) => $row->identifier_type.'|'.$row->normalized_identifier);

        foreach ($appointments as $appointment) {
            foreach (['phone', 'email'] as $type) {
                $identifier = $normalized[$appointment->id][$type] ?? null;
                $row = $identifier === null ? null : $counts->get($type.'|'.$identifier);

                $appointment->setAttribute(
                    "{$type}_visit_count",
                    $identifier === null ? null : ($row?->visit_count ?? 0)
                );
                $appointment->setAttribute("{$type}_visit_count_updated_at", $row?->updated_at);
            }
        }
    }

    /**
     * @return array<string, string> valid normalized identifiers keyed by type, email first
     */
    private function identifiersFor(?string $email, ?string $phone): array
    {
        return array_filter([
            'email' => $this->normalizer->email($email),
            'phone' => $this->normalizer->phone($phone),
        ]);
    }

    private function findExisting(array $identifiers): ?Client
    {
        $matches = ClientIdentifier::query()
            ->where(function ($query) use ($identifiers) {
                foreach ($identifiers as $type => $identifier) {
                    $query->orWhere(fn ($q) => $q->where('identifier_type', $type)->where('normalized_identifier', $identifier));
                }
            })
            ->lockForUpdate()
            ->get();

        // When email and phone point at different clients, the email match wins.
        $match = $matches->firstWhere('identifier_type', 'email') ?? $matches->first();

        return $match?->client;
    }

    /**
     * Give the client any phone/email it booked with that no client owns yet,
     * so that identifier gets its own count.
     */
    private function addMissingIdentifiers(Client $client, array $identifiers): void
    {
        $now = now();

        foreach ($identifiers as $type => $identifier) {
            ClientIdentifier::query()->insertOrIgnore([
                'client_id'             => $client->id,
                'identifier_type'       => $type,
                'normalized_identifier' => $identifier,
                'visit_count'           => 0,
                'created_at'            => $now,
                'updated_at'            => $now,
            ]);
        }
    }

    private function adjustVisitCounts(Appointment $appointment, int $delta): void
    {
        if ($delta === 0) {
            return;
        }

        if ($appointment->client_id !== null) {
            $this->applyDelta(Client::whereKey($appointment->client_id), $delta);
        }

        foreach ($this->identifiersFor($appointment->customer_email, $appointment->customer_phone) as $type => $identifier) {
            $this->applyDelta(
                ClientIdentifier::where('identifier_type', $type)->where('normalized_identifier', $identifier),
                $delta
            );
        }
    }

    private function applyDelta(Builder $query, int $delta): void
    {
        $delta > 0
            ? $query->increment('visit_count', $delta)
            : $query->where('visit_count', '>', 0)->decrement('visit_count', -$delta);
    }

    private function isCounted(string $status): bool
    {
        return in_array($status, self::COUNTED_STATUSES, true);
    }
}
