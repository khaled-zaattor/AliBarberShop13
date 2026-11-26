<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientIdentifier extends Model
{
    protected $fillable = [
        'client_id',
        'identifier_type',
        'normalized_identifier',
        'visit_count',
    ];

    protected function casts(): array
    {
        return [
            'visit_count' => 'integer',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
