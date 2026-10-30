// Starter blog articles. They are general, educational pieces that only restate what the site already says
// about Ethos Matrix's services (no figures or claims about the company). Review and edit them in /admin.
// Used by seed.mjs (through revamp-content.mjs) and by seed-blog.mjs for databases seeded earlier.

const POSTS = [
  {
    title: "Design and Build vs Traditional Procurement: Which Suits Your Project?",
    slug: "design-and-build-vs-traditional-procurement",
    categories: "Article, Construction",
    coverProject: "zim-lansal",
    published_at: "2026-10-27",
    excerpt:
      "A construction project can lose time and money when design, cost planning and site work fall out of step. Here is how the two most common ways of delivering a building compare.",
    body: `Every building project starts with a choice about how it will be delivered. Under traditional procurement, the client appoints a designer first and then appoints a contractor to build the finished design. Under design and build, one team takes responsibility for both.

## What is design and build?

In a design and build arrangement, a single company is responsible for designing the project and constructing it. The client deals with one point of contact, and design decisions are made with cost and buildability in mind from the start.

## What is traditional procurement?

With traditional procurement, design and construction are separate contracts. The design is completed and priced before a contractor is appointed. This can give the client close control over the design, but it also means more parties to coordinate and more places where information can be lost.

## Key differences

- **Responsibility:** one team accountable for the whole project, or several parties with their own contracts.
- **Coordination:** design and cost planning happen together, or one after the other.
- **Timeline:** some work can overlap, or design is finished before construction begins.
- **Changes:** handled inside one team, or negotiated between the designer, contractor and client.

## When design and build tends to suit

It tends to work well when you want a single point of responsibility, a clearer view of cost early on, and a smooth handover from drawings to site. Office fit-outs, residential developments and renovations are common examples.

## When traditional procurement may suit

It may suit projects where the design must be fully fixed before pricing, or where you want a separate consultant to oversee the design independently.

## How Ethos Matrix approaches projects

Ethos Matrix is a Nigerian turnkey real estate company covering conceptual design, architectural design, construction and project management. Bringing these stages together means planning, design and construction decisions are made in step. You can see how this works across our [projects](/projects).

## Questions to ask before you decide

1. How much of the design is already settled?
2. Do you want one team accountable for both design and construction?
3. How important is it to understand the likely cost early?

If you are weighing your options, [talk to us about your project](/quote).`,
  },
  {
    title: "What Turnkey Real Estate Development Means for Property Owners",
    slug: "what-turnkey-real-estate-development-means",
    categories: "Article, Real Estate",
    coverProject: "brompton-city",
    published_at: "2026-10-20",
    excerpt:
      "A turnkey project is delivered from first idea to handover by one team. Here is what that covers and what to look for before you commit.",
    body: `Turnkey means the project is handed to you ready to use. Instead of coordinating separate designers, builders and managers yourself, one team takes the project from concept to completion.

## What does turnkey cover?

A turnkey service usually brings several stages under one roof:

1. **Conceptual design and feasibility:** turning an idea into a clear direction and checking it makes sense before money is spent.
2. **Architectural design:** exterior, facade and interior design that is functional and tailored to the client's needs.
3. **Construction:** building, including renovation and remodeling of existing spaces, with attention to quality, efficiency and durability.
4. **Project management:** planning, coordination, budgeting and timely delivery.
5. **Handover:** a finished project ready for you to move into or put to use.

## Benefits for property owners

- **One point of contact** instead of several contractors to chase.
- **Consistent standards** because the same team carries the project through each stage.
- **Fewer hand-offs**, which means fewer places for information and responsibility to fall through the gaps.

## What to check before you commit

- Is the scope of work written down clearly?
- Who manages subcontractors and suppliers?
- How are changes requested, priced and approved?
- What is included at handover?

## Where Ethos Matrix fits

Ethos Matrix is a Nigerian-based turnkey real estate company offering design, planning, construction and finishing. Read more [about us](/about) or see our [services](/services).`,
  },
  {
    title: "Renovation or Remodeling? How to Choose the Right Approach",
    slug: "renovation-or-remodeling",
    categories: "Article, Renovation",
    coverProject: "vi-house-renovation",
    published_at: "2026-10-13",
    excerpt: "The two words are often used as if they mean the same thing, but they describe different kinds of work. Knowing the difference helps you plan and budget.",
    body: `If you are thinking about changing a building you already own, you will hear both words: renovation and remodeling. They overlap, but they are not the same.

## What is renovation?

Renovation is about restoring or updating what is already there. Think repairing, repainting, refinishing and replacing worn elements so the space looks and works like new, without changing how it is laid out.

## What is remodeling?

Remodeling changes the form or function of a space. That could mean moving walls, combining rooms, adding openings or reorganising a floor plan so the building works differently.

## How to decide

- **What problem are you solving?** Tired finishes point towards renovation. A layout that no longer suits how you live or work points towards remodeling.
- **How much disruption can you accept?** Remodeling usually involves more structural work and takes longer.
- **What does your budget allow?** Clear priorities help you decide where to spend first.

### A note on structural changes

Moving or removing walls can affect how a building carries load. Changes like these need professional design input and the right approvals before work begins.

## Planning tips

1. Write down your priorities before you start, from must-have to nice-to-have.
2. Agree a clear scope and schedule with your contractor.
3. Allow some flexibility for things that only become visible once work begins.

## How we can help

Renovation and remodeling are part of our construction services, alongside project management to oversee planning, coordination, budgeting and delivery. See examples in our [construction projects](/projects/construction), or [get in touch](/quote) to discuss yours.`,
  },
];

export async function applyBlogContent(q) {
  const [{ n }] = await q("SELECT count(*)::int AS n FROM posts");
  if (n > 0) { console.log("blog already has articles; leaving them alone"); return; }
  for (const [i, p] of POSTS.entries()) {
    const [proj] = await q("SELECT cover_id FROM projects WHERE slug = $1", [p.coverProject]);
    await q(
      `INSERT INTO posts (title, slug, excerpt, body, categories, cover_id, published, published_at, sort)
       VALUES ($1,$2,$3,$4,$5,$6,true,$7,$8) ON CONFLICT (slug) DO NOTHING`,
      [p.title, p.slug, p.excerpt, p.body, p.categories, proj?.cover_id ?? null, p.published_at, i],
    );
  }
  await q(
    "INSERT INTO settings (key, value) VALUES ('blog_intro', $1) ON CONFLICT (key) DO NOTHING",
    ["Ideas, news and project stories from Ethos Matrix. Learn more about design, construction and property development in Nigeria."],
  );
  console.log(`added ${POSTS.length} starter articles`);
}
