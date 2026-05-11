import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

const mockUser = { name: "Errikos Kohls", role: "Office Manager" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-warm-50">
      <Suspense fallback={null}>
        <Sidebar user={mockUser} />
      </Suspense>
      <div className="flex flex-col min-h-screen w-full transition-[margin] duration-300" style={{ marginLeft: "var(--sidebar-w, 240px)" }}>
        <Suspense fallback={null}>
          <Header user={mockUser} />
        </Suspense>
        <main className="flex-1 pt-16 p-6">{children}</main>
      </div>
    </div>
  );
}
