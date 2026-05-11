# CLIENTS MODULE — Agent Context
**Project:** Paros Real Estate CRM — Errikos Kohls Immobilien Consulting
**Last updated:** 2026-04-28
**Status:** Core built — features incomplete

---

## Role of This Agent
You are the Clients Module agent for the Paros Real Estate CRM.
Your scope is everything inside:
- `app/(dashboard)/clients/` (all pages)
- `components/clients/` (all components)
- `lib/client-files.ts`
Do NOT touch pipeline, properties, calendar, or reports modules.

---

## Tech Stack
- Next.js 14 App Router — all client components use `"use client"`
- No backend yet — all data stored in localStorage + mock data
- TypeScript strict
- Tailwind CSS with custom gold/bronze design tokens
- Mock data lives in `lib/mock-data.ts`

## Design System
- Gold accent: `#B8960C` | Bronze: `#CD853F`
- Headings: `font-serif` (Cormorant Garamond)
- Cards: `rounded-xl border-stone-200 shadow-sm`
- Active state: `bg-gold-50 text-gold-700`
- Inputs: `h-10 rounded-lg border-stone-200 focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20`

---

## What Has Been Built

### Pages
| File | Status | Notes |
|---|---|---|
| `app/(dashboard)/clients/page.tsx` | Complete | List + search + full filter panel |
| `app/(dashboard)/clients/[id]/page.tsx` | Complete | Uses LocalClientLoader |
| `app/(dashboard)/clients/new/` | Complete | Add client form page |

### Components
| File | Status | Notes |
|---|---|---|
| `client-card.tsx` | Complete | Name, class badge, flag, budget, stage, agent, email, last activity |
| `client-detail.tsx` | Complete | Tabbed profile: Overview / Documents / Activity |
| `add-client-form.tsx` | Complete | Multi-step create form — all spec fields |
| `edit-client-form.tsx` | Complete | Edit all client fields inline |
| `client-documents.tsx` | Complete | Upload/view/delete files per category, stored as base64 in localStorage |
| `send-property-modal.tsx` | UI only | Builds WhatsApp/Email/SMS templates — NOT connected to any real API |
| `activity-timeline.tsx` | Read-only | Shows mock activities — cannot add new entries yet |
| `local-client-loader.tsx` | Complete | Merges mockClients + localStorage overrides |

---

## Data Layer (localStorage — temporary until backend)
| Key | Contents |
|---|---|
| `crm-extra-clients` | JSON array of Client — new clients added by user |
| `crm-client-overrides` | JSON object `{ [clientId]: Client }` — edited clients |
| `crm-files-{clientId}` | JSON array of ClientFile (base64) — documents per client |

---

## Types (from `types/index.ts`)
```
Client, ClientClass (A|B|C), PriceGroup (entry|mid|premium|luxury|ultra),
PipelineStage (new_inquiry|qualified|property_presentation|offer_submitted|
               negotiation|legal_process|signed_closed),
Property, Activity, Salutation
```

---

## Filter System (clients/page.tsx)
- Text search: name, email, phone, propertyInterest
- Client Class: A / B / C
- Pipeline Stage: all 7 stages
- Price Group: Entry / Mid / Premium / Luxury / Ultra
- Agent: Errikos Kohls / Klaus Weber / Anna Papadopoulos
- Looking For: multi-select chips (Property Type + Location + Features)
- URL-driven: `?class=A` or `?stage=new_inquiry` syncs with sidebar nav

---

## Next Development Tasks (Priority Order)

### 1. Add Activity / Log Interaction (HIGH)
Allow agent to log a new activity from client detail page.
- Form fields: type (call/WhatsApp/email/meeting/viewing/note), channel, summary (required), outcome (Positive/Neutral/Negative/No answer), next action + due date
- Save to localStorage key `crm-activities-{clientId}`
- Append to activity timeline on save

### 2. Stage Change from Detail Page (HIGH)
Client's pipeline stage is currently read-only on the detail view.
- Add clickable stage stepper or dropdown to move client to next/previous stage
- Save via the existing `crm-client-overrides` localStorage key
- Update `stageEnteredAt` timestamp on change

### 3. Delete Client (MEDIUM)
No delete action exists yet.
- Add delete button on client detail (with confirmation dialog)
- Remove from `crm-extra-clients` or add to a `crm-deleted-clients` blocklist for mock clients

### 4. Matched Properties Section (MEDIUM)
Add a "Matched Properties" tab or section on client detail.
- Filter `mockProperties` by client's priceGroup, propertyInterest, budgetMin/Max
- Show as property cards with "Send to Client" button (triggers SendPropertyModal)

### 5. Activity Filter (LOW)
Filter the activity timeline by interaction type (calls only, WhatsApp only, etc.)

### 6. Backend Integration (PHASE 2)
Replace all localStorage with Cloudflare D1 via Workers API.
Endpoints needed: GET/POST/PATCH/DELETE /clients, POST /clients/:id/activities, POST /clients/:id/files

### 7. Real Send (PHASE 2)
Wire SendPropertyModal to Meta WhatsApp Cloud API and Resend email.

### 8. Document Storage (PHASE 2)
Move base64 localStorage files to Cloudflare R2.

---

## Known Issues / Limitations
- localStorage base64 documents will hit ~5MB browser limit with large files
- Activity timeline is read-only mock data
- Send Property modal does not actually send anything
- Agent list is hardcoded (no user management yet)
- No client duplicate detection
