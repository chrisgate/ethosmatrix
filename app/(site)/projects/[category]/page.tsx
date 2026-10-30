import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBanner } from "@/components/PageBanner";
import { ProjectCard } from "@/components/ProjectCard";
import {
  CATEGORIES, CATEGORY_IMAGE_KEY, categorySlug, getMedia, getProjectFacets, getProjects, getSettings,
} from "@/lib/content";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ category?: string; location?: string; year?: string; status?: string }>;
};

const find = (slug: string) => CATEGORIES.find((c) => categorySlug(c) === slug);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).category;
  if (slug === "all") return { title: "All Projects", description: "Browse every Ethos Matrix project by category, location and year." };
  const c = find(slug);
  return c ? { title: c, description: `${c} projects by Ethos Matrix.` } : {};
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const slug = (await params).category;
  const sp = await searchParams;
  const isAll = slug === "all";
  const fixed = isAll ? undefined : find(slug);
  if (!isAll && !fixed) notFound();

  // On "All projects" the category itself is a filter.
  const category = fixed ?? CATEGORIES.find((c) => categorySlug(c) === sp.category);
  const s = await getSettings();
  const [projects, facets, banner] = await Promise.all([
    getProjects({ category, location: sp.location, year: sp.year, status: sp.status }),
    getProjectFacets(fixed),
    getMedia(fixed ? s[CATEGORY_IMAGE_KEY[fixed]] : s.banner_projects_id),
  ]);
  const filtered = Boolean(sp.location || sp.year || sp.status || (isAll && sp.category));
  const select = "w-full border border-black/15 bg-white px-3 py-2.5 font-quicksand text-sm text-[#333] focus:border-gold focus:outline-none";

  return (
    <>
      <PageBanner
        title={fixed ?? "All Projects"}
        image={banner?.filename}
        crumbs={[{ label: "Home", href: "/" }, ...(fixed ? [{ label: "All Projects", href: "/projects/all" }] : [{ label: "Projects", href: "/projects" }, { label: "All Projects" }])]}
      />
      <section className="bg-white pb-20 pt-6">
        <form method="get" className="mx-auto mb-8 grid max-w-[1140px] gap-3 px-5 sm:grid-cols-2 lg:grid-cols-[repeat(4,1fr)_auto]">
          {isAll && (
            <select name="category" defaultValue={sp.category ?? ""} className={select} aria-label="Category">
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={categorySlug(c)}>{c}</option>)}
            </select>
          )}
          {facets.locations.length > 0 && (
            <select name="location" defaultValue={sp.location ?? ""} className={select} aria-label="Location">
              <option value="">Any location</option>
              {facets.locations.map((l) => <option key={l}>{l}</option>)}
            </select>
          )}
          {facets.years.length > 0 && (
            <select name="year" defaultValue={sp.year ?? ""} className={select} aria-label="Year">
              <option value="">Any year</option>
              {facets.years.map((y) => <option key={y}>{y}</option>)}
            </select>
          )}
          {facets.statuses.length > 0 && (
            <select name="status" defaultValue={sp.status ?? ""} className={select} aria-label="Status">
              <option value="">Any status</option>
              {facets.statuses.map((st) => <option key={st}>{st}</option>)}
            </select>
          )}
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-[#161616] px-5 py-2.5 font-montserrat text-[11px] font-bold uppercase tracking-[.16em] text-white hover:bg-black">Filter</button>
            {filtered && <Link href={`/projects/${slug}`} className="flex items-center px-3 font-quicksand text-sm text-gold-dark hover:underline">Reset</Link>}
          </div>
        </form>

        <p className="mx-auto mb-5 max-w-[1140px] px-5 font-quicksand text-sm text-[#777]">{projects.length} {projects.length === 1 ? "project" : "projects"}</p>
        <div className="mx-auto grid max-w-[1140px] gap-6 px-5 md:grid-cols-2">
          {projects.map((p) => <ProjectCard key={p.id} p={p} label={category ?? p.categories[0]} />)}
        </div>
        {!projects.length && <p className="px-5 text-center text-[#666]">No projects match those filters.</p>}
      </section>
    </>
  );
}
