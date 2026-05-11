"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

interface Props {
  user: { name: string; role: string; avatar?: string };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen bg-warm-50">
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar user={user} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div
        className="flex flex-col min-h-screen w-full transition-[margin] duration-300 lg:ml-[var(--sidebar-w,240px)]"
      >
        <Header user={user} onMenuToggle={() => setMobileOpen(o => !o)} />
        <main className="flex-1 p-4 md:p-6 mt-16">{children}</main>
      </div>
    </div>
  );
}
