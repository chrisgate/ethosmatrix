import Link from "next/link";
import { notFound } from "next/navigation";
import { q } from "@/lib/db";
import { ENTITIES } from "@/lib/entities";

export default async function EntityList({ params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const ent = ENTITIES[entity];
  if (!ent) notFound();
  const rows = await q<Record<string, unknown>>(`SELECT * FROM ${ent.table} ORDER BY ${ent.orderBy}`);
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">{ent.plural}</h1>
        <Link href={`/admin/${entity}/new`} className="a-btn">+ Add {ent.label.toLowerCase()}</Link>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              {ent.columns.map((c) => <th key={c} className="px-4 py-3">{c.replace(/_/g, " ")}</th>)}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={String(r.id)} className="border-b last:border-0">
                {ent.columns.map((c) => (
                  <td key={c} className="max-w-xs truncate px-4 py-3">{typeof r[c] === "boolean" ? (r[c] ? "Yes" : "No") : Array.isArray(r[c]) ? (r[c] as string[]).join(", ") : String(r[c] ?? "")}</td>
                ))}
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/${entity}/${r.id}`} className="font-medium text-gold-dark hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={ent.columns.length + 1} className="px-4 py-8 text-center text-stone-500">Nothing here yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
