# CRM Specification — Errikos Kohls Immobilien Consulting
**Paros Real Estate CRM**
Version 1.0 | April 2026

---

## 1. Project Overview

A professional, cloud-based CRM system for **Errikos Kohls Immobilien Consulting**, a boutique luxury real-estate agency operating in Paros, Greece. The system manages the full buyer journey from initial inquiry through to property purchase, with a visual pipeline, client classification, and multi-agent collaboration.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) on Cloudflare Pages |
| Backend | Cloudflare Workers + Hono.js |
| Database | Cloudflare D1 (SQLite) + Drizzle ORM |
| Storage | Cloudflare R2 + Cloudflare Images |
| Auth | Better Auth |
| Maps | Mapbox GL JS |
| Email | Resend / Mailchannels |
| Estimated monthly cost | $0–$25 (Cloudflare free tiers) |

---

## 3. Design System

| Token | Value |
|---|---|
| Primary accent | Gold `#B8960C` |
| Secondary accent | Bronze `#CD853F` |
| Background | White `#FFFFFF`, Off-white `#FAFAF8` |
| Text primary | `#1A1A1A` |
| Text secondary | `#6B6B6B` |
| Border | `#E8E2D9` |
| Font headings | Cormorant Garamond (serif, luxury) |
| Font body | Inter (clean, readable) |
| Border radius | 8px cards, 4px inputs |
| Shadow | `0 2px 12px rgba(0,0,0,0.06)` |

---

## 4. Languages

Default: **English**
Supported: English (en), German (de), French (fr), Greek (el)

---

## 5. User Roles & Permissions

| Role | Description | Key Access |
|---|---|---|
| Admin | System administrator | Full access + settings |
| Office Manager | Operational lead | All clients, all agents, reports, commissions |
| Senior Agent | Experienced agent | Own clients + read others, price floor visible |
| Agent | Standard agent | Own clients only |
| Support Staff | Admin assistant | Lead intake, calendar, no financials |

---

## 6. Client Classification System

### 6.1 Maturity Classification (A / B / C)

| Class | Definition | Follow-up cadence |
|---|---|---|
| **A — Hot** | Ready to buy within 0–3 months, financing confirmed | Every 2–3 days |
| **B — Warm** | Serious interest, 3–12 month horizon | Weekly |
| **C — Cold** | Early research, 12+ months or unclear timeline | Monthly newsletter |

Classification is set by the agent and updated as the client progresses. Office Manager can override.

### 6.2 Price Group Categorization

| Group | Budget Range (EUR) | Typical Property Type |
|---|---|---|
| Entry | Up to €300,000 | Small plots, studios, village houses |
| Mid | €300,000 – €700,000 | Houses, seafront apartments |
| Premium | €700,000 – €1,500,000 | Villas, large seafront properties |
| Luxury | €1,500,000 – €3,000,000 | Luxury villas, private seafront |
| Ultra | €3,000,000+ | Trophy properties, large estates |

---

## 7. Sales Pipeline — Flowchart Stages

Each client moves through the following stages. The pipeline is visualized as a Kanban-style flowchart board.

```
STAGE 1          STAGE 2          STAGE 3          STAGE 4
New Inquiry  →   Qualified    →   Property      →   Offer
                               Presentation       Submitted
                 ↓ classify                        ↓
              A / B / C                        STAGE 5
              price group                   Negotiation
                                                   ↓
                                              STAGE 6
                                         Legal Process
                                            (Greece)
                                                   ↓
                                              STAGE 7
                                           Signed &
                                             Closed
```

### Stage Details

| # | Stage | Entry Criteria | Exit Criteria | Key Actions |
|---|---|---|---|---|
| 1 | New Inquiry | Lead created | Agent makes first contact | Assign agent, log source |
| 2 | Qualified | First contact made | Requirements defined, classified A/B/C | Set budget, property prefs, price group |
| 3 | Property Presentation | Matched properties sent | Client viewed ≥1 property | Schedule viewings, send property PDFs |
| 4 | Offer Submitted | Client ready to make offer | Offer formally submitted | Document offer, link to property |
| 5 | Negotiation | Offer received by seller | Price/terms agreed | Counter-offer log, approval workflow |
| 6 | Legal Process | Agreement in principle | All legal steps complete | Greek legal checklist (AFM, notary, tax) |
| 7 | Signed & Closed | Contract signed at notary | Commission received | Archive client, request referral |

### Lost / Paused States (can occur at any stage)
- **Lost — Bought elsewhere**
- **Lost — Budget issue**
- **Lost — No suitable property**
- **Paused — Will revisit**
- **Archived**

---

## 8. Client Profile

### Core Fields
- Full name (+ name in native script)
- Nationality / citizenship
- Country of residence
- Preferred language
- Phone (WhatsApp-enabled)
- Email
- Passport / ID number (for legal)
- AFM (Greek tax number) — required before purchase

### Classification Fields
- Maturity class: A / B / C
- Price group: Entry / Mid / Premium / Luxury / Ultra
- Budget min / max (EUR)
- Purchase timeline
- Financing: Cash / Mortgage / TBD
- Purchase purpose: Primary residence / Holiday home / Investment / Rental / Golden Visa

### Property Requirements
- Property types (multi-select)
- Preferred areas in Paros (multi-select)
- Min bedrooms, min bathrooms
- Min plot/build size (m²)
- Sea view: Required / Preferred / Not important
- Sea front: Required / Preferred / Not important
- Pool: Required / Preferred / Not important
- Max distance from sea (m)

### Assignment
- Primary agent (required)
- Secondary agent (optional — co-agent)
- Assigned by: Office Manager

---

## 9. Multi-Agent Assignment

- Each client has 1 primary agent + optional co-agent(s)
- Agents can be added/removed by Office Manager
- All assigned agents see the full client file and activity log
- Commission split configured per deal by Office Manager
- Transfer of primary agent requires Office Manager approval

---

## 10. Activity Log & Comments

Every interaction is logged chronologically on the client's timeline:

### Interaction Types
- Phone call (inbound / outbound)
- WhatsApp message (in / out)
- Email (in / out)
- In-office meeting
- Property viewing
- Offer submitted
- Document sent / received
- Internal note (not visible to client)
- Stage change (automatic)
- Classification change (automatic)

### Comment Fields
- Date & time (auto)
- Agent name (auto)
- Type (dropdown)
- Channel: Phone / WhatsApp / Email / In-person
- Summary (required, free text)
- Outcome: Positive / Neutral / Negative / No answer
- Next action + due date
- Attached files

---

## 11. Properties Module (Summary)

### Key Fields
- Property ID (PAR-YYYY-####)
- Title (EN / DE / FR / EL)
- Type: Villa / House / Cycladic / Apartment / Plot / Commercial / Hotel
- Status: Available / Under Offer / Under Contract / Sold / Off-market
- Location: Area (Parikia / Naoussa / Lefkes / Marpissa / Alyki / etc.)
- GPS coordinates + polygon boundary
- Price (asking), Price floor (internal only)
- Area m² (build), Plot m² (land)
- Bedrooms / Bathrooms
- Sea front / Sea view / Pool / Garden
- Distance from sea (m)
- Year built / renovated
- Legal: KAEK, land registry status, energy certificate (ΠΕΑ), ENFIA
- Media: Photos (up to 80), video, drone, 3D tour, floor plans
- Documents: Permits, title deed, certificates

### Property Status Flow
DRAFT → AVAILABLE → UNDER_OFFER → UNDER_CONTRACT → SOLD
                                                   → RENTED
                  → OFF_MARKET
                  → WITHDRAWN

---

## 12. Viewings & Calendar

- Schedule viewings: client + property + agent + date/time
- Google Calendar sync (2-way, OAuth2)
- iCal subscription link
- Viewing feedback form (agent fills post-visit)
- Auto follow-up reminders
- Summer mode: 45-min buffer between viewings, max 6/day
- Multi-language confirmation messages (WhatsApp / Email)

---

## 13. Communications

- **WhatsApp Business API** — primary channel (Meta Cloud API)
- Email (Gmail / Outlook OAuth2 sync)
- Phone call logging (manual or VoIP)
- Unified inbox: all channels in one screen
- Message templates in EN / DE / FR / EL
- Auto sequences (post-viewing, follow-up, re-engagement)
- GDPR compliance: opt-in recorded, data stored in EU

---

## 14. Reports & Analytics

### Agent Reports
- Deals closed, commissions earned
- Viewings conducted, conversion rate
- Lead response time
- Pipeline progression

### Office Manager Reports
- Revenue forecast (pipeline-weighted)
- Inventory: days on market, price per m²
- Lead source ROI
- Seasonal trends (Paros: peak June–Sept)
- Year-over-year comparison

### Export
- PDF (branded with agency logo)
- Excel / CSV
- Scheduled email delivery

---

## 15. Greek Legal Process Checklist (Stage 6)

- [ ] AFM obtained (buyer)
- [ ] Greek tax representative appointed (non-EU buyers)
- [ ] Land registry check (Κτηματολόγιο) — clear title
- [ ] ENFIA certificate — no outstanding property tax
- [ ] Energy performance certificate (ΠΕΑ) — required by law
- [ ] Building permit verified
- [ ] No unauthorized constructions (τακτοποίηση)
- [ ] Transfer tax paid (3.09% of contract value)
- [ ] Notary selected (Paros-based)
- [ ] Pre-contract signed (Προσύμφωνο)
- [ ] Final contract signed (Οριστικό Συμβόλαιο)
- [ ] Registered in land registry post-signing
- [ ] Golden Visa checklist (if applicable — purchase ≥€250,000, non-EU buyer)

---

## 16. Commission Structure

| Type | Rate |
|---|---|
| Seller commission | 2–3% + 24% VAT |
| Buyer commission | 2–3% + 24% VAT |
| Double-sided | 4–6% + 24% VAT |
| Agent share (of agency net) | Configured per agent in settings |

Auto-calculated fields: net, VAT (24%), gross, agent share, split partner share.

---

## 17. Mobile Requirements

- Full PWA (Progressive Web App) — installable on iOS/Android
- All pipeline operations work on mobile
- Photo upload from phone camera
- Offline: last 7 days of client data readable
- Touch-optimized: large tap targets, bottom navigation

---

## 18. Build Phases

### Phase 1 — MVP (6 weeks)
- [ ] Next.js + Cloudflare Workers scaffold
- [ ] Auth (Better Auth) — roles & permissions
- [ ] Client CRUD with classification (A/B/C) + price group
- [ ] Pipeline board (Kanban, 7 stages)
- [ ] Activity log & agent comments
- [ ] Basic property module
- [ ] Responsive UI with design system

### Phase 2 — Core (4 weeks)
- [ ] Viewings & Google Calendar sync
- [ ] WhatsApp Business API integration
- [ ] Email sync (Gmail / Outlook)
- [ ] Property media (photos, floor plans)
- [ ] Mapbox property map

### Phase 3 — Advanced (4 weeks)
- [ ] Full reports & analytics dashboard
- [ ] Multi-language (DE / FR / EL)
- [ ] Greek legal checklist workflow
- [ ] Commission calculator
- [ ] PWA + offline mode

### Phase 4 — Polish (2 weeks)
- [ ] External portals sync (Spitogatos, Rightmove)
- [ ] Auto follow-up sequences
- [ ] PDF report export
- [ ] Performance optimization

---

*Specification v1.0 — Errikos Kohls Immobilien Consulting — April 2026*
