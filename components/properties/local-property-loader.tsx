"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PropertyDetail } from "@/components/properties/property-detail";
import type { Property } from "@/types";

const EXTRA_KEY     = "crm-extra-properties";
const OVERRIDE_KEY  = "crm-property-overrides";

export function LocalPropertyLoader({ id }: { id: string }) {
  const [property, setProperty] = useState<Property | null | undefined>(undefined);

  useEffect(() => {
    try {
      const extras    = JSON.parse(localStorage.getItem(EXTRA_KEY)    ?? "[]") as Property[];
      const overrides = JSON.parse(localStorage.getItem(OVERRIDE_KEY) ?? "{}") as Record<string, Property>;
      const found     = overrides[id] ?? extras.find(p => p.id === id) ?? null;
      setProperty(found);
    } catch {
      setProperty(null);
    }
  }, [id]);

  if (property === undefined) {
    return <div className="py-24 text-center text-stone-400 text-sm">Loading…</div>;
  }

  if (property === null) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="font-serif text-xl text-stone-500">Property not found</p>
        <Link href="/properties" className="text-sm text-[#B8960C] hover:underline">
          ← Back to Properties
        </Link>
      </div>
    );
  }

  return <PropertyDetail property={property} />;
}
