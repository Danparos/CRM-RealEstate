"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Mail,
  Phone,
  Smartphone,
  MapPin,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { getAllContacts, deleteContact } from "@/lib/db/contacts";
import type { Contact } from "@/lib/db/contacts";

// ─── Type config ──────────────────────────────────────────────────────────────

type ContactType = Contact["type"];

const TYPE_TABS: { value: ContactType | "all"; label: string }[] = [
  { value: "all",         label: "All" },
  { value: "lawyer",      label: "Lawyers" },
  { value: "notary",      label: "Notaries" },
  { value: "accountant",  label: "Accountants" },
  { value: "engineer",    label: "Engineers" },
];

const TYPE_COLOR: Record<ContactType, { avatar: string; badge: string }> = {
  lawyer:     { avatar: "bg-violet-100 text-violet-700", badge: "bg-violet-50 text-violet-700 border-violet-200" },
  notary:     { avatar: "bg-amber-100  text-amber-700",  badge: "bg-amber-50  text-amber-700  border-amber-200"  },
  accountant: { avatar: "bg-emerald-100 text-emerald-700", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  engineer:   { avatar: "bg-sky-100   text-sky-700",    badge: "bg-sky-50   text-sky-700   border-sky-200"   },
};

const TYPE_LABEL: Record<ContactType, string> = {
  lawyer:     "Lawyer",
  notary:     "Notary",
  accountant: "Accountant",
  engineer:   "Engineer",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(c: Contact): string {
  return `${(c.firstName?.[0] ?? "").toUpperCase()}${(c.lastName?.[0] ?? "").toUpperCase()}`;
}

function fullName(c: Contact): string {
  return [c.salutation, c.firstName, c.lastName].filter(Boolean).join(" ");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ contact }: { contact: Contact }) {
  const colors = TYPE_COLOR[contact.type];
  return (
    <div
      className={`h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold ${colors.avatar}`}
    >
      {initials(contact)}
    </div>
  );
}

function TypeBadge({ type }: { type: ContactType }) {
  const colors = TYPE_COLOR[type];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${colors.badge}`}
    >
      {TYPE_LABEL[type]}
    </span>
  );
}

function ContactRow({
  contact,
  onEdit,
  onDelete,
}: {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-5 py-4 flex items-start gap-4 hover:shadow-md transition-shadow">
      {/* Avatar */}
      <Avatar contact={contact} />

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-stone-900 text-[15px] leading-tight">
            {fullName(contact)}
          </span>
          <TypeBadge type={contact.type} />
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-stone-500">
          {contact.email && (
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 shrink-0 text-stone-400" />
              <a
                href={`mailto:${contact.email}`}
                className="hover:text-[#B8960C] transition-colors truncate max-w-[200px]"
              >
                {contact.email}
              </a>
            </span>
          )}
          {contact.phone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 shrink-0 text-stone-400" />
              <a href={`tel:${contact.phone}`} className="hover:text-[#B8960C] transition-colors">
                {contact.phone}
              </a>
            </span>
          )}
          {contact.mobile && (
            <span className="inline-flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 shrink-0 text-stone-400" />
              <a href={`tel:${contact.mobile}`} className="hover:text-[#B8960C] transition-colors">
                {contact.mobile}
              </a>
            </span>
          )}
          {contact.address && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-stone-400" />
              <span className="truncate max-w-[220px]">{contact.address}</span>
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onEdit}
          title="Edit contact"
          className="h-8 w-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-[#B8960C] hover:bg-[#fdf9ec] transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          title="Delete contact"
          className="h-8 w-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactsPage() {
  const router = useRouter();

  const [contacts, setContacts]       = useState<Contact[]>([]);
  const [loading, setLoading]         = useState(true);
  const [query, setQuery]             = useState("");
  const [activeTab, setActiveTab]     = useState<ContactType | "all">("all");

  // Load
  useEffect(() => {
    getAllContacts()
      .then(setContacts)
      .finally(() => setLoading(false));
  }, []);

  // Filter
  const filtered = contacts.filter((c) => {
    const matchesType = activeTab === "all" || c.type === activeTab;
    const q = query.trim().toLowerCase();
    const matchesSearch =
      !q ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.email?.toLowerCase().includes(q) ?? false);
    return matchesType && matchesSearch;
  });

  // Counts per tab
  const countFor = (tab: ContactType | "all") =>
    tab === "all"
      ? contacts.length
      : contacts.filter((c) => c.type === tab).length;

  // Delete
  async function handleDelete(contact: Contact) {
    const confirmed = window.confirm(
      `Delete ${fullName(contact)}? This action cannot be undone.`
    );
    if (!confirmed) return;
    await deleteContact(contact.id);
    setContacts((prev) => prev.filter((c) => c.id !== contact.id));
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <h1 className="font-serif text-[36px] font-semibold leading-none tracking-wide text-stone-900">
            Contacts
          </h1>
          <p className="mt-2 text-[13px] uppercase tracking-[0.2em] text-stone-400 font-medium">
            Lawyers, notaries, accountants &amp; engineers
          </p>
        </div>
        <button
          onClick={() => router.push("/contacts/new")}
          className="inline-flex items-center gap-1.5 px-4 h-10 rounded-md text-sm font-medium bg-[#B8960C] text-white shadow-sm hover:bg-[#9a7a0a] transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4 shrink-0" />
          New Contact
        </button>
      </div>

      {/* ── Type filter tabs ── */}
      <div className="flex flex-wrap gap-2">
        {TYPE_TABS.map((tab) => {
          const active = activeTab === tab.value;
          const count  = countFor(tab.value);
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`inline-flex items-center gap-2 px-4 h-9 rounded-full text-sm font-medium border transition-all ${
                active
                  ? "bg-stone-900 border-stone-900 text-white"
                  : "bg-white border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700"
              }`}
            >
              {tab.label}
              <span
                className={`inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full text-[11px] font-semibold ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search bar ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name…"
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-stone-200 bg-white text-sm text-stone-800 placeholder:text-stone-400 outline-none transition-all focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 shadow-sm"
        />
      </div>

      {/* ── Contact list ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-[#B8960C] border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="h-14 w-14 rounded-full bg-stone-100 flex items-center justify-center">
            <Users className="h-7 w-7 text-stone-300" />
          </div>
          <p className="text-stone-500 text-sm font-medium">No contacts yet</p>
          <p className="text-stone-400 text-xs">
            Add lawyers, notaries, accountants and engineers to your network.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              onEdit={() => router.push(`/contacts/${contact.id}`)}
              onDelete={() => handleDelete(contact)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
