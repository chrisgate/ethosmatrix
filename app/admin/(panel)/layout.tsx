import { AdminSidebar } from "@/components/admin/AdminSidebar";
import type { NavGroup } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { q } from "@/lib/db";

export const metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [{ n: fresh }] = await q<{ n: number }>("SELECT count(*)::int AS n FROM appointments WHERE status = 'new'");

  const groups: NavGroup[] = [
    { title: "Overview", items: [{ href: "/admin", label: "Dashboard" }] },
    {
      title: "Site",
      items: [
        { href: "/admin/settings", label: "Site content" },
        { href: "/admin/slides", label: "Hero slides" },
        { href: "/admin/services", label: "Services" },
        { href: "/admin/stats", label: "Stats counters" },
        { href: "/admin/steps", label: "How we work" },
        { href: "/admin/faqs", label: "FAQs" },
      ],
    },
    {
      title: "Portfolio",
      items: [
        { href: "/admin/projects", label: "Projects" },
        { href: "/admin/gallery", label: "Event photos" },
        { href: "/admin/clients", label: "Client logos" },
        { href: "/admin/testimonials", label: "Testimonials" },
      ],
    },
    { title: "Blog", items: [{ href: "/admin/posts", label: "Blog articles" }] },
    { title: "Files", items: [{ href: "/admin/media", label: "Media library" }] },
    { title: "Leads", items: [{ href: "/admin/appointments", label: "Enquiries", badge: fresh }] },
  ];

  return (
    <div className="min-h-screen bg-stone-100 text-ink md:flex">
      <AdminSidebar groups={groups} />
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
