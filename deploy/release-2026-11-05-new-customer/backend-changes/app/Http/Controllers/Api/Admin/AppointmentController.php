<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Admin\Concerns\ResolvesAuthBarber;
use App\Http\Requests\UpdateAppointmentRequest;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Models\Barber;
use App\Services\AvailabilityService;
use App\Services\AppointmentService;
use App\Services\ClientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;

class AppointmentController extends Controller
{
    use ResolvesAuthBarber;

    public function __construct(
        private readonly AppointmentService $appointmentService,
        private readonly ClientService $clientService,
        private readonly AvailabilityService $availabilityService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Appointment::with(['barber', 'service', 'services', 'client'])
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc');

        // Barber role: restrict to own appointments only
        $authBarber = $this->authBarber();
        if ($authBarber) {
            $query->where('barber_id', $authBarber->id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->filled('date')) {
            $query->where('appointment_date', $request->date);
        }

        // Filter by barber (admin/receptionist only — barber is already locked above)
        if (!$authBarber && $request->filled('barber_id')) {
            $query->where('barber_id', $request->barber_id);
        }

        // Filter by customer email
        if ($request->filled('email')) {
            $query->where('customer_email', 'like', '%' . $request->email . '%');
        }

        // Filter by service
        if ($request->filled('service_id')) {
            $query->where(function ($q) use ($request) {
                $q->where('service_id', $request->service_id)
                    ->orWhereHas('services', fn ($services) => $services->where('services.id', $request->service_id));
            });
        }

        // Search by customer name or phone
        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('customer_name', 'like', $term)
                  ->orWhere('customer_phone', 'like', $term);
            });
        }

        $appointments = $query->paginate(15);
        $this->clientService->attachVisitCounts($appointments->getCollection());

        return response()->json([
            'success' => true,
            'data'    => AppointmentResource::collection($appointments)->response()->getData(true),
        ]);
    }

    public function syncVisitCounts(): JsonResponse
    {
        // Visit counts update live; this links any appointment still missing a client.
        $linked = $this->clientService->linkUnassignedAppointments();

        return response()->json([
            'success' => true,
            'message' => 'Client visit counts updated successfully.',
            'data' => [
                'linked_appointments' => $linked,
                'calculated_at'       => now()->toISOString(),
            ],
        ]);
    }

    public function show(Appointment $appointment): JsonResponse
    {
        if ($this->isBarberRole()) {
            $authBarber = $this->authBarber();
            abort_if(!$authBarber || $appointment->barber_id !== $authBarber->id, 403, 'Forbidden.');
        }

        $appointment->load(['barber', 'service', 'services', 'client', 'followUps']);
        $this->clientService->attachVisitCounts(collect([$appointment]));

        return response()->json([
            'success' => true,
            'data'    => new AppointmentResource($appointment),
        ]);
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): JsonResponse
    {
        if ($this->isBarberRole()) {
            $authBarber = $this->authBarber();
            abort_if(!$authBarber || $appointment->barber_id !== $authBarber->id, 403, 'Forbidden.');
        }

        $data = $request->validated();

        // Handle status transitions
        if (isset($data['status'])) {
            if ($data['status'] === 'completed' && !$appointment->completed_at) {
                $data['completed_at'] = now();
            }

            if ($data['status'] === 'confirmed' && $request->boolean('check_in')) {
                $data['checked_in_at'] = now();
            }
        }

        DB::transaction(function () use ($appointment, $data) {
            $barberId = (int) ($data['barber_id'] ?? $appointment->barber_id);
            Barber::whereKey($barberId)->lockForUpdate()->firstOrFail();
            $appointment->refresh();
            $inactiveStatuses = ['cancelled', 'no_show'];
            $willBeActive = !in_array($data['status'] ?? $appointment->status, $inactiveStatuses, true);
            $needsAvailabilityCheck = $willBeActive && (
                $barberId !== (int) $appointment->barber_id ||
                in_array($appointment->status, $inactiveStatuses, true)
            );

            if ($needsAvailabilityCheck && !$this->availabilityService->isSlotAvailable(
                $barberId,
                $appointment->appointment_date->format('Y-m-d'),
                $appointment->appointment_time,
                $appointment->duration_minutes,
                $appointment->id
            )) {
                throw new HttpResponseException(response()->json([
                    'success' => false,
                    'message' => 'The selected barber is not available at this appointment time.',
                ], 409));
            }

            $previousStatus = $appointment->status;
            $appointment->update($data);
            $this->clientService->recordStatusChange($appointment, $previousStatus);
        }, 3);
        $appointment->load(['barber', 'service', 'services', 'client']);
        $this->clientService->attachVisitCounts(collect([$appointment]));

        return response()->json([
            'success' => true,
            'message' => 'Appointment updated successfully.',
            'data'    => new AppointmentResource($appointment),
        ]);
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        if ($this->isBarberRole()) {
            $authBarber = $this->authBarber();
            abort_if(!$authBarber || $appointment->barber_id !== $authBarber->id, 403, 'Forbidden.');
        }

        $appointment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Appointment deleted successfully.',
        ]);
    }

    public function bulkDeleteOld(): JsonResponse
    {
        $count = Appointment::whereDate('appointment_date', '<', now()->toDateString())->delete();

        return response()->json([
            'success' => true,
            'message' => "Deleted {$count} past appointment(s).",
            'count'   => $count,
        ]);
    }
}
