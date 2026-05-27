"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Check, Trash2 } from "lucide-react";
import {
  Contact,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} from "@/lib/db/contacts";
import { cn } from "@/lib/utils";

// ── tiny helpers ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">
        {label}
      </span>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40 w-full"
    />
  );
}

// ── type pill labels ─────────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: Contact["type"]; label: string }[] = [
  { value: "lawyer",     label: "Lawyer" },
  { value: "notary",     label: "Notary" },
  { value: "accountant", label: "Accountant" },
  { value: "engineer",   label: "Engineer" },
];

const SALUTATION_OPTIONS: Contact["salutation"][] = ["Mr", "Mrs", "Ms", "Dr"];

// ── blank form ───────────────────────────────────────────────────────────────

type FormState = Omit<Contact, "id" | "createdAt" | "updatedAt">;

function blankForm(): FormState {
  return {
    type:       "lawyer",
    salutation: undefined,
    firstName:  "",
    lastName:   "",
    email:      undefined,
    phone:      undefined,
    mobile:     undefined,
    address:    undefined,
    notes:      undefined,
  };
}

function contactToForm(c: Contact): FormState {
  return {
    type:       c.type,
    salutation: c.salutation,
    firstName:  c.firstName,
    lastName:   c.lastName,
    email:      c.email,
    phone:      c.phone,
    mobile:     c.mobile,
    address:    c.address,
    notes:      c.notes,
  };
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const router  = useRouter();
  const isNew   = params.id === "new";

  const [form,    setForm]    = useState<FormState>(blankForm());
  const [loading, setLoading] = useState(!isNew);
  const [found,   setFound]   = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  // load existing contact
  useEffect(() => {
    if (isNew) return;
    getContact(params.id).then((c) => {
      if (!c) { setFound(false); }
      else    { setForm(contactToForm(c)); }
      setLoading(false);
    });
  }, [params.id, isNew]);

  const update = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: val || undefined }));
  }, []);

  // ── save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    if (isNew) {
      const created = await createContact(form);
      setSaving(false);
      if (created) {
        router.push(`/contacts/${created.id}`);
      }
    } else {
      await updateContact(params.id, form);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  // ── delete ────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!confirm("Delete this contact? This cannot be undone.")) return;
    await deleteContact(params.id);
    router.push("/contacts");
  }

  // ── loading / not found ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-7 w-7 rounded-full border-2 border-[#B8960C] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!found) {
    return (
      <div className="text-center py-24 text-stone-400">
        <p>Contact not found.</p>
        <Link
          href="/contacts"
          className="text-[#B8960C] text-sm font-semibold hover:underline mt-2 block"
        >
          Back to contacts
        </Link>
      </div>
    );
  }

  const displayName =
    form.firstName || form.lastName
      ? [form.salutation, form.firstName, form.lastName].filter(Boolean).join(" ")
      : isNew
      ? "New Contact"
      : "Contact";

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/contacts"
            className="h-8 w-8 flex items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={2} />
          </Link>
          <h1 className="font-serif text-[22px] font-semibold text-stone-900 leading-tight">
            {displayName}
          </h1>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold transition-all",
            saved
              ? "bg-emerald-500 text-white"
              : "bg-[#B8960C] text-white hover:bg-[#9a7a0a]"
          )}
        >
          {saved ? (
            <>
              <Check size={14} strokeWidth={2.5} />
              Saved
            </>
          ) : saving ? (
            "Saving…"
          ) : (
            <>
              <Save size={14} strokeWidth={2} />
              Save
            </>
          )}
        </button>
      </div>

      {/* ── Form card ── */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-6 py-6 space-y-6">

        {/* Type pills */}
        <Field label="Type">
          <div className="flex flex-wrap gap-2 pt-0.5">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, type: opt.value }))}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold border transition-all",
                  form.type === opt.value
                    ? "bg-[#B8960C] text-white border-[#B8960C]"
                    : "bg-white text-stone-500 border-stone-300 hover:border-[#B8960C] hover:text-[#B8960C]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="h-px bg-stone-100" />

        {/* Salutation + Name row */}
        <div className="grid grid-cols-3 gap-4">
          <Field label="Salutation">
            <select
              value={form.salutation ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  salutation: (e.target.value as Contact["salutation"]) || undefined,
                }))
              }
              className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40 w-full bg-white"
            >
              <option value="">—</option>
              {SALUTATION_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field label="First Name">
            <Input
              value={form.firstName}
              onChange={(v) => setForm((prev) => ({ ...prev, firstName: v }))}
              placeholder="First name"
            />
          </Field>

          <Field label="Last Name">
            <Input
              value={form.lastName}
              onChange={(v) => setForm((prev) => ({ ...prev, lastName: v }))}
              placeholder="Last name"
            />
          </Field>
        </div>

        {/* Contact details */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email">
            <Input
              value={form.email ?? ""}
              onChange={(v) => update("email", v)}
              placeholder="name@example.com"
              type="email"
            />
          </Field>

          <Field label="Phone">
            <Input
              value={form.phone ?? ""}
              onChange={(v) => update("phone", v)}
              placeholder="+30 210 …"
            />
          </Field>

          <Field label="Mobile">
            <Input
              value={form.mobile ?? ""}
              onChange={(v) => update("mobile", v)}
              placeholder="+30 6 …"
            />
          </Field>

          <Field label="Address">
            <Input
              value={form.address ?? ""}
              onChange={(v) => update("address", v)}
              placeholder="Street, City"
            />
          </Field>
        </div>

        {/* Notes */}
        <Field label="Notes">
          <textarea
            rows={3}
            value={form.notes ?? ""}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Internal notes…"
            className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
          />
        </Field>
      </div>

      {/* Delete button — only in edit mode */}
      {!isNew && (
        <div className="flex justify-end pt-2 pb-8">
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-xs text-stone-300 hover:text-red-400 transition-colors"
          >
            <Trash2 size={12} strokeWidth={2} />
            Delete this contact
          </button>
        </div>
      )}
    </div>
  );
}
