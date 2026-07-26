# E-Commerce Order Management & Search — UI/UX Design Spec

**Purpose of this doc:** one reference your team can build against to take the frontend from "features exist" to "looks and feels like a real SaaS product." Covers design system, per-screen redesign, and the bug/consistency checklist to run end-to-end.

---

## 1. Design System

### 1.1 Color Palette (Neutral SaaS, not marketplace-orange)

Your current landing hero uses a purple/pink gradient headline on a dark photo — that reads as a lifestyle/D2C brand, not an admin/ops tool. Split the palette by surface:

**Storefront (Screens 1–2) — light, trustworthy, conversion-focused**
| Token | Hex | Use |
|---|---|---|
| `--bg-base` | `#F7F8FA` | page background |
| `--surface` | `#FFFFFF` | cards, panels |
| `--border` | `#E4E7EC` | dividers, card borders |
| `--text-primary` | `#1A1D23` | headings, prices |
| `--text-secondary` | `#5B6470` | descriptions, meta |
| `--accent-primary` | `#2F6F5E` | deep teal — nav, links, focus rings |
| `--accent-cta` | `#E8623D` | coral — Add to Cart, Place Order |
| `--success` | `#1E8E5A` | in-stock, order accepted |
| `--danger` | `#D14343` | out of stock, rejected |

**Admin Dashboard (Screens 3–4) — dense, data-first, low chroma**
| Token | Hex | Use |
|---|---|---|
| `--bg-admin` | `#F4F5F7` | dashboard background |
| `--surface-admin` | `#FFFFFF` | table, cards |
| `--sidebar-bg` | `#1B2129` | facet sidebar |
| `--sidebar-text` | `#C6CBD3` | sidebar labels |
| `--status-pending` | `#B98900` (amber) |
| `--status-processing` | `#2563EB` (blue) |
| `--status-shipped` | `#1E8E5A` (green) |
| `--status-cancelled` | `#8A94A3` (grey, not red — cancelled isn't an "error") |

Drop the purple/pink gradient entirely for the admin side. Keep it, if at all, only as a small storefront hero accent — not on buttons, not on data screens.

### 1.2 Typography
- One typeface family, e.g. **Inter** (or your existing "Warm Clarity" font if it's already Inter-adjacent).
- Scale: `12 / 14 / 16 / 20 / 24 / 32 / 40px`, 1.4 line-height for body, 1.2 for headings.
- Prices always tabular-nums (`font-variant-numeric: tabular-nums`) so the product grid and order table don't jitter.

### 1.3 Spacing & Grid
- 8px base unit. Card padding `16px`/`24px`. Section gaps `32–48px`.
- Product grid: `repeat(auto-fill, minmax(240px, 1fr))`, gap `20px`. Never fixed 4-column — it breaks on tablet.
- Max content width `1280px`, centered, `24px` side padding on mobile.

### 1.4 Elevation & Radius
- Radius: `8px` cards, `6px` buttons/inputs, `999px` pills (status badges).
- Shadow: one soft shadow token `0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)`. Don't stack multiple heavy shadows — that's what's currently making it look "off."

---

## 2. Screen-by-Screen Redesign

### Screen 1 — Customer Storefront
**Current risk:** generic hero, unclear if product grid is really pulling live Mongo data.
- **Header:** logo, persistent search stays hidden here (search lives in admin only, per spec) — instead show "Log In As" dropdown top-right, replacing "Sign in."
- **Product card:** image (4:3, `object-fit: cover`, lazy-loaded), title (1 line, ellipsis), 2-line description clamp, price in `--text-primary` bold, stock as a small pill: green "In Stock (14)" / red "Out of Stock" — never just a number with no label.
- **Add to Cart:** disabled + greyed state when stock = 0, not just hidden.
- **Cart affordance:** persistent mini-cart icon with item count badge, top-right — currently your screenshot shows "0 Cart" static text, make it a real component bound to local state.

### Screen 2 — Checkout
- Two-column layout: left = order summary (line items, qty, subtotal), right = sticky "Place Order" card with total + button.
- **Success/failure state:** don't use a generic toast only — show an inline banner above the button: green check + order ID on success, red banner with specific reason ("Wireless Mouse: only 2 left") on rejection.
- Disable "Place Order" while request in flight; show spinner in button, not a full-page loader — full-page loaders feel broken on a checkout step.

### Screen 3 — Admin Search Dashboard (your core deliverable — spend the most polish here)
- **Layout:** left fixed sidebar (facets, dark `--sidebar-bg`) + top omni-search bar + KPI cards row + data table. This is the single biggest "looks like a real SaaS tool" signal — most student projects skip the persistent facet sidebar and just do a search bar + list, which reads as a demo, not a product.
- **KPI cards:** 2 cards max width, large number + label + small delta/context line, not just a bare number.
- **Table:** sticky header, status as colored pill (not plain text), right-align Total Amount, hover row highlight, clickable Order ID row → navigates to Screen 4.
- **Empty/loading states:** skeleton rows while OpenSearch query runs; explicit "No orders match these filters" state — not a blank table, which reads as broken.

### Screen 4 — Admin Order Details
- Header block: Order ID + status pill + version number + **sync status indicator** (small dot: green "Synced" / amber "Syncing" / red "Out of sync" comparing Mongo version vs OpenSearch `source_version`) — this is explicitly called out in your spec as a differentiator, make it visually real, not just a text label.
- Status dropdown triggers PATCH; on `409` show a non-blocking banner: "This order was updated elsewhere — refresh to see the latest version," don't let it fail silently.

---

## 3. Bug / Consistency Checklist (run before calling frontend "done")

- [ ] Product grid pulls from `GET /api/products` (Mongo), not hardcoded array — check Network tab, not just visuals
- [ ] Search dashboard hits `/api/search/orders` only — confirm no accidental Mongo calls on that screen
- [ ] Cart total recalculates client-side but is **re-validated server-side** on `POST /api/orders` — server errors must surface in UI, not just console
- [ ] Idempotency key generated once per checkout attempt, persisted across retries (not regenerated on every click)
- [ ] Status pill colors consistent across Screen 3 table and Screen 4 detail — audit for hardcoded color mismatches
- [ ] All prices rendered from `*_minor` integer fields divided by 100 at render time — check for any place doing float math upstream
- [ ] Loading, empty, and error states exist for every fetch — not just the happy path
- [ ] Facet filters and search bar combine correctly (AND logic) and update table + KPIs together, not independently
- [ ] 409 conflict on status update is caught and shown, not swallowed
- [ ] Sync status indicator on Screen 4 actually compares real version numbers, not a static "Synced" label
- [ ] Responsive check: product grid and admin table both usable at 768px width, not just desktop

---

## 4. Next Step

Send over your existing frontend code (or a repo link) and your backend's actual base URL/routes when ready — I'll cross-check this checklist against the real implementation, flag exactly which items are broken vs. cosmetic, and hand back a prioritized fix list before we touch the redesign build.
