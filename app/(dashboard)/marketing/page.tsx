import { Suspense } from "react";
import { MarketingPageClient } from "@/components/marketing/marketing-page-client";

export default function MarketingPage() {
  return (
    <Suspense fallback={<div className="p-6 text-stone-400 text-sm">Loading…</div>}>
      <MarketingPageClient />
    </Suspense>
  );
}
