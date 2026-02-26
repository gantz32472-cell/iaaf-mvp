import Link from "next/link";
import type { Route } from "next";
import { APP_NAME } from "@/lib/constants";

const items: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Dashboard" },
  { href: "/offers", label: "Offers" },
  { href: "/content", label: "Content" },
  { href: "/posts", label: "Posts" },
  { href: "/dm-rules", label: "DM Rules" },
  { href: "/analytics", label: "Analytics" }
];

export function Nav() {
  return (
    <aside className="sticky top-0 h-screen w-full max-w-64 border-r border-brand-100 bg-white/80 p-4 backdrop-blur">
      <div className="mb-6 rounded-2xl bg-brand-900 p-4 text-white">
        <div className="text-xs uppercase tracking-[0.2em] text-brand-100">IAAF</div>
        <div className="mt-1 text-xl font-semibold">{APP_NAME}</div>
        <div className="mt-2 text-xs text-brand-100">Instagram比較アフィリエイト運用自動化</div>
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-900"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}