import type { Client, PipelineStage, Activity, Property } from "@/types";

export const mockClients: Client[] = [
  // new_inquiry
  {
    id: "c001", email: "marcus.hoffmann@gmx.de", firstName: "Marcus", lastName: "Hoffmann",
    nationality: "DE", language: "de", clientClass: "B", priceGroup: "mid",
    budgetMin: 350000, budgetMax: 550000, stage: "new_inquiry",
    primaryAgent: "Klaus Weber",
    lastActivityAt: "2026-04-22T10:00:00Z", lastActivityNote: "Submitted inquiry via website contact form",
    stageEnteredAt: "2026-04-24T00:00:00Z", phone: "+49 171 3847291",
    propertyInterest: "Stone house with pool, Lefkes or Marpissa",
  },
  {
    id: "c002", email: "sophie.marchand@laposte.net", firstName: "Sophie", lastName: "Marchand",
    nationality: "FR", language: "fr", clientClass: "A", priceGroup: "luxury",
    budgetMin: 1800000, budgetMax: 3500000, stage: "new_inquiry",
    primaryAgent: "Dan Paul",
    lastActivityAt: "2026-04-21T14:30:00Z", lastActivityNote: "Referred by existing client — initial call scheduled",
    stageEnteredAt: "2026-04-22T00:00:00Z", phone: "+33 6 12 34 56 78",
    propertyInterest: "Seafront villa, Naoussa or Golden Beach",
  },
  {
    id: "c003", email: "n.papadimitriou@gmail.com", firstName: "Nikos", lastName: "Papadimitriou",
    nationality: "GR", language: "el", clientClass: "C", priceGroup: "entry",
    budgetMin: 150000, budgetMax: 280000, stage: "new_inquiry",
    primaryAgent: "Anna Papadopoulos",
    lastActivityAt: "2026-04-20T09:00:00Z", lastActivityNote: "Sent introductory brochure via email",
    stageEnteredAt: "2026-04-20T00:00:00Z", phone: "+30 697 1234567",
    propertyInterest: "Plot near Parikia, building potential",
  },
  {
    id: "c004", email: "j.whitmore@gmail.com", firstName: "James", lastName: "Whitmore",
    nationality: "GB", language: "en", clientClass: "B", priceGroup: "premium",
    budgetMin: 750000, budgetMax: 1200000, stage: "new_inquiry",
    primaryAgent: "Dan Paul",
    lastActivityAt: "2026-04-19T16:00:00Z", lastActivityNote: "Responded to Instagram ad — awaiting callback",
    stageEnteredAt: "2026-04-19T00:00:00Z", phone: "+44 7911 234567",
    propertyInterest: "Traditional Cycladic villa, Paros interior village",
  },
  {
    id: "c020", email: "daniel.weiss@bluewin.ch", firstName: "Daniel", lastName: "Weiss",
    nationality: "CH", language: "de", clientClass: "C", priceGroup: "entry",
    budgetMin: 180000, budgetMax: 320000, stage: "new_inquiry",
    primaryAgent: "Anna Papadopoulos",
    lastActivityAt: "2026-04-23T08:00:00Z", lastActivityNote: "First contact — emailed listing catalogue",
    stageEnteredAt: "2026-04-25T00:00:00Z", phone: "+41 78 901 23 45",
    propertyInterest: "Small apartment or studio, Parikia town",
  },
  // qualified
  {
    id: "c005", email: "yael.bendavid@gmail.com", firstName: "Yael", lastName: "Ben-David",
    nationality: "IL", language: "en", clientClass: "A", priceGroup: "ultra",
    budgetMin: 5000000, budgetMax: 10000000, stage: "qualified",
    primaryAgent: "Dan Paul",
    lastActivityAt: "2026-04-18T11:00:00Z", lastActivityNote: "Qualification call completed — confirmed liquid funds",
    stageEnteredAt: "2026-04-16T00:00:00Z", phone: "+972 52 345 6789",
    propertyInterest: "Private estate with direct sea access, anywhere on Paros",
  },
  {
    id: "c006", email: "i.vdberg@outlook.com", firstName: "Ingrid", lastName: "van der Berg",
    nationality: "NL", language: "en", clientClass: "A", priceGroup: "luxury",
    budgetMin: 2000000, budgetMax: 4000000, stage: "qualified",
    primaryAgent: "Klaus Weber",
    lastActivityAt: "2026-04-17T13:00:00Z", lastActivityNote: "Sent curated portfolio of 5 listings",
    stageEnteredAt: "2026-04-14T00:00:00Z", phone: "+31 6 23456789",
    propertyInterest: "Designer villa with infinity pool, Alyki or Santa Maria",
  },
  {
    id: "c007", email: "thomas.breitner@bluewin.ch", firstName: "Thomas", lastName: "Breitner",
    nationality: "CH", language: "de", clientClass: "B", priceGroup: "premium",
    budgetMin: 900000, budgetMax: 1500000, stage: "qualified",
    primaryAgent: "Klaus Weber",
    lastActivityAt: "2026-04-15T10:30:00Z", lastActivityNote: "Discussed must-haves: sea view, 3+ beds, parking",
    stageEnteredAt: "2026-04-11T00:00:00Z", phone: "+41 79 456 78 90",
    propertyInterest: "Sea-view villa, Naoussa surroundings",
  },
  {
    id: "c008", email: "claire.fontaine@orange.fr", firstName: "Claire", lastName: "Fontaine",
    nationality: "FR", language: "fr", clientClass: "B", priceGroup: "mid",
    budgetMin: 400000, budgetMax: 650000, stage: "qualified",
    primaryAgent: "Anna Papadopoulos",
    lastActivityAt: "2026-04-14T15:00:00Z", lastActivityNote: "Confirmed interest in rental-yield properties",
    stageEnteredAt: "2026-04-08T00:00:00Z", phone: "+33 6 87 65 43 21",
    propertyInterest: "Apartment or small house, Parikia, rental potential",
  },
  // property_presentation
  {
    id: "c009", email: "a.mueller@t-online.de", firstName: "Alexander", lastName: "Müller",
    nationality: "DE", language: "de", clientClass: "A", priceGroup: "luxury",
    budgetMin: 2500000, budgetMax: 5000000, stage: "property_presentation",
    primaryAgent: "Dan Paul",
    lastActivityAt: "2026-04-16T09:00:00Z", lastActivityNote: "Sent property PDF for Villa Aegean Crest, Naoussa",
    stageEnteredAt: "2026-04-17T00:00:00Z", phone: "+49 160 9876543",
    propertyInterest: "Seafront luxury villa, Naoussa bay area",
  },
  {
    id: "c010", email: "rachel.cohen@gmail.com", firstName: "Rachel", lastName: "Cohen",
    nationality: "IL", language: "en", clientClass: "B", priceGroup: "premium",
    budgetMin: 800000, budgetMax: 1400000, stage: "property_presentation",
    primaryAgent: "Anna Papadopoulos",
    lastActivityAt: "2026-04-13T14:00:00Z", lastActivityNote: "Virtual tour link sent — follow-up call booked",
    stageEnteredAt: "2026-04-12T00:00:00Z", phone: "+972 54 876 5432",
    propertyInterest: "Modern villa with pool, Golden Beach corridor",
  },
  {
    id: "c011", email: "oliver.hartley@icloud.com", firstName: "Oliver", lastName: "Hartley",
    nationality: "GB", language: "en", clientClass: "A", priceGroup: "ultra",
    budgetMin: 6000000, budgetMax: 12000000, stage: "property_presentation",
    primaryAgent: "Dan Paul",
    lastActivityAt: "2026-04-11T10:00:00Z", lastActivityNote: "Scheduled in-person viewing for late April",
    stageEnteredAt: "2026-04-06T00:00:00Z", phone: "+44 7700 900123",
    propertyInterest: "Private compound or estate, Paros north coast",
  },
  // offer_submitted
  {
    id: "c012", email: "henrik.larsson@web.de", firstName: "Henrik", lastName: "Larsson",
    nationality: "DE", language: "de", clientClass: "A", priceGroup: "premium",
    budgetMin: 1000000, budgetMax: 1600000, stage: "offer_submitted",
    primaryAgent: "Klaus Weber",
    lastActivityAt: "2026-04-10T11:00:00Z", lastActivityNote: "Offer of €1.25M submitted on Villa Margarita, Naoussa",
    stageEnteredAt: "2026-04-15T00:00:00Z", phone: "+49 176 55443322",
    propertyInterest: "Village villa with sea view, Naoussa",
  },
  {
    id: "c013", email: "isabelle.dupont@wanadoo.fr", firstName: "Isabelle", lastName: "Dupont",
    nationality: "FR", language: "fr", clientClass: "B", priceGroup: "mid",
    budgetMin: 450000, budgetMax: 700000, stage: "offer_submitted",
    primaryAgent: "Anna Papadopoulos",
    lastActivityAt: "2026-04-09T15:30:00Z", lastActivityNote: "Offer of €540K submitted — awaiting seller response",
    stageEnteredAt: "2026-04-18T00:00:00Z", phone: "+33 6 55 44 33 22",
    propertyInterest: "Traditional house with courtyard, Lefkes village",
  },
  // negotiation
  {
    id: "c014", email: "david.goldstein@gmail.com", firstName: "David", lastName: "Goldstein",
    nationality: "IL", language: "en", clientClass: "A", priceGroup: "luxury",
    budgetMin: 3000000, budgetMax: 6000000, stage: "negotiation",
    primaryAgent: "Dan Paul",
    lastActivityAt: "2026-04-08T10:00:00Z", lastActivityNote: "Counter-offer received — €4.2M vs asking €4.8M",
    stageEnteredAt: "2026-04-10T00:00:00Z", phone: "+972 50 111 2233",
    propertyInterest: "Seafront estate, Ambelas peninsula",
  },
  {
    id: "c015", email: "c.ashworth@outlook.com", firstName: "Catherine", lastName: "Ashworth",
    nationality: "GB", language: "en", clientClass: "B", priceGroup: "premium",
    budgetMin: 850000, budgetMax: 1300000, stage: "negotiation",
    primaryAgent: "Klaus Weber",
    lastActivityAt: "2026-04-07T14:00:00Z", lastActivityNote: "Second counter-offer submitted — closing on fixtures",
    stageEnteredAt: "2026-04-05T00:00:00Z", phone: "+44 7890 123456",
    propertyInterest: "Renovated captain's house, Parikia old town",
  },
  // legal_process
  {
    id: "c016", email: "pieter.devries@gmail.com", firstName: "Pieter", lastName: "de Vries",
    nationality: "NL", language: "en", clientClass: "A", priceGroup: "luxury",
    budgetMin: 2200000, budgetMax: 3800000, stage: "legal_process",
    primaryAgent: "Dan Paul",
    lastActivityAt: "2026-04-06T09:00:00Z", lastActivityNote: "Notary appointment confirmed — title search underway",
    stageEnteredAt: "2026-03-29T00:00:00Z", phone: "+31 6 98765432",
    propertyInterest: "Villa with pool and guesthouse, Kolymbithres area",
  },
  {
    id: "c017", email: "elena.stavrakis@yahoo.gr", firstName: "Elena", lastName: "Stavrakis",
    nationality: "GR", language: "el", clientClass: "B", priceGroup: "mid",
    budgetMin: 300000, budgetMax: 500000, stage: "legal_process",
    primaryAgent: "Anna Papadopoulos",
    lastActivityAt: "2026-04-05T11:00:00Z", lastActivityNote: "Tax office clearance obtained — awaiting final contract",
    stageEnteredAt: "2026-03-24T00:00:00Z", phone: "+30 694 9876543",
    propertyInterest: "Residential plot, Parikia outskirts",
  },
  // signed_closed
  {
    id: "c018", email: "michael.bergmann@siemens.com", firstName: "Michael", lastName: "Bergmann",
    nationality: "DE", language: "de", clientClass: "A", priceGroup: "ultra",
    budgetMin: 7000000, budgetMax: 14000000, stage: "signed_closed",
    primaryAgent: "Dan Paul",
    lastActivityAt: "2026-04-03T16:00:00Z", lastActivityNote: "Contracts signed — keys handed over",
    stageEnteredAt: "2026-04-23T00:00:00Z", phone: "+49 151 22334455",
    propertyInterest: "Exclusive seafront estate, Naoussa — SOLD €9.4M",
  },
  {
    id: "c019", email: "amelie.rousseau@gmail.com", firstName: "Amélie", lastName: "Rousseau",
    nationality: "FR", language: "fr", clientClass: "B", priceGroup: "premium",
    budgetMin: 950000, budgetMax: 1500000, stage: "signed_closed",
    primaryAgent: "Anna Papadopoulos",
    lastActivityAt: "2026-03-28T10:00:00Z", lastActivityNote: "Deal closed at €1.15M — post-sale welcome package sent",
    stageEnteredAt: "2026-04-21T00:00:00Z", phone: "+33 6 11 22 33 44",
    propertyInterest: "Cycladic villa with vineyard view, Prodromos — SOLD €1.15M",
  },
];

export const PIPELINE_STAGES: {
  id: PipelineStage;
  label: string;
  description: string;
  color: string;
}[] = [
  { id: "new_inquiry",           label: "New Inquiry",            description: "Initial contact — not yet qualified",         color: "#0ea5e9" },
  { id: "qualified",             label: "Qualified",              description: "Budget, intent & timeline confirmed",          color: "#8b5cf6" },
  { id: "property_presentation", label: "Property Presentation",  description: "Active shortlist being presented",             color: "#6366f1" },
  { id: "offer_submitted",       label: "Offer Submitted",        description: "Formal offer placed — awaiting seller",        color: "#B8960C" },
  { id: "negotiation",           label: "Negotiation",            description: "Price & terms under active negotiation",       color: "#f97316" },
  { id: "legal_process",         label: "Legal Process",          description: "Contracts, notary & title search in progress", color: "#CD853F" },
  { id: "signed_closed",         label: "Signed & Closed",        description: "Transaction completed — keys transferred",     color: "#22c55e" },
];

export const mockActivities: Activity[] = [
  // c001 · Marcus Hoffmann
  { id: "act-c001-1", clientId: "c001", type: "stage_change", date: "2026-04-24T09:00:00Z", note: "Client moved to New Inquiry stage after website contact form submission.", agentName: "Klaus Weber", metadata: { from: "—", to: "New Inquiry" } },
  { id: "act-c001-2", clientId: "c001", type: "email", date: "2026-04-23T11:30:00Z", note: "Sent welcome email with introductory property brochure and agency overview.", agentName: "Klaus Weber" },
  { id: "act-c001-3", clientId: "c001", type: "whatsapp", date: "2026-04-22T10:15:00Z", note: "WhatsApp message sent confirming receipt of inquiry and scheduling a call.", agentName: "Klaus Weber", metadata: { response: "Seen, no reply yet" } },
  // c002 · Sophie Marchand
  { id: "act-c002-1", clientId: "c002", type: "stage_change", date: "2026-04-22T08:00:00Z", note: "Entered pipeline as a referral from existing client.", agentName: "Dan Paul", metadata: { from: "—", to: "New Inquiry" } },
  { id: "act-c002-2", clientId: "c002", type: "phone_call", date: "2026-04-21T14:30:00Z", note: "Initial call to introduce the agency. Sophie confirmed budget up to €3.5M and preference for Naoussa area.", agentName: "Dan Paul", metadata: { duration: "18 min" } },
  { id: "act-c002-3", clientId: "c002", type: "email", date: "2026-04-21T16:00:00Z", note: "Follow-up email with curated Naoussa and Golden Beach seafront listings PDF.", agentName: "Dan Paul" },
  { id: "act-c002-4", clientId: "c002", type: "note", date: "2026-04-20T09:00:00Z", note: "Internal note: Referred by Jean-Pierre Fontaine. High intent, looking to purchase before summer.", agentName: "Dan Paul" },
  // c003 · Nikos Papadimitriou
  { id: "act-c003-1", clientId: "c003", type: "stage_change", date: "2026-04-20T08:00:00Z", note: "New inquiry recorded from Spitogatos portal — interested in building plots near Parikia.", agentName: "Anna Papadopoulos", metadata: { from: "—", to: "New Inquiry" } },
  { id: "act-c003-2", clientId: "c003", type: "email", date: "2026-04-20T09:30:00Z", note: "Sent introductory brochure highlighting available plots in Parikia outskirts with building permits.", agentName: "Anna Papadopoulos" },
  { id: "act-c003-3", clientId: "c003", type: "whatsapp", date: "2026-04-19T15:00:00Z", note: "Sent WhatsApp with two plot listings — asked about timeline and financing plans.", agentName: "Anna Papadopoulos", metadata: { response: "Replied — interested in both" } },
  // c004 · James Whitmore
  { id: "act-c004-1", clientId: "c004", type: "stage_change", date: "2026-04-19T08:00:00Z", note: "Lead from Instagram ad campaign — clicked on Cycladic village listing.", agentName: "Dan Paul", metadata: { from: "—", to: "New Inquiry", source: "Instagram Ad" } },
  { id: "act-c004-2", clientId: "c004", type: "email", date: "2026-04-19T16:30:00Z", note: "Sent automated welcome email. Followed up manually with Cycladic house listings in Lefkes and Marpissa.", agentName: "Dan Paul" },
  { id: "act-c004-3", clientId: "c004", type: "phone_call", date: "2026-04-18T11:00:00Z", note: "Attempted callback — no answer. Left voicemail.", agentName: "Dan Paul", metadata: { duration: "—", outcome: "Voicemail left" } },
  // c005 · Yael Ben-David
  { id: "act-c005-1", clientId: "c005", type: "stage_change", date: "2026-04-16T10:00:00Z", note: "Moved to Qualified stage after confirming liquid funds and purchase intent.", agentName: "Dan Paul", metadata: { from: "New Inquiry", to: "Qualified" } },
  { id: "act-c005-2", clientId: "c005", type: "phone_call", date: "2026-04-18T11:00:00Z", note: "Qualification call completed. Confirmed budget €5M–€10M, liquid. Looking for private estate with direct sea access. Timeline: purchase within 6 months.", agentName: "Dan Paul", metadata: { duration: "35 min" } },
  { id: "act-c005-3", clientId: "c005", type: "meeting", date: "2026-04-14T09:00:00Z", note: "Video call meeting to discuss requirements in detail. Shared mood-board of preferred estate styles. Agreed on north-coast focus for initial shortlist.", agentName: "Dan Paul", metadata: { duration: "55 min", platform: "Zoom" } },
  { id: "act-c005-4", clientId: "c005", type: "email", date: "2026-04-12T13:00:00Z", note: "Sent initial inquiry response with ultra-luxury estate shortlist. Three properties highlighted in Naoussa, Ambelas, and Kamares.", agentName: "Dan Paul" },
  { id: "act-c005-5", clientId: "c005", type: "note", date: "2026-04-10T08:30:00Z", note: "High-priority A-class client. Requires concierge-level service. Security and privacy are key concerns — no public listings to be shared.", agentName: "Dan Paul" },
  // c006 · Ingrid van der Berg
  { id: "act-c006-1", clientId: "c006", type: "stage_change", date: "2026-04-14T09:00:00Z", note: "Qualified after confirming €2M–€4M budget and designer villa preference with pool.", agentName: "Klaus Weber", metadata: { from: "New Inquiry", to: "Qualified" } },
  { id: "act-c006-2", clientId: "c006", type: "email", date: "2026-04-17T13:00:00Z", note: "Sent curated portfolio of 5 designer villa listings in Alyki and Santa Maria with full spec sheets.", agentName: "Klaus Weber" },
  { id: "act-c006-3", clientId: "c006", type: "phone_call", date: "2026-04-15T10:30:00Z", note: "Follow-up call — Ingrid confirmed top two properties from initial list. Discussed viewing schedule for May.", agentName: "Klaus Weber", metadata: { duration: "22 min" } },
  // c007 · Thomas Breitner
  { id: "act-c007-1", clientId: "c007", type: "stage_change", date: "2026-04-11T08:00:00Z", note: "Moved to Qualified — confirmed must-haves: sea view, minimum 3 bedrooms, parking.", agentName: "Klaus Weber", metadata: { from: "New Inquiry", to: "Qualified" } },
  { id: "act-c007-2", clientId: "c007", type: "phone_call", date: "2026-04-15T10:30:00Z", note: "Detailed requirements call. Thomas confirmed Naoussa surroundings as preferred zone. Budget confirmed at CHF 1.4M equivalent.", agentName: "Klaus Weber", metadata: { duration: "28 min" } },
  { id: "act-c007-3", clientId: "c007", type: "email", date: "2026-04-13T11:00:00Z", note: "Sent sea-view villa shortlist — four properties around Naoussa including two with private parking.", agentName: "Klaus Weber" },
  // c008 · Claire Fontaine
  { id: "act-c008-1", clientId: "c008", type: "stage_change", date: "2026-04-08T09:00:00Z", note: "Qualified — confirmed interest in rental-yield properties in Parikia.", agentName: "Anna Papadopoulos", metadata: { from: "New Inquiry", to: "Qualified" } },
  { id: "act-c008-2", clientId: "c008", type: "phone_call", date: "2026-04-14T15:00:00Z", note: "Claire confirmed rental yield is primary driver. Looking for properties with proven short-let history. Budget €400K–€650K firm.", agentName: "Anna Papadopoulos", metadata: { duration: "20 min" } },
  { id: "act-c008-3", clientId: "c008", type: "document", date: "2026-04-11T10:00:00Z", note: "Sent rental yield analysis document for two Parikia apartments showing 6–8% gross yield.", agentName: "Anna Papadopoulos", metadata: { file: "parikia-rental-yield-analysis.pdf" } },
  // c009 · Alexander Müller
  { id: "act-c009-1", clientId: "c009", type: "stage_change", date: "2026-04-17T09:00:00Z", note: "Advanced to Property Presentation — Villa Aegean Crest PDF sent and acknowledged.", agentName: "Dan Paul", metadata: { from: "Qualified", to: "Property Presentation" } },
  { id: "act-c009-2", clientId: "c009", type: "document", date: "2026-04-16T09:00:00Z", note: "Sent full property PDF for Villa Aegean Crest, Naoussa — 4 bed, seafront, infinity pool, €3.9M asking.", agentName: "Dan Paul", metadata: { file: "villa-aegean-crest-brochure.pdf" } },
  { id: "act-c009-3", clientId: "c009", type: "viewing", date: "2026-04-14T10:00:00Z", note: "Virtual walkthrough conducted via video call. Alexander expressed strong interest in the sea-facing terrace and master suite layout.", agentName: "Dan Paul", metadata: { format: "Virtual" } },
  { id: "act-c009-4", clientId: "c009", type: "meeting", date: "2026-04-10T14:00:00Z", note: "Strategy meeting to narrow shortlist to two top contenders. Alexander confirmed maximum €4.5M — no compromise on seafront position.", agentName: "Dan Paul", metadata: { duration: "45 min", platform: "WhatsApp Video" } },
  { id: "act-c009-5", clientId: "c009", type: "phone_call", date: "2026-04-07T11:00:00Z", note: "Qualification call — confirmed liquid funds and German bank financing already pre-arranged.", agentName: "Dan Paul", metadata: { duration: "30 min" } },
  // c010 · Rachel Cohen
  { id: "act-c010-1", clientId: "c010", type: "stage_change", date: "2026-04-12T09:00:00Z", note: "Moved to Property Presentation after expressing strong interest in Golden Beach corridor.", agentName: "Anna Papadopoulos", metadata: { from: "Qualified", to: "Property Presentation" } },
  { id: "act-c010-2", clientId: "c010", type: "email", date: "2026-04-13T14:00:00Z", note: "Sent virtual tour link for Villa Thessaloniki and Villa Marinos in Golden Beach area. Follow-up call booked for 15 Apr.", agentName: "Anna Papadopoulos" },
  { id: "act-c010-3", clientId: "c010", type: "viewing", date: "2026-04-11T11:00:00Z", note: "Conducted in-person showing of two villas in Golden Beach. Rachel preferred the larger property with the private pool terrace.", agentName: "Anna Papadopoulos", metadata: { duration: "3 hours" } },
  // c011 · Oliver Hartley
  { id: "act-c011-1", clientId: "c011", type: "stage_change", date: "2026-04-06T09:00:00Z", note: "Moved to Property Presentation — exclusive compound listings prepared for Oliver's review.", agentName: "Dan Paul", metadata: { from: "Qualified", to: "Property Presentation" } },
  { id: "act-c011-2", clientId: "c011", type: "note", date: "2026-04-11T10:00:00Z", note: "In-person viewing scheduled for late April. Oliver arriving by private jet — arrange transfer and Naoussa accommodation.", agentName: "Dan Paul", metadata: { arrival: "28 Apr 2026" } },
  { id: "act-c011-3", clientId: "c011", type: "document", date: "2026-04-08T09:00:00Z", note: "Sent confidential property dossier covering three off-market north-coast estates. NDA signed and on file.", agentName: "Dan Paul", metadata: { file: "hartley-confidential-estates-dossier.pdf", nda: "Signed 07 Apr 2026" } },
  { id: "act-c011-4", clientId: "c011", type: "meeting", date: "2026-04-05T11:00:00Z", note: "Strategy meeting in London with Oliver and his PA. Discussed requirements: 6+ beds, helipad or large parking, absolute privacy.", agentName: "Dan Paul", metadata: { location: "London — Claridge's", duration: "90 min" } },
  // c012 · Henrik Larsson
  { id: "act-c012-1", clientId: "c012", type: "stage_change", date: "2026-04-15T09:00:00Z", note: "Moved to Offer Submitted — formal offer of €1.25M lodged on Villa Margarita.", agentName: "Klaus Weber", metadata: { from: "Property Presentation", to: "Offer Submitted" } },
  { id: "act-c012-2", clientId: "c012", type: "offer", date: "2026-04-10T11:00:00Z", note: "Formal offer of €1.25M submitted on Villa Margarita, Naoussa. Asking price was €1.45M. Offer includes furnishings.", agentName: "Klaus Weber", metadata: { amount: "€1,250,000", property: "Villa Margarita", asking: "€1,450,000" } },
  { id: "act-c012-3", clientId: "c012", type: "viewing", date: "2026-04-06T10:00:00Z", note: "Second in-person viewing of Villa Margarita. Henrik spent 2+ hours on site and confirmed intent to offer.", agentName: "Klaus Weber", metadata: { duration: "2.5 hours" } },
  { id: "act-c012-4", clientId: "c012", type: "phone_call", date: "2026-04-04T14:00:00Z", note: "Post-first-viewing debrief call. Henrik flagged concern about terrace size but is otherwise very interested.", agentName: "Klaus Weber", metadata: { duration: "20 min" } },
  // c013 · Isabelle Dupont
  { id: "act-c013-1", clientId: "c013", type: "stage_change", date: "2026-04-18T09:00:00Z", note: "Moved to Offer Submitted — €540K offer placed on traditional Lefkes house.", agentName: "Anna Papadopoulos", metadata: { from: "Property Presentation", to: "Offer Submitted" } },
  { id: "act-c013-2", clientId: "c013", type: "offer", date: "2026-04-09T15:30:00Z", note: "Offer of €540K submitted on traditional stone house in Lefkes. Asking €595K. Awaiting seller response.", agentName: "Anna Papadopoulos", metadata: { amount: "€540,000", property: "Lefkes Stone House", asking: "€595,000" } },
  { id: "act-c013-3", clientId: "c013", type: "viewing", date: "2026-04-05T10:00:00Z", note: "In-person viewing of Lefkes stone house. Isabelle loved the character and village setting.", agentName: "Anna Papadopoulos", metadata: { duration: "2 hours" } },
  // c014 · David Goldstein
  { id: "act-c014-1", clientId: "c014", type: "stage_change", date: "2026-04-10T09:00:00Z", note: "Entered Negotiation stage — counter-offer received from seller at €4.2M vs asking €4.8M.", agentName: "Dan Paul", metadata: { from: "Offer Submitted", to: "Negotiation" } },
  { id: "act-c014-2", clientId: "c014", type: "note", date: "2026-04-08T10:00:00Z", note: "Counter-offer received: seller holding at €4.5M. David's limit is €4.3M. Exploring inclusion of boat dock and furniture in deal.", agentName: "Dan Paul", metadata: { seller_counter: "€4,500,000", client_limit: "€4,300,000" } },
  { id: "act-c014-3", clientId: "c014", type: "phone_call", date: "2026-04-06T11:00:00Z", note: "Strategy call with David — agreed to counter at €4.2M with boat dock and external furniture included.", agentName: "Dan Paul", metadata: { duration: "40 min" } },
  { id: "act-c014-4", clientId: "c014", type: "offer", date: "2026-04-03T14:00:00Z", note: "Initial offer of €3.9M submitted on Ambelas peninsula estate. Asking was €4.8M.", agentName: "Dan Paul", metadata: { amount: "€3,900,000", property: "Ambelas Estate", asking: "€4,800,000" } },
  { id: "act-c014-5", clientId: "c014", type: "viewing", date: "2026-03-28T10:00:00Z", note: "Exclusive viewing of Ambelas peninsula estate. David confirmed this is his top choice.", agentName: "Dan Paul", metadata: { duration: "3 hours" } },
  // c015 · Catherine Ashworth
  { id: "act-c015-1", clientId: "c015", type: "stage_change", date: "2026-04-05T09:00:00Z", note: "Entered Negotiation stage — second counter-offer submitted, closing on fixtures and fittings.", agentName: "Klaus Weber", metadata: { from: "Offer Submitted", to: "Negotiation" } },
  { id: "act-c015-2", clientId: "c015", type: "note", date: "2026-04-07T14:00:00Z", note: "Negotiation progressing on fixtures. Seller agrees to include kitchen appliances. Catherine insisting on antique door fittings.", agentName: "Klaus Weber" },
  { id: "act-c015-3", clientId: "c015", type: "phone_call", date: "2026-04-04T10:00:00Z", note: "Negotiation call — Catherine confirmed she will accept €1.05M if kitchen and door fittings are included.", agentName: "Klaus Weber", metadata: { duration: "30 min" } },
  { id: "act-c015-4", clientId: "c015", type: "offer", date: "2026-04-01T11:00:00Z", note: "Second counter-offer at €1.05M submitted — first offer was €980K, seller countered at €1.1M.", agentName: "Klaus Weber", metadata: { amount: "€1,050,000", property: "Captain's House Parikia" } },
  // c016 · Pieter de Vries
  { id: "act-c016-1", clientId: "c016", type: "stage_change", date: "2026-03-29T09:00:00Z", note: "Entered Legal Process stage — notary engaged and title search initiated.", agentName: "Dan Paul", metadata: { from: "Negotiation", to: "Legal Process" } },
  { id: "act-c016-2", clientId: "c016", type: "document", date: "2026-04-06T09:00:00Z", note: "Title search report received — property is clear of encumbrances. Notary appointment confirmed for April 20.", agentName: "Dan Paul", metadata: { file: "title-search-deVries.pdf", notary_date: "20 Apr 2026" } },
  { id: "act-c016-3", clientId: "c016", type: "meeting", date: "2026-04-02T11:00:00Z", note: "Meeting with Pieter and notary Konstantina Daskalopoulou to review preliminary contract.", agentName: "Dan Paul", metadata: { location: "Paros Notary Office" } },
  { id: "act-c016-4", clientId: "c016", type: "document", date: "2026-03-31T14:00:00Z", note: "Preliminary contract (προσύμφωνο) drafted and reviewed by both parties. Deposit of €100K transferred.", agentName: "Dan Paul", metadata: { file: "preliminary-contract-deVries.pdf", deposit: "€100,000" } },
  // c017 · Elena Stavrakis
  { id: "act-c017-1", clientId: "c017", type: "stage_change", date: "2026-03-24T09:00:00Z", note: "Entered Legal Process — contracts underway on residential plot in Parikia outskirts.", agentName: "Anna Papadopoulos", metadata: { from: "Negotiation", to: "Legal Process" } },
  { id: "act-c017-2", clientId: "c017", type: "document", date: "2026-04-05T11:00:00Z", note: "Tax office (ΔΟΥ) clearance obtained. Awaiting final notarial contract — estimated completion 12 May.", agentName: "Anna Papadopoulos", metadata: { file: "doy-clearance-stavrakis.pdf" } },
  { id: "act-c017-3", clientId: "c017", type: "phone_call", date: "2026-04-01T10:00:00Z", note: "Update call — informed Elena that ΔΟΥ clearance is pending and final contract will be ready within 6 weeks.", agentName: "Anna Papadopoulos", metadata: { duration: "12 min" } },
  { id: "act-c017-4", clientId: "c017", type: "document", date: "2026-03-28T13:00:00Z", note: "Preliminary contract signed and deposit of €30K paid. Engineer's building study attached.", agentName: "Anna Papadopoulos", metadata: { file: "preliminary-stavrakis.pdf", deposit: "€30,000" } },
  // c018 · Michael Bergmann
  { id: "act-c018-1", clientId: "c018", type: "stage_change", date: "2026-04-23T09:00:00Z", note: "Deal completed — signed and closed at €9.4M on exclusive Naoussa seafront estate.", agentName: "Dan Paul", metadata: { from: "Legal Process", to: "Signed & Closed" } },
  { id: "act-c018-2", clientId: "c018", type: "meeting", date: "2026-04-03T16:00:00Z", note: "Final signing meeting at Paros notary. All parties present. Contracts signed, keys handed over. Champagne served on site.", agentName: "Dan Paul", metadata: { location: "Naoussa Notary" } },
  { id: "act-c018-3", clientId: "c018", type: "document", date: "2026-04-01T11:00:00Z", note: "Final contract (κυρία σύμβαση) signed and notarized. Full payment of €9.4M confirmed received.", agentName: "Dan Paul", metadata: { file: "final-contract-bergmann.pdf", amount: "€9,400,000" } },
  { id: "act-c018-4", clientId: "c018", type: "phone_call", date: "2026-03-25T10:00:00Z", note: "Pre-closing call — reviewed all outstanding documents. Wire transfer confirmed for April 1.", agentName: "Dan Paul", metadata: { duration: "20 min" } },
  // c019 · Amélie Rousseau
  { id: "act-c019-1", clientId: "c019", type: "stage_change", date: "2026-04-21T09:00:00Z", note: "Deal closed at €1.15M — Cycladic villa with vineyard view in Prodromos transferred.", agentName: "Anna Papadopoulos", metadata: { from: "Legal Process", to: "Signed & Closed" } },
  { id: "act-c019-2", clientId: "c019", type: "meeting", date: "2026-03-28T10:00:00Z", note: "Closing meeting and key handover at the property in Prodromos. Amélie received welcome package and local services guide.", agentName: "Anna Papadopoulos", metadata: { location: "Prodromos Villa", price: "€1,150,000" } },
  { id: "act-c019-3", clientId: "c019", type: "document", date: "2026-03-25T14:00:00Z", note: "Final contract notarized. Full payment received. Land registry transfer in progress.", agentName: "Anna Papadopoulos", metadata: { file: "final-contract-rousseau.pdf", amount: "€1,150,000" } },
  // c020 · Daniel Weiss
  { id: "act-c020-1", clientId: "c020", type: "stage_change", date: "2026-04-25T08:00:00Z", note: "New inquiry registered from Airbnb investment forum referral.", agentName: "Anna Papadopoulos", metadata: { from: "—", to: "New Inquiry" } },
  { id: "act-c020-2", clientId: "c020", type: "email", date: "2026-04-23T08:30:00Z", note: "Sent listing catalogue featuring small apartments and studios in Parikia — 6 options within budget.", agentName: "Anna Papadopoulos" },
  { id: "act-c020-3", clientId: "c020", type: "whatsapp", date: "2026-04-22T10:00:00Z", note: "WhatsApp introduction message with agency presentation. Daniel replied asking about short-let regulations in Paros.", agentName: "Anna Papadopoulos", metadata: { response: "Replied — asked about short-let rules" } },
];

export const mockProperties: Property[] = [
  { id: "p001", reference: "EK-001", title: { en: "Villa Aegean Crest", de: "Villa Ägäischer Kamm" }, type: "villa", status: "available", askingPrice: 9500000, area: "Naoussa", bedrooms: 6, bathrooms: 5, buildArea: 480, plotArea: 3200, seafront: true, seaView: true, pool: true, distanceFromSea: 0, agentId: "errikos", coverImage: "/properties/prop-1.jpg" },
  { id: "p002", reference: "EK-002", title: { en: "Kolymbithres Pearl", de: "Perle von Kolymbithres" }, type: "villa", status: "available", askingPrice: 4200000, area: "Kolymbithres", bedrooms: 4, bathrooms: 3, buildArea: 280, plotArea: 1800, seafront: false, seaView: true, pool: true, distanceFromSea: 180, agentId: "errikos", coverImage: "/properties/prop-3.jpg" },
  { id: "p003", reference: "EK-003", title: { en: "Golden Beach Retreat", de: "Rückzugsort Golden Beach" }, type: "villa", status: "available", askingPrice: 2750000, area: "Golden Beach", bedrooms: 5, bathrooms: 4, buildArea: 320, plotArea: 2400, seafront: false, seaView: true, pool: true, distanceFromSea: 220, agentId: "klaus" },
  { id: "p004", reference: "EK-004", title: { en: "Lefkes Stone Manor", de: "Steinherrenhaus Lefkes" }, type: "house", status: "available", askingPrice: 1350000, area: "Lefkes", bedrooms: 4, bathrooms: 3, buildArea: 240, plotArea: 950, seafront: false, seaView: false, pool: false, agentId: "anna", coverImage: "/properties/prop-2.jpg" },
  { id: "p005", reference: "EK-005", title: { en: "Ambelas Cliff Villa", de: "Kliffvilla Ambelas" }, type: "villa", status: "available", askingPrice: 5800000, area: "Ambelas", bedrooms: 5, bathrooms: 4, buildArea: 390, plotArea: 2800, seafront: true, seaView: true, pool: true, distanceFromSea: 0, agentId: "errikos" },
  { id: "p006", reference: "EK-006", title: { en: "Parikia Captain's House", de: "Kapitänshaus Parikia" }, type: "cycladic", status: "available", askingPrice: 780000, area: "Parikia", bedrooms: 3, bathrooms: 2, buildArea: 160, plotArea: 420, seafront: false, seaView: false, pool: false, agentId: "anna" },
  { id: "p007", reference: "EK-007", title: { en: "Alyki Seafront Maisonette", de: "Maisonnette Meerseite Alyki" }, type: "maisonette", status: "available", askingPrice: 560000, area: "Alyki", bedrooms: 2, bathrooms: 2, buildArea: 95, seafront: true, seaView: true, pool: false, distanceFromSea: 15, agentId: "anna" },
  { id: "p008", reference: "EK-008", title: { en: "Prodromos Vineyard Estate", de: "Weingutanwesen Prodromos" }, type: "house", status: "available", askingPrice: 1120000, area: "Prodromos", bedrooms: 4, bathrooms: 3, buildArea: 210, plotArea: 4500, seafront: false, seaView: false, pool: true, agentId: "klaus" },
  { id: "p009", reference: "EK-009", title: { en: "Naoussa Bay Apartment", de: "Bucht-Apartment Naoussa" }, type: "apartment", status: "available", askingPrice: 280000, area: "Naoussa", bedrooms: 1, bathrooms: 1, buildArea: 62, seafront: false, seaView: true, pool: false, distanceFromSea: 350, agentId: "anna" },
  { id: "p010", reference: "EK-010", title: { en: "Villa Margarita", de: "Villa Margarita" }, type: "villa", status: "under_offer", askingPrice: 1380000, area: "Naoussa", bedrooms: 4, bathrooms: 3, buildArea: 265, plotArea: 1200, seafront: false, seaView: true, pool: true, distanceFromSea: 400, agentId: "klaus" },
  { id: "p011", reference: "EK-011", title: { en: "Lefkes Village House", de: "Dorfhaus Lefkes" }, type: "cycladic", status: "under_offer", askingPrice: 540000, area: "Lefkes", bedrooms: 2, bathrooms: 1, buildArea: 120, plotArea: 310, seafront: false, seaView: false, pool: false, agentId: "anna" },
  { id: "p012", reference: "EK-012", title: { en: "Naoussa Grand Estate", de: "Großanwesen Naoussa" }, type: "villa", status: "sold", askingPrice: 9400000, area: "Naoussa", bedrooms: 7, bathrooms: 6, buildArea: 620, plotArea: 5500, seafront: true, seaView: true, pool: true, distanceFromSea: 0, agentId: "errikos" },
];
