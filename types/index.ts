export type ClientClass = "A" | "B" | "C";
export type PriceGroup = "entry" | "mid" | "premium" | "luxury" | "ultra";
export type PipelineStage =
  | "new_inquiry"
  | "qualified"
  | "property_presentation"
  | "offer_submitted"
  | "negotiation"
  | "legal_process"
  | "signed_closed";

export type LostReason =
  | "bought_elsewhere" | "budget_issue" | "no_property" | "paused" | "archived";

export type PropertyType =
  | "villa" | "apartment" | "house" | "plot"
  | "investment" | "renovation_project" | "new_project" | "opportunity"
  | "cycladic" | "maisonette" | "studio" | "land" | "commercial" | "hotel";

export type PropertyStatus =
  | "draft" | "available" | "under_offer"
  | "under_contract" | "sold" | "rented"
  | "off_market" | "on_hold" | "withdrawn" | "archived";

export type UserRole =
  | "admin" | "office_manager" | "senior_agent" | "agent" | "support";

export type ActivityType =
  | "phone_call" | "whatsapp" | "email" | "meeting"
  | "viewing" | "offer" | "document" | "note"
  | "stage_change" | "class_change";

export type VendorStage =
  | "owner_inquiry"
  | "valuation"
  | "listing_agreement"
  | "listed"
  | "under_offer"
  | "legal_process"
  | "sold"
  | "withdrawn";

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  languages: string[];
  active?: boolean;
  avatar?: string;
  createdAt?: string;
}

export type Salutation = "Mr." | "Mrs." | "Ms." | "Dr." | "Prof.";

export interface Client {
  id: string;
  salutation?: Salutation;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  nationality?: string;
  language?: string;
  clientClass: ClientClass;
  priceGroup?: PriceGroup;
  budgetMin?: number;
  budgetMax?: number;
  stage: PipelineStage;
  primaryAgent?: string;
  primaryAgentId?: string;
  coAgentIds?: string[];
  propertyInterest?: string;
  propertyLocations?: string[];
  propertyTypes?: string[];
  propertyBedroomsMin?: string;
  propertyBedroomsMax?: string;
  propertyPool?: "any" | "yes" | "no";
  propertyViews?: string[];
  lastActivityAt?: string;
  lastActivityNote?: string;
  stageEnteredAt?: string;
  createdAt?: string;
  updatedAt?: string;
  archived?: boolean;
  archivedAt?: string;
  blacklisted?: boolean;
  blacklistedAt?: string;
}

export interface Activity {
  id: string;
  clientId?: string;
  propertyId?: string;
  vendorId?: string;
  type: ActivityType;
  date: string;
  note: string;
  agentName: string;
  metadata?: Record<string, string>;
}

export interface Vendor {
  id: string;
  salutation?: Salutation;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  nationality?: string;
  language?: string;
  stage: VendorStage;
  primaryAgentId?: string;
  primaryAgent?: string;
  propertyId?: string;
  propertyRef?: string;
  askingPrice?: number;
  valuationPrice?: number;
  listingCommission?: number;
  contractType?: "exclusive" | "open";
  exclusiveUntil?: string;
  notes?: string;
  lastActivityAt?: string;
  lastActivityNote?: string;
  stageEnteredAt?: string;
  createdAt?: string;
  updatedAt?: string;
  archived?: boolean;
  archivedAt?: string;
}

export type PropertyCondition = "planned" | "in_good_condition" | "needs_renovation" | "under_construction";
export type EnergyClass = "A+" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "exempt";
export type ContractType = "exclusive" | "open";
export type PropertyUsage = "residential" | "commercial";
export type MarketingMethod = "sale" | "rent" | "sale_or_rent";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  assignedTo?: string;
  clientId?: string;
  propertyId?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  createdAt?: string;
}

export interface Property {
  id: string;
  reference: string;
  title: Record<string, string>;
  type: PropertyType;
  status: PropertyStatus;
  availableSince?: string;

  // Admin
  ownershipGroup?: string;
  agentId: string;
  coAgentIds?: string[];
  recordingResponsible?: string;
  displayOnWebsite?: boolean;
  disabled?: boolean;
  keysAvailable?: boolean;

  // Financial
  askingPrice: number;
  buyerCommission?: number;
  sellerCommission?: number;
  contractType?: ContractType;

  // Physical
  bedrooms: number;
  bathrooms: number;
  buildArea: number;
  buildableArea?: number;
  plotArea?: number;
  floors?: number;
  rooms?: number;
  balconies?: number;
  terraces?: number;
  yearOfConstruction?: number;
  condition?: PropertyCondition;
  energyClass?: EnergyClass;
  heatingTypes?: string[];

  // Location
  area: string;
  island?: string;
  country?: string;
  scoutRegion?: string;
  address?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;

  // Classification
  usage?: PropertyUsage;
  marketingMethod?: MarketingMethod;

  // Features
  seafront: boolean;
  seaView: boolean;
  pool: boolean;
  distanceFromSea?: number;
  features?: string[];
  description?: string;
  comments?: string;
  legalChecklist?: { label: string; checked: boolean }[];

  coverImage?: string;
  createdAt?: string;
  vendorId?: string;
}
