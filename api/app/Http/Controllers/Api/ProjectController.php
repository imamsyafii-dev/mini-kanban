<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        return ProjectResource::collection(
            $request->user()->projects()->latest()->get()
        );
    }

    public function store(StoreProjectRequest $request)
    {
        $project = $request->user()->projects()->create($request->validated());

        return (new ProjectResource($project))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, Project $project): ProjectResource
    {
        $this->ensureOwner($request, $project);

        return new ProjectResource($project);
    }

    public function update(
        UpdateProjectRequest $request,
        Project $project,
    ): ProjectResource {
        $this->ensureOwner($request, $project);

        $project->update($request->validated());

        return new ProjectResource($project);
    }

    public function destroy(Request $request, Project $project)
    {
        $this->ensureOwner($request, $project);

        $project->delete();

        return response()->noContent();
    }

    private function ensureOwner(Request $request, Project $project): void
    {
        abort_unless($project->user_id === $request->user()->id, 404);
    }
}