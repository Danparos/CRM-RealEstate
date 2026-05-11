"use client";

import { useState, useEffect } from "react";
import { Plus, Check, X } from "lucide-react";
import { AREAS, getAreas, saveCustomArea } from "@/lib/constants";

interface Props {
  value: string;
  onChange: (val: string) => void;
  inputClassName: string;
  required?: boolean;
}

export function AreaSelect({ value, onChange, inputClassName, required }: Props) {
  const [allAreas, setAllAreas] = useState(AREAS);
  const [adding, setAdding] = useState(false);
  const [newArea, setNewArea] = useState("");

  useEffect(() => { setAllAreas(getAreas()); }, []);

  const confirm = () => {
    const trimmed = newArea.trim();
    if (!trimmed) return;
    saveCustomArea(trimmed);
    setAllAreas(getAreas());
    onChange(trimmed);
    setNewArea("");
    setAdding(false);
  };

  // Make sure current value is always selectable (e.g. custom area already saved)
  const options = allAreas.includes(value)
    ? allAreas
    : [...allAreas, value].filter(Boolean).sort((a, b) => a.localeCompare(b));

  if (adding) {
    return (
      <div className="flex gap-1.5">
        <input
          type="text"
          autoFocus
          value={newArea}
          onChange={e => setNewArea(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") { e.preventDefault(); confirm(); }
            if (e.key === "Escape") { setAdding(false); setNewArea(""); }
          }}
          placeholder="New area name…"
          className={inputClassName}
        />
        <button type="button" onClick={confirm}
          className="shrink-0 inline-flex items-center justify-center px-2.5 rounded-lg bg-[#B8960C] text-white self-stretch hover:bg-[#9e7f0a] transition-colors">
          <Check size={13} strokeWidth={2.5} />
        </button>
        <button type="button" onClick={() => { setAdding(false); setNewArea(""); }}
          className="shrink-0 inline-flex items-center justify-center px-2.5 rounded-lg border border-stone-200 text-stone-500 self-stretch hover:border-stone-300 transition-colors">
          <X size={13} strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-1.5">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className={`${inputClassName} flex-1`}
      >
        {options.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      <button type="button" onClick={() => setAdding(true)}
        className="shrink-0 inline-flex items-center justify-center px-2.5 rounded-lg border border-stone-200 text-stone-400 self-stretch hover:border-[#B8960C] hover:text-[#B8960C] transition-colors"
        title="Add new area">
        <Plus size={13} strokeWidth={2} />
      </button>
    </div>
  );
}
