"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PropertyDetail } from "@/components/properties/property-detail";
import { getProperty } from "@/lib/db/properties";
import type { Property } from "@/types";

export function LocalPropertyLoader({ id }: { id: string }) {
  const [property, setProperty] = useState<Property | null | undefined>(undefined);

  useEffect(() => {
    getProperty(id)
      .then(found => setProperty(found ?? null))
      .catch(() => setProperty(null));
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
