// ─── Property option lists ───────────────────────────────────────────────────
// Edit these arrays to add / remove options across the entire app.
// Used by: add-property-form, edit-property-form, property-detail inline editor.

const CUSTOM_AREAS_KEY = "crm-custom-areas";

export function getAreas(): string[] {
  if (typeof window === "undefined") return AREAS;
  try {
    const custom = JSON.parse(localStorage.getItem(CUSTOM_AREAS_KEY) ?? "[]") as string[];
    const seen = new Set<string>();
    return [...AREAS, ...custom].filter(a => seen.has(a) ? false : (seen.add(a), true)).sort((a, b) => a.localeCompare(b));
  } catch { return AREAS; }
}

export function saveCustomArea(area: string) {
  const trimmed = area.trim();
  if (!trimmed || AREAS.includes(trimmed)) return;
  try {
    const custom = JSON.parse(localStorage.getItem(CUSTOM_AREAS_KEY) ?? "[]") as string[];
    if (!custom.includes(trimmed)) {
      localStorage.setItem(CUSTOM_AREAS_KEY, JSON.stringify([...custom, trimmed]));
    }
  } catch {}
}

export const AREAS = [
  "Naoussa", "Parikia", "Lefkes", "Alyki", "Golden Beach", "Marpissa",
  "Santa Maria", "Kolymbithres", "Prodromos", "Ambelas", "Kamares",
  "Piso Livadi", "Ysterni", "Pyrgaki", "Dryos", "Pounta", "Filizi",
  "Tsoukalia", "Tzanes", "Makria Miti", "Agkairia", "Lolantonis",
];

export const HEATING_OPTIONS = [
  "Central Heating", "Autonomous / Gas", "Underfloor Heating",
  "Solar", "Air Conditioning", "Fireplace", "Electric",
];

export const FEATURE_OPTIONS = [
  "Seafront", "Sea View", "Pool", "Private Garden", "Terrace",
  "Balcony", "Parking", "Garage", "Storage Room", "Elevator",
  "Air Conditioning", "Fireplace", "Alarm System", "CCTV",
  "Furnished", "Fully Equipped Kitchen", "Solar Panels",
  "Borehole", "Guesthouse", "Helipad",
];
