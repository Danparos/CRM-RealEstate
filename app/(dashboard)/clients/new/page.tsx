"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AddClientForm } from "@/components/clients/add-client-form";

export default function NewClientPage() {
  const router = useRouter();
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/clients" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-[#B8960C] transition-colors">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        All Clients
      </Link>
      <div>
        <h1 className="font-serif text-[32px] font-medium text-stone-900 leading-tight">New Client</h1>
        <p className="mt-1.5 text-sm text-stone-500">Fill in the details to add a client to the CRM.</p>
      </div>
      <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg,#B8960C 0%,#E8C20A 45%,#CD853F 100%)" }} />
        <AddClientForm
          onSuccess={id => router.push(`/clients/${id}`)}
          onCancel={() => router.push("/clients")}
        />
      </div>
    </div>
  );
}
