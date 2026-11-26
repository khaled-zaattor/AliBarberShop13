<?php

use App\Services\ClientService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedInteger('visit_count')->default(0);
            $table->timestamp('first_booked_at')->nullable();
            $table->timestamps();
        });

        // Each phone/email a client has booked with, counted separately like before.
        Schema::create('client_identifiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->enum('identifier_type', ['phone', 'email']);
            $table->string('normalized_identifier');
            $table->unsignedInteger('visit_count')->default(0);
            $table->timestamps();

            $table->unique(['identifier_type', 'normalized_identifier'], 'client_identifiers_identifier_unique');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('client_id')->nullable()->after('id')
                  ->constrained('clients')->nullOnDelete();
            $table->boolean('is_new_customer')->nullable()->after('client_id');
        });

        // Backfill: every existing appointment gets a client; the oldest per client is "new".
        app(ClientService::class)->linkUnassignedAppointments();
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('client_id');
            $table->dropColumn('is_new_customer');
        });

        Schema::dropIfExists('client_identifiers');
        Schema::dropIfExists('clients');
    }
};
