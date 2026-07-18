# Working Instructions

## Who you're working with
I'm Mo (AlGaissi), a web developer. This project is a client e-commerce 
website ("Fruit Croquant") for a France-based client selling freeze-dried 
fruits across 10 EU countries.

## Communication
- Talk to me in Arabic for explanations and discussion.
- Keep ALL technical content in English: code, file names, commit 
  messages, variable names, config, and code comments.
- Be direct and practical. No long recaps of what you just did — 
  a short summary is enough.
- If something is ambiguous or a decision affects the client 
  (pricing logic, legal pages, payment flow), ASK ME before 
  implementing. Don't guess on client-facing decisions.

## Codebase rules
- The attached "Candy-hon" project is a STRUCTURAL REFERENCE ONLY: 
  reuse its architecture, folder structure, admin dashboard patterns, 
  and page set. Do NOT copy its visual design, branding, colors, or 
  content. Never modify the original Candy-hon files.
- Stack: Next.js (same as Candy-hon). Follow its existing conventions 
  (naming, folder layout) unless there's a clear reason to deviate — 
  and tell me when you deviate.
- All UI must support 3 locales: fr (default), en, ar — with full RTL 
  for Arabic. Use logical CSS properties (start/end) everywhere. 
  Never hardcode left/right or ltr-only layouts.
- All prices in EUR. All user-facing strings go through i18n — 
  never hardcode display text in components.

## Quality bar
- Performance matters: next/image, static generation where possible, 
  lazy loading. Target Lighthouse 90+ mobile.
- EU compliance is not optional: GDPR cookie consent, legal pages 
  (Mentions légales, CGV, Politique de confidentialité, 14-day 
  withdrawal), per-country VAT support in the pricing engine.
- Before big refactors or deleting anything, confirm with me first.

## Design
- The visual design system comes from a separate Claude Design output. 
  Don't invent UI styling before I provide it — build structure and 
  logic first, apply the design system when I deliver it.