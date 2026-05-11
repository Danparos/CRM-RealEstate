# PROPERTIES MODULE — Agent Context
**Project:** Paros Real Estate CRM — Errikos Kohls Immobilien Consulting
**Last updated:** 2026-04-28
**Status:** Basic list built — detail page, add/edit, filters all missing

---

## Role of This Agent
You are the Properties Module agent for the Paros Real Estate CRM.
Your scope is everything inside:
- `app/(dashboard)/properties/` (all pages)
- `components/properties/` (to be created)
- Any property-related CRM components
Do NOT touch clients, pipeline, calendar, or reports modules.

---

## Tech Stack
- Next.js 14 App Router
- No backend yet — all data in `lib/mock-data.ts` → `mockProperties[]`
- TypeScript strict
- Tailwind CSS with gold/bronze design tokens
- localStorage for any new property overrides (same pattern as clients)

## Design System
- Gold accent: `#B8960C` | Bronze: `#CD853F`
- Headings: `font-serif` (Cormorant Garamond)
- Cards: `rounded-xl border-stone-200 shadow-sm`
- Active state: `bg-gold-50 text-gold-700`

---

## What Has Been Built

### Pages
| File | Status | Notes |
|---|---|---|
| `app/(dashboard)/properties/page.tsx` | Partial | Grid list with status tabs (All / Available / Under Offer / Sold) — no detail, no add, no full filters |

### Components
| File | Status | Notes |
|---|---|---|
| None yet | — | No `components/properties/` directory exists |

### Data
- `lib/mock-data.ts` → `mockProperties: Property[]` — mock listings
- Property type defined in `types/index.ts`

---

## Current Properties Page Features
- Grid layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Status tabs: All / Available / Under Offer / Sold (URL: `?status=available`)
- Card shows: cover image placeholder, reference (PAR-YYYY-####), area badge, seafront/pool/sea-view icons, title, price, type badge, status badge, bed/bath/m²
- "Add Property" button exists but is **disabled** (opacity-50, cursor-not-allowed)
- No click-through to detail page
- No search or advanced filters
- No sorting

---

## Property Type (from `types/index.ts`)
```typescript
interface Property {
  id: string
  reference: string               // PAR-YYYY-####
  title: Record<string, string>   // { en, de, fr, el }
  type: PropertyType              // villa|house|cycladic|apartment|maisonette|studio|land|commercial|hotel
  status: PropertyStatus          // draft|available|under_offer|under_contract|sold|rented|off_market|withdrawn|archived
  askingPrice: number
  area: string                    // Naoussa, Parikia, etc.
  bedrooms: number
  bathrooms: number
  buildArea: number               // m²
  plotArea?: number               // m²
  seafront: boolean
  seaView: boolean
  pool: boolean
  distanceFromSea?: number        // meters
  coverImage?: string
  agentId: string
}
```

## Status Flow
`DRAFT → AVAILABLE → UNDER_OFFER → UNDER_CONTRACT → SOLD`
`→ RENTED | OFF_MARKET | WITHDRAWN | ARCHIVED`

---

## Sidebar (already configured)
Properties is in the sidebar nav at `/properties`. No subcategories yet.

## Header
Properties page currently has a small double header (not yet updated to pipeline-style large header — needs fixing like clients/pipeline were fixed).

---

## Next Development Tasks (Priority Order)

### 1. Pipeline-style Header + Hide Top Bar (HIGH)
Same treatment as clients/pipeline:
- Hide title in fixed top header for `/properties` routes
- Add large serif "Properties" header with subtitle "Paros property listings"
- Show property count pill

### 2. Property Detail Page (HIGH)
`app/(dashboard)/properties/[id]/page.tsx`
Full property profile showing:
- Photo gallery (placeholder grid for now)
- All fields: price, type, status, area, bedrooms, bathrooms, build/plot m², seafront/pool/sea-view/distance
- Legal checklist placeholder (KAEK, energy cert, ENFIA, permits)
- Assigned agent
- Matched clients (clients whose budget/prefs match this property)
- Activity log (viewings scheduled, offers received)
- Action buttons: Edit, Change Status, Send to Client

### 3. Add Property Form (HIGH)
`app/(dashboard)/properties/new/page.tsx`
Multi-section form:
- Basic info: title (EN/DE/FR/EL), type, area, reference auto-generated
- Pricing: asking price, price floor (internal)
- Details: bedrooms, bathrooms, build m², plot m², year built
- Features: seafront, sea view, pool, distance from sea, garden
- Status: draft by default
- Agent assignment
- Save to localStorage `crm-extra-properties`

### 4. Edit Property (MEDIUM)
Inline edit modal on property detail — same pattern as edit-client-form.tsx

### 5. Full Filter Panel (MEDIUM)
Beyond status tabs, add:
- Property type filter (multi-select)
- Area/location filter
- Price range slider
- Bedrooms min
- Features (seafront, pool, sea view)
- Search by title/reference

### 6. Sidebar Subcategories (MEDIUM)
Add subcategories under Properties in sidebar:
- Available
- Under Offer
- Under Contract
- Sold
- Off Market
- Draft

### 7. Status Change Workflow (MEDIUM)
Allow changing property status from detail page with confirmation:
Available → Under Offer → Under Contract → Sold

### 8. Matched Clients (LOW)
On property detail, show clients whose budget and preferences match the property.
Cross-reference: `client.budgetMax >= property.askingPrice * 0.9` and area/type overlap.

### 9. Photo Gallery (PHASE 2)
Upload photos per property — store in localStorage/R2.
Carousel viewer on detail page.

### 10. Mapbox Integration (PHASE 2)
Plot property location on map using GPS coordinates.

---

## File Naming Convention (follow clients module pattern)
```
components/properties/property-card.tsx       — card for grid
components/properties/property-detail.tsx     — full detail view
components/properties/add-property-form.tsx   — create form
components/properties/edit-property-form.tsx  — edit modal
components/properties/property-status-badge.tsx — reusable badge
```

## Known Issues
- "Add Property" button is disabled placeholder
- No detail page exists — cards are not clickable
- Header not updated to pipeline style yet
- No localStorage persistence for properties (read-only mock data)
