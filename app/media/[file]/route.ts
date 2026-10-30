import { readFile } from "node:fs/promises";
import path from "node:path";
import { q } from "@/lib/db";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[\w.-]+$/.test(file) || file.includes("..")) return new Response("Not found", { status: 404 });
  const [m] = await q<{ mime: string }>("SELECT mime FROM media WHERE filename = $1", [file]);
  if (!m) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(path.join(UPLOAD_DIR, file));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": m.mime,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
