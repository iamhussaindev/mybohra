# MyBohra — Product & Platform Reference

> **Source of truth:** `MyBohra-Master-Plan.docx` (v1.0, June 2026) + live Supabase schema  
> **MVP target:** Before Ramadan 1447 AH

Use this document when building any MyBohra repo. When in doubt, align with the master plan and map features to the Supabase tables below.

---

## What MyBohra Is

MyBohra is a **daily-utility mobile app** for the **Dawoodi Bohra community**, combining:

1. **Religious & community tools** — Hijri calendar, Miqaat tracking, namaz times, Quran, tasbeeh, Qibla, PDF library, Mazaar/Ziyarat directory, Sautul Iman videos
2. **Hyper-local business marketplace** — Bohra-owned businesses (Rida, food, tailors, event vendors) with WhatsApp/Instagram-simple seller UX but structured, searchable storefronts

**Core differentiation:** Deep interlinking between community/religious data and commerce — e.g. a Mazaar page links to nearby musafirkhanas, ziyarat sites, transport, halal restaurants, and Market listings.

**Vision:** The first app opened in the morning (date + namaz) and the first app opened when looking for a Mazaar, PDF, or local Bohra business.

---

## Problems Solved

| Problem                                                                                         | MyBohra answer                                                                       |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Fragmented community info across bohracorner, zaereen, its52, idaratalzakereen, dawoodibohraapp | Single app with linked entities                                                      |
| Businesses stuck on WhatsApp/Instagram (no retrieval, spam, no seller traceability)             | Market module: photo + price + description → auto-categorized, persistent storefront |

---

## App Navigation (4 Tabs)

| Tab          | Purpose                                                                      |
| ------------ | ---------------------------------------------------------------------------- |
| **Homepage** | Daily command center: PDF, calendar, namaz strip, feature grid, Miqaat strip |
| **Search**   | Universal Search — tabbed, ranked, fuzzy results across all entity types     |
| **Market**   | Business marketplace, categories, featured products, ads                     |
| **Account**  | Business profile, catalog, notifications, chat, settings                     |

### Homepage highlights

- Quick icons: PDF (today), Calendar (today), Namaz
- Namaz strip: countdown + 6 times + current ghari
- Feature grid: Sautul Iman, Quran, Qibla, Counter, Tasbeeh List, Miqaats, Mazaar (Sadaqah → secondary menu, TBD)
- Miqaat strip: today + upcoming

### UX bar

- **PDF in ≤3 taps** from app open
- **Today's date in ≤1 tap**
- **Fuzzy Miqaat search** (typos, phonetic variants) — hard requirement, not nice-to-have

---

## MVP Scope (Before Ramadan 1447)

- Homepage, PDF library, Hijri calendar + Miqaats, namaz + reminders
- Sautul Iman (YouTube iframe), Quran, Tasbeeh, Qibla
- Mazaar / Ziyarat / Musafirkhana directory (seeded via reels + ₹50/business program)
- Halal restaurant finder, geofenced "inside Mazaar" mode
- **Universal Search** with dedicated backend API (not client-only)
- Market: self-serve listings, auto category detection, featured/popular, ad banners
- Account: business profile, catalog, notifications, chat, settings

### Post-MVP (Phase 2 → Year 3)

- Listing fees, payment tracking, RSVP generator, donations/Sadaqah reminders
- Premium seller tier, marketplace commission, AI stickers, community groups, MyBohra Hunar

---

## Business Model

Utility features are **never paywalled** — they drive DAU/retention; monetization is on Market:

| Stream                                                        | Phase                            |
| ------------------------------------------------------------- | -------------------------------- |
| Business listing fees                                         | Phase 2+                         |
| Featured placement / ad banners                               | MVP (primary early revenue)      |
| Moderated categories (travel, photography, wedding, interior) | MVP                              |
| Marketplace commission                                        | Phase 3 (needs payment tracking) |
| Premium seller tier                                           | Phase 3                          |

MVP: free/discounted listings + ₹50/business seeding incentive + ad inventory.

---

## Brand & Color Palette

Canonical colors for all MyBohra repos (app, webapp, dashboard). Do not hardcode hex in components — use theme tokens.

| Token | Hex | Usage |
| ----- | --- | ----- |
| **Primary** | `#B0271A` | Buttons, links, active states, brand marks |
| **Gradient start** | `#B0271A` | Hero backgrounds, CTAs, gradient text |
| **Gradient end** | `#7F0E03` | Gradient pairs with primary |
| **Background** | `#FEF6D5` | Page/screen background (warm cream) |
| **Accent** | `#B78034` | Highlights, badges, secondary emphasis |
| **Text** | `#0F0808` | Body copy, headings |

**Gradient:** `linear-gradient(135deg, #B0271A 0%, #7F0E03 100%)`

### Where tokens live

| Repo | Source file |
| ---- | ----------- |
| Native app | `app/theme/colors.ts` → `brandPalette` |
| Website | `webapp/app/globals.css` → `--mb-*` CSS variables |
| Dashboard | `mybohra-dashboard/app/globals.css` → `@theme` + `:root` |

Derived scales (primary-10 … primary-900, accent-100 … accent-600) are generated from the canonical values in each repo's theme file.

---

| Component            | Repository                                   |
| -------------------- | -------------------------------------------- |
| Admin dashboard & DB | `github.com/iamhussaindev/mybohra-dashboard` |
| Website              | `github.com/iamhussaindev/mybohra-webapp`    |
| Native app           | `github.com/iamhussaindev/mybohra`           |

**This workspace:** `mybohra-dashboard` — Next.js admin for content, Mazaar, library, business moderation, analytics.

---

## Supabase Database Map

Live schema reference. Row counts are approximate (June 2026).

### Daily utility & content

| Table            | Rows   | Product feature                | Notes                                                                                                 |
| ---------------- | ------ | ------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `library`        | ~2,718 | PDF/audio library              | `album_enum`, tags, categories, `search_vector`, pdf/audio/youtube URLs                               |
| `daily_duas`     | —      | PDF of the day                 | Links `library_id` to Hijri date (day/month)                                                          |
| `miqaat`         | ~238   | Calendar & Miqaats             | Types: URS, MILAD, WASHEQ, PEHLI_RAAT, SHAHADAT, ASHARA, IMPORTANT_NIGHT, EID, OTHER; day/night phase |
| `miqaat_library` | —      | Miqaat ↔ PDF links             | Junction                                                                                              |
| `tasbeeh`        | —      | Tasbeeh list & counter presets | Arabic text, audio, count, type enum                                                                  |
| `youtube_videos` | ~307   | Sautul Iman                    | YouTube metadata; optional `library_id` link                                                          |
| `data`           | —      | App config key-value           | Generic settings store                                                                                |
| `location`       | ~817   | Namaz / geo base               | Cities with lat/lng/timezone                                                                          |

### Mazaar ecosystem (core differentiator)

| Table                 | Rows | Product feature              | Notes                                                    |
| --------------------- | ---- | ---------------------------- | -------------------------------------------------------- |
| `mazaars`             | ~32  | Mazaar directory             | lat/lng, photos, `location_id`, social links             |
| `ziyarat`             | ~162 | Ziyarat (Duat)               | rank enum, history, coordinates                          |
| `mazaar_ziyarat`      | —    | Mazaar ↔ Ziyarat             | Junction                                                 |
| `musafirkhana`        | ~17  | Guest houses                 | rooms, contact, map_link                                 |
| `mazaar_musafirkhana` | —    | Mazaar ↔ Musafirkhana        | Junction                                                 |
| `nearby_places`       | —    | Nearby attractions/transport | Types: AIRPORT, RAILWAY_STATION, MALL, METRO, ATTRACTION |
| `masjid`              | —    | Masjids near mazaars         | Optional `mazaar_id`                                     |
| `miqaat_ziyarat`      | ~1   | Miqaat ↔ Ziyarat             | Junction                                                 |
| `devices`             | ~1   | Geofencing / analytics       | `current_lat/lng` for "inside Mazaar" mode               |

### Market / business

| Table                   | Rows | Product feature         | Notes                                 |
| ----------------------- | ---- | ----------------------- | ------------------------------------- |
| `business`              | —    | Seller storefronts      | slug, location, ratings, verification |
| `category`              | —    | Hierarchical taxonomy   | Self-referential `parent_id`          |
| `business_category`     | —    | Business ↔ categories   | Many-to-many                          |
| `post`                  | —    | Posts & products        | `is_product` flag                     |
| `product_details`       | —    | Product pricing/stock   | Linked to `post`                      |
| `business_review`       | —    | Reviews                 | Moderation via `is_approved`          |
| `business_media`        | —    | Gallery media           |                                       |
| `subscription_plan`     | —    | Premium tiers (Phase 3) |                                       |
| `business_subscription` | —    | Active subscriptions    |                                       |
| `payment`               | —    | Subscription payments   | stripe/manual                         |

### Users & community

| Table            | Rows | Product feature          | Notes                                           |
| ---------------- | ---- | ------------------------ | ----------------------------------------------- |
| `user`           | —    | App users                | phone, email, roles array                       |
| `rsvp_events`    | —    | RSVP generator (Phase 2) | darees, majlis, shadi, birthday; links `miqaat` |
| `rsvp_responses` | —    | RSVP answers             | yes/no/maybe + headcount                        |

### Entity relationship (simplified)

```
mazaars ──┬── mazaar_ziyarat ── ziyarat
          ├── mazaar_musafirkhana ── musafirkhana
          ├── nearby_places
          └── masjid

miqaat ──┬── miqaat_library ── library
         └── miqaat_ziyarat ── ziyarat

business ──┬── post ── product_details
           ├── business_category ── category
           ├── business_review
           └── business_subscription ── subscription_plan ── payment
```

---

## Technical Requirements (from master plan)

1. **Universal Search API** — Backend service returning tabbed, ranked results across: Miqaats, Mazaar/Ziyarat, PDFs, Products, Businesses, Restaurants. **Fuzzy/typo tolerance required.**
2. **Geofenced Mazaar mode** — Use device location (`devices.current_lat/lng`) to auto-show contextual Mazaar view.
3. **Auto-categorization** — Market listings: seller uploads photo + price + description; system assigns category.
4. **Search on library** — `library.search_vector` / `search_text` already support full-text; extend pattern to other entities.

### Reference data sources (research only — verify licensing before production)

bohracorner.com, zaereen.com, its52.com/musafareen, idaratalzakereen.org, dawoodibohraapp.com

---

## Schema source of truth & type sync

| Repo | Owns |
|------|------|
| **mybohra-dashboard** | `supabase/migrations/` (all DDL), `npm run db:push`, `npm run db:sync` |
| **app** (this repo) | Generated types + store models — `app/services/supabase/database.types.ts`, `app/models/generated/` |

**After any database change:**

```bash
cd mybohra-dashboard
npm run db:migration:new -- feature_name   # if new migration
npm run db:push                            # apply to Supabase
npm run db:sync                            # regenerate types → dashboard + app
```

From this repo you can also run `npm run db:types` (delegates to the dashboard sync script).

Do **not** add SQL migrations in this repo. Schema DDL is dashboard-only.

Full guide: `mybohra-dashboard/docs/SCHEMA_SYNC.md`

---

## Dashboard ↔ Database Alignment

| Dashboard route / module        | Primary tables                                    |
| ------------------------------- | ------------------------------------------------- |
| Library, PDF editor, daily duas | `library`, `daily_duas`, `miqaat_library`         |
| Miqaats, admin calendar         | `miqaat`, `daily_duas`                            |
| Mazaars, Ziyarat, Musafirkhana  | `mazaars`, `ziyarat`, `musafirkhana`, junctions   |
| Nearby places, Masjid           | `nearby_places`, `masjid`                         |
| Tasbeeh                         | `tasbeeh`                                         |
| YouTube / Sautul Iman           | `youtube_videos`                                  |
| Business, posts, moderation     | `business`, `post`, `category`, `business_review` |
| Users                           | `user` (+ Supabase Auth)                          |
| Location                        | `location`                                        |
| Devices                         | `devices`                                         |
| Analytics                       | cross-table metrics                               |
| Data (key-value)                | `data`                                            |

---

## Open Decisions (tracked)

- Sadaqah: homepage icon vs secondary menu
- Quran module scope: text vs audio vs both
- Marketing partner list & compensation
- MyBohra Hunar scope (Phase 3)
- Payment provider for marketplace commission
- Data licensing for third-party reference sources

---

## Security note (Supabase)

RLS hardening is in migration `20240611000013_security_hardening.sql` (`miqaat`, `daily_duas`, `location`, `user`, `miqaat_library`). The dangerous `exec_sql` function is removed in that migration.

---

_Last synced from master plan + Supabase: June 2026_
