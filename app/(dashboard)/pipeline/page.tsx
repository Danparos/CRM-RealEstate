import { Suspense } from "react";
import { PipelinePageClient } from "@/components/pipeline/pipeline-page-client";
import { PIPELINE_STAGES } from "@/lib/mock-data";

export default function PipelinePage() {
  return (
    <Suspense fallback={<div className="p-6 text-stone-400 text-sm">Loading…</div>}>
      <PipelinePageClient stages={PIPELINE_STAGES} />
    </Suspense>
  );
}
