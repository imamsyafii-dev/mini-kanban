"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, authApi } from "@/lib/api";
import type { AuthUser } from "@/types/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await authApi.me();
        setUser(response.user);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/login");
          return;
        }

        setMessage("Unable to load your profile.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadUser();
  }, [router]);

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
      <section className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-600">Mini Kanban</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              Welcome, {user?.name}
            </h1>
            <p className="mt-2 text-slate-600">{user?.email}</p>
          </div>

          <button
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
            disabled={isLoggingOut}
            onClick={handleLogout}
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>

        {message && (
          <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {message}
          </p>
        )}

        <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          Your projects and Kanban board will appear here.
        </div>
      </section>
    </main>
  );
}