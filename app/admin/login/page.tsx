import { loginAction } from "@/lib/actions";

export const metadata = { title: "Admin login", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 p-4">
      <form action={loginAction} className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow">
        <h1 className="font-display text-2xl">Ethos Matrix admin</h1>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">Invalid email or password.</p>}
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input name="email" type="email" required autoComplete="username" className="a-input" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input name="password" type="password" required autoComplete="current-password" className="a-input" />
        </div>
        <button className="a-btn w-full" type="submit">Sign in</button>
      </form>
    </main>
  );
}
