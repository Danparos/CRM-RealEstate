"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

interface Props {
  user: { name: string; role: string; avatar?: string };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed,  setCollapsed]  = useState(false);

  return (
    <div className="min-h-screen bg-warm-50">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        user={user}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Content shifts right by sidebar width using padding-left */}
      <div
        className="flex flex-col min-h-screen"
        style={{ paddingLeft: collapsed ? "4rem" : "15rem", transition: "padding-left 300ms" }}
      >
        <Header user={user} collapsed={collapsed} onMenuToggle={() => setMobileOpen(o => !o)} />
        <main className="flex-1 p-4 md:p-6 mt-16">{children}</main>
      </div>
    </div>
  );
}
