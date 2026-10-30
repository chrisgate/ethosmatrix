import Link from "next/link";
import { q } from "@/lib/db";

type Latest = { id: number; name: string; email: string; project_type: string; status: string; created_at: Date };

export default async function Dashboard() {
  const [c] = await q<Record<string, string>>(`SELECT
    (SELECT count(*) FROM projects) AS projects,
    (SELECT count(*) FROM services) AS services,
    (SELECT count(DISTINCT image_id) FROM gallery) AS events,
    (SELECT count(*) FROM testimonials) AS testimonials,
    (SELECT count(*) FROM faqs) AS faqs,
    (SELECT count(*) FROM posts) AS posts,
    (SELECT count(*) FROM media) AS media,
    (SELECT count(*) FROM appointments WHERE status = 'new') AS fresh`);
  const latest = await q<Latest>("SELECT id, name, email, project_type, status, created_at FROM appointments ORDER BY created_at DESC LIMIT 5");

  const cards: [string, string, string][] = [
    ["New enquiries", c.fresh, "/admin/appointments"],
    ["Projects", c.projects, "/admin/projects"],
    ["Services", c.services, "/admin/services"],
    ["Blog articles", c.posts, "/admin/posts"],
    ["FAQs", c.faqs, "/admin/faqs"],
    ["Event photos", c.events, "/admin/gallery"],
    ["Testimonials", c.testimonials, "/admin/testimonials"],
    ["Media files", c.media, "/admin/media"],
  ];
  const actions: [string, string][] = [
    ["+ New project", "/admin/projects/new"],
    ["+ New article", "/admin/posts/new"],
    ["Edit site content", "/admin/settings"],
    ["Upload photos", "/admin/media"],
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-4xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-stone-600">Everything on the website is edited from here. Changes go live as soon as you save.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {actions.map(([label, href]) => <Link key={href} href={href} className="a-btn">{label}</Link>)}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([label, n, href], i) => (
          <Link key={label} href={href} className={`rounded-lg p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow ${i === 0 && Number(n) > 0 ? "bg-gold text-white" : "bg-white"}`}>
            <div className="text-3xl font-semibold">{n}</div>
            <div className={`text-sm ${i === 0 && Number(n) > 0 ? "text-white/85" : "text-stone-600"}`}>{label}</div>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Latest enquiries</h2>
          <Link href="/admin/appointments" className="text-sm font-medium text-gold-dark hover:underline">View all</Link>
        </div>
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          {latest.map((a) => (
            <Link key={a.id} href="/admin/appointments" className="flex items-center justify-between gap-4 border-b px-5 py-3 text-sm last:border-0 hover:bg-stone-50">
              <div className="min-w-0">
                <div className="truncate font-medium">{a.name} <span className="font-normal text-stone-500">· {a.email}</span></div>
                {a.project_type && <div className="text-xs text-stone-500">{a.project_type}</div>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${a.status === "new" ? "bg-gold/15 text-gold-dark" : "bg-stone-100 text-stone-600"}`}>{a.status}</span>
                <span className="text-xs text-stone-500">{new Date(a.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
              </div>
            </Link>
          ))}
          {!latest.length && <p className="px-5 py-8 text-center text-sm text-stone-500">No enquiries yet. They will appear here when someone uses the quote or contact form.</p>}
        </div>
      </section>
    </div>
  );
}
