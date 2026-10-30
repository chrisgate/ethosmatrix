/**
 * Helpers for the article editor. Pure string functions with no Node or DOM APIs, so the same code
 * cleans pasted text in the browser and sanitizes what is saved and rendered on the server.
 */

const VOID = new Set(["br", "hr", "img"]);
const TAGS = new Set([
  "p", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "strike", "ul", "ol", "li", "blockquote",
  "a", "img", "br", "hr", "figure", "figcaption", "div", "iframe",
]);
const ALIGNABLE = new Set(["p", "h2", "h3", "h4", "blockquote", "li", "figure", "div"]);
const VIDEO_SRC = /^https:\/\/(?:www\.youtube(?:-nocookie)?\.com\/embed\/[\w-]{6,20}|player\.vimeo\.com\/video\/\d+)(?:\?[\w=&%.-]*)?$/;

const TAG_RE = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^\s"'<>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'<>=`]+))?)*)\s*(\/?)>/g;
const ATTR_RE = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>=`]+)))?/g;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s: string) => s.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** Text and attribute values in HTML already carry entities (&amp;, &nbsp;): only escape a bare "&" so nothing is escaped twice. */
const fixAmp = (s: string) => s.replace(/&(?!(?:[a-z]+|#\d+|#x[\da-f]+);)/gi, "&amp;");
const attrOut = (s: string) => escAttr(fixAmp(s));
const textOut = (s: string) => fixAmp(s).replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const isHtml = (s: string) => /^\s*<[a-z!]/i.test(s);

/** Cleans editor or pasted HTML down to the tags and attributes the article page supports. */
export function sanitizeHtml(input: string): string {
  const src = (input ?? "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript|template|object|embed|svg|math)\b[\s\S]*?<\/\1\s*>/gi, "");
  let out = "";
  const stack: string[] = [];
  let last = 0;
  for (const m of src.matchAll(TAG_RE)) {
    out += textOut(src.slice(last, m.index));
    last = (m.index ?? 0) + m[0].length;
    const closing = m[1] === "/";
    const tag = m[2].toLowerCase();
    if (!TAGS.has(tag)) continue; // unknown tag: drop the tag, keep its text
    if (closing) {
      if (VOID.has(tag)) continue;
      const at = stack.lastIndexOf(tag);
      if (at < 0) continue;
      while (stack.length > at) out += `</${stack.pop()}>`;
      continue;
    }
    const attrs: Record<string, string> = {};
    for (const a of m[3].matchAll(ATTR_RE)) attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? a[4] ?? "";
    let html = "";
    let keep = true;
    if (tag === "a") {
      const href = (attrs.href ?? "").trim();
      if (!/^(?:https?:\/\/|mailto:|tel:|\/|#)/i.test(href)) keep = false;
      else {
        html += ` href="${attrOut(href)}"`;
        if (/^https?:\/\//i.test(href)) html += ' target="_blank" rel="noopener noreferrer"';
      }
    } else if (tag === "img") {
      const s = (attrs.src ?? "").trim();
      if (!/^(?:https:\/\/|\/media\/)/i.test(s)) continue;
      html += ` src="${attrOut(s)}" alt="${attrOut(attrs.alt ?? "")}" loading="lazy"`;
      for (const k of ["width", "height"]) if (/^\d{1,4}$/.test(attrs[k] ?? "")) html += ` ${k}="${attrs[k]}"`;
    } else if (tag === "iframe") {
      const s = (attrs.src ?? "").trim();
      if (!VIDEO_SRC.test(s)) continue;
      html += ` src="${attrOut(s)}" title="Video" loading="lazy" allowfullscreen`;
    } else if (tag === "div") {
      if (!/\bvideo\b/.test(attrs.class ?? "")) continue; // only the video wrapper survives; other divs become plain text flow
      html += ' class="video"';
    }
    if (ALIGNABLE.has(tag) && tag !== "div") {
      const al = /text-align\s*:\s*(left|center|right|justify)/i.exec(attrs.style ?? "");
      if (al && al[1].toLowerCase() !== "left") html += ` style="text-align:${al[1].toLowerCase()}"`;
    }
    if (!keep) {
      // a link without a usable href: keep its text, drop the tag (a matching </a> is ignored later)
      continue;
    }
    out += `<${tag}${html}>`;
    if (!VOID.has(tag)) stack.push(tag);
  }
  out += textOut(src.slice(last));
  while (stack.length) out += `</${stack.pop()}>`;
  return out.replace(/<p(?: [^>]*)?>(?:<br>|\s|&nbsp;)*<\/p>/g, "").trim(); // drop the empty paragraphs the editor leaves behind
}

const inlineMd = (t: string) =>
  esc(t)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]+)\)/g, '<a href="$2">$1</a>');

/** Converts the older plain-text format (blank-line paragraphs, ## headings, - bullets, **bold**) to HTML. */
export function legacyToHtml(text: string): string {
  const blocks = (text ?? "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return sanitizeHtml(
    blocks
      .map((b) => {
        if (b.startsWith("### ")) return `<h3>${inlineMd(b.slice(4))}</h3>`;
        if (b.startsWith("## ")) return `<h2>${inlineMd(b.slice(3))}</h2>`;
        const lines = b.split("\n");
        if (lines.every((l) => /^-\s+/.test(l))) return `<ul>${lines.map((l) => `<li>${inlineMd(l.replace(/^-\s+/, ""))}</li>`).join("")}</ul>`;
        if (lines.every((l) => /^\d+\.\s+/.test(l))) return `<ol>${lines.map((l) => `<li>${inlineMd(l.replace(/^\d+\.\s+/, ""))}</li>`).join("")}</ol>`;
        return `<p>${lines.map(inlineMd).join("<br>")}</p>`;
      })
      .join(""),
  );
}

/** Article body as HTML, whichever format it was saved in. */
export const bodyToHtml = (body: string) => (isHtml(body) ? sanitizeHtml(body) : legacyToHtml(body));

/** Plain text of an article body (for read time and meta descriptions). */
export function bodyToText(body: string): string {
  const html = isHtml(body) ? body : legacyToHtml(body);
  return html
    .replace(/<\/(p|h[2-4]|li|blockquote|figcaption)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
