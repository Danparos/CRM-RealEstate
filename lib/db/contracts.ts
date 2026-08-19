import { createClient } from "@/lib/supabase/client";

export interface FollowUpItem {
  id: string;
  label: string;
  done: boolean;
  dueDate?: string;
}

export interface Contract {
  id: string;
  clientId?: string;
  // Buyer
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerNationality?: string;
  buyerLawyer?: string;
  buyerLawyerPhone?: string;
  // Property
  propertyId?: string;
  propertyRef?: string;
  propertyTitle?: string;
  // Seller
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  sellerLawyer?: string;
  sellerLawyerPhone?: string;
  // Notary
  notaryName?: string;
  // Linked contacts
  buyerLawyerId?: string;
  sellerLawyerId?: string;
  buyerAccountantId?: string;
  sellerAccountantId?: string;
  buyerEngineerId?: string;
  sellerEngineerId?: string;
  notaryId?: string;
  notaryDate?: string;
  // Financial
  agreedPrice?: number;
  buyerCommission?: number;
  sellerCommission?: number;
  depositAmount?: number;
  depositPaidAt?: string;
  // Dates
  preliminaryContractDate?: string;
  finalContractDate?: string;
  completionDate?: string;
  // Status
  stage: "legal_process" | "signed_closed";
  vendorId?: string;
  agentName?: string;
  agentId?: string;
  coAgentId?: string;
  coAgentName?: string;
  agentSplitPercent?: number;
  commissionStatus?: "pending" | "invoiced" | "received";
  commissionReceivedAt?: string;
  invoiceNumber?: string;
  notes?: string;
  followUpItems: FollowUpItem[];
  createdAt: string;
  updatedAt: string;
}

function toContract(row: Record<string, unknown>): Contract {
  return {
    id:               row.id as string,
    clientId:         row.client_id as string | undefined,
    buyerName:        row.buyer_name as string,
    buyerEmail:       row.buyer_email as string | undefined,
    buyerPhone:       row.buyer_phone as string | undefined,
    buyerNationality: row.buyer_nationality as string | undefined,
    buyerLawyer:      row.buyer_lawyer as string | undefined,
    buyerLawyerPhone: row.buyer_lawyer_phone as string | undefined,
    propertyId:       row.property_id as string | undefined,
    propertyRef:      row.property_ref as string | undefined,
    propertyTitle:    row.property_title as string | undefined,
    sellerName:       row.seller_name as string | undefined,
    sellerEmail:      row.seller_email as string | undefined,
    sellerPhone:      row.seller_phone as string | undefined,
    sellerLawyer:     row.seller_lawyer as string | undefined,
    sellerLawyerPhone: row.seller_lawyer_phone as string | undefined,
    notaryName:       row.notary_name as string | undefined,
    buyerLawyerId:      row.buyer_lawyer_id as string | undefined,
    sellerLawyerId:     row.seller_lawyer_id as string | undefined,
    buyerAccountantId:  row.buyer_accountant_id as string | undefined,
    sellerAccountantId: row.seller_accountant_id as string | undefined,
    buyerEngineerId:    row.buyer_engineer_id as string | undefined,
    sellerEngineerId:   row.seller_engineer_id as string | undefined,
    notaryId:           row.notary_id as string | undefined,
    notaryDate:       row.notary_date as string | undefined,
    agreedPrice:      row.agreed_price as number | undefined,
    buyerCommission:  row.buyer_commission as number | undefined,
    sellerCommission: row.seller_commission as number | undefined,
    depositAmount:    row.deposit_amount as number | undefined,
    depositPaidAt:    row.deposit_paid_at as string | undefined,
    preliminaryContractDate: row.preliminary_contract_date as string | undefined,
    finalContractDate: row.final_contract_date as string | undefined,
    completionDate:   row.completion_date as string | undefined,
    stage:            (row.stage as Contract["stage"]) ?? "legal_process",
    vendorId:         row.vendor_id as string | undefined,
    agentName:        row.agent_name as string | undefined,
    agentId:          row.agent_id as string | undefined,
    coAgentId:        row.co_agent_id as string | undefined,
    coAgentName:      row.co_agent_name as string | undefined,
    agentSplitPercent: row.agent_split_percent as number | undefined,
    commissionStatus: (row.commission_status as Contract["commissionStatus"]) ?? "pending",
    commissionReceivedAt: row.commission_received_at as string | undefined,
    invoiceNumber:    row.invoice_number as string | undefined,
    notes:            row.notes as string | undefined,
    followUpItems:    (row.follow_up_items as FollowUpItem[]) ?? [],
    createdAt:        row.created_at as string,
    updatedAt:        row.updated_at as string,
  };
}

type ContractInput = Omit<Contract, "id" | "createdAt" | "updatedAt">;

function toRow(data: ContractInput) {
  return {
    client_id:          data.clientId ?? null,
    buyer_name:         data.buyerName,
    buyer_email:        data.buyerEmail ?? null,
    buyer_phone:        data.buyerPhone ?? null,
    buyer_nationality:  data.buyerNationality ?? null,
    buyer_lawyer:       data.buyerLawyer ?? null,
    buyer_lawyer_phone: data.buyerLawyerPhone ?? null,
    property_id:        data.propertyId ?? null,
    property_ref:       data.propertyRef ?? null,
    property_title:     data.propertyTitle ?? null,
    seller_name:        data.sellerName ?? null,
    seller_email:       data.sellerEmail ?? null,
    seller_phone:       data.sellerPhone ?? null,
    seller_lawyer:      data.sellerLawyer ?? null,
    seller_lawyer_phone: data.sellerLawyerPhone ?? null,
    notary_name:        data.notaryName ?? null,
    buyer_lawyer_id:      data.buyerLawyerId ?? null,
    seller_lawyer_id:     data.sellerLawyerId ?? null,
    buyer_accountant_id:  data.buyerAccountantId ?? null,
    seller_accountant_id: data.sellerAccountantId ?? null,
    buyer_engineer_id:    data.buyerEngineerId ?? null,
    seller_engineer_id:   data.sellerEngineerId ?? null,
    notary_id:            data.notaryId ?? null,
    notary_date:        data.notaryDate ?? null,
    agreed_price:       data.agreedPrice ?? null,
    buyer_commission:   data.buyerCommission ?? null,
    seller_commission:  data.sellerCommission ?? null,
    deposit_amount:     data.depositAmount ?? null,
    deposit_paid_at:    data.depositPaidAt ?? null,
    preliminary_contract_date: data.preliminaryContractDate ?? null,
    final_contract_date: data.finalContractDate ?? null,
    completion_date:    data.completionDate ?? null,
    stage:              data.stage,
    vendor_id:          data.vendorId ?? null,
    agent_name:         data.agentName ?? null,
    agent_id:           data.agentId ?? null,
    co_agent_id:        data.coAgentId ?? null,
    co_agent_name:      data.coAgentName ?? null,
    agent_split_percent: data.agentSplitPercent ?? 100,
    commission_status:  data.commissionStatus ?? "pending",
    commission_received_at: data.commissionReceivedAt ?? null,
    invoice_number:     data.invoiceNumber ?? null,
    notes:              data.notes ?? null,
    follow_up_items:    data.followUpItems ?? [],
    updated_at:         new Date().toISOString(),
  };
}

export async function getAllContracts(): Promise<Contract[]> {
  try {
    const { data, error } = await createClient()
      .from("contracts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("[db/contracts] getAll:", error.message); return []; }
    return (data ?? []).map(r => toContract(r as Record<string, unknown>));
  } catch (err) {
    console.error("[db/contracts] getAll unexpected:", err);
    return [];
  }
}

export async function getContract(id: string): Promise<Contract | null> {
  try {
    const { data, error } = await createClient()
      .from("contracts")
      .select("*")
      .eq("id", id)
      .single();
    if (error) { console.error("[db/contracts] get:", error.message); return null; }
    return data ? toContract(data as Record<string, unknown>) : null;
  } catch (err) {
    console.error("[db/contracts] get unexpected:", err);
    return null;
  }
}

export async function createContract(data: ContractInput): Promise<Contract | null> {
  try {
    const id = crypto.randomUUID();
    const { data: row, error } = await createClient()
      .from("contracts")
      .insert({ id, ...toRow(data) })
      .select()
      .single();
    if (error) { console.error("[db/contracts] create:", error.message); return null; }
    return row ? toContract(row as Record<string, unknown>) : null;
  } catch (err) {
    console.error("[db/contracts] create unexpected:", err);
    return null;
  }
}

export async function updateContract(id: string, data: ContractInput): Promise<void> {
  const { error } = await createClient()
    .from("contracts")
    .update(toRow(data))
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteContract(id: string): Promise<boolean> {
  try {
    const { error } = await createClient()
      .from("contracts")
      .delete()
      .eq("id", id);
    if (error) { console.error("[db/contracts] delete:", error.message); return false; }
    return true;
  } catch (err) {
    console.error("[db/contracts] delete unexpected:", err);
    return false;
  }
}
