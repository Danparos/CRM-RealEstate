# PROJECT CONTEXT
name: Paros Real Estate CRM
agency: Errikos Kohls Immobilien Consulting
path: project -1
created: 2026-04-26
status: specification phase

## Overview
Professional CRM system for a boutique luxury real-estate agency operating
primarily in Paros, Greek islands. Manages buyer clients through a structured
sales pipeline from first contact to property purchase.

## Agency Details
- Name: Errikos Kohls Immobilien Consulting
- Market: Luxury residential & plot properties — Paros, Greece
- Focus: High-end buyers, international clientele

## Tech Stack (decided)
- Frontend: Next.js 14 (App Router) on Cloudflare Pages
- Backend: Cloudflare Workers + Hono.js
- Database: Cloudflare D1 (SQLite) + Drizzle ORM
- Storage: Cloudflare R2 + Cloudflare Images
- Auth: Better Auth
- Maps: Mapbox GL JS
- ORM: Drizzle

## Design System
- Aesthetic: Luxury real-estate — professional, premium
- Primary accent: Gold / Bronze (#B8960C, #CD853F range)
- Background: Clean white (#FFFFFF, #FAFAF8)
- Typography: Elegant serif for headings, clean sans-serif for body
- Mobile-first: Agents work on phones at properties

## Languages
- English (default)
- German
- French
- Greek

## Core Features
1. Full client lifecycle: first contact → property purchase
2. Multi-step pipeline flowchart (visual stages)
3. Client maturity classification: A / B / C
4. Price group categorization
5. Multi-agent assignment per client
6. Agent comments & activity tracking

## User Roles
- Admin
- Office Manager
- Senior Agent
- Agent
- Support Staff

## Key Modules
1. Properties / Listings
2. Clients & Leads
3. Sales Pipeline (flowchart)
4. Viewings & Calendar
5. Deals & Transactions
6. Communications (WhatsApp, Email, Phone)
7. Reports & Analytics
