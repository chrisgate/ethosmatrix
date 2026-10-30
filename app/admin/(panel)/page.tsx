import Link from "next/link";
import { q } from "@/lib/db";

export default async function Dashboard() {
  const [c] = await q<Record<string, string>>(`SELECT
    (SELECT count(*) FROM projects) AS projects,
    (SELECT count(*) FROM services) AS services,
    (SELECT count(*) FROM gallery) AS gallery,
    (SELECT count(*) FROM testimonials) AS testimonials,
    (SELECT count(*) FROM media) AS media,
    (SELECT count(*) FROM appointments WHERE status = 'new') AS appointments`);
  const cards: [string, string, string][] = [
    ["Projects", c.projects, "/admin/projects"],
    ["Services", c.services, "/admin/services"],
    ["Gallery images", c.gallery, "/admin/gallery"],
    ["Testimonials", c.testimonials, "/admin/testimonials"],
    ["Media files", c.media, "/admin/media"],
    ["New appointments", c.appointments, "/admin/appointments"],
  ];
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map(([label, n, href]) => (
          <Link key={label} href={href} className="rounded-lg bg-white p-5 shadow-sm hover:shadow">
            <div className="text-3xl font-semibold">{n}</div>
            <div className="text-sm text-stone-600">{label}</div>
          </Link>
        ))}
      </div>
      <p className="mt-8 max-w-xl text-sm text-stone-600">
        Use <b>Site content</b> to edit the home page, about text, leadership message and contact details. Upload
        images from any form or from the Media library.
      </p>
    </div>
  );
}
