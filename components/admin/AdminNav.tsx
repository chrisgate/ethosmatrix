"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavGroup = { title: string; items: { href: string; label: string; badge?: number }[] };

/** Admin sidebar links grouped by purpose, with the current page highlighted. */
export function AdminNav({ groups }: { groups: NavGroup[] }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(href + "/"));
  return (
    <nav className="space-y-5" aria-label="Admin">
      {groups.map((g) => (
        <div key={g.title}>
          <div className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-white/40">{g.title}</div>
          <ul className="space-y-0.5">
            {g.items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                    active(it.href) ? "bg-gold text-white shadow" : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                  aria-current={active(it.href) ? "page" : undefined}
                >
                  {it.label}
                  {!!it.badge && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-semibold text-white">{it.badge}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
