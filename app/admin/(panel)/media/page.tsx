import { q } from "@/lib/db";
import { deleteMedia, updateMediaAlt, uploadMedia } from "@/lib/actions";

export default async function MediaPage() {
  const media = await q<{ id: number; filename: string; original_name: string; alt: string; size: number }>(
    "SELECT id, filename, original_name, alt, size FROM media ORDER BY id DESC",
  );
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Media library</h1>
      <form action={uploadMedia} className="mb-8 flex flex-wrap items-center gap-3 rounded-lg bg-white p-4 shadow-sm">
        <input type="file" name="files" multiple required accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="text-sm" />
        <button className="a-btn">Upload images</button>
        <span className="text-xs text-stone-500">JPG, PNG, WebP, GIF or AVIF, up to 15 MB each.</span>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {media.map((m) => (
          <div key={m.id} className="overflow-hidden rounded-lg bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/media/${m.filename}`} alt={m.alt} className="h-40 w-full object-cover" loading="lazy" />
            <div className="space-y-2 p-3">
              <div className="truncate text-xs text-stone-500" title={m.original_name}>{m.original_name} · {Math.round(m.size / 1024)} KB</div>
              <form action={updateMediaAlt} className="flex gap-2">
                <input type="hidden" name="id" value={m.id} />
                <input name="alt" defaultValue={m.alt} placeholder="Alt text" className="a-input" />
                <button className="a-btn">Save</button>
              </form>
              <form action={deleteMedia}>
                <input type="hidden" name="id" value={m.id} />
                <button className="-ml-2 rounded px-2 py-2.5 text-sm text-red-700 hover:bg-red-50 hover:underline">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
      {!media.length && <p className="text-stone-500">No images uploaded yet.</p>}
    </div>
  );
}
