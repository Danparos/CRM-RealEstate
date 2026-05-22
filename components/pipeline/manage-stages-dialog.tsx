"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { EditableStage } from "@/hooks/use-pipeline-stages";

const PRESET_COLORS = [
  "#0ea5e9", "#8b5cf6", "#6366f1", "#B8960C",
  "#f97316", "#CD853F", "#22c55e", "#ef4444",
  "#ec4899", "#14b8a6", "#64748b", "#1d4ed8",
];

interface Props {
  open: boolean;
  stages: EditableStage[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<EditableStage>) => void;
  onAdd: (after?: string) => string;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
  onReset: () => void;
  clientCountByStage: Record<string, number>;
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 p-2 bg-stone-50 rounded-lg border border-stone-200">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
            value === c ? "border-stone-700 scale-110" : "border-transparent"
          )}
          style={{ backgroundColor: c }}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
        title="Custom colour"
      />
    </div>
  );
}

interface StageRowProps {
  stage: EditableStage;
  index: number;
  total: number;
  clientCount: number;
  onUpdate: (updates: Partial<EditableStage>) => void;
  onDelete: () => void;
  onMove: (dir: "up" | "down") => void;
}

function StageRow({ stage, index, total, clientCount, onUpdate, onDelete, onMove }: StageRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className={cn(
      "rounded-xl border border-stone-200 bg-white overflow-hidden",
      "transition-shadow hover:shadow-sm"
    )}>
      {/* Row header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Move buttons */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onMove("up")}
            disabled={index === 0}
            className="w-5 h-4 flex items-center justify-center text-stone-300 hover:text-stone-600 disabled:opacity-20 disabled:cursor-not-allowed text-xs"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => onMove("down")}
            disabled={index === total - 1}
            className="w-5 h-4 flex items-center justify-center text-stone-300 hover:text-stone-600 disabled:opacity-20 disabled:cursor-not-allowed text-xs"
          >
            ▼
          </button>
        </div>

        {/* Color dot */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowColorPicker((p) => !p)}
            className="w-4 h-4 rounded-full border-2 border-white shadow-md ring-1 ring-stone-200 hover:scale-110 transition-transform"
            style={{ backgroundColor: stage.color }}
            title="Change colour"
          />
          {showColorPicker && (
            <div className="absolute left-0 top-6 z-20 w-48 shadow-xl rounded-xl overflow-hidden border border-stone-200">
              <ColorPicker value={stage.color} onChange={(c) => { onUpdate({ color: c }); setShowColorPicker(false); }} />
            </div>
          )}
        </div>

        {/* Stage label (inline edit) */}
        <input
          type="text"
          value={stage.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="flex-1 min-w-0 text-sm font-semibold text-stone-800 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40 rounded px-1 py-0.5"
          placeholder="Stage name"
        />

        {/* Client count badge */}
        <span className={cn(
          "shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full tabular-nums",
          clientCount > 0 ? "bg-[#B8960C]/10 text-[#B8960C]" : "bg-stone-100 text-stone-400"
        )}>
          {clientCount} client{clientCount !== 1 ? "s" : ""}
        </span>

        {/* Expand/collapse */}
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="shrink-0 text-stone-400 hover:text-stone-700 text-xs px-2 py-1 rounded hover:bg-stone-100 transition-colors"
        >
          {expanded ? "▲ less" : "▼ edit"}
        </button>

        {/* Delete */}
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="shrink-0 text-stone-300 hover:text-red-400 transition-colors"
            title="Delete stage"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4h6v2"/>
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-red-400 font-medium">
              {clientCount > 0 ? `${clientCount} clients will be unassigned` : "Delete?"}
            </span>
            <button
              type="button"
              onClick={() => { onDelete(); setConfirmDelete(false); }}
              className="text-[11px] font-semibold text-white bg-red-400 hover:bg-red-500 px-2 py-0.5 rounded transition-colors"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-[11px] text-stone-500 hover:text-stone-700 px-1"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Expanded detail editor */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-stone-100 flex flex-col gap-3 bg-stone-50/50">
          <div className="grid grid-cols-1 gap-3 pt-3">
            {/* Description */}
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Description</span>
              <input
                type="text"
                value={stage.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                className="text-sm text-stone-700 bg-white border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
                placeholder="Short description shown in column header"
              />
            </label>

            {/* Enter trigger */}
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Entry Trigger</span>
              <input
                type="text"
                value={stage.enterTrigger}
                onChange={(e) => onUpdate({ enterTrigger: e.target.value })}
                className="text-sm text-stone-700 bg-white border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
                placeholder="What causes a client to enter this stage?"
              />
            </label>

            {/* Exit trigger */}
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Advancement Trigger</span>
              <input
                type="text"
                value={stage.exitTrigger}
                onChange={(e) => onUpdate({ exitTrigger: e.target.value })}
                className="text-sm text-stone-700 bg-white border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
                placeholder="What triggers advancement to the next stage?"
              />
            </label>

            {/* SLA warning */}
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">SLA Warning (days)</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={9999}
                  value={stage.slaWarningDays === 9999 ? "" : stage.slaWarningDays}
                  onChange={(e) => onUpdate({ slaWarningDays: Number(e.target.value) || 9999 })}
                  className="w-24 text-sm text-stone-700 bg-white border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40 tabular-nums"
                  placeholder="∞"
                />
                <span className="text-[11px] text-stone-400">days before orange warning badge appears on client cards</span>
              </div>
            </label>

            {/* Colour picker expanded */}
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Stage Colour</span>
              <ColorPicker value={stage.color} onChange={(c) => onUpdate({ color: c })} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export function ManageStagesDialog({
  open, stages, onClose, onUpdate, onAdd, onDelete, onMove, onReset, clientCountByStage,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(28,20,10,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white shrink-0">
          <div>
            <h2 className="font-serif text-xl font-semibold text-stone-900 leading-none">Manage Pipeline Stages</h2>
            <p className="text-[11px] text-stone-400 mt-1 uppercase tracking-wider">Add · Edit · Reorder · Delete</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        {/* Stage list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2.5">
          {stages.map((stage, idx) => (
            <StageRow
              key={stage.id}
              stage={stage}
              index={idx}
              total={stages.length}
              clientCount={clientCountByStage[stage.id] ?? 0}
              onUpdate={(updates) => onUpdate(stage.id, updates)}
              onDelete={() => onDelete(stage.id)}
              onMove={(dir) => onMove(stage.id, dir)}
            />
          ))}

          {/* Add stage button */}
          <button
            type="button"
            onClick={() => onAdd()}
            className={cn(
              "w-full py-3 rounded-xl border-2 border-dashed border-[#B8960C]/40",
              "text-[13px] font-semibold text-[#B8960C] hover:bg-[#B8960C]/5",
              "transition-colors flex items-center justify-center gap-2"
            )}
          >
            <span className="text-lg leading-none">+</span>
            Add Stage
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100 bg-stone-50/50 shrink-0">
          <button
            type="button"
            onClick={onReset}
            className="text-[12px] text-stone-400 hover:text-stone-600 underline underline-offset-2 transition-colors"
          >
            Reset to defaults
          </button>
          <div className="flex items-center gap-2 text-[11px] text-stone-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            Changes saved automatically
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 text-white text-[13px] font-semibold hover:bg-stone-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
