import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";

const mockUser = { name: "Dan Paul", role: "Office Manager" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <DashboardShell user={mockUser}>
        {children}
      </DashboardShell>
    </Suspense>
  );
}
