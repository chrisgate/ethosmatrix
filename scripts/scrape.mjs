// Best-effort scraper for a project page on the old WordPress site.
const ORIGIN = "https://ethosmatrix.com";
const UP = `${ORIGIN}/wp-content/uploads/`;

const decode = (s) =>
  s.replace(/&#8217;|&rsquo;/g, "’").replace(/&#8216;|&lsquo;/g, "‘").replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#8221;|&rdquo;/g, "”").replace(/&#8211;|&ndash;/g, "–").replace(/&#8212;|&mdash;/g, "—")
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">");

export async function getHtml(url, tries = 4) {
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (ethosmatrix-seed)" } });
      if (r.ok) return await r.text();
    } catch {}
    await new Promise((r) => setTimeout(r, 1200 * i));
  }
  return null;
}

const CAT = /^(CONCEPTUAL DESIGN|ARCHITECTURAL DESIGN|CONSTRUCTION|PROJECT MANAGEMENT|RENOVATION)\.?$/i;
const PARA = "\n\n";

export async function scrapeProject(pathname) {
  const html = await getHtml(ORIGIN + pathname.replace(/\?.*$/, ""));
  if (!html) return null;
  const body = html.slice(html.indexOf("<body"), html.lastIndexOf("</body>"));
  const main = body
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/g, "");
  const text = decode(
    main.replace(/<(br|\/p|\/h[1-6]|\/li|\/div|\/a|\/span)[^>]*>/gi, "\n").replace(/<[^>]+>/g, ""),
  )
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const at = (re) => text.findIndex((l) => re.test(l));
  const info = at(/^Project (information|details)$/i);
  const scope = at(/^PROJECT SCOPE/i);
  const concept = at(/^DESIGN CONCEPT/i);
  const other = at(/^(PROJECT OVERVIEW|Other projects|VIEW ALL PROJECTS)/i);
  const stopAt = other < 0 ? text.length : other;
  const out = { subtitle: "", body: "", scope: "", concept_title: "", concept_text: "", images: [] };

  // Hero: last category label before the content, then the title, then subtitle lines.
  const firstContent = [info, scope, concept].filter((i) => i > 0).sort((a, b) => a - b)[0] ?? stopAt;
  let cat = -1;
  for (let i = 9; i < firstContent; i++) if (CAT.test(text[i])) cat = i;
  const heroEnd = info >= 0 ? info : firstContent;
  if (cat >= 0 && heroEnd > cat + 2) out.subtitle = text.slice(cat + 2, heroEnd).join(" ");
  if (out.subtitle.length > 60) out.subtitle = "";
  if (info >= 0) out.body = text.slice(info + 1, scope > info ? scope : stopAt).join(PARA);
  else if (cat >= 0 && firstContent > cat + 2) out.body = text.slice(cat + 2, firstContent).join(PARA);

  if (scope >= 0) {
    const seg = text.slice(scope + 1, concept > scope ? concept : stopAt);
    const brk = seg.findIndex((l) => /^(AMENITIES|THE AMENITIES|Client:|Concept\b)/i.test(l));
    const sc = brk < 0 ? seg : seg.slice(0, brk);
    out.scope = sc.filter((l) => l.length < 140).join("\n");
    const rest = brk < 0 ? [] : seg.slice(brk).filter((l) => l.length > 140);
    if (rest.length) { out.concept_title = "Concept"; out.concept_text = rest.join(PARA); }
  }
  if (concept >= 0) {
    out.concept_title = text[concept].replace(/^DESIGN CONCEPT\s*:?\s*/i, "") || "Design concept";
    out.concept_text = text.slice(concept + 1, stopAt).join(PARA);
  }

  // Key facts and a video link, when the page has them.
  const fact = (re) => { const l = text.find((x) => re.test(x)); return l ? l.replace(re, "").trim() : ""; };
  const title = (s) => s.toLowerCase().replace(/(^|[\s/-])([a-z])/g, (_, a, b) => a + b.toUpperCase());
  out.client = fact(/^Client:\s*/i);
  out.location = title(fact(/^Location:\s*/i));
  out.year = fact(/^Date:\s*/i);
  out.size = fact(/^(Size|Area|Floor area)\s*:\s*/i);
  const vid = main.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/|vimeo\.com\/)[^"' <>]+/i);
  out.video = vid ? decode(vid[0]) : "";

  // Full-size images linked from the page (lightbox/gallery links).
  const hrefs = [
    ...main.matchAll(/href=["'](https:\/\/ethosmatrix\.com\/wp-content\/uploads\/[^"']+\.(?:jpe?g|png|webp))["']/gi),
  ].map((m) => m[1]);
  out.images = [...new Set(hrefs)]
    .map((u) => u.replace(UP, ""))
    .filter((p) => !/lgw|decoration|logo/i.test(p) && !/^2024\/07\/\d/.test(p));
  return out;
}
