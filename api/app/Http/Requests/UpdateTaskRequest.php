<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:3000'],
            'status' => ['sometimes', 'required', 'string', 'in:todo,in_progress,done'],
            'position' => ['sometimes', 'required', 'integer', 'min:0'],
            'due_date' => ['nullable', 'date'],
        ];
    }
}
