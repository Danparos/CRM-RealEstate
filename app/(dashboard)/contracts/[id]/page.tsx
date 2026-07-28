"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { getContract, updateContract, deleteContract } from "@/lib/db/contracts";
import type { Contract, FollowUpItem } from "@/lib/db/contracts";
import { getAllAgents } from "@/lib/db/agents";
import { getAllVendors } from "@/lib/db/vendors";
import type { Agent, Vendor } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import ContactPicker from "@/components/ui/contact-picker";

const STAGE_OPTIONS = [
  { value: "legal_process", label: "Legal Process" },
  { value: "signed_closed", label: "Signed & Closed" },
] as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">{label}</span>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40 w-full"
    />
  );
}

function Section({ title, open, onToggle, children }: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-colors"
      >
        <span className="font-semibold text-stone-800 text-[15px]">{title}</span>
        {open ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
      </button>
      {open && <div className="px-6 pb-6 space-y-4 border-t border-stone-100">{children}</div>}
    </div>
  );
}

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [sections, setSections] = useState({ buyer: true, seller: true, property: true, financial: true, commission: true, dates: true, followup: true, notes: true });
  const [newFollowUp, setNewFollowUp] = useState("");
  const [agents,  setAgents]  = useState<Agent[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    getContract(params.id).then(c => { setContract(c); setLoading(false); });
  }, [params.id]);

  useEffect(() => {
    getAllVendors().then(setVendors);
  }, []);

  useEffect(() => {
    async function loadAgents() {
      const supabase = createClient();
      const [allAgents, { data: { user } }] = await Promise.all([
        getAllAgents(),
        supabase.auth.getUser(),
      ]);
      const active = allAgents.filter(a => a.active !== false);
      setAgents(active);
      if (user?.email) {
        const me = active.find(a => a.email === user.email);
        if (me) {
          setCurrentAgent(me);
          setIsAdmin(me.role === "admin" || me.role === "office_manager");
        } else {
          setIsAdmin(true); // fallback: if not in agents table, treat as admin
        }
      }
    }
    loadAgents();
  }, []);

  const update = useCallback((patch: Partial<Contract>) => {
    setContract(prev => prev ? { ...prev, ...patch } : prev);
  }, []);

  async function handleSave() {
    if (!contract) return;
    setSaving(true);
    await updateContract(contract.id, contract);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleDelete() {
    if (!contract) return;
    if (!confirm("Delete this contract? This cannot be undone.")) return;
    await deleteContract(contract.id);
    router.push("/contracts");
  }

  function addFollowUp() {
    if (!newFollowUp.trim() || !contract) return;
    const item: FollowUpItem = {
      id:    crypto.randomUUID(),
      label: newFollowUp.trim(),
      done:  false,
    };
    update({ followUpItems: [...contract.followUpItems, item] });
    setNewFollowUp("");
  }

  function toggleFollowUp(id: string) {
    if (!contract) return;
    update({ followUpItems: contract.followUpItems.map(f => f.id === id ? { ...f, done: !f.done } : f) });
  }

  function deleteFollowUp(id: string) {
    if (!contract) return;
    update({ followUpItems: contract.followUpItems.filter(f => f.id !== id) });
  }

  function toggleSection(key: keyof typeof sections) {
    setSections(s => ({ ...s, [key]: !s[key] }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-7 w-7 rounded-full border-2 border-[#B8960C] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-24 text-stone-400">
        <p>Contract not found.</p>
        <Link href="/contracts" className="text-[#B8960C] text-sm font-semibold hover:underline mt-2 block">Back to contracts</Link>
      </div>
    );
  }

  const done  = contract.followUpItems.filter(f => f.done).length;
  const total = contract.followUpItems.length;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/contracts" className="h-8 w-8 flex items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-colors">
            <ArrowLeft size={14} strokeWidth={2} />
          </Link>
          <div>
            <h1 className="font-serif text-[22px] font-semibold text-stone-900 leading-tight">
              {contract.buyerName || "New Contract"}
            </h1>
            {contract.propertyRef && (
              <p className="text-sm text-stone-400 mt-0.5">{contract.propertyRef}{contract.propertyTitle ? ` · ${contract.propertyTitle}` : ""}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={contract.stage}
            onChange={e => update({ stage: e.target.value as Contract["stage"] })}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold border focus:outline-none",
              contract.stage === "signed_closed"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            )}
          >
            {STAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold transition-all",
              saved ? "bg-emerald-500 text-white" : "bg-[#B8960C] text-white hover:bg-[#9a7a0a]"
            )}
          >
            {saved ? <><Check size={14} strokeWidth={2.5} /> Saved</> : saving ? "Saving…" : <><Save size={14} strokeWidth={2} /> Save</>}
          </button>
        </div>
      </div>

      {/* ── Buyer ── */}
      <Section title="Buyer" open={sections.buyer} onToggle={() => toggleSection("buyer")}>
        <div className="pt-4 grid grid-cols-2 gap-4">
          <Field label="Full Name">
            <Input value={contract.buyerName} onChange={v => update({ buyerName: v })} placeholder="Buyer full name" />
          </Field>
          <Field label="Nationality">
            <Input value={contract.buyerNationality ?? ""} onChange={v => update({ buyerNationality: v })} placeholder="e.g. NL, DE, IL" />
          </Field>
          <Field label="Email">
            <Input value={contract.buyerEmail ?? ""} onChange={v => update({ buyerEmail: v })} placeholder="buyer@email.com" type="email" />
          </Field>
          <Field label="Phone">
            <Input value={contract.buyerPhone ?? ""} onChange={v => update({ buyerPhone: v })} placeholder="+31 6 ..." />
          </Field>
          <Field label="Buyer's Lawyer">
            <ContactPicker
              type="lawyer"
              value={contract.buyerLawyerId}
              onChange={id => update({ buyerLawyerId: id })}
            />
          </Field>
          <Field label="Buyer's Accountant">
            <ContactPicker
              type="accountant"
              value={contract.buyerAccountantId}
              onChange={id => update({ buyerAccountantId: id })}
            />
          </Field>
          <Field label="Buyer's Engineer">
            <ContactPicker
              type="engineer"
              value={contract.buyerEngineerId}
              onChange={id => update({ buyerEngineerId: id })}
            />
          </Field>
        </div>
      </Section>

      {/* ── Seller ── */}
      <Section title="Seller" open={sections.seller} onToggle={() => toggleSection("seller")}>
        <div className="pt-4 grid grid-cols-2 gap-4">
          {/* Vendor link — auto-fills seller fields */}
          <div className="col-span-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              Link to Vendor Record
            </label>
            <select
              value={contract.vendorId ?? ""}
              onChange={e => {
                const v = vendors.find(vn => vn.id === e.target.value);
                if (v) {
                  update({
                    vendorId:   v.id,
                    sellerName:  `${v.firstName} ${v.lastName}`,
                    sellerEmail: v.email,
                    sellerPhone: v.phone,
                  });
                } else {
                  update({ vendorId: undefined });
                }
              }}
              className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40 w-full bg-white"
            >
              <option value="">— Select vendor (auto-fills below) —</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.firstName} {v.lastName}{v.propertyRef ? ` · ${v.propertyRef}` : ""}</option>
              ))}
            </select>
          </div>
          <Field label="Full Name">
            <Input value={contract.sellerName ?? ""} onChange={v => update({ sellerName: v })} placeholder="Seller full name" />
          </Field>
          <Field label="Phone">
            <Input value={contract.sellerPhone ?? ""} onChange={v => update({ sellerPhone: v })} placeholder="+30 ..." />
          </Field>
          <Field label="Email">
            <Input value={contract.sellerEmail ?? ""} onChange={v => update({ sellerEmail: v })} placeholder="seller@email.com" type="email" />
          </Field>
          <div />
          <Field label="Seller's Lawyer">
            <ContactPicker
              type="lawyer"
              value={contract.sellerLawyerId}
              onChange={id => update({ sellerLawyerId: id })}
            />
          </Field>
          <Field label="Seller's Accountant">
            <ContactPicker
              type="accountant"
              value={contract.sellerAccountantId}
              onChange={id => update({ sellerAccountantId: id })}
            />
          </Field>
          <Field label="Seller's Engineer">
            <ContactPicker
              type="engineer"
              value={contract.sellerEngineerId}
              onChange={id => update({ sellerEngineerId: id })}
            />
          </Field>
        </div>
      </Section>

      {/* ── Property ── */}
      <Section title="Property" open={sections.property} onToggle={() => toggleSection("property")}>
        <div className="pt-4 grid grid-cols-2 gap-4">
          <Field label="Reference">
            <Input value={contract.propertyRef ?? ""} onChange={v => update({ propertyRef: v })} placeholder="EK-001" />
          </Field>
          <Field label="Title">
            <Input value={contract.propertyTitle ?? ""} onChange={v => update({ propertyTitle: v })} placeholder="Property name" />
          </Field>
          <Field label="Notary">
            <ContactPicker
              type="notary"
              value={contract.notaryId}
              onChange={id => update({ notaryId: id })}
            />
          </Field>
          <Field label="Agent">
            {isAdmin ? (
              <select
                value={contract.agentName ?? ""}
                onChange={e => update({ agentName: e.target.value })}
                className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40 w-full bg-white"
              >
                <option value="">— Select agent —</option>
                {agents.map(a => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
            ) : (
              <div className="rounded-xl border border-stone-100 bg-stone-50 px-3 py-2.5 text-sm text-stone-600">
                {currentAgent?.name ?? contract.agentName ?? "—"}
              </div>
            )}
          </Field>
        </div>
      </Section>

      {/* ── Financial ── */}
      <Section title="Financial" open={sections.financial} onToggle={() => toggleSection("financial")}>
        <div className="pt-4 grid grid-cols-2 gap-4">
          <Field label="Agreed Price (€)">
            <Input value={contract.agreedPrice?.toString() ?? ""} onChange={v => update({ agreedPrice: v ? Number(v) : undefined })} placeholder="3500000" type="number" />
          </Field>
          <Field label="Deposit Amount (€)">
            <Input value={contract.depositAmount?.toString() ?? ""} onChange={v => update({ depositAmount: v ? Number(v) : undefined })} placeholder="100000" type="number" />
          </Field>
          <Field label="Buyer Commission (%)">
            <Input value={contract.buyerCommission?.toString() ?? ""} onChange={v => update({ buyerCommission: v ? Number(v) : undefined })} placeholder="2" type="number" />
          </Field>
          <Field label="Seller Commission (%)">
            <Input value={contract.sellerCommission?.toString() ?? ""} onChange={v => update({ sellerCommission: v ? Number(v) : undefined })} placeholder="2" type="number" />
          </Field>
          <Field label="Deposit Paid Date">
            <Input value={contract.depositPaidAt ?? ""} onChange={v => update({ depositPaidAt: v })} type="date" />
          </Field>
        </div>

        {/* ── Calculated Fees ── */}
        {(() => {
          const price  = contract.agreedPrice;
          const buyPct = contract.buyerCommission;
          const selPct = contract.sellerCommission;
          const buyFee = price && buyPct ? (price * buyPct) / 100 : null;
          const selFee = price && selPct ? (price * selPct) / 100 : null;
          const total  = (buyFee ?? 0) + (selFee ?? 0);
          const fmt    = (n: number) => "€" + n.toLocaleString("de-DE");
          return (
            <div className="mt-2 rounded-xl border border-[#B8960C]/20 bg-amber-50/60 px-5 py-4">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-3">Calculated Fees</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Buyer commission {buyPct ? `(${buyPct}%)` : ""}</span>
                  <span className="font-semibold text-stone-700">{buyFee ? fmt(buyFee) : "—"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Seller commission {selPct ? `(${selPct}%)` : ""}</span>
                  <span className="font-semibold text-stone-700">{selFee ? fmt(selFee) : "—"}</span>
                </div>
                <div className="h-px bg-[#B8960C]/20 my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-stone-700">Total Agency Fee <span className="text-[11px] font-normal text-stone-400">(excl. VAT)</span></span>
                  <span className="text-base font-bold text-[#B8960C]">{total > 0 ? fmt(total) : "—"}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </Section>

      {/* ── Commission Tracking ── */}
      <Section title="Commission Tracking" open={sections.commission} onToggle={() => toggleSection("commission")}>
        <div className="pt-4 space-y-4">
          {/* Status + Invoice */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Commission Status">
              <select
                value={contract.commissionStatus ?? "pending"}
                onChange={e => update({ commissionStatus: e.target.value as Contract["commissionStatus"] })}
                className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40 w-full bg-white"
              >
                <option value="pending">Pending</option>
                <option value="invoiced">Invoiced</option>
                <option value="received">Received</option>
              </select>
            </Field>
            <Field label="Invoice Number">
              <Input value={contract.invoiceNumber ?? ""} onChange={v => update({ invoiceNumber: v })} placeholder="INV-2026-001" />
            </Field>
          </div>

          {/* Agent split + Co-agent */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Agent Split (% to primary agent)">
              <Input
                value={contract.agentSplitPercent?.toString() ?? "100"}
                onChange={v => update({ agentSplitPercent: v ? Number(v) : 100 })}
                placeholder="100"
                type="number"
              />
            </Field>
            <Field label="Co-Agent">
              {isAdmin ? (
                <select
                  value={contract.coAgentId ?? ""}
                  onChange={e => {
                    const a = agents.find(ag => ag.id === e.target.value);
                    update({ coAgentId: e.target.value || undefined, coAgentName: a?.name });
                  }}
                  className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40 w-full bg-white"
                >
                  <option value="">— No co-agent —</option>
                  {agents.filter(a => a.id !== (agents.find(ag => ag.name === contract.agentName)?.id)).map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              ) : (
                <div className="rounded-xl border border-stone-100 bg-stone-50 px-3 py-2.5 text-sm text-stone-600">
                  {contract.coAgentName ?? "—"}
                </div>
              )}
            </Field>
          </div>

          {/* Commission received date */}
          {contract.commissionStatus === "received" && (
            <Field label="Date Received">
              <Input value={contract.commissionReceivedAt ?? ""} onChange={v => update({ commissionReceivedAt: v })} type="date" />
            </Field>
          )}

          {/* Commission breakdown summary */}
          {(() => {
            const price   = contract.agreedPrice ?? 0;
            const buyFee  = price * ((contract.buyerCommission  ?? 0) / 100);
            const selFee  = price * ((contract.sellerCommission ?? 0) / 100);
            const total   = buyFee + selFee;
            const split   = contract.agentSplitPercent ?? 100;
            const primary = total * (split / 100);
            const coShare = total * ((100 - split) / 100);
            const fmt     = (n: number) => "€" + Math.round(n).toLocaleString("de-DE");
            if (total === 0) return null;
            return (
              <div className="rounded-xl border border-[#B8960C]/20 bg-amber-50/60 px-5 py-4 space-y-2">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-1">Commission Breakdown</p>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Total agency fee</span>
                  <span className="font-semibold text-stone-700">{fmt(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">{contract.agentName || "Primary agent"} ({split}%)</span>
                  <span className="font-bold text-[#B8960C]">{fmt(primary)}</span>
                </div>
                {split < 100 && contract.coAgentName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">{contract.coAgentName} ({100 - split}%)</span>
                    <span className="font-semibold text-stone-600">{fmt(coShare)}</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </Section>

      {/* ── Key Dates ── */}
      <Section title="Key Dates" open={sections.dates} onToggle={() => toggleSection("dates")}>
        <div className="pt-4 grid grid-cols-2 gap-4">
          <Field label="Preliminary Contract">
            <Input value={contract.preliminaryContractDate ?? ""} onChange={v => update({ preliminaryContractDate: v })} type="date" />
          </Field>
          <Field label="Notary Date">
            <Input value={contract.notaryDate ?? ""} onChange={v => update({ notaryDate: v })} type="date" />
          </Field>
          <Field label="Final Contract">
            <Input value={contract.finalContractDate ?? ""} onChange={v => update({ finalContractDate: v })} type="date" />
          </Field>
          <Field label="Completion Date">
            <Input value={contract.completionDate ?? ""} onChange={v => update({ completionDate: v })} type="date" />
          </Field>
        </div>
      </Section>

      {/* ── Follow-up Checklist ── */}
      <Section title={`Follow-up${total > 0 ? ` (${done}/${total})` : ""}`} open={sections.followup} onToggle={() => toggleSection("followup")}>
        <div className="pt-4 space-y-2">
          {contract.followUpItems.map(item => (
            <div key={item.id} className="flex items-center gap-3 group">
              <button
                type="button"
                onClick={() => toggleFollowUp(item.id)}
                className={cn(
                  "h-5 w-5 rounded flex items-center justify-center shrink-0 border transition-colors",
                  item.done ? "bg-emerald-100 border-emerald-300" : "bg-white border-stone-300 hover:border-[#B8960C]"
                )}
              >
                {item.done && <Check size={11} className="text-emerald-600" strokeWidth={3} />}
              </button>
              <span className={cn("flex-1 text-sm", item.done ? "line-through text-stone-400" : "text-stone-700")}>{item.label}</span>
              <button
                onClick={() => deleteFollowUp(item.id)}
                className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded text-stone-300 hover:text-red-400 transition-all"
              >
                <Trash2 size={12} strokeWidth={2} />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newFollowUp}
              onChange={e => setNewFollowUp(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addFollowUp()}
              placeholder="Add follow-up item…"
              className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
            />
            <button
              onClick={addFollowUp}
              disabled={!newFollowUp.trim()}
              className="h-9 w-9 flex items-center justify-center rounded-lg bg-[#B8960C] text-white hover:bg-[#9a7a0a] disabled:bg-stone-200 disabled:text-stone-400 transition-colors"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </Section>

      {/* ── Notes ── */}
      <Section title="Notes" open={sections.notes} onToggle={() => toggleSection("notes")}>
        <div className="pt-4">
          <textarea
            rows={5}
            value={contract.notes ?? ""}
            onChange={e => update({ notes: e.target.value })}
            placeholder="Internal notes, updates, legal observations…"
            className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
          />
        </div>
      </Section>

      {/* Delete */}
      <div className="flex justify-end pt-2 pb-8">
        <button
          onClick={handleDelete}
          className="text-xs text-stone-300 hover:text-red-400 transition-colors"
        >
          Delete this contract
        </button>
      </div>
    </div>
  );
}
