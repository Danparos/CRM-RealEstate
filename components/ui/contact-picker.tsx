"use client";

import { useEffect, useState } from "react";
import { Contact, getAllContacts } from "@/lib/db/contacts";
import { cn } from "@/lib/utils";
import { User, X, ChevronDown, ExternalLink } from "lucide-react";

interface ContactPickerProps {
  type: "lawyer" | "notary" | "accountant" | "engineer";
  value?: string;
  onChange: (id: string | undefined) => void;
  label?: string;
  placeholder?: string;
}

export default function ContactPicker({
  type,
  value,
  onChange,
  label,
  placeholder,
}: ContactPickerProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllContacts(type)
      .then(setContacts)
      .finally(() => setLoading(false));
  }, [type]);

  const selectedContact = contacts.find((c) => c.id === value);

  const displayLabel =
    label ??
    type.charAt(0).toUpperCase() + type.slice(1);

  const defaultPlaceholder = placeholder ?? `— Select ${displayLabel} —`;

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newValue = e.target.value;

    if (newValue === "__new__") {
      window.open("/contacts/new", "_blank");
      e.target.value = value ?? "";
      return;
    }

    onChange(newValue || undefined);
  }

  return (
    <div className="w-full">
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-400">
          <User className="h-4 w-4" />
        </span>

        <select
          value={value ?? ""}
          onChange={handleChange}
          disabled={loading}
          className={cn(
            "w-full appearance-none rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-8 text-sm text-stone-800 shadow-sm",
            "focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40 focus:border-[#B8960C]/60",
            "disabled:cursor-not-allowed disabled:opacity-50",
            loading && "text-stone-400"
          )}
        >
          <option value="">{loading ? "Loading…" : defaultPlaceholder}</option>

          {contacts.map((contact) => {
            const name = [
              contact.salutation ?? "",
              contact.firstName,
              contact.lastName,
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <option key={contact.id} value={contact.id}>
                {name}
              </option>
            );
          })}

          <option value="__new__">＋ Add new contact →</option>
        </select>

        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-stone-400">
          <ChevronDown className="h-4 w-4" />
        </span>
      </div>

      {selectedContact && (
        <div className="bg-stone-50 rounded-lg px-3 py-2 mt-1.5 text-xs text-stone-500 space-y-0.5">
          {selectedContact.email && (
            <p className="truncate">{selectedContact.email}</p>
          )}
          {selectedContact.phone && (
            <p>{selectedContact.phone}</p>
          )}
          {selectedContact.mobile && (
            <p>{selectedContact.mobile}</p>
          )}
          <a
            href={`/contacts/${selectedContact.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#B8960C] hover:underline mt-0.5"
          >
            <ExternalLink className="h-3 w-3" />
            View profile
          </a>
        </div>
      )}
    </div>
  );
}
