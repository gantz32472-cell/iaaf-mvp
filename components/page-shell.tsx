import { ReactNode } from "react";
import { Nav } from "@/components/nav";

export function PageShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <Nav />
      <main className="p-4 md:p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        </header>
        {children}
      </main>
    </div>
  );
}
