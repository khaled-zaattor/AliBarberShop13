<?php

use App\Services\ClientService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Visit counts now live on the clients table.
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('client_visit_counts') && Schema::hasTable('counted_appointment_visits')) {
            app(ClientService::class)->importLegacyCounts(
                DB::table('counted_appointment_visits')->get(),
                DB::table('client_visit_counts')->get()
            );
        }

        Schema::dropIfExists('counted_appointment_visits');
        Schema::dropIfExists('client_visit_counts');
    }

    public function down(): void
    {
        Schema::create('client_visit_counts', function (Blueprint $table) {
            $table->id();
            $table->enum('identifier_type', ['phone', 'email']);
            $table->string('normalized_identifier');
            $table->unsignedInteger('visit_count')->default(0);
            $table->timestamp('last_calculated_at')->nullable();
            $table->timestamps();

            $table->unique(['identifier_type', 'normalized_identifier'], 'client_visit_counts_identifier_unique');
        });

        Schema::create('counted_appointment_visits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('source_appointment_id');
            $table->foreignId('client_visit_count_id')
                ->constrained('client_visit_counts')
                ->cascadeOnDelete();
            $table->enum('identifier_type', ['phone', 'email']);
            $table->string('normalized_identifier');
            $table->timestamp('counted_at');
            $table->timestamps();

            $table->unique(['source_appointment_id', 'identifier_type'], 'counted_appointment_visits_source_unique');
        });
    }
};
