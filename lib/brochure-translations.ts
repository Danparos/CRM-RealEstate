export type BrochureLang = "en" | "de" | "fr" | "gr";

export const LANG_LABELS: Record<BrochureLang, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  gr: "Ελληνικά",
};

export const T: Record<BrochureLang, Record<string, string>> = {
  en: {
    forSale:        "For Sale",
    forRent:        "For Rent",
    askingPrice:    "Asking Price",
    bedrooms:       "Bedrooms",
    bathrooms:      "Bathrooms",
    buildArea:      "Build Area",
    plotArea:       "Plot Area",
    location:       "Location",
    features:       "Features",
    contactAgent:   "Contact Agent",
    reference:      "Reference",
    exclusiveListing: "Exclusive Listing",
    viewingBy:      "Viewing by appointment only",
    agencyName:     "CRM - Real Estate",
    tagline:        "Premium Real Estate · Paros, Greece",
    pool:           "Swimming Pool",
    seafront:       "Seafront",
    seaView:        "Sea View",
    yearBuilt:      "Year Built",
    commission:     "Buyer's Commission",
  },
  de: {
    forSale:        "Zu Verkaufen",
    forRent:        "Zu Vermieten",
    askingPrice:    "Kaufpreis",
    bedrooms:       "Schlafzimmer",
    bathrooms:      "Badezimmer",
    buildArea:      "Wohnfläche",
    plotArea:       "Grundstücksfläche",
    location:       "Lage",
    features:       "Ausstattung",
    contactAgent:   "Kontakt",
    reference:      "Referenz",
    exclusiveListing: "Exklusivmandat",
    viewingBy:      "Besichtigung nur nach Vereinbarung",
    agencyName:     "CRM - Real Estate",
    tagline:        "Premium Immobilien · Paros, Griechenland",
    pool:           "Schwimmbad",
    seafront:       "Meereslage",
    seaView:        "Meerblick",
    yearBuilt:      "Baujahr",
    commission:     "Käuferprovision",
  },
  fr: {
    forSale:        "À Vendre",
    forRent:        "À Louer",
    askingPrice:    "Prix Demandé",
    bedrooms:       "Chambres",
    bathrooms:      "Salles de Bain",
    buildArea:      "Surface Habitable",
    plotArea:       "Surface du Terrain",
    location:       "Localisation",
    features:       "Caractéristiques",
    contactAgent:   "Contact Agent",
    reference:      "Référence",
    exclusiveListing: "Mandat Exclusif",
    viewingBy:      "Visites sur rendez-vous uniquement",
    agencyName:     "CRM - Real Estate",
    tagline:        "Immobilier Premium · Paros, Grèce",
    pool:           "Piscine",
    seafront:       "Front de Mer",
    seaView:        "Vue Mer",
    yearBuilt:      "Année de Construction",
    commission:     "Commission Acquéreur",
  },
  gr: {
    forSale:        "Προς Πώληση",
    forRent:        "Προς Ενοικίαση",
    askingPrice:    "Ζητούμενη Τιμή",
    bedrooms:       "Υπνοδωμάτια",
    bathrooms:      "Μπάνια",
    buildArea:      "Εμβαδόν Κατοικίας",
    plotArea:       "Εμβαδόν Οικοπέδου",
    location:       "Τοποθεσία",
    features:       "Χαρακτηριστικά",
    contactAgent:   "Επικοινωνία",
    reference:      "Κωδικός",
    exclusiveListing: "Αποκλειστική Εντολή",
    viewingBy:      "Επισκέψεις μόνο κατόπιν ραντεβού",
    agencyName:     "CRM - Real Estate",
    tagline:        "Premium Ακίνητα · Πάρος, Ελλάδα",
    pool:           "Πισίνα",
    seafront:       "Παραθαλάσσιο",
    seaView:        "Θέα Θάλασσα",
    yearBuilt:      "Έτος Κατασκευής",
    commission:     "Προμήθεια Αγοραστή",
  },
};

export interface BrochureSendRecord {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyRef: string;
  clientName: string;
  clientEmail: string;
  lang: BrochureLang;
  sentAt: string;
  agentName: string;
  method: "email" | "whatsapp" | "download";
}

const STORAGE_KEY = "paros_crm_brochure_sends_v1";

export function getSendHistory(): BrochureSendRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BrochureSendRecord[]) : [];
  } catch { return []; }
}

export function addSendRecord(record: Omit<BrochureSendRecord, "id">): BrochureSendRecord {
  const full = { ...record, id: `send_${Date.now()}` };
  try {
    const existing = getSendHistory();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([full, ...existing].slice(0, 200)));
  } catch {}
  return full;
}
