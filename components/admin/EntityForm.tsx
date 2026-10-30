import { q } from "@/lib/db";
import type { Field } from "@/lib/entities";

type MediaRow = { id: number; filename: string; alt: string; original_name: string };

const Thumb = ({ m }: { m: MediaRow }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={`/media/${m.filename}`} alt={m.alt} className="h-16 w-16 rounded object-cover" loading="lazy" />
);

function ImagePicker({ f, value, media }: { f: Field; value: unknown; media: MediaRow[] }) {
  const multi = f.type === "images";
  const selected = new Set<number>(multi ? ((value as number[]) ?? []) : value ? [Number(value)] : []);
  return (
    <div className="space-y-2">
      <details className="rounded border border-stone-300 bg-white p-3" open={selected.size === 0 && media.length < 30}>
        <summary className="cursor-pointer text-sm font-medium">
          Choose from library ({media.length}){selected.size ? ` · ${selected.size} selected` : ""}
        </summary>
        <div className="mt-3 flex max-h-72 flex-wrap gap-2 overflow-y-auto">
          {!multi && (
            <label className="flex w-16 flex-col items-center gap-1 text-xs">
              <span className="flex h-16 w-16 items-center justify-center rounded border border-dashed">None</span>
              <input type="radio" name={f.name} value="" defaultChecked={selected.size === 0} />
            </label>
          )}
          {media.map((m) => (
            <label key={m.id} className="flex w-16 flex-col items-center gap-1 text-xs" title={m.original_name}>
              <Thumb m={m} />
              <input
                type={multi ? "checkbox" : "radio"}
                name={f.name}
                value={m.id}
                defaultChecked={selected.has(m.id)}
              />
            </label>
          ))}
        </div>
      </details>
      <div>
        <span className="mr-2 text-sm text-stone-600">{multi ? "Or upload new:" : "Or upload a new image:"}</span>
        <input type="file" name={multi ? `${f.name}__files` : `${f.name}__file`} accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple={multi} className="text-sm" />
      </div>
    </div>
  );
}

export async function EntityForm({
  fields, values, action, submitLabel = "Save",
}: {
  fields: Field[];
  values: Record<string, unknown>;
  action: (fd: FormData) => Promise<void>;
  submitLabel?: string;
}) {
  const needsMedia = fields.some((f) => f.type === "image" || f.type === "images");
  const media = needsMedia
    ? await q<MediaRow>("SELECT id, filename, alt, original_name FROM media ORDER BY id DESC")
    : [];
  return (
    <form action={action} className="space-y-5">
      {fields.map((f) => (
        <div key={f.name}>
          <label className="mb-1 block text-sm font-medium">
            {f.label}{f.required && <span className="text-red-600"> *</span>}
          </label>
          {f.type === "textarea" ? (
            <textarea name={f.name} defaultValue={String(values[f.name] ?? "")} rows={5} className="a-input" required={f.required} />
          ) : f.type === "select" ? (
            <select name={f.name} defaultValue={String(values[f.name] ?? f.options?.[0] ?? "")} className="a-input">
              {f.options?.map((o) => <option key={o}>{o}</option>)}
            </select>
          ) : f.type === "checkboxes" ? (
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {f.options?.map((o) => (
                <label key={o} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name={f.name} value={o} defaultChecked={((values[f.name] as string[]) ?? []).includes(o)} />
                  {o}
                </label>
              ))}
            </div>
          ) : f.type === "checkbox" ? (
            <input type="checkbox" name={f.name} defaultChecked={values[f.name] === undefined ? f.name === "published" : Boolean(values[f.name])} className="h-4 w-4" />
          ) : f.type === "image" || f.type === "images" ? (
            <ImagePicker f={f} value={values[f.name]} media={media} />
          ) : (
            <input
              name={f.name}
              type={f.type === "number" ? "number" : "text"}
              defaultValue={String(values[f.name] ?? (f.type === "number" ? 0 : ""))}
              className="a-input"
              required={f.required}
            />
          )}
          {f.help && <p className="mt-1 text-xs text-stone-500">{f.help}</p>}
        </div>
      ))}
      <button className="a-btn" type="submit">{submitLabel}</button>
    </form>
  );
}
