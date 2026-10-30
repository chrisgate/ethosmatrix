import { notFound } from "next/navigation";
import { EntityForm } from "@/components/admin/EntityForm";
import { q } from "@/lib/db";
import { ENTITIES } from "@/lib/entities";
import { deleteEntity, saveEntity } from "@/lib/actions";

export default async function EntityEdit({ params }: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id } = await params;
  const ent = ENTITIES[entity];
  if (!ent) notFound();
  const isNew = id === "new";
  let values: Record<string, unknown> = {};
  if (!isNew) {
    const [row] = await q<Record<string, unknown>>(`SELECT * FROM ${ent.table} WHERE id = $1`, [Number(id) || 0]);
    if (!row) notFound();
    values = row;
  }
  const numId = isNew ? null : Number(id);
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 font-display text-3xl">{isNew ? `New ${ent.label.toLowerCase()}` : `Edit ${ent.label.toLowerCase()}`}</h1>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <EntityForm fields={ent.fields} values={values} action={saveEntity.bind(null, entity, numId)} />
      </div>
      {numId && (
        <form action={deleteEntity.bind(null, entity, numId)} className="mt-4">
          <button className="a-btn-danger">Delete this {ent.label.toLowerCase()}</button>
        </form>
      )}
    </div>
  );
}
