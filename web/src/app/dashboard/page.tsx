"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, authApi, projectApi } from "@/lib/api";
import type { AuthUser } from "@/types/auth";
import type { Project } from "@/types/project";

const projectColors = ["#4F46E5", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444"];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(projectColors[0]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [userResponse, projectsResponse] = await Promise.all([
          authApi.me(),
          projectApi.list(),
        ]);

        setUser(userResponse.user);
        setProjects(projectsResponse.data);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/login");
          return;
        }

        setMessage("Unable to load your workspace.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, [router]);

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    setIsCreatingProject(true);
    setMessage("");

    try {
      const response = await projectApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });

      setProjects((currentProjects) => [response.data, ...currentProjects]);
      setName("");
      setDescription("");
      setColor(projectColors[0]);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.replace("/login");
        return;
      }

      setMessage("Unable to create the project. Please try again.");
    } finally {
      setIsCreatingProject(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    setMessage("");

    try {
      await authApi.logout();
      router.replace("/login");
      router.refresh();
    } catch {
      setMessage("Unable to sign out. Please try again.");
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading your workspace...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-start justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-indigo-600">Mini Kanban</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              Welcome, {user?.name}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
          </div>

          <button
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
            disabled={isLoggingOut}
            onClick={handleLogout}
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Create a project
          </h2>

          <form
            className="mt-4 grid gap-4 md:grid-cols-2"
            onSubmit={handleCreateProject}
          >
            <label className="block text-sm font-medium text-slate-700">
              Project name
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Personal portfolio"
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Color
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={color}
                onChange={(event) => setColor(event.target.value)}
              >
                {projectColors.map((projectColor) => (
                  <option key={projectColor} value={projectColor}>
                    {projectColor}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700 md:col-span-2">
              Description <span className="font-normal text-slate-400">(optional)</span>
              <textarea
                className="mt-1 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                maxLength={2000}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What is this project about?"
              />
            </label>

            <div className="md:col-span-2">
              <button
                className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isCreatingProject || !name.trim()}
                type="submit"
              >
                {isCreatingProject ? "Creating project..." : "Create project"}
              </button>
            </div>
          </form>
        </section>

        {message && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {message}
          </p>
        )}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Your projects</h2>
            <span className="text-sm text-slate-500">{projects.length} total</span>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              You do not have any projects yet. Create your first project above.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  style={{ borderTop: `4px solid ${project.color}` }}
                >
                  <h3 className="font-semibold text-slate-900">{project.name}</h3>
                  <p className="mt-2 min-h-10 text-sm text-slate-600">
                    {project.description || "No description yet."}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
