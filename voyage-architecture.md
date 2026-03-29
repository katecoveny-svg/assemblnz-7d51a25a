# VOYAGE — Assembl Travel Agent Integration Architecture

## Overview

VOYAGE is Assembl's travel planning agent. When a client describes a trip, VOYAGE builds a structured itinerary and deploys an interactive trip planner app — the same one you and Adrian used for Italy, but white-labelled under Assembl branding.

The trip planner becomes a **live deliverable** the client uses throughout their trip: booking tracker, budget calculator, expense splitter, packing list, and shared notes.

---

## How It Works (End to End)

```
Client: "I'm planning 2 weeks in Europe with my partner"
           │
           ▼
    ┌──────────────┐
    │   VOYAGE      │  ← Assembl travel agent (Claude Sonnet API)
    │   Agent       │
    └──────┬───────┘
           │ Asks clarifying questions:
           │ - Dates, budget, travel style
           │ - Must-see vs flexible
           │ - Accommodation preferences (budget/mid/luxury)
           │ - Dietary needs, mobility, interests
           ▼
    ┌──────────────┐
    │  Build        │  VOYAGE structures the trip into:
    │  Itinerary    │  → Destinations with colours, dates, coordinates
    │               │  → Day-by-day activities with costs, types, urgency flags
    │               │  → Accommodation options per destination (3 tiers)
    │               │  → Packing list based on destinations + season
    └──────┬───────┘
           │ Writes structured JSON to Supabase
           ▼
    ┌──────────────┐
    │  Supabase     │  trip_plans → trip_destinations → trip_days
    │  Database     │  → trip_activities → trip_accommodation
    │               │  → trip_packing → trip_expenses → trip_notes
    └──────┬───────┘
           │ Client gets a shareable link
           ▼
    ┌──────────────┐
    │  Trip Planner │  React app (this component)
    │  Frontend     │  Reads from Supabase with real-time subscriptions
    │               │  Both travelers can toggle, book, expense, note
    └──────────────┘
```

---

## Features Carried From Italia App

| Feature | Italia Version | VOYAGE Version |
|---------|---------------|----------------|
| **Countdown dashboard** | Hardcoded departure date | Dynamic from trip_plans.departure_date |
| **Progress rings** | Hotels/Activities/Packing | Same — calculated from Supabase state |
| **Day-by-day timeline** | 16 days Italy data | Dynamic from trip_days + trip_activities |
| **Activity booking toggle** | Supabase real-time sync | Same architecture |
| **Urgent flags** | ⚠ in note field | urgent boolean column |
| **Hotel comparison** | 3–4 options per region, tier badges | Same — VOYAGE generates 3 tiers |
| **Select → Book workflow** | customHotels state + Supabase | trip_accommodation.status column |
| **Budget breakdown** | Category totals + currency conversion | Same — currency from trip_plans |
| **Live expense tracker** | Add/delete, split between K & A | Generic traveler names from trip_plans |
| **Who-owes-who** | Split calculation | Same formula |
| **Packing checklist** | Per-person checkboxes | Simplified to per-item toggle |
| **Notes** | General + per-day notes | Same |
| **Bottom nav + More drawer** | 4 primary + drawer | Same pattern |
| **PWA install nudge** | iOS/Android detection | Same |
| **Map view** | Leaflet with route | Planned — use destination coordinates |
| **Food guide** | Regional food recommendations | VOYAGE generates from destination research |
| **Hidden gems** | Per-region local tips | VOYAGE generates from web search |
| **PDF export** | Pre-generated PDFs | Planned — generate on demand |
| **Vote system** | K/A keen buttons | Planned — traveler preference votes |

---

## Agent Prompt (VOYAGE)

This goes into the VOYAGE agent's system prompt in the Assembl roster:

```
You are VOYAGE, Assembl's travel planning agent. When a client describes a trip,
you build a structured itinerary and deploy an interactive trip planner.

## Your Process

1. DISCOVER — Ask about:
   - Destination(s) and dates
   - Number of travelers and their names
   - Budget range (budget / mid-range / luxury / mixed)
   - Travel style (adventure, cultural, relaxation, food-focused)
   - Must-see priorities
   - Any mobility, dietary, or access needs
   - Home currency (default NZD for NZ clients)

2. RESEARCH — For each destination:
   - Key activities with real costs, booking links, and urgency flags
   - 3 accommodation options per stop (budget, mid, luxury) with real prices
   - Transport connections between stops with costs
   - Local food recommendations
   - Hidden gems and insider tips
   - Seasonal considerations

3. STRUCTURE — Output as JSON matching this schema:
   {
     name: string,
     travelers: string[],
     currency: string,
     exchangeRate: number,
     departureDate: ISO date,
     returnDate: ISO date,
     destinations: [{ id, name, color, dates, nights, lat, lng }],
     days: [{ date, weekday, title, dest, stay, activities: [{
       id, name, cost, type, booked, urgent, link, note
     }]}],
     accommodation: [{ dest, checkIn, checkOut, nights, status, options: [{
       name, tier, price, stars, perks, booked
     }]}],
     packing: [{ id, label, items: string[] }]
   }

4. DEPLOY — Write the JSON to Supabase and return the planner link.

## Activity Types
- free: No cost, no booking needed
- ticket: Requires purchase/timed entry
- food: Restaurant or food experience
- experience: Tours, classes, tastings
- transport: Trains, ferries, transfers

## Urgency Rules
Mark as urgent: true when:
- Timed entry that sells out (Sagrada Familia, Last Supper, etc.)
- Train tickets with dynamic pricing (book early = save 60%+)
- Small-group experiences with limited spots
- Seasonal events with booking windows

## Accommodation Tiers
Always provide exactly 3 options per destination:
- budget: Hostels, B&Bs, budget hotels, Airbnbs
- mid: 3–4 star hotels, design hotels, boutique stays
- luxury: 5-star, renowned properties, special experiences

## Colour Assignment
Assign each destination a brand accent colour:
- Rotate between #00FF88 (green), #00E5FF (cyan), #FF2D9B (pink)
- No two adjacent destinations should share a colour

## Packing List
Generate based on:
- Destinations and climate
- Activities planned (hiking shoes if hikes, smart outfit if restaurants)
- Duration of trip
- Always include: Documents, Essentials, Clothes, Tech categories
```

---

## Supabase Schema

See `voyage-schema.sql` for the complete migration. Key tables:

- **trip_plans** — Master record per trip (name, dates, travelers, currency)
- **trip_destinations** — Ordered stops with colours and coordinates
- **trip_days** — Day-by-day itinerary linked to destinations
- **trip_activities** — Individual activities with booking state, urgency, costs
- **trip_accommodation** — Hotel options per destination with selection/booking state
- **trip_packing** — Packing categories and items with check state
- **trip_expenses** — Live expense logging with who-paid tracking
- **trip_notes** — Shared notes (general or linked to a day)

All tables use Row Level Security (RLS) — only trip members can read/write.

---

## Pricing / Tier Placement

| Assembl Tier | Access |
|-------------|--------|
| **Starter ($89/mo)** | VOYAGE chat only — text itinerary, no app |
| **Pro ($299/mo)** | VOYAGE + trip planner app (1 active trip) |
| **Business ($599/mo)** | VOYAGE + unlimited trips + team sharing |
| **HELM Personal ($14/mo)** | Add VOYAGE as a lifestyle agent |

---

## Implementation Phases

### Phase 1 — MVP (Now)
- VOYAGE agent prompt in Assembl roster
- Static trip planner component (data baked in, like Italia app)
- Client gets a Netlify-deployed version per trip
- Manual: Kate runs VOYAGE, pastes output, deploys

### Phase 2 — Dynamic
- Supabase tables + real-time sync
- VOYAGE writes directly to Supabase via API
- Client gets a unique URL (e.g., trip.assembl.co.nz/abc123)
- Real-time multi-traveler sync (like Italia app's K/A system)

### Phase 3 — Full Product
- Map view with Leaflet/Mapbox
- PDF export on demand
- Food guide per destination
- Hidden gems section
- Vote/preference system between travelers
- Push notifications for upcoming bookings
- Integration with Stripe for trip planning as a paid add-on

---

## File Inventory

| File | Purpose |
|------|---------|
| `generic-trip-planner.jsx` | White-label version, light theme, sample Europe data |
| `voyage-assembl-planner.jsx` | Assembl-branded version, dark cosmic theme, full brand tokens |
| `voyage-schema.sql` | Supabase migration for all trip planner tables |
| `voyage-architecture.md` | This document |
