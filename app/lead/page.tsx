"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";

const BUDGET_OPTIONS = [
  { label: "Up to €500k",     value: "entry",   max: 500000   },
  { label: "€500k – €1M",     value: "mid",     max: 1000000  },
  { label: "€1M – €2M",       value: "premium", max: 2000000  },
  { label: "€2M – €5M",       value: "luxury",  max: 5000000  },
  { label: "€5M+",            value: "ultra",   max: 10000000 },
  { label: "Flexible / Open", value: "",        max: undefined },
];

const PROPERTY_TYPES = [
  "Villa", "Apartment", "House", "Plot / Land",
  "Investment", "New Project", "Hotel",
];

const LOCATIONS = [
  "Parikia", "Naoussa", "Lefkes", "Alyki",
  "Golden Beach", "Santa Maria", "Piso Livadi",
  "Antiparos", "Other",
];

const inp = "h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm text-stone-800 outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 transition-all placeholder:text-stone-400";

function LeadFormInner() {
  const params = useSearchParams();
  const agentId   = params.get("agent")      ?? undefined;
  const agentName = params.get("agentName")  ?? undefined;
  const source    = params.get("source")     ?? "web form";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    budget: "",
    types: [] as string[],
    locations: [] as string[],
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const toggleArr = (arr: string[], val: string): string[] =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email && !form.phone) {
      setErrorMsg("Please provide an email or phone number.");
      return;
    }
    setErrorMsg("");
    setStatus("sending");

    const budget = BUDGET_OPTIONS.find(b => b.value === form.budget);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName:         form.firstName,
          lastName:          form.lastName,
          email:             form.email   || undefined,
          phone:             form.phone   || undefined,
          priceGroup:        budget?.value || undefined,
          budgetMax:         budget?.max,
          propertyTypes:     form.types.map(t => t.toLowerCase().replace(/ \/ /g, "_").replace(/ /g, "_")),
          propertyLocations: form.locations,
          message:           form.message || undefined,
          agentId,
          agentName,
          source,
        }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (status === "done") {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-12 max-w-md w-full text-center">
          <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="font-serif text-3xl font-semibold text-stone-900 mb-3">Thank you!</h2>
          <p className="text-stone-500 leading-relaxed">
            We&apos;ve received your enquiry and will be in touch shortly.
          </p>
          {agentName && (
            <p className="mt-3 text-sm text-stone-400">
              {agentName} will contact you soon.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#B8960C] mb-3">Paros Real Estate</p>
          <h1 className="font-serif text-4xl font-semibold text-stone-900 leading-tight mb-3">
            Find Your Property in Paros
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            Tell us what you&apos;re looking for and we&apos;ll match you with the right properties.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-stone-100 shadow-xl p-8 space-y-6">

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">First Name *</label>
              <input
                required
                type="text"
                value={form.firstName}
                onChange={e => set("firstName", e.target.value)}
                placeholder="Maria"
                className={inp}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Last Name *</label>
              <input
                required
                type="text"
                value={form.lastName}
                onChange={e => set("lastName", e.target.value)}
                placeholder="Smith"
                className={inp}
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set("email", e.target.value)}
                placeholder="you@email.com"
                className={inp}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Phone / WhatsApp</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set("phone", e.target.value)}
                placeholder="+30 694 …"
                className={inp}
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Budget</label>
            <select
              value={form.budget}
              onChange={e => set("budget", e.target.value)}
              className={inp + " appearance-none cursor-pointer"}
            >
              <option value="">Select a range…</option>
              {BUDGET_OPTIONS.map(b => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>

          {/* Property types */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Property Type</label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("types", toggleArr(form.types, t))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.types.includes(t)
                      ? "bg-[#B8960C] text-white border-[#B8960C]"
                      : "bg-white text-stone-600 border-stone-200 hover:border-[#B8960C] hover:text-[#B8960C]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Preferred Area</label>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map(loc => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => set("locations", toggleArr(form.locations, loc))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.locations.includes(loc)
                      ? "bg-[#B8960C] text-white border-[#B8960C]"
                      : "bg-white text-stone-600 border-stone-200 hover:border-[#B8960C] hover:text-[#B8960C]"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Tell us more (optional)</label>
            <textarea
              value={form.message}
              onChange={e => set("message", e.target.value)}
              placeholder="e.g. Looking for a sea-view villa with pool, preferably north Paros…"
              rows={3}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 transition-all placeholder:text-stone-400 resize-none"
            />
          </div>

          {/* Error */}
          {(status === "error" || errorMsg) && (
            <p className="text-sm text-red-500 font-medium">{errorMsg || "Something went wrong. Please try again."}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full h-12 rounded-xl bg-[#B8960C] text-white font-semibold text-sm hover:bg-[#9e7f0a] transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {status === "sending" ? (
              <><Loader2 size={16} className="animate-spin" /> Sending…</>
            ) : (
              "Send Enquiry"
            )}
          </button>

          <p className="text-center text-[11px] text-stone-400">
            We respect your privacy. Your details are never shared with third parties.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LeadPage() {
  return (
    <Suspense>
      <LeadFormInner />
    </Suspense>
  );
}
