"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AddPropertyForm } from "@/components/properties/add-property-form";

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 pb-2 border-b border-stone-100">
        <div className="flex items-start gap-4">
          <Link href="/properties"
            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-colors shadow-sm">
            <ArrowLeft size={15} strokeWidth={2} />
          </Link>
          <div>
            <p className="text-[13px] uppercase tracking-[0.2em] text-stone-400 font-medium mb-1">
              Properties <span className="text-[#B8960C] mx-2 font-light">/</span>
              <span className="text-[#B8960C]">New Property</span>
            </p>
            <h1 className="font-serif text-[36px] font-semibold leading-none tracking-wide text-stone-900">
              Add Property
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl">
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8">
          <AddPropertyForm />
        </div>
      </div>
    </div>
  );
}
