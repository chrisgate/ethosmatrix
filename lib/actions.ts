"use server";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { q } from "./db";
import { login, logout, requireAdmin } from "./auth";
import { ENTITIES, SETTINGS_GROUPS, type Field } from "./entities";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/avif": ".avif",
};
const MAX_BYTES = 15 * 1024 * 1024;

const refresh = () => revalidatePath("/", "layout");

async function saveFile(file: File): Promise<number | null> {
  if (!file || !file.size) return null;
  const ext = ALLOWED[file.type];
  if (!ext) throw new Error(`Unsupported file type: ${file.type || file.name}`);
  if (file.size > MAX_BYTES) throw new Error(`${file.name} is larger than 15 MB`);
  await mkdir(UPLOAD_DIR, { recursive: true });
  const base = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "image";
  let data: Buffer = Buffer.from(await file.arrayBuffer());
  let outExt = ext;
  let outMime = file.type;
  if (file.type !== "image/gif") {
    // Keep uploads web-sized: max 2400px wide, re-encoded as WebP.
    data = await sharp(data).rotate().resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    outExt = ".webp";
    outMime = "image/webp";
  }
  const filename = `${randomBytes(4).toString("hex")}-${base}${outExt}`;
  await writeFile(path.join(UPLOAD_DIR, filename), data);
  const [row] = await q<{ id: number }>(
    "INSERT INTO media (filename, original_name, mime, size, alt) VALUES ($1,$2,$3,$4,$5) RETURNING id",
    [filename, file.name, outMime, data.length, base.replace(/-/g, " ")],
  );
  return row.id;
}

const filesOf = (fd: FormData, key: string) =>
  fd.getAll(key).filter((f): f is File => f instanceof File && f.size > 0);

async function readField(f: Field, fd: FormData): Promise<string | number | boolean | number[] | null> {
  switch (f.type) {
    case "checkbox": return fd.has(f.name);
    case "checkboxes": return fd.getAll(f.name).map(String) as unknown as string;
    case "number": return parseInt(String(fd.get(f.name) ?? "0"), 10) || 0;
    case "image": {
      const [up] = filesOf(fd, `${f.name}__file`);
      if (up) return await saveFile(up);
      return Number(fd.get(f.name)) || null;
    }
    case "images": {
      const ids = fd.getAll(f.name).map(Number).filter(Boolean);
      for (const up of filesOf(fd, `${f.name}__files`)) {
        const id = await saveFile(up);
        if (id) ids.push(id);
      }
      return ids;
    }
    default: return String(fd.get(f.name) ?? "").trim();
  }
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";

async function uniqueSlug(base: string, id: number | null) {
  let slug = slugify(base), n = 1;
  for (;;) {
    const rows = await q("SELECT 1 FROM projects WHERE slug = $1 AND id <> $2", [slug, id ?? 0]);
    if (!rows.length) return slug;
    slug = `${slugify(base)}-${++n}`;
  }
}

export async function saveEntity(entityKey: string, id: number | null, fd: FormData) {
  await requireAdmin();
  const ent = ENTITIES[entityKey];
  if (!ent) throw new Error("Unknown entity");
  const cols: string[] = [], vals: unknown[] = [];
  for (const f of ent.fields) {
    let v = await readField(f, fd);
    if (f.type === "slug") v = await uniqueSlug(String(v) || String(fd.get("title") ?? ""), id);
    cols.push(f.name); vals.push(v);
  }
  if (id) {
    await q(`UPDATE ${ent.table} SET ${cols.map((c, i) => `${c}=$${i + 1}`).join(",")} WHERE id=$${cols.length + 1}`, [...vals, id]);
  } else {
    await q(`INSERT INTO ${ent.table} (${cols.join(",")}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(",")})`, vals);
  }
  refresh();
  redirect(`/admin/${entityKey}`);
}

export async function deleteEntity(entityKey: string, id: number) {
  await requireAdmin();
  const ent = ENTITIES[entityKey];
  if (!ent) throw new Error("Unknown entity");
  await q(`DELETE FROM ${ent.table} WHERE id=$1`, [id]);
  refresh();
  redirect(`/admin/${entityKey}`);
}

export async function saveSettings(fd: FormData) {
  await requireAdmin();
  for (const g of SETTINGS_GROUPS) for (const f of g.fields) {
    const v = await readField(f, fd);
    const s = Array.isArray(v) ? v.join(",") : v === null ? "" : String(v);
    if (f.type === "checkboxes") continue;
    await q("INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value", [f.name, s]);
  }
  refresh();
  redirect("/admin/settings?saved=1");
}

export async function uploadMedia(fd: FormData) {
  await requireAdmin();
  for (const f of filesOf(fd, "files")) await saveFile(f);
  refresh();
  redirect("/admin/media");
}

export async function updateMediaAlt(fd: FormData) {
  await requireAdmin();
  await q("UPDATE media SET alt=$1 WHERE id=$2", [String(fd.get("alt") ?? ""), Number(fd.get("id"))]);
  refresh();
  redirect("/admin/media");
}

export async function deleteMedia(fd: FormData) {
  await requireAdmin();
  const [m] = await q<{ filename: string }>("DELETE FROM media WHERE id=$1 RETURNING filename", [Number(fd.get("id"))]);
  if (m) await unlink(path.join(UPLOAD_DIR, m.filename)).catch(() => {});
  refresh();
  redirect("/admin/media");
}

export async function setAppointmentStatus(fd: FormData) {
  await requireAdmin();
  await q("UPDATE appointments SET status=$1 WHERE id=$2", [String(fd.get("status")), Number(fd.get("id"))]);
  redirect("/admin/appointments");
}

export async function deleteAppointment(fd: FormData) {
  await requireAdmin();
  await q("DELETE FROM appointments WHERE id=$1", [Number(fd.get("id"))]);
  redirect("/admin/appointments");
}

export async function loginAction(fd: FormData) {
  const ok = await login(String(fd.get("email") ?? ""), String(fd.get("password") ?? ""));
  redirect(ok ? "/admin" : "/admin/login?error=1");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

export async function submitAppointment(fd: FormData) {
  if (String(fd.get("website") ?? "")) redirect("/contact?sent=1"); // honeypot
  const name = String(fd.get("name") ?? "").trim().slice(0, 120);
  const email = String(fd.get("email") ?? "").trim().slice(0, 160);
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) redirect("/contact?error=1");
  await q(
    "INSERT INTO appointments (name,email,phone,service,preferred_date,message) VALUES ($1,$2,$3,$4,$5,$6)",
    [name, email, ...["phone", "service", "preferred_date", "message"].map((k) => String(fd.get(k) ?? "").trim().slice(0, 2000))],
  );
  redirect("/contact?sent=1");
}
