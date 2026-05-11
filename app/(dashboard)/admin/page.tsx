import { AgentsClient } from "@/components/admin/agents-client";
import { PermissionsMatrix } from "@/components/admin/permissions-matrix";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 pb-2 border-b border-stone-100">
        <div>
          <h1 className="font-serif text-[36px] font-semibold leading-none tracking-wide text-stone-900">
            Admin
          </h1>
          <p className="mt-2 text-[13px] uppercase tracking-[0.2em] text-stone-400 font-medium">
            Team management &amp; permissions
          </p>
        </div>
      </div>

      <section>
        <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-4">Agents</h2>
        <AgentsClient />
      </section>

      <section>
        <PermissionsMatrix />
      </section>
    </div>
  );
}
