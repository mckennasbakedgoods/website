# Design

Visual system for **Mckenna's Baked Goods** — a warm, homey, modern bakery site. Identity-preserving: derived from her real Instagram brand (badge logo, line-art motifs, dusty-rose + gold accents, warm photography), elevated to feel intentional and specific to her rather than templated.

## Theme

Warm editorial-lifestyle. A calibrated near-white canvas (not flat beige) lets warm food photography and a strawberry-berry accent carry the warmth. Cocoa-ink type, generous space, her own hand-drawn line-art and sparkle motifs as signature touches. Mobile-first; design is the product.

## Color

OKLCH throughout. Strategy: **restrained-warm canvas + one committed berry accent** (pulled from her red-velvet / strawberry / raspberry bakes). Dusty rose and antique gold are her secondary brand accents, used sparingly.

```css
--bg:         oklch(98% 0.008 75);    /* warm near-white canvas (NOT orange cream) */
--surface:    oklch(99.5% 0.003 80);  /* cards, form fields */
--surface-2:  oklch(95.5% 0.014 72);  /* oat section bg for rhythm */
--ink:        oklch(26% 0.03 45);     /* warm cocoa near-black — headings + body */
--ink-soft:   oklch(43% 0.025 48);    /* secondary text + placeholders (≥4.5:1 on bg) */
--berry:      oklch(52% 0.21 22);     /* strawberry red — links, accents */
--berry-deep: oklch(46% 0.19 22);     /* CTA fills (white text ≥4.5:1), hover */
--blush:      oklch(91% 0.035 18);    /* soft pink fills / badges */
--gold:       oklch(70% 0.085 78);    /* antique gold — sparkle motif only, tiny */
--line:       oklch(87% 0.012 60);    /* hairline borders */
```

- Body text is `--ink` / `--ink-soft` on `--bg` — never light gray on tint.
- White text only on `--berry-deep` or darker. On `--berry` use `--ink` or white-with-care.
- Warmth comes from photography + accent + ink, not from a saturated background.

## Typography

Two families, paired on a contrast axis (serif display + geometric sans body). Her script charm comes from **Fraunces italic**, not a third font.

- **Display / headings:** Fraunces (variable; opsz, soft, wght). Soft optical character, warm-modern. Weights 400–600.
- **Section accent labels** ("Muffins", "Cakes", "sweet things"): Fraunces *italic* — reads near-script, echoes her hand-lettered menu.
- **Body / UI:** Manrope 400/500/600/700.
- Display clamp ceiling ≤ 6rem. Letter-spacing floor ≥ -0.04em. `text-wrap: balance` on h1–h3, `pretty` on prose. Body line length 60–72ch.

## Iconography & motifs (her brand language, rebuilt as SVG)

- Circular badge logo: "MCKENNA'S · BAKED GOODS" around a script M + heart.
- Line-art: whisk-in-hand, cupcake, cake-slice (delicate single-stroke).
- 4-point sparkle accents (gold), used sparingly near headings.
- Hand-drawn swash underlines beneath script section labels.

## Components

- **Header:** sticky, translucent; SVG badge + nav (Menu · About · How to Order) + berry "Request an order" CTA. Real, accessible mobile hamburger → slide-down panel (focus-trapped, ESC to close).
- **Hero:** photo-led, asymmetric (not centered-generic). Headline (Fraunces), warm sub, primary CTA + "See the menu." Hero image eager + `fetchpriority=high`.
- **Story / Meet Mckenna:** her Le Cordon Bleu story, first-person voice, portrait/photo.
- **Menu:** real menu. Muffins list (6/12 pricing), build-your-own 6″ cakes (base/filling/frosting, $60). Line-art icons + Fraunces-italic labels. Editorial layout, NOT a 3-card grid.
- **Gallery:** editorial/bento image grid from her photography.
- **How to order:** the real 4 steps — a genuine sequence, so numbered markers are earned. Her dusty-rose numbered style.
- **Order form:** inquiry form → Formsubmit → mckennasbakedgoods@gmail.com. Fields: name, email, phone (opt), what you'd like, date needed. Honeypot + table template. Venmo/Apple Pay + $10 local-delivery note. Boise, ID.
- **Footer:** badge, Instagram (@mckennas.baked.goods), email, credit, Boise ID.

## Layout

- Mobile-first. Container `min(92%, 1120px)`.
- Vary section spacing for rhythm; alternate `--bg` / `--surface-2`.
- Flex for 1D, Grid for 2D. Responsive grids: `repeat(auto-fit, minmax(280px, 1fr))`.
- Semantic z-index scale (header < mobile-panel < toast).

## Motion

Gentle, warm, intentional — never the uniform fade-reflex.
- Scroll-reveal: content visible by default, transitions *enhance* (no visibility gated on JS).
- Hero: subtle settle on load; staggered menu rows; CTA hover lift.
- Sparkles: faint twinkle (CSS), respects reduced motion.
- Easing: ease-out-expo/quint. No bounce.
- Full `prefers-reduced-motion: reduce` alternative (crossfade/instant).

## Accessibility

WCAG 2.2 AA. Contrast ≥4.5:1 body. Keyboard-navigable nav + form, visible focus rings, real `<label>`s. Touch targets ≥44px. Reduced-motion honored everywhere.
