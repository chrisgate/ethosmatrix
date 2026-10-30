import { EntityForm } from "@/components/admin/EntityForm";
import { getSettings, parseIds } from "@/lib/content";
import { SETTINGS_GROUPS } from "@/lib/entities";
import { saveSettings } from "@/lib/actions";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const s = await getSettings();
  const fields = SETTINGS_GROUPS.flatMap((g) => g.fields);
  const values: Record<string, unknown> = {};
  for (const f of fields) {
    values[f.name] = f.type === "images" ? parseIds(s[f.name]) : f.type === "image" ? Number(s[f.name]) || null : (s[f.name] ?? "");
  }
  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 font-display text-3xl">Site content</h1>
      {saved && <p className="mb-4 rounded bg-green-50 p-2 text-sm text-green-800">Saved. Changes are live.</p>}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <SettingsSections groups={SETTINGS_GROUPS} values={values} />
      </div>
    </div>
  );
}

// One form for all groups so a single Save covers everything.
async function SettingsSections({ groups, values }: { groups: typeof SETTINGS_GROUPS; values: Record<string, unknown> }) {
  return (
    <EntityForm
      fields={groups.flatMap((g) => g.fields)}
      values={values}
      action={saveSettings}
      submitLabel="Save all changes"
    />
  );
}
