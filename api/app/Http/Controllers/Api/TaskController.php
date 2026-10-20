<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;


class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, Project $project)
    {
        $this->ensureProjectOwner($request, $project);

        return TaskResource::collection(
            $project->tasks()->orderBy('position')->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request, Project $project)
    {
        $this->ensureProjectOwner($request, $project);

        $attributes = $request->validated();
        $attributes['position'] = ((int) $project->tasks()->max('position')) + 1;

        $task = $project->tasks()->create($attributes);

        return (new TaskResource($task))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Task $task): TaskResource
    {
        $this->ensureTaskOwner($request, $task);

        return new TaskResource($task);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(
        UpdateTaskRequest $request,
        Task $task,
    ): TaskResource {
        $this->ensureTaskOwner($request, $task);

        $task->update($request->validated());

        return new TaskResource($task);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Task $task)
    {
        $this->ensureTaskOwner($request, $task);

        $task->delete();

        return response()->noContent();
    }

    private function ensureProjectOwner(Request $request, Project $project): void
    {
        abort_unless($project->user_id === $request->user()->id, 404);
    }

    private function ensureTaskOwner(Request $request, Task $task): void
    {
        $this->ensureProjectOwner($request, $task->project);
    }
}
