import Image from "next/image";
import { loginAction } from "@/lib/actions";
import { getMedia, getSettings } from "@/lib/content";

export const metadata = { title: "Admin login", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const logo = await getMedia((await getSettings()).logo_id).catch(() => null);
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,#2a2418,#0b0b0b_70%)] p-4">
      <form action={loginAction} className="w-full max-w-sm space-y-5 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          {logo ? (
            <span className="mx-auto mb-3 inline-flex rounded-lg bg-black px-4 py-3">
              <Image src={`/media/${logo.filename}`} alt="Ethos Matrix" width={144} height={41} className="h-[41px] w-auto" priority />
            </span>
          ) : (
            <h1 className="font-display text-3xl font-semibold">Ethos Matrix</h1>
          )}
          <p className="text-sm text-stone-500">Sign in to manage your website</p>
        </div>
        {error && <p className="rounded bg-red-50 p-2.5 text-center text-sm text-red-700">Invalid email or password.</p>}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" required autoComplete="username" className="a-input" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="a-input" />
        </div>
        <button className="w-full rounded-md bg-gold py-2.5 text-sm font-semibold text-white transition hover:bg-gold-dark" type="submit">Sign in</button>
      </form>
    </main>
  );
}
