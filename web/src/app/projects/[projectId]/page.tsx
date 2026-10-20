"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiError, projectApi, taskApi } from "@/lib/api";
import type { Project } from "@/types/project";
import type { Task, TaskStatus } from "@/types/task";

const columns: Array<{
  status: TaskStatus;
  label: string;
  color: string;
}> = [
  { status: "todo", label: "To Do", color: "bg-slate-100" },
  { status: "in_progress", label: "In Progress", color: "bg-blue-50" },
  { status: "done", label: "Done", color: "bg-emerald-50" },
];

export default function ProjectBoardPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = Number(params.projectId);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");

  useEffect(() => {
    async function loadBoard() {
      if (Number.isNaN(projectId)) {
        router.replace("/dashboard");
        return;
      }

      try {
        const [projectResponse, tasksResponse] = await Promise.all([
          projectApi.show(projectId),
          taskApi.list(projectId),
        ]);

        setProject(projectResponse.data);
        setTasks(tasksResponse.data);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/login");
          return;
        }

        if (error instanceof ApiError && error.status === 404) {
          setMessage("Project not found or you do not have access to it.");
          return;
        }

        setMessage("Unable to load this project.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadBoard();
  }, [projectId, router]);

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    setIsCreatingTask(true);
    setMessage("");

    try {
      const response = await taskApi.create(projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
      });

      setTasks((currentTasks) => [...currentTasks, response.data]);
      setTitle("");
      setDescription("");
      setStatus("todo");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.replace("/login");
        return;
      }

      setMessage("Unable to create the task. Please try again.");
    } finally {
      setIsCreatingTask(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading project board...
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-slate-700">
            {message || "Project could not be loaded."}
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-block rounded-lg bg-slate-900 px-4 py-2 font-medium text-white"
          >
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <Link className="text-sm font-medium text-indigo-600" href="/dashboard">
            ← Back to dashboard
          </Link>

          <div className="mt-4 flex items-start gap-3">
            <span
              className="mt-1 h-4 w-4 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {project.name}
              </h1>
              {project.description && (
                <p className="mt-2 text-slate-600">{project.description}</p>
              )}
            </div>
          </div>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Create task</h2>

          <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleCreateTask}>
            <label className="block text-sm font-medium text-slate-700">
              Task title
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                maxLength={150}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Create project wireframe"
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Status
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={status}
                onChange={(event) => setStatus(event.target.value as TaskStatus)}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700 md:col-span-2">
              Description <span className="font-normal text-slate-400">(optional)</span>
              <textarea
                className="mt-1 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                maxLength={3000}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add more context for this task."
              />
            </label>

            <div className="md:col-span-2">
              <button
                className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isCreatingTask || !title.trim()}
                type="submit"
              >
                {isCreatingTask ? "Creating task..." : "Create task"}
              </button>
            </div>
          </form>
        </section>

        {message && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {message}
          </p>
        )}

        <section className="grid gap-5 lg:grid-cols-3">
          {columns.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.status,
            );

            return (
              <div key={column.status} className={`rounded-2xl p-4 ${column.color}`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-800">{column.label}</h2>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-600">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {columnTasks.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-500">
                      No tasks yet.
                    </p>
                  ) : (
                    columnTasks.map((task) => (
                      <article key={task.id} className="rounded-xl bg-white p-4 shadow-sm">
                        <h3 className="font-medium text-slate-900">{task.title}</h3>
                        {task.description && (
                          <p className="mt-2 text-sm text-slate-600">
                            {task.description}
                          </p>
                        )}
                      </article>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </section>
    </main>
  );
}
