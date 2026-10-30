"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions";
import { AdminNav, type NavGroup } from "./AdminNav";

/** Dark sidebar on desktop; a compact top bar with a menu button on phones (closes after navigating). */
export function AdminSidebar({ groups }: { groups: NavGroup[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  const pending = groups.flatMap((g) => g.items).reduce((n, i) => n + (i.badge ?? 0), 0);

  return (
    <aside className="bg-ink text-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:overflow-y-auto md:p-4">
      <div className="flex items-center justify-between gap-2 px-4 py-3 md:mb-6 md:px-3 md:pb-0 md:pt-1">
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap font-display text-[24px] font-semibold leading-none">Ethos Matrix</span>
          <span className="rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="admin-menu"
          className="relative flex h-10 w-10 items-center justify-center rounded-md border border-white/20 md:hidden"
        >
          <span className="sr-only">Menu</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
          {!open && pending > 0 && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500" />}
        </button>
      </div>

      <div id="admin-menu" className={`${open ? "block" : "hidden"} max-h-[calc(100vh-64px)] overflow-y-auto px-4 pb-4 md:block md:max-h-none md:overflow-visible md:p-0`}>
        <AdminNav groups={groups} />
        <div className="mt-6 space-y-0.5 border-t border-white/10 pt-4">
          <Link href="/" target="_blank" className="block rounded-md px-3 py-2 text-sm text-gold hover:bg-white/10">View site ↗</Link>
          <form action={logoutAction}>
            <button className="w-full rounded-md px-3 py-2 text-left text-sm text-white/60 hover:bg-white/10 hover:text-white">Sign out</button>
          </form>
        </div>
      </div>
    </aside>
  );
}
