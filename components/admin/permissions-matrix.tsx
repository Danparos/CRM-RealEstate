import { PERMISSIONS_MATRIX, PERM_CONFIG, ROLE_CONFIG } from "@/lib/agents-config";
import type { UserRole } from "@/types";

const MODULES = ["Dashboard", "Pipeline", "Clients", "Properties", "Calendar", "Reports", "Admin"];
const ROLES: UserRole[] = ["admin", "office_manager", "senior_agent", "agent", "support"];

export function PermissionsMatrix() {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-100">
        <h2 className="font-serif text-xl font-bold text-stone-900">Role Permissions</h2>
        <p className="text-xs text-stone-400 mt-0.5">Access levels by role across all modules</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-400 w-36">Module</th>
              {ROLES.map(role => {
                const cfg = ROLE_CONFIG[role];
                return (
                  <th key={role} className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.badgeClass}`}>
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dotClass}`} />
                      {cfg.label}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {MODULES.map(module => (
              <tr key={module} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-6 py-3 font-medium text-stone-700 text-sm">{module}</td>
                {ROLES.map(role => {
                  const perm = PERMISSIONS_MATRIX[role][module] ?? "none";
                  const cfg = PERM_CONFIG[perm];
                  return (
                    <td key={role} className={`px-4 py-3 text-center ${cfg.cellClass}`}>
                      <span className={`text-xs ${cfg.textClass}`}>{cfg.label}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-stone-100 flex items-center gap-6 bg-stone-50/50">
        <div className="flex items-center gap-1.5 text-xs text-stone-500"><span className="inline-block w-2 h-2 rounded-full bg-emerald-500" /> Full access</div>
        <div className="flex items-center gap-1.5 text-xs text-stone-500"><span className="inline-block w-2 h-2 rounded-full bg-amber-500" /> Edit</div>
        <div className="flex items-center gap-1.5 text-xs text-stone-500"><span className="inline-block w-2 h-2 rounded-full bg-stone-300" /> View only</div>
        <div className="flex items-center gap-1.5 text-xs text-stone-400"><span className="text-stone-300 font-bold">—</span> No access</div>
      </div>
    </div>
  );
}
