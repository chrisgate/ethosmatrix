import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBanner } from "@/components/PageBanner";
import { ProjectCard } from "@/components/ProjectCard";
import { CATEGORIES, CATEGORY_IMAGE_KEY, categorySlug, getMedia, getProjects, getSettings } from "@/lib/content";

type Props = { params: Promise<{ category: string }> };

const find = (slug: string) => CATEGORIES.find((c) => categorySlug(c) === slug);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = find((await params).category);
  return c ? { title: c, description: `${c} projects by Ethos Matrix.` } : {};
}

export default async function CategoryPage({ params }: Props) {
  const category = find((await params).category);
  if (!category) notFound();
  const s = await getSettings();
  const [projects, banner] = await Promise.all([
    getProjects({ category }),
    getMedia(s[CATEGORY_IMAGE_KEY[category]]),
  ]);

  return (
    <>
      <PageBanner
        title={category}
        image={banner?.filename}
        crumbs={[{ label: "Home", href: "/" }, { label: "All Projects", href: "/projects" }]}
      />
      <section className="bg-white pb-20 pt-6">
        <div className="mx-auto grid max-w-[1140px] gap-6 px-5 md:grid-cols-2">
          {projects.map((p) => <ProjectCard key={p.id} p={p} label={category} />)}
        </div>
        {!projects.length && <p className="px-5 text-center text-[#666]">No projects in this category yet.</p>}
      </section>
    </>
  );
}
