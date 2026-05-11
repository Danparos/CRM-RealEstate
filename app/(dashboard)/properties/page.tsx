import Link from "next/link";
import { Plus } from "lucide-react";
import { mockProperties } from "@/lib/mock-data";
import { PropertyGridClient } from "@/components/properties/property-grid-client";
import type { PropertyStatus } from "@/types";

interface Props {
  searchParams: { status?: string };
}

const STATUS_LABELS: Partial<Record<PropertyStatus, string>> = {
  available:      "Available",
  under_offer:    "Under Offer",
  under_contract: "Under Contract",
  sold:           "Sold",
  off_market:     "Off Market",
  draft:          "Draft",
  rented:         "Rented",
  withdrawn:      "Withdrawn",
  archived:       "Archived",
};

const TABS: { label: string; value?: string }[] = [
  { label: "All" },
  { label: "Available",   value: "available"   },
  { label: "Under Offer", value: "under_offer" },
  { label: "Sold",        value: "sold"        },
];

export default function PropertiesPage({ searchParams }: Props) {
  const statusFilter = searchParams.status as PropertyStatus | undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 pb-2 border-b border-stone-100">
        <div>
          <h1 className="font-serif text-[36px] font-semibold leading-none tracking-wide text-stone-900">
            {statusFilter ? (
              <>Properties <span className="text-stone-300 mx-3 font-light">/</span> <span className="text-[#B8960C]">{STATUS_LABELS[statusFilter] ?? statusFilter}</span></>
            ) : "Properties"}
          </h1>
          <p className="mt-2 text-[13px] uppercase tracking-[0.2em] text-stone-400 font-medium">
            Paros property listings
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/properties/new"
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold rounded-lg bg-[#B8960C] text-white shadow-sm hover:bg-[#9e7f0a] transition-colors tracking-wide">
            <Plus size={15} strokeWidth={2} />
            Add Property
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {TABS.map((tab) => {
          const isActive = tab.value === statusFilter || (!tab.value && !statusFilter);
          const href = tab.value ? `/properties?status=${tab.value}` : "/properties";
          return (
            <Link key={tab.label} href={href}
              className={isActive
                ? "inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-[#B8960C] text-white shadow-sm"
                : "inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium border border-stone-300 text-stone-600 hover:border-[#B8960C] hover:text-[#B8960C] transition-colors"
              }>
              {tab.label}
            </Link>
          );
        })}
      </div>

      <PropertyGridClient
        serverProperties={mockProperties}
        statusFilter={statusFilter}
      />
    </div>
  );
}
