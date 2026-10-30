import { q } from "@/lib/db";
import { deleteAppointment, setAppointmentStatus } from "@/lib/actions";

type A = {
  id: number; name: string; email: string; phone: string; service: string;
  preferred_date: string; message: string; status: string; created_at: Date;
  project_type: string; budget: string; location: string; timeline: string; project: string;
};

export default async function AppointmentsPage() {
  const rows = await q<A>("SELECT * FROM appointments ORDER BY created_at DESC");
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Enquiries</h1>
      <div className="space-y-4">
        {rows.map((a) => (
          <div key={a.id} className="rounded-lg bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{a.name}</div>
                <div className="text-sm text-stone-600">
                  <a href={`mailto:${a.email}`} className="underline">{a.email}</a>
                  {a.phone && <> · {a.phone}</>}
                </div>
                <div className="mt-1 text-xs text-stone-500">
                  {new Date(a.created_at).toLocaleString("en-GB")}
                  {a.service && <> · {a.service}</>}
                  {a.preferred_date && <> · wants {a.preferred_date}</>}
                </div>
              </div>
              <div className="flex gap-2">
                <form action={setAppointmentStatus} className="flex gap-2">
                  <input type="hidden" name="id" value={a.id} />
                  <select name="status" defaultValue={a.status} className="a-input !w-auto">
                    {["new", "contacted", "booked", "closed"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button className="a-btn">Update</button>
                </form>
                <form action={deleteAppointment}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="a-btn-danger">Delete</button>
                </form>
              </div>
            </div>
            {[["Project type", a.project_type], ["About project", a.project], ["Location", a.location], ["Budget", a.budget], ["Timeline", a.timeline]].some(([, v]) => v) && (
              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                {[["Project type", a.project_type], ["About project", a.project], ["Location", a.location], ["Budget", a.budget], ["Timeline", a.timeline]].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}><dt className="inline text-stone-500">{k}: </dt><dd className="inline font-medium">{v}</dd></div>
                ))}
              </dl>
            )}
            {a.message && <p className="mt-3 whitespace-pre-line text-sm">{a.message}</p>}
          </div>
        ))}
        {!rows.length && <p className="text-stone-500">No appointment requests yet.</p>}
      </div>
    </div>
  );
}
