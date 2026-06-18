# Design — "Loud Little Bakery" (Bold & Alive)

Total reset. Reference-anchored to **Doe** (doe.co.nz) and **Dominique Ansel**:
a confident, joyful, color-forward bakery brand. The opposite of the timid
warm-paper-and-serif version that got (rightly) rejected. Big saturated color
fields, one expressive script wordmark, the bakes shot as round graphic
"stickers," hand-drawn doodles everywhere, loud condensed display type, playful
bouncy motion. Premium because it commits — not because it whispers.

## Vibe

Warm, joyful, a little cheeky, unmistakably hers. Boutique, NOT childish — the
restraint is in the *system* (one type trio, a tight color set), the loudness is
in the *scale and color*. Instagram-native, mobile-first.

## Color (OKLCH) — saturated, color-blocked

```css
--berry:      oklch(55% 0.16 18);   /* strawberry — primary hero field */
--berry-deep: oklch(42% 0.15 18);   /* deep raspberry — text on light, dark CTAs */
--cream:      oklch(96% 0.025 92);  /* warm cream — breathing-room sections */
--butter:     oklch(88% 0.14 92);   /* butter yellow — pop blocks, CTAs */
--sage:       oklch(83% 0.06 155);  /* soft pistachio — accent block */
--blush:      oklch(91% 0.045 18);  /* light pink — soft blocks/chips */
--ink:        oklch(24% 0.03 38);   /* warm near-black — text on light, ink blocks */
--line:       oklch(86% 0.02 40);
```

Sections **color-block**: berry → ink marquee → cream → blush → cream → sage →
ink → berry. Joyful but cohesive (shared warm hues). White/cream text only on
berry/ink/berry-deep; dark ink on cream/butter/sage/blush.

## Type (3 voices, loud)

- **Display (LOUD):** Anton — ultra-bold condensed uppercase. Giant headlines,
  taglines, big numbers, the marquee. This is the volume.
- **Wordmark / warm accent:** Kaushan Script — "Mckenna's" + a few hand-signed
  accent words ("just for you", "the good stuff"). The warmth + life.
- **Body / UI:** Hanken Grotesk 400–800 — clean, friendly, readable. The calm.

## Signature details — bespoke

- **Hand-drawn doodles** (custom SVG): sparkle, heart, squiggle-underline,
  loop-arrow, starburst, swirl, flower-asterisk — scattered as positioned accents
  in brand colors. Echoes her IG line-art. This is where the "life" comes from.
- **Round photo stickers:** her bakes in circle/squircle crops, slightly rotated,
  on the color fields, with little tags — photos as graphic objects, not framed.
- Bespoke single-stroke UI icons (plus, check, arrow, instagram, pin).

## Sections

1. **Hero** — full berry field, doodles, giant Anton headline + Kaushan accent,
   row of round bake-stickers, bold CTAs.
2. **Marquee** — ink strip, big Anton running text.
3. **The bakes** — cream field. Bold muffin rows (tap to add) + a chunky
   "build a 6″ cake" card; a sticky bold **"YOUR BOX"** panel fills live with
   your picks + total + the inquiry form (Formsubmit → mckennasbakedgoods@gmail.com).
4. **Gallery** — playful scrapbook collage (rounded rects + circles + doodles).
5. **Story** — sage/butter block, portrait in a blob frame, Anton + Kaushan signature.
6. **How it works** — big Anton numbers with doodle arrows.
7. **Footer** — berry field, huge "LET'S BAKE", CTA, contact.

## Motion (playful, reduced-motion safe)

Things bounce/slide/pop in, cards wobble on hover, doodles gently float & twinkle,
buttons squish, marquee scrolls. Full `prefers-reduced-motion` alternative.
Compositor-friendly only.

## Accessibility

WCAG 2.2 AA. White/cream text only on dark-enough fields (berry ≤55% L, ink);
dark ink on light fields. Real `<label>`s, visible focus, ≥44px touch targets,
keyboard-operable order + form, reduced-motion honored.
