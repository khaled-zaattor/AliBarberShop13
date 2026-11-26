<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    protected $fillable = [
        'name',
        'visit_count',
        'first_booked_at',
    ];

    protected function casts(): array
    {
        return [
            'visit_count'     => 'integer',
            'first_booked_at' => 'datetime',
        ];
    }

    public function identifiers(): HasMany
    {
        return $this->hasMany(ClientIdentifier::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }
}
