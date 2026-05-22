"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { EditableStage } from "@/hooks/use-pipeline-stages";

interface StagePickerProps {
  stages: EditableStage[];
  currentStageId: string;
  onSelect: (stageId: string) => void;
  onClose: () => void;
}

export function StagePicker({ stages, currentStageId, onSelect, onClose }: StagePickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const others = stages.filter((s) => s.id !== currentStageId);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute left-0 bottom-full mb-1 z-30 w-56",
        "bg-white rounded-xl border border-stone-200 shadow-xl overflow-hidden"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 border-b border-stone-100">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Move to stage</p>
      </div>
      <div className="py-1">
        {others.map((stage) => (
          <button
            key={stage.id}
            type="button"
            onClick={() => { onSelect(stage.id); onClose(); }}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2",
              "text-left text-[12px] text-stone-700 font-medium",
              "hover:bg-stone-50 transition-colors"
            )}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: stage.color }}
            />
            {stage.label}
          </button>
        ))}
      </div>
    </div>
  );
}
