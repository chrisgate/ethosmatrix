"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { uploadEditorImage } from "@/lib/actions";
import { sanitizeHtml } from "@/lib/richtext";

type MediaRow = { id: number; filename: string; alt: string; original_name: string };
type Panel = "link" | "image" | "video" | null;

const ICONS: Record<string, string> = {
  undo: "M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3",
  redo: "M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3",
  ul: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  left: "M4 6h16M4 12h10M4 18h14",
  center: "M4 6h16M7 12h10M5 18h14",
  right: "M4 6h16M10 12h10M6 18h14",
  link: "M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1",
  image: "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9h.01",
  video: "M3 6h13v12H3zM16 10l5-3v10l-5-3",
  hr: "M3 12h18",
};

function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={ICONS[name]} />
    </svg>
  );
}

function Btn({ label, on, active, children }: { label: string; on: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active ?? undefined}
      // keep the text selection: buttons must not take focus from the editor
      onMouseDown={(e) => e.preventDefault()}
      onClick={on}
      className={`flex h-9 min-w-9 items-center justify-center rounded px-2 text-[15px] text-stone-700 transition hover:bg-stone-200 ${active ? "bg-stone-300 text-black" : ""}`}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-6 w-px bg-stone-300" aria-hidden />;

/** YouTube and Vimeo page links -> embeddable URL. */
function embedUrl(raw: string): string | null {
  const u = raw.trim();
  let m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,20})/i);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;
  return null;
}

const normaliseUrl = (v: string) => {
  const u = v.trim();
  if (!u) return "";
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(u)) return u;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u)) return `mailto:${u}`;
  return `https://${u}`;
};

const escText = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const isEmpty = (html: string) => !html.replace(/<(?!img|iframe|hr)[^>]*>|&nbsp;|\s/gi, "");

export function RichTextEditor({ name, initialHtml, media: initialMedia }: { name: string; initialHtml: string; media: MediaRow[] }) {
  const ed = useRef<HTMLDivElement>(null);
  const saved = useRef<Range | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [html, setHtml] = useState(initialHtml);
  const [source, setSource] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [media, setMedia] = useState(initialMedia);
  const [fmt, setFmt] = useState({ bold: false, italic: false, underline: false, strike: false, ul: false, ol: false, left: false, center: false, right: false, block: "p" });
  const [url, setUrl] = useState("");
  const [pick, setPick] = useState<MediaRow | null>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [stats, setStats] = useState({ words: 0, minutes: 1 });

  const measure = useCallback((el: HTMLElement) => {
    const words = (el.innerText || "").trim().split(/\s+/).filter(Boolean).length;
    setStats({ words, minutes: Math.max(1, Math.round(words / 200)) });
  }, []);

  const sync = useCallback(() => {
    const el = ed.current;
    if (!el) return;
    setHtml(isEmpty(el.innerHTML) ? "" : el.innerHTML);
    measure(el);
  }, [measure]);

  useEffect(() => {
    const el = ed.current;
    if (!el) return;
    el.innerHTML = initialHtml;
    measure(el);
    document.execCommand("defaultParagraphSeparator", false, "p");
  }, [initialHtml, measure]);

  // Track the caret (so panels can restore it) and which formats are active at it.
  useEffect(() => {
    const onSel = () => {
      const s = window.getSelection();
      if (!s || !s.rangeCount || !ed.current?.contains(s.anchorNode)) return;
      saved.current = s.getRangeAt(0).cloneRange();
      const q = (c: string) => { try { return document.queryCommandState(c); } catch { return false; } };
      let block = "p";
      try { block = (document.queryCommandValue("formatBlock") || "p").toLowerCase().replace(/[<>]/g, ""); } catch {}
      setFmt({
        bold: q("bold"), italic: q("italic"), underline: q("underline"), strike: q("strikeThrough"),
        ul: q("insertUnorderedList"), ol: q("insertOrderedList"),
        left: q("justifyLeft"), center: q("justifyCenter"), right: q("justifyRight"),
        block: ["h2", "h3", "h4", "blockquote"].includes(block) ? block : "p",
      });
    };
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, []);

  const restore = () => {
    const el = ed.current;
    if (!el) return;
    el.focus();
    const s = window.getSelection();
    if (!s) return;
    s.removeAllRanges();
    if (saved.current && el.contains(saved.current.commonAncestorContainer)) s.addRange(saved.current);
    else { const r = document.createRange(); r.selectNodeContents(el); r.collapse(false); s.addRange(r); }
  };

  const run = (cmd: string, val?: string) => {
    restore();
    // a list inside a heading or quote is invalid HTML: turn the block back into a paragraph first
    if (/^insert(Un)?orderedList$/.test(cmd) && fmt.block !== "p") document.execCommand("formatBlock", false, "<p>");
    document.execCommand("styleWithCSS", false, cmd.startsWith("justify") ? "true" : "false");
    document.execCommand(cmd, false, val);
    sync();
  };

  const insert = (markup: string) => {
    restore();
    document.execCommand("insertHTML", false, markup);
    sync();
  };

  const openPanel = (p: Exclude<Panel, null>) => {
    if (panel === p) return setPanel(null);
    setErr(""); setUrl(""); setPick(null); setAlt(""); setCaption("");
    if (p === "link") {
      const a = window.getSelection()?.anchorNode?.parentElement?.closest("a");
      if (a) setUrl(a.getAttribute("href") ?? "");
    }
    setPanel(p);
  };

  const applyLink = () => {
    const href = normaliseUrl(url);
    if (!href) return;
    restore();
    const sel = window.getSelection();
    if (sel && sel.isCollapsed) document.execCommand("insertHTML", false, `<a href="${escText(href)}">${escText(url.trim())}</a>`);
    else document.execCommand("createLink", false, href);
    sync(); setPanel(null);
  };

  const applyVideo = () => {
    const src = embedUrl(url);
    if (!src) return setErr("Paste a YouTube or Vimeo link.");
    insert(`<div class="video"><iframe src="${src}" title="Video" allowfullscreen></iframe></div><p><br></p>`);
    setPanel(null);
  };

  const applyImage = () => {
    if (!pick) return setErr("Choose or upload an image first.");
    const cap = caption.trim();
    insert(`<figure><img src="/media/${pick.filename}" alt="${escText(alt.trim())}">${cap ? `<figcaption>${escText(cap)}</figcaption>` : ""}</figure><p><br></p>`);
    setPanel(null);
  };

  const upload = async (files: FileList | File[] | null) => {
    if (!files || !files.length) return;
    setBusy(true); setErr("");
    try {
      for (const f of Array.from(files)) {
        const fd = new FormData();
        fd.set("file", f);
        const m = await uploadEditorImage(fd);
        setMedia((cur) => [m, ...cur.filter((x) => x.id !== m.id)]);
        setPick(m); setAlt(m.alt);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed. Use a JPG, PNG, WebP, GIF or AVIF under 15 MB.");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const img = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith("image/"));
    if (img.length) {
      e.preventDefault();
      setPanel("image");
      void upload(img);
      return;
    }
    const h = e.clipboardData.getData("text/html");
    e.preventDefault();
    if (h) document.execCommand("insertHTML", false, sanitizeHtml(h));
    else {
      const t = e.clipboardData.getData("text/plain");
      document.execCommand("insertHTML", false, t.split(/\n{2,}/).map((p) => `<p>${escText(p.trim()).replace(/\n/g, "<br>")}</p>`).join(""));
    }
    sync();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); saveAndOpen("link"); }
  };
  const saveAndOpen = (p: Exclude<Panel, null>) => openPanel(p);

  const toggleSource = () => {
    if (source) {
      const clean = sanitizeHtml(html);
      if (ed.current) { ed.current.innerHTML = clean; measure(ed.current); }
      setHtml(clean);
    } else if (ed.current) {
      setHtml(sanitizeHtml(ed.current.innerHTML));
    }
    setPanel(null);
    setSource(!source);
  };

  const field = "w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm";

  return (
    <div className="overflow-hidden rounded-md border border-stone-300 bg-white">
      <input type="hidden" name={name} value={html} />

      <div className="flex flex-wrap items-center gap-0.5 border-b border-stone-300 bg-stone-100 p-1.5">
        <Btn label="Undo" on={() => run("undo")}><Icon name="undo" /></Btn>
        <Btn label="Redo" on={() => run("redo")}><Icon name="redo" /></Btn>
        <Sep />
        <select
          aria-label="Text style"
          value={fmt.block}
          onChange={(e) => run("formatBlock", `<${e.target.value}>`)}
          onMouseDown={() => saveSelNow()}
          className="h-9 rounded border border-stone-300 bg-white px-2 text-sm"
          disabled={source}
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading</option>
          <option value="h3">Sub-heading</option>
          <option value="h4">Small heading</option>
          <option value="blockquote">Quote</option>
        </select>
        <Sep />
        <Btn label="Bold (Ctrl+B)" active={fmt.bold} on={() => run("bold")}><b>B</b></Btn>
        <Btn label="Italic (Ctrl+I)" active={fmt.italic} on={() => run("italic")}><i className="font-serif">I</i></Btn>
        <Btn label="Underline (Ctrl+U)" active={fmt.underline} on={() => run("underline")}><u>U</u></Btn>
        <Btn label="Strikethrough" active={fmt.strike} on={() => run("strikeThrough")}><s>S</s></Btn>
        <Sep />
        <Btn label="Bulleted list" active={fmt.ul} on={() => run("insertUnorderedList")}><Icon name="ul" /></Btn>
        <Btn label="Numbered list" active={fmt.ol} on={() => run("insertOrderedList")}><span className="text-[13px] font-semibold">1.</span></Btn>
        <Btn label="Quote" active={fmt.block === "blockquote"} on={() => run("formatBlock", fmt.block === "blockquote" ? "<p>" : "<blockquote>")}><span className="font-serif text-xl leading-none">&ldquo;</span></Btn>
        <Sep />
        <Btn label="Align left" active={fmt.left} on={() => run("justifyLeft")}><Icon name="left" /></Btn>
        <Btn label="Align centre" active={fmt.center} on={() => run("justifyCenter")}><Icon name="center" /></Btn>
        <Btn label="Align right" active={fmt.right} on={() => run("justifyRight")}><Icon name="right" /></Btn>
        <Sep />
        <Btn label="Link (Ctrl+K)" active={panel === "link"} on={() => openPanel("link")}><Icon name="link" /></Btn>
        <Btn label="Image" active={panel === "image"} on={() => openPanel("image")}><Icon name="image" /></Btn>
        <Btn label="Video (YouTube or Vimeo)" active={panel === "video"} on={() => openPanel("video")}><Icon name="video" /></Btn>
        <Btn label="Divider line" on={() => run("insertHorizontalRule")}><Icon name="hr" /></Btn>
        <Btn label="Clear formatting" on={() => run("removeFormat")}><span className="text-[13px] font-semibold">T<sub>x</sub></span></Btn>
        <span className="flex-1" />
        <Btn label="Edit HTML" active={source} on={toggleSource}><span className="font-mono text-[13px]">&lt;/&gt;</span></Btn>
      </div>

      {panel && !source && (
        <div
          className="space-y-3 border-b border-stone-300 bg-amber-50/60 p-3"
          onKeyDown={(e) => { if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") e.preventDefault(); }}
        >
          {panel === "link" && (
            <div className="flex flex-wrap items-center gap-2">
              <input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyLink(); } }} placeholder="https://example.com or /services" aria-label="Link address" className={`${field} min-w-0 flex-1`} />
              <button type="button" onClick={applyLink} className="a-btn">Apply link</button>
              <button type="button" onClick={() => { run("unlink"); setPanel(null); }} className="a-btn-danger">Remove link</button>
              <p className="w-full text-xs text-stone-500">Select some text first. Without a selection the address itself is inserted as the link text.</p>
            </div>
          )}

          {panel === "video" && (
            <div className="flex flex-wrap items-center gap-2">
              <input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyVideo(); } }} placeholder="Paste a YouTube or Vimeo link" aria-label="Video link" className={`${field} min-w-0 flex-1`} />
              <button type="button" onClick={applyVideo} className="a-btn">Insert video</button>
            </div>
          )}

          {panel === "image" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple onChange={(e) => upload(e.target.files)} className="text-sm" aria-label="Upload images" />
                {busy && <span className="text-sm text-stone-600">Uploading…</span>}
              </div>
              {media.length > 0 && (
                <div className="flex max-h-52 flex-wrap gap-2 overflow-y-auto rounded border border-stone-200 bg-white p-2" role="listbox" aria-label="Media library">
                  {media.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      role="option"
                      aria-selected={pick?.id === m.id}
                      title={m.original_name}
                      onClick={() => { setPick(m); setAlt(m.alt); }}
                      className={`h-16 w-16 overflow-hidden rounded border-2 ${pick?.id === m.id ? "border-gold" : "border-transparent hover:border-stone-300"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/media/${m.filename}`} alt={m.alt} className="h-full w-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
              <div className="grid gap-2 sm:grid-cols-2">
                <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe the image (alt text)" aria-label="Alt text" className={field} />
                <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (optional)" aria-label="Caption" className={field} />
              </div>
              <button type="button" onClick={applyImage} disabled={!pick || busy} className="a-btn disabled:opacity-50">Insert image</button>
            </div>
          )}
          {err && <p className="text-sm text-red-700" role="alert">{err}</p>}
        </div>
      )}

      <div className={source ? "hidden" : ""}>
        <div
          ref={ed}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline
          aria-label="Article text"
          onInput={sync}
          onBlur={sync}
          onPaste={onPaste}
          onKeyDown={onKeyDown}
          onFocus={() => {
            const el = ed.current;
            if (el && !el.innerHTML.trim()) { el.innerHTML = "<p><br></p>"; restore(); }
          }}
          className="article-prose min-h-[440px] max-h-[75vh] overflow-y-auto px-5 py-4 outline-none sm:px-8 sm:py-6"
        />
      </div>
      {source && (
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          spellCheck={false}
          aria-label="Article HTML"
          className="block min-h-[440px] w-full resize-y border-0 bg-stone-900 p-4 font-mono text-[13px] leading-relaxed text-stone-100 outline-none"
        />
      )}

      <div className="flex flex-wrap justify-between gap-2 border-t border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-500">
        <span>{stats.words} words · about {stats.minutes} min read</span>
        <span>Ctrl+B bold · Ctrl+I italic · Ctrl+K link</span>
      </div>
    </div>
  );

  function saveSelNow() {
    const s = window.getSelection();
    if (s && s.rangeCount && ed.current?.contains(s.anchorNode)) saved.current = s.getRangeAt(0).cloneRange();
  }
}
