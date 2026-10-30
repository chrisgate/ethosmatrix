import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";

const NAV = [
  ["/admin", "Dashboard"],
  ["/admin/settings", "Site content"],
  ["/admin/projects", "Projects"],
  ["/admin/services", "Services"],
  ["/admin/gallery", "Gallery"],
  ["/admin/testimonials", "Testimonials"],
  ["/admin/media", "Media library"],
  ["/admin/appointments", "Appointments"],
];

export const metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-stone-100 text-ink md:flex">
      <aside className="bg-ink p-4 text-white md:min-h-screen md:w-60 md:shrink-0">
        <div className="mb-4 font-display text-xl">Ethos Matrix</div>
        <nav className="flex flex-wrap gap-1 md:flex-col">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="rounded px-3 py-2 text-sm hover:bg-white/10">{label}</Link>
          ))}
          <Link href="/" target="_blank" className="rounded px-3 py-2 text-sm text-gold hover:bg-white/10">View site ↗</Link>
        </nav>
        <form action={logoutAction} className="mt-4">
          <button className="rounded px-3 py-2 text-sm text-white/70 hover:bg-white/10">Sign out</button>
        </form>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
