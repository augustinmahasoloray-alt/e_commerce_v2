# StepUp — Project Context Prompt

Paste this at the start of a conversation with any AI assistant so it has full context before you ask for changes.

---

## Project

**StepUp** is a shoe e-commerce capstone project, originally built as a multi-vendor marketplace and now being **converted to a single-vendor model** — I am the only seller (previously multiple vendors, vendor applications, commission splitting, etc.). Some backend and frontend pieces still reflect the old multi-vendor architecture and need to be simplified or removed as we go.

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS v4
- **Backend:** Node.js / Express / Prisma 7.x with `@prisma/adapter-pg` (PostgreSQL)
- **Hosting (dev):** VirtualBox Ubuntu VM simulating a VPS, Nginx reverse proxy, NAT port forwarding, VS Code Remote-SSH
- **Auth:** Role-based (`admin`, and previously `vendeur` — being phased out), JWT
- **Roles going forward:** `admin` (me, the sole seller/owner) and regular customers. The `vendeur` role, vendor dashboard, vendor application flow, and order-splitting/commission logic are being removed.

## Design system (from global CSS)

- **Colors (CSS variables, light/dark via `.dark` class on `<html>`, persisted through a ThemeProvider):**
  - Light: background `#FAFAF9`, surface `#FFFFFF`, text `#111827`, accent `#e09f3e`, muted `#03045e`
  - Dark: background `#0B0B0B`, surface `#161616`, text `#F5F5F5`, accent `#e09f3e` (same), muted `#A0AEC0`
- **Tailwind v4 theme tokens** (via `@theme`): `bg-backgroundColor`, `bg-surfaceColor`, `text-textColor`, `text-accent`, `text-muted`
- **Fonts:**
  - `font-display` → **Qurova** (custom, local `.otf` files in `public/fonts/qurova/`, weights 300–700)
  - `font-headline` → **Metal** (via Bunny Fonts)
  - `font-body` → **Albert Sans** (via Bunny Fonts, full weight range incl. italics)
- Smooth 300ms transition on background/text color when switching themes.
- Custom infinite marquee animation (`.marquee-track`, 40s linear loop, pauses on hover, respects `prefers-reduced-motion`) used in a `FeaturedCollections` component.

## Existing code already written (for reference / consistency)

- **`Navbar.jsx`**: already updated for the single-vendor pivot — no more `vendeur` role, no "Devenir vendeur" link, `getAccountLink()` only distinguishes `admin` vs. logged-in customer vs. logged-out. Uses `AuthContext`, `ThemeContext`, a `useScrolled` hook, and a responsive collision-detection pattern (collapses nav links into a hamburger menu when space runs out) via `ResizeObserver`.
- Brand name: **StepUp** (logo styled as "StepUp" in `font-headline` + ".shop" in `font-body` + accent color).

## What's still pending

- Remove remaining multi-vendor backend pieces: `Vendor`, `VendorOrder`, `VendorTransaction` Prisma models, vendor middleware/services/controllers/routes, commission calculation, order-splitting logic.
- Simplify checkout (no more multi-vendor cart splitting).
- Decide whether to repurpose the old vendor dashboard as my personal admin panel or rebuild it.
- Frontend routing, catalog, cart (`CartContext`), and checkout are still incomplete.

## How I want you to work with me

- Give complete, ready-to-use files rather than partial snippets, unless I explicitly ask for a targeted diff.
- When giving terminal commands: show the long/explicit form first, then the short form, then a brief explanation of key flags.
- Stay consistent with the color tokens, font tokens, and component patterns already described above — don't introduce new colors/fonts or reinvent existing patterns (e.g. the collapsing-navbar logic, ThemeContext usage) without a good reason.

---

**Ready for action.** Given this context, help me with: *[describe the specific task here]*