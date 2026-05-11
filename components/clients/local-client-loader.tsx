"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClientDetail } from "@/components/clients/client-detail";
import type { Client } from "@/types";

export function LocalClientLoader({ id }: { id: string }) {
  const [client, setClient] = useState<Client | null | undefined>(undefined);

  useEffect(() => {
    try {
      const extras = JSON.parse(localStorage.getItem("crm-extra-clients") ?? "[]") as Client[];
      const found  = extras.find(c => c.id === id);
      setClient(found ?? null);
    } catch {
      setClient(null);
    }
  }, [id]);

  if (client === undefined) {
    return <div className="py-24 text-center text-stone-400 text-sm">Loading…</div>;
  }

  if (client === null) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="font-serif text-xl text-stone-500">Client not found</p>
        <Link href="/clients" className="text-sm text-[#B8960C] hover:underline">
          ← Back to Clients
        </Link>
      </div>
    );
  }

  return <ClientDetail client={client} />;
}
