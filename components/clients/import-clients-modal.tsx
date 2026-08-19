"use client";

import { useRef, useState } from "react";
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { upsertClient } from "@/lib/db/clients";
import type { Client } from "@/types";

interface Props {
  onClose: () => void;
  onDone: () => void;
}

// Maps common Excel column header variants → Client field names
const COLUMN_MAP: Record<string, keyof RowData> = {
  // First name
  "first name": "first_name", "firstname": "first_name", "given name": "first_name",
  "first": "first_name", "name": "first_name", "שם פרטי": "first_name",
  // Last name
  "last name": "last_name", "lastname": "last_name", "surname": "last_name",
  "family name": "last_name", "last": "last_name", "שם משפחה": "last_name",
  // Email
  "email": "email", "e-mail": "email", "email address": "email",
  "mail": "email", "email id": "email", "e mail": "email",
  "to": "email", "to address": "email",
  "אימייל": "email", "דואר אלקטרוני": "email",
  // Phone
  "phone": "phone", "mobile": "phone", "tel": "phone", "telephone": "phone",
  "cell": "phone", "mobile phone": "phone", "phone number": "phone",
  "טלפון": "phone", "נייד": "phone",
  // Salutation
  "salutation": "salutation", "title": "salutation", "mr/mrs": "salutation",
  // Nationality
  "nationality": "nationality", "country": "nationality", "לאום": "nationality",
  // Language
  "language": "language", "שפה": "language",
  // Budget
  "budget min": "budget_min", "budget minimum": "budget_min", "min budget": "budget_min",
  "minimum budget": "budget_min", "budget from": "budget_min",
  "budget max": "budget_max", "budget maximum": "budget_max", "max budget": "budget_max",
  "maximum budget": "budget_max", "budget to": "budget_max", "budget up to": "budget_max",
  // Notes
  "notes": "notes", "note": "notes", "comments": "notes", "remarks": "notes",
  // Stage / class
  "stage": "stage",
  "flowchart step": "stage", "flowchart": "stage", "step": "stage",
  "class": "client_class", "client class": "client_class", "priority": "client_class",
  "client maturity": "client_class", "maturity": "client_class",
  "price class": "price_group", "price group": "price_group", "price": "price_group",
  // Last contact
  "last contact": "last_contact", "last activity": "last_contact", "last contacted": "last_contact",
  // Assigned agent
  "assigned agents": "agent", "assigned agent": "agent", "agent": "agent",
  // Activity
  "activity": "notes", "last activity note": "notes",
};

interface RowData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  salutation?: string;
  nationality?: string;
  language?: string;
  budget_min?: string;
  budget_max?: string;
  notes?: string;
  stage?: string;
  client_class?: string;
  price_group?: string;
  last_contact?: string;
  agent?: string;
}

type ImportStatus = "idle" | "preview" | "importing" | "done";

// Excel serial date → ISO string (handles numeric serial dates and common text formats)
function parseExcelDate(raw?: string): string | undefined {
  if (!raw || raw.trim() === "") return undefined;
  const serial = Number(raw.trim());
  if (!isNaN(serial) && serial > 25569 && serial < 200000) {
    return new Date((serial - 25569) * 86400000).toISOString();
  }
  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = raw.trim().match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const year = y.length === 2 ? `20${y}` : y;
    const dt = new Date(`${year}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`);
    if (!isNaN(dt.getTime())) return dt.toISOString();
  }
  const parsed = new Date(raw.trim());
  return isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

// Maps text class labels (Hot/Warm/Cold) and letters (A/B/C) to Client["clientClass"]
function parseClientClass(raw?: string): Client["clientClass"] {
  const map: Record<string, Client["clientClass"]> = {
    "a": "A", "hot": "A", "1": "A",
    "b": "B", "warm": "B", "2": "B",
    "c": "C", "cold": "C", "3": "C",
  };
  return map[raw?.toLowerCase().trim() ?? ""] ?? "C";
}

export function ImportClientsModal({ onClose, onDone }: Props) {
  const [status, setStatus]     = useState<ImportStatus>("idle");
  const [rows, setRows]         = useState<RowData[]>([]);
  const [headers, setHeaders]   = useState<string[]>([]);
  const [error, setError]       = useState<string | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: 0, errors: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

        if (!raw.length) { setError("The file appears to be empty."); return; }

        // Normalise headers
        const rawHeaders = Object.keys(raw[0]);
        setHeaders(rawHeaders);

        const parsed: RowData[] = raw.map(r => {
          const row: RowData = {};
          for (const [header, val] of Object.entries(r)) {
            const key = COLUMN_MAP[header.toLowerCase().trim()];
            if (key) (row as Record<string, unknown>)[key] = String(val ?? "").trim();
          }
          return row;
        }).filter(r => r.first_name || r.last_name || r.email);

        if (!parsed.length) {
          setError("No valid rows found. Make sure your file has columns like 'First Name', 'Last Name', 'Email'.");
          return;
        }

        setRows(parsed);
        setStatus("preview");
      } catch {
        setError("Could not read the file. Please use .xlsx, .xls, or .csv format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    setStatus("importing");
    setProgress({ done: 0, total: rows.length, errors: 0 });
    let errors = 0;
    const baseTs = Date.now();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const client: Client = {
        id:           `import-${baseTs}-${i}`,
        firstName:    row.first_name || "Unknown",
        lastName:     row.last_name  || "",
        email:        row.email      || undefined,
        phone:        row.phone      || undefined,
        salutation:   (row.salutation as Client["salutation"]) || undefined,
        nationality:  row.nationality || undefined,
        language:     row.language   || undefined,
        budgetMin:    row.budget_min ? Number(row.budget_min.replace(/[^0-9.]/g, "")) || undefined : undefined,
        budgetMax:    row.budget_max ? Number(row.budget_max.replace(/[^0-9.]/g, "")) || undefined : undefined,
        clientClass:  parseClientClass(row.client_class),
        priceGroup:   (row.price_group as Client["priceGroup"]) || undefined,
        primaryAgent: row.agent || undefined,
        stage:        "new_inquiry",
        lastActivityAt:   parseExcelDate(row.last_contact),
        lastActivityNote: row.notes || undefined,
        propertyLocations: [],
        propertyTypes:     [],
        propertyViews:     [],
        coAgentIds:        [],
        createdAt:    new Date().toISOString(),
        updatedAt:    new Date().toISOString(),
      };

      try {
        await upsertClient(client);
      } catch (err) {
        console.error(`[import] row ${i} failed:`, err);
        errors++;
      }

      setProgress({ done: i + 1, total: rows.length, errors });
    }

    setStatus("done");
    setProgress(p => ({ ...p, errors }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet size={20} className="text-[#B8960C]" />
            <h2 className="font-serif text-xl font-semibold text-stone-900">Import Clients</h2>
          </div>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Idle: drop zone */}
          {status === "idle" && (
            <div className="space-y-4">
              <p className="text-sm text-stone-500">
                Upload an Excel or CSV file. Expected columns: <span className="font-medium text-stone-700">First Name, Last Name, Email, Phone, Nationality, Language, Budget Min, Budget Max</span>
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-full h-36 rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-2 text-stone-400 hover:border-[#B8960C] hover:text-[#B8960C] transition-colors"
              >
                <Upload size={28} strokeWidth={1.5} />
                <span className="text-sm font-medium">Click to select file</span>
                <span className="text-xs">.xlsx · .xls · .csv</span>
              </button>
              <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="sr-only" onChange={handleFile} />
              {error && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {status === "preview" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-600">
                  <span className="font-semibold text-stone-900">{rows.length}</span> clients ready to import
                </p>
                <button
                  type="button"
                  onClick={() => { setStatus("idle"); setRows([]); setError(null); }}
                  className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                >
                  Choose different file
                </button>
              </div>

              {/* Show detected columns */}
              <div className="text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2">
                <span className="font-medium text-stone-700">Detected columns: </span>
                {headers.map(h => {
                  const mapped = COLUMN_MAP[h.toLowerCase().trim()];
                  return (
                    <span key={h} className={`inline-block mr-2 px-1.5 py-0.5 rounded ${mapped ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-400 line-through"}`}>
                      {h}
                    </span>
                  );
                })}
              </div>

              {/* Preview table */}
              <div className="rounded-lg border border-stone-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-stone-50 text-stone-500 uppercase tracking-wide">
                      <tr>
                        {["First Name","Last Name","Email","Phone","Nationality","Budget Min","Budget Max"].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {rows.slice(0, 8).map((row, i) => (
                        <tr key={i} className="text-stone-700">
                          <td className="px-3 py-2 whitespace-nowrap">{row.first_name || "—"}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{row.last_name  || "—"}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{row.email      || "—"}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{row.phone      || "—"}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{row.nationality|| "—"}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{row.budget_min || "—"}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{row.budget_max || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {rows.length > 8 && (
                  <p className="px-3 py-2 text-xs text-stone-400 border-t border-stone-100">
                    + {rows.length - 8} more rows
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Importing */}
          {status === "importing" && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <Loader2 size={36} className="text-[#B8960C] animate-spin" />
              <div className="text-center">
                <p className="font-medium text-stone-900">Importing clients…</p>
                <p className="text-sm text-stone-500 mt-1">{progress.done} / {progress.total}</p>
              </div>
              <div className="w-64 h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B8960C] rounded-full transition-all duration-300"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Done */}
          {status === "done" && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <CheckCircle size={40} className="text-green-500" />
              <div className="text-center">
                <p className="font-semibold text-stone-900 text-lg">Import complete</p>
                <p className="text-sm text-stone-500 mt-1">
                  {progress.done - progress.errors} imported successfully
                  {progress.errors > 0 && `, ${progress.errors} failed`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-100">
          {status === "done" ? (
            <button
              type="button"
              onClick={onDone}
              className="px-5 h-9 rounded-lg bg-[#B8960C] text-white text-sm font-semibold hover:bg-[#9e7f0a] transition-colors"
            >
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 h-9 rounded-lg border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              {status === "preview" && (
                <button
                  type="button"
                  onClick={handleImport}
                  className="px-5 h-9 rounded-lg bg-[#B8960C] text-white text-sm font-semibold hover:bg-[#9e7f0a] transition-colors"
                >
                  Import {rows.length} Clients
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
