# Handoff: Fruit Croquant — E-commerce Commerce Core

## Overview
Design direction and core screens for **Fruit Croquant** (@fruicroc), a premium freeze-dried fruit e-commerce shop based in France, shipping to 10 EU countries. Trilingual (FR default / EN / AR with full RTL mirroring). This bundle covers: desktop homepage, mobile homepage, mobile product detail with weight-tier price selector, FR/AR mirroring proof, and design foundations.

Target stack per client brief: **Next.js + CSS, mobile-first, Lighthouse 90+ on mobile**.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, not production code to copy directly. The task is to **recreate these designs in the target codebase** (Next.js) using its established patterns. `Fruit Croquant.dc.html` is the design document; open it in a browser to see all screens on one canvas.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii and copy are final intent — recreate pixel-perfectly. Product photography is temporary (cropped from the brand's Instagram grid); the client will provide clean-background originals at the same aspect ratios.

## Critical Constraint: Trilingual + RTL
- Languages: French (default), English, Arabic.
- **Never use physical left/right.** All layouts use logical properties (`margin-inline-start`, `inset-inline-end`, `text-align: end`…) and flex/grid, so `dir="rtl"` mirrors everything for free. The design doc includes a side-by-side FR (LTR) / AR (RTL) proof — replicate that behavior.
- Arabic runs ~20–25% longer: buttons/nav/cards must tolerate expansion. Arabic needs more line-height (≈1.3 for display, ≈1.8 for body vs 1.1/1.65 Latin).
- Prices: EN `€7.00` · FR `7,00 €` · AR keeps `€7.00` with Latin digits.

## Design Tokens
Colors (semantic):
- `--primary` #C42B2B — cherry red: CTAs, prices, active states, announcement bar
- `--primary-ink` #A31E1E — link hover
- `--accent` #FFC53D — mango yellow: stickers, promo tiles; text on accent #7A4A00 / #B07508
- `--surface` #FDF3E3 — cream canvas (default page background)
- `--surface-2` #F7E7CC — chips, wells, lang switcher track
- `--border` #F0DFC2, input border #EAD9BE
- `--success` / trust #3F7D4E — leaf green: Halal badge, story section CTA, "Added ✓"
- `--success-soft` #E4EFDF, story section bg #EFF5EC
- `--ink` #3A2420 — headings, footer bg (cacao)
- Body text #5C3A2E–#6E4A38 · muted #8A6248 / #9A7156
- `--error` #B3261E
- Text on primary: #FFF6E8 (warm white, never pure white)

Typography (both families cover Latin + Arabic natively — one font stack for all three languages):
- Display: **'Baloo Bhaijaan 2'** 700/800 — h1 58px desktop / 34px mobile (lh 1.08–1.12; Arabic 1.25–1.3), h2 30px, card titles 18.5px, buttons 15–18px
- Body: **'Readex Pro'** 300–700 — body 14–18px (lh 1.65; Arabic 1.8), captions 12–13.5px
- Google Fonts: `family=Baloo+Bhaijaan+2:wght@500;600;700;800&family=Readex+Pro:wght@300;400;500;600;700`

Shape & elevation:
- Pills everywhere: buttons/badges/chips `border-radius: 999px`
- Cards 16–20px radius, product images 22–24px, thumbnails 14px
- Shadows: cards `0 2px 8px rgba(58,36,32,.08)`; CTA `0 4px 14px rgba(196,43,43,.35)`; floating (cookie banner, toast) `0 12px 36px rgba(58,36,32,.25)`
- Scalloped section dividers (echo of the logo badge), CSS only:
  `height:18px; background: radial-gradient(circle at 14px -5px, <upper-color> 15px, transparent 16px) 0 0/34px 18px repeat-x, <lower-color>;`
- Hit targets ≥ 44px on mobile.

## Commerce Logic
Weight-tier pricing is brand-wide (same for every product):
30 g = €4.50 · 50 g = €7.00 · 70 g = €9.50 · 100 g = €14.50
- Product card shows "from €4.50" + weight chips (30/50/70/100g).
- Product detail: 4-pill weight selector (selected = red fill, white text; unselected = white, #EAD9BE border, #7A4A3A text). Selecting updates the CTA price live. CTA: "Add to cart · €X.XX" → on click turns green "#3F7D4E" with "Added ✓".
- Trust signals: "Free delivery in France from €30", "Free across Europe from €100 + gift 🎁", 100% Halal badge, PayPal + IBAN bank transfer, "Ships to 10 EU countries".
- Categories: Fruits · Vegetables · Candy. A "🏠 LOCAL PICKUP ONLY" badge variant exists (bg #F0DFC2, text #7A5240) for non-shippable items.

## Screens
### 1a Homepage — desktop (1440)
Announcement bar (red) → header (logo badge + two-tone wordmark, nav, FR/EN/AR pill switcher, cart with count) → hero: 2-col grid (1.05fr/.95fr), left = badges + h1 ("Real fruit, impossibly crunchy." with red span) + sub + red pill CTA + green outline secondary + trust chips; right = 430px circular photo in white ring, rotated yellow "croc croc !" sticker, floating price card → scallop divider → white section: 3 category tiles (photo, bottom gradient, name) then 4-col product grid → scallop → story section (#EFF5EC): arch-shaped photo placeholder of Jana, quote h2, letter teaser, green CTA → newsletter band (cream) → footer (#3A2420, yellow wordmark, PayPal/IBAN chips) → GDPR cookie banner, floating bottom-center card: logo, warm copy ("A cookie with your fruit?"), "Only essentials" text button + green "Accept all".

### 1b Homepage — mobile (390)
Same content stacked: compact announcement, hamburger header, badge + h1 + rounded hero photo + full-width CTA + trust row, 3 small category tiles, 2-col product grid, story band, footer.

### 1c Product detail — mobile (390)
Cream gallery (main image 280px, 3 thumbnails, active = 3px red border), Halal + no-added-sugar badges, title + description, weight selector grid (4 pills showing size + price), full-width CTA with live price, shipping reassurance line, spec rows (Ingredients / Shelf life / Shipping) as label/value flex rows.

### 1d FR/AR mirroring proof
Identical mobile hero + horizontal product card rendered `dir="ltr"` (French) and `dir="rtl"` (Arabic). All copy for both languages is in the design file — reuse it as seed translations.

### 1e Foundations
Palette swatches, Latin + Arabic type scale, buttons (primary/trust/secondary/disabled), badges (HALAL / NEW / LOCAL PICKUP ONLY), input, toast ("Added to cart — …" dark card, green check).

## Interactions & Behavior
- Weight selector: single-select, updates price + resets "added" state.
- Add to cart: optimistic UI (button → green "Added ✓"), plus toast pattern from 1e.
- Cookie banner: shown on first visit, both buttons dismiss (persist consent choice; "Only essentials" = no analytics). GDPR-required, first thing EU visitors see — keep it on-brand.
- Language switcher: 3-state pill; switching sets `lang` + `dir` on `<html>`.
- Hovers (recommendation): buttons darken slightly (primary → #A31E1E), cards lift `translateY(-2px)` + stronger shadow; transitions ~150ms ease.
- Checkout (not yet designed): two payment paths — PayPal button, and bank transfer where the order is confirmed as "pending" with IBAN instructions shown.

## State Management
- `cart`: line items {productId, weightG, qty}; price derived from weight tier map.
- `locale`: 'fr' | 'en' | 'ar' (fr default) — drives copy, price formatting, dir.
- `consent`: 'all' | 'essential' | null.
- Product data: name, slug, category, note/tagline, images[], badges[], shippable flag.

## Assets
- `uploads/logo.png` — round scalloped brand badge (official logo, use as-is).
- `assets/blackberry.png, peach.png, passionfruit.png, dragonfruit.png, mushroom.png` — 349×349 crops from the brand's Instagram; **temporary**, swap for client originals.
- Candy category tile and Jana's photo are placeholders awaiting real photography.
- Icons: minimal — inline stroke SVG cart (stroke #5C3A2E, width 2); avoid icon libraries.

## Files
- `Fruit Croquant.dc.html` — the full design document (all screens 1a–1e). Sections are anchored by ids 1a…1e.
- `assets/` — product photo crops. `uploads/logo.png` — logo.

## Not Yet Designed
Product listing w/ filters, cart + checkout, About Us (Jana's letter), admin theme — pending future design rounds; follow these foundations when they arrive.
