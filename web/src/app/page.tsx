import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-indigo-600">Mini Kanban</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Organize your work with clarity.
        </h1>
        <p className="mt-4 text-slate-600">
          A project management app built with Laravel and Next.js.
        </p>

        <div className="mt-8 flex gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700"
          >
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}