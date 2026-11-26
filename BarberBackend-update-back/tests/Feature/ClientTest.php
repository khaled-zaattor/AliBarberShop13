<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\BusinessHour;
use App\Models\Client;
use App\Models\ClientIdentifier;
use App\Models\Service;
use App\Models\User;
use App\Services\ClientService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ClientTest extends TestCase
{
    use RefreshDatabase;

    private Barber $barber;

    private Service $service;

    private Carbon $date;

    protected function defineEnvironment($app): void
    {
        $app['config']->set('database.default', 'sqlite');
        $app['config']->set('database.connections.sqlite.database', ':memory:');
    }

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();

        $this->date = Carbon::today()->next(Carbon::TUESDAY);
        BusinessHour::create([
            'day_of_week' => $this->date->dayOfWeek,
            'open_time' => '08:00:00',
            'close_time' => '18:00:00',
            'is_closed' => false,
            'slot_duration' => 30,
        ]);

        $this->barber = Barber::create([
            'name' => 'Client Test Barber',
            'email' => 'client-barber@example.com',
            'is_active' => true,
        ]);
        $this->service = Service::create([
            'name' => 'Client Test Service',
            'price' => 30,
            'duration_minutes' => 30,
            'is_active' => true,
        ]);
        $this->barber->services()->attach($this->service);
    }

    public function test_first_booking_creates_new_client_and_repeat_booking_is_returning(): void
    {
        $this->book('10:00', 'Client@Example.com', '8135550100')
            ->assertCreated()
            ->assertJsonPath('data.is_new_customer', true);

        $this->book('11:00', 'client@example.com', '7275550199')
            ->assertCreated()
            ->assertJsonPath('data.is_new_customer', false);

        $this->assertSame(1, Client::count());
        $client = Client::firstOrFail();
        $this->assertSame(2, $client->visit_count);
        $this->assertSame(2, $this->identifierCount('email', 'client@example.com', $client));
        // A second phone on a returning client is kept and counted on its own.
        $this->assertSame(1, $this->identifierCount('phone', '+18135550100', $client));
        $this->assertSame(1, $this->identifierCount('phone', '+17275550199', $client));
        $this->assertSame(2, Appointment::where('client_id', $client->id)->count());
    }

    public function test_phone_and_email_totals_can_differ_like_before(): void
    {
        $this->book('10:00', 'same@example.com', '(813) 555-0100');
        $this->book('11:00', 'SAME@example.com', '813-555-0100');
        $this->book('12:00', 'different@example.com', '1 813 555 0100');
        Sanctum::actingAs(User::factory()->create(['role' => 'admin', 'is_active' => true]));

        $this->getJson('/api/admin/appointments')
            ->assertOk()
            ->assertJsonPath('data.data.0.phone_visit_count', 3)
            ->assertJsonPath('data.data.0.email_visit_count', 1)
            ->assertJsonPath('data.data.2.email_visit_count', 2);
    }

    public function test_same_phone_in_a_different_format_is_returning(): void
    {
        $this->book('10:00', 'first@example.com', '(813) 555-0100')
            ->assertJsonPath('data.is_new_customer', true);

        $this->book('11:00', 'second@example.com', '+1 813-555-0100')
            ->assertJsonPath('data.is_new_customer', false);

        $this->assertSame(1, Client::count());
    }

    public function test_cancel_lowers_and_reactivate_restores_visit_count(): void
    {
        $this->book('10:00', 'client@example.com', '8135550100');
        $this->book('11:00', 'client@example.com', '8135550100');
        $appointment = Appointment::orderBy('id')->firstOrFail();
        Sanctum::actingAs(User::factory()->create(['role' => 'admin', 'is_active' => true]));

        $this->putJson("/api/admin/appointments/{$appointment->id}", ['status' => 'cancelled'])
            ->assertOk()
            ->assertJsonPath('data.visit_count', 1)
            ->assertJsonPath('data.phone_visit_count', 1)
            ->assertJsonPath('data.email_visit_count', 1);

        $this->putJson("/api/admin/appointments/{$appointment->id}", ['status' => 'no_show'])
            ->assertJsonPath('data.visit_count', 1);

        $this->putJson("/api/admin/appointments/{$appointment->id}", ['status' => 'completed'])
            ->assertJsonPath('data.visit_count', 2)
            ->assertJsonPath('data.phone_visit_count', 2)
            ->assertJsonPath('data.email_visit_count', 2)
            ->assertJsonPath('data.is_new_customer', true);
    }

    public function test_deleting_appointments_keeps_visit_history(): void
    {
        $this->book('10:00', 'client@example.com', '8135550100');
        Appointment::query()->delete();

        $this->assertSame(1, Client::firstOrFail()->visit_count);
        $this->book('11:00', 'client@example.com', '8135550100')
            ->assertJsonPath('data.is_new_customer', false);
    }

    public function test_backfill_links_existing_appointments_oldest_first(): void
    {
        $first = $this->legacyAppointment('cancelled', '8135550100', 'old@example.com');
        $second = $this->legacyAppointment('completed', '813.555.0100', 'OLD@example.com');
        $third = $this->legacyAppointment('confirmed', '7275550100', 'other@example.com');
        $invalid = $this->legacyAppointment('completed', '555-010', 'not-an-email');

        $this->assertSame(3, app(ClientService::class)->linkUnassignedAppointments());

        $this->assertTrue($first->fresh()->is_new_customer);
        $this->assertFalse($second->fresh()->is_new_customer);
        $this->assertTrue($third->fresh()->is_new_customer);
        $this->assertNull($invalid->fresh()->client_id);
        $this->assertSame($first->fresh()->client_id, $second->fresh()->client_id);
        // Cancelled visits are not counted.
        $this->assertSame(1, $first->fresh()->client->visit_count);
        $this->assertSame(1, $third->fresh()->client->visit_count);
        // Running it again changes nothing.
        $this->assertSame(0, app(ClientService::class)->linkUnassignedAppointments());
    }

    public function test_legacy_counts_are_kept_including_deleted_appointments(): void
    {
        $kept = $this->legacyAppointment('completed', '8135550100', 'kept@example.com');
        app(ClientService::class)->linkUnassignedAppointments();

        // Old ledger: 3 visits for "kept" (2 deleted since), 2 for a client with no appointments left.
        $ledger = collect([
            (object) ['source_appointment_id' => $kept->id, 'identifier_type' => 'phone', 'normalized_identifier' => '+18135550100', 'counted_at' => '2026-08-01 10:00:00'],
            (object) ['source_appointment_id' => 900, 'identifier_type' => 'phone', 'normalized_identifier' => '+17275550100', 'counted_at' => '2026-07-01 10:00:00'],
            (object) ['source_appointment_id' => 900, 'identifier_type' => 'email', 'normalized_identifier' => 'gone@example.com', 'counted_at' => '2026-07-01 10:00:00'],
        ]);
        $summaries = collect([
            (object) ['identifier_type' => 'phone', 'normalized_identifier' => '+18135550100', 'visit_count' => 3],
            (object) ['identifier_type' => 'email', 'normalized_identifier' => 'kept@example.com', 'visit_count' => 1],
            (object) ['identifier_type' => 'phone', 'normalized_identifier' => '+17275550100', 'visit_count' => 2],
            (object) ['identifier_type' => 'email', 'normalized_identifier' => 'gone@example.com', 'visit_count' => 2],
        ]);

        app(ClientService::class)->importLegacyCounts($ledger, $summaries);

        $keptClient = $kept->fresh()->client;
        $this->assertSame(3, $this->identifierCount('phone', '+18135550100', $keptClient));
        $this->assertSame(1, $this->identifierCount('email', 'kept@example.com', $keptClient));
        $this->assertSame(3, $keptClient->visit_count);

        $goneClient = ClientIdentifier::where('normalized_identifier', 'gone@example.com')->firstOrFail()->client;
        $this->assertSame(2, $this->identifierCount('phone', '+17275550100', $goneClient));
        $this->assertSame(2, $goneClient->visit_count);
        $this->assertSame('2026-07-01', $goneClient->first_booked_at->toDateString());

        $this->book('10:00', 'gone@example.com', '7275550100')
            ->assertJsonPath('data.is_new_customer', false);
        $this->assertSame(3, $this->identifierCount('email', 'gone@example.com', $goneClient));
        $this->assertSame(3, $goneClient->fresh()->visit_count);
    }

    public function test_barber_cannot_sync_but_sees_counts_on_scoped_index(): void
    {
        $barberUser = User::factory()->create(['role' => 'barber', 'is_active' => true]);
        $this->barber->update(['user_id' => $barberUser->id]);
        $this->book('10:00', 'own@example.com', '8135550100');

        Sanctum::actingAs($barberUser);

        $this->postJson('/api/admin/appointments/sync-visit-counts')->assertForbidden();
        $this->getJson('/api/admin/appointments')
            ->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.visit_count', 1)
            ->assertJsonPath('data.data.0.phone_visit_count', 1)
            ->assertJsonPath('data.data.0.email_visit_count', 1)
            ->assertJsonPath('data.data.0.is_new_customer', true)
            ->assertJsonStructure(['data' => ['data' => [[
                'phone_visit_count_updated_at',
                'email_visit_count_updated_at',
            ]]]]);
    }

    public function test_sync_links_unassigned_appointments(): void
    {
        $this->legacyAppointment('completed', '8135550100', 'old@example.com');
        Sanctum::actingAs(User::factory()->create(['role' => 'receptionist', 'is_active' => true]));

        $this->postJson('/api/admin/appointments/sync-visit-counts')
            ->assertOk()
            ->assertJsonPath('data.linked_appointments', 1);
    }

    private function identifierCount(string $type, string $identifier, Client $client): int
    {
        return ClientIdentifier::where('client_id', $client->id)
            ->where('identifier_type', $type)
            ->where('normalized_identifier', $identifier)
            ->firstOrFail()
            ->visit_count;
    }

    private function book(string $time, string $email, string $phone)
    {
        return $this->postJson('/api/appointments', [
            'service_ids' => [$this->service->id],
            'barber_id' => $this->barber->id,
            'appointment_date' => $this->date->format('Y-m-d'),
            'appointment_time' => $time,
            'customer_name' => 'Client Test Customer',
            'customer_email' => $email,
            'customer_phone' => $phone,
        ]);
    }

    private function legacyAppointment(string $status, string $phone, string $email): Appointment
    {
        $sequence = Appointment::count() + 1;
        $appointment = new Appointment([
            'customer_name' => 'Legacy '.$sequence,
            'customer_email' => $email,
            'customer_phone' => $phone,
            'barber_id' => $this->barber->id,
            'appointment_date' => now()->addDays($sequence)->toDateString(),
            'appointment_time' => '09:00',
            'duration_minutes' => 30,
            'total_price' => 30,
            'status' => $status,
        ]);
        $appointment->service_id = $this->service->id;
        $appointment->save();

        return $appointment;
    }
}
