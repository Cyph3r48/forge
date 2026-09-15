"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ZONES = [
  { href: "/", label: "Status" },
  { href: "/agents", label: "Agents" },
  { href: "/work", label: "Work" },
  { href: "/live", label: "Live" },
  { href: "/memory", label: "Memory" },
  { href: "/connections", label: "Connections" },
  { href: "/runtime", label: "Runtime" },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sidebar">
      <div className="brand">The Forge</div>
      <nav>
        {ZONES.map((z) => (
          <Link key={z.href} href={z.href} className={path === z.href ? "active" : ""}>
            {z.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}