---
name: RMHCDT Youth Portal
description: Local-government youth funding portal for the Royal Mbo Host Community Development Trust
colors:
  mbo-forest: "#15803d"
  mbo-forest-deep: "#166534"
  mbo-forest-light: "#16a34a"
  mbo-forest-pale: "#4ade80"
  amber-gold: "#fbbf24"
  amber-warm: "#f59e0b"
  amber-earth: "#b45309"
  amber-deep: "#92400e"
  blue-training: "#1d4ed8"
  blue-calm: "#3b82f6"
  purple-grant: "#7e22ce"
  cyan-outcome: "#0e7490"
  red-error: "#ef4444"
  red-error-deep: "#dc2626"
  red-error-dark: "#b91c1c"
  ink-primary: "#0f172a"
  ink-secondary: "#374151"
  ink-tertiary: "#64748b"
  ink-muted: "#94a3b8"
  ink-disabled: "#cbd5e1"
  surface-white: "#ffffff"
  surface-page: "#f9fafb"
  surface-input: "#f8fafc"
  surface-hover: "#f1f5f9"
  border-default: "#e2e8f0"
  border-subtle: "#f1f5f9"
  border-card: "#e8ecf0"
  green-tint-bg: "#f0fdf4"
  green-tint-border: "#bbf7d0"
  green-tint-hover: "#dcfce7"
  amber-tint-bg: "#fffbeb"
  amber-tint-border: "#fde68a"
  blue-tint-bg: "#eff6ff"
  blue-tint-border: "#bfdbfe"
  purple-tint-bg: "#faf5ff"
  purple-tint-border: "#e9d5ff"
  cyan-tint-bg: "#ecfeff"
  cyan-tint-border: "#a5f3fc"
  red-tint-bg: "#fef2f2"
  red-tint-border: "#fecaca"
  dark-section: "#0a1f13"
  dark-section-deeper: "#060f09"
typography:
  display:
    fontFamily: "Sora, sans-serif"
    fontSize: "clamp(36px, 4vw, 60px)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Sora, sans-serif"
    fontSize: "clamp(30px, 3.5vw, 48px)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Sora, sans-serif"
    fontSize: "20px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.1em"
    textTransform: "uppercase"
rounded:
  xs: "4px"
  sm: "8px"
  md: "10px"
  lg: "14px"
  xl: "16px"
  "2xl": "20px"
  "3xl": "24px"
  full: "100px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  "2xl": "32px"
  "3xl": "48px"
  "4xl": "64px"
  section: "100px"
components:
  button-primary:
    backgroundColor: "{colors.mbo-forest}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "13px 28px"
  button-primary-hover:
    backgroundColor: "{colors.mbo-forest-deep}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.md}"
    padding: "13px 28px"
  button-submit:
    backgroundColor: "{colors.mbo-forest}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "13px"
  button-submit-hover:
    backgroundColor: "{colors.mbo-forest-deep}"
  button-ghost:
    backgroundColor: "{colors.green-tint-bg}"
    textColor: "{colors.mbo-forest}"
    rounded: "{rounded.sm}"
  button-danger:
    backgroundColor: "{colors.red-tint-bg}"
    textColor: "{colors.red-error-deep}"
    rounded: "{rounded.sm}"
  card-surface:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.xl}"
  card-surface-hover:
    backgroundColor: "{colors.surface-white}"
  input-field:
    backgroundColor: "{colors.surface-input}"
    rounded: "{rounded.md}"
    padding: "0 14px"
  input-field-focus:
    backgroundColor: "{colors.surface-white}"
---

# Design System: RMHCDT Youth Portal

## 1. Overview

**Creative North Star: "The Community Trust"**

The RMHCDT Youth Portal is a government funding platform that feels rooted, dependable, and warm — like a well-built community center where every door is clearly marked and every process is visible. It serves Mbo youth applying for scholarships, grants, and empowerment programmes alongside the administrators and verifiers who manage the funding cycle. Both audiences need clarity, dignity, and efficiency.

The system is built on a single strong anchor — Mbo Forest green (#15803d) — supported by a warm amber accent and a restrained neutral scale. Typography pairs the geometric confidence of Sora for headings with the clean readability of DM Sans for body text. Surfaces use a soft terrain of subtle, layered shadows that create gentle depth without hard edges. Components are tactile and confident: buttons have weight, cards feel substantial, and every interactive element responds clearly.

This system explicitly rejects flashy fintech aesthetics (no gradient heroes, no neon accents), cold corporate sterility (no white-on-white sprawl), and bureaucratic clutter. It is government infrastructure that treats its users with respect.

**Key Characteristics:**
- Single dominant brand color (Mbo Forest green) used deliberately, not diffusely
- Amber gold as the warmth accent — rare, meaningful, never decorative
- Soft terrain elevation: shadows are low-opacity, layered, and responsive to interaction
- Tactile components: buttons lift on hover, cards shift with clear feedback
- Typographic clarity: Sora's geometric precision for structure, DM Sans for comfortable reading
- Tinted surfaces carry meaning: green = success/action, amber = attention, red = error, blue/purple/cyan = category identity

## 2. Colors

The palette is anchored by Mbo Forest green — the color of growth, trust, and the Mbo landscape. Amber gold provides warmth without sentimentality. Four category colors (blue, purple, cyan, amber-earth) distinguish programme types. A full neutral gray scale handles text hierarchy, and tinted backgrounds carry semantic meaning.

### Primary
- **Mbo Forest** (`#15803d`): The brand anchor. Used on primary buttons, active links, focus rings, success indicators, and the navbar bottom border. Also tints success banners and green card backgrounds via its lighter variants.
- **Mbo Forest Deep** (`#166534`): Primary button hover state. Darkens the anchor without shifting hue.
- **Mbo Forest Light** (`#16a34a`): Gradient accents, dot indicators, secondary green elements.
- **Mbo Forest Pale** (`#4ade80`): Text on dark sections (CTA banner, footer). The only green light enough to hold contrast against `#0a1f13`.

### Accent
- **Amber Gold** (`#fbbf24`): The warmth accent. Used on the logo letter, camera bracket guides, and sidebar subtext. Rare by design — its scarcity preserves its impact.
- **Amber Warm** (`#f59e0b`): Current-step pills, password strength "Fair" indicator.
- **Amber Earth** (`#b45309`): Empowerment programme icon color, rule card accents.
- **Amber Deep** (`#92400e`): Pending/flagged status text.

### Category Colors
- **Blue Training** (`#1d4ed8`): Training/vocational programme icon color.
- **Purple Grant** (`#7e22ce`): Grant programme icon color.
- **Cyan Outcome** (`#0e7490`): Outcome/process step color.

### Semantic
- **Red Error** (`#ef4444`): Error text, error borders, danger buttons, notification badges.
- **Red Error Deep** (`#dc2626`): API error banners, danger hover states.
- **Red Error Dark** (`#b91c1c`): Rejected status text.

### Neutral
- **Ink Primary** (`#0f172a`): Headings, primary text, logo name.
- **Ink Secondary** (`#374151`): Body text, form labels, secondary content.
- **Ink Tertiary** (`#64748b`): Descriptions, muted content, placeholder alternatives.
- **Ink Muted** (`#94a3b8`): Placeholder text, subtle labels, inactive icons.
- **Ink Disabled** (`#cbd5e1`): Disabled text, subtle borders.
- **Surface White** (`#ffffff`): Cards, page backgrounds, button text.
- **Surface Page** (`#f9fafb`): Body background.
- **Surface Input** (`#f8fafc`): Input and textarea backgrounds.
- **Surface Hover** (`#f1f5f9`): Table row hover, subtle dividers.
- **Border Default** (`#e2e8f0`): Standard borders on cards, inputs, dividers.
- **Border Subtle** (`#f1f5f9`): Thin dividers, table borders.
- **Border Card** (`#e8ecf0`): Login/register card borders.

### Tinted Backgrounds
- **Green Tint BG** (`#f0fdf4`): Success banners, icon backgrounds, green card fills.
- **Green Tint Border** (`#bbf7d0`): Green card borders, success state borders.
- **Green Tint Hover** (`#dcfce7`): Green outline button hover, green card hover.
- **Amber Tint BG** (`#fffbeb`): Warning banners, amber card fills.
- **Amber Tint Border** (`#fde68a`): Amber card borders, attention state borders.
- **Blue Tint BG** (`#eff6ff`): Training programme cards.
- **Blue Tint Border** (`#bfdbfe`): Training programme card borders.
- **Purple Tint BG** (`#faf5ff`): Grant programme cards.
- **Purple Tint Border** (`#e9d5ff`): Grant programme card borders.
- **Cyan Tint BG** (`#ecfeff`): Outcome step cards.
- **Cyan Tint Border** (`#a5f3fc`): Outcome step card borders.
- **Red Tint BG** (`#fef2f2`): Error banners, danger button backgrounds.
- **Red Tint Border** (`#fecaca`): Error banner borders, danger button borders.

### Dark Section
- **Dark Section** (`#0a1f13`): CTA banner background, footer background, dashboard sidebar. A very dark green that reads as near-black with brand warmth.
- **Dark Section Deeper** (`#060f09`): Navbar scrolled dark mode background.

### Named Rules
**The One Green Rule.** Mbo Forest is used on ≤10% of any given screen. Its power comes from restraint. Tinted backgrounds (green-tint-bg) do not count against this limit — they are atmosphere, not accent.

**The Amber Scarcity Rule.** Amber Gold appears on exactly three elements per surface maximum: the logo mark, one status indicator, and one camera guide. Never as decoration.

## 3. Typography

**Display Font:** Sora (with sans-serif fallback)
**Body Font:** DM Sans (with sans-serif fallback)

**Character:** Sora brings geometric precision and structural confidence to headings — its clean, modern letterforms convey institutional trust without feeling corporate. DM Sans provides comfortable, highly readable body text with a humanist warmth that balances Sora's geometry. The pairing is confident-but-approachable: one font declares, the other explains.

### Hierarchy
- **Display** (800, `clamp(36px, 4vw, 60px)`, 1.1): Hero headings and primary page titles. Used once per page. Letter-spacing tightened to -0.03em for impact without cramping.
- **Headline** (800, `clamp(30px, 3.5vw, 48px)`, 1.15): Section headings on the landing page. Card group titles on dashboards.
- **Title** (800, 20px, 1.25): Card titles, panel headers, form section headings. Letter-spacing at -0.02em.
- **Body** (400, 14px, 1.65): All running text, descriptions, form content, table cells. Maximum line length 65–75ch on desktop.
- **Label** (700, 11px, 1.3, 0.1em, uppercase): Section kickers, category badges, stat labels, form field labels (at 12-13px without uppercase for form labels specifically).

### Named Rules
**The One Display Rule.** The Display size is reserved for the single most important heading on a page. Every other heading steps down to Headline or Title. Two Display-sized elements on one screen is the system's loudest tell.

**The Label Restraint Rule.** Uppercase tracked labels appear on section kickers and category badges only. They are never used as form field labels (which stay sentence-case at 12-13px) or as card headings.

## 4. Elevation

This system uses a soft terrain approach: surfaces are flat at rest, with gentle, layered shadows that create a subtle landscape of depth. Shadows are always low-opacity (0.03–0.08 for cards, up to 0.35 for primary buttons) and never harsh. Depth increases on interaction — cards lift slightly on hover, buttons rise, dropdowns float above the surface. There are no hard shadow edges, no `box-shadow` with spread, and no shadow used purely as decoration.

### Shadow Vocabulary
- **Surface Rest** (`0 1px 3px rgba(0,0,0,0.04)`): The lightest touch — cards sitting on the page.
- **Surface Float** (`0 2px 8px rgba(0,0,0,0.03)` to `0 4px 24px rgba(0,0,0,0.04)`): Standard card elevation. Notification cards, summary cards, programme cards.
- **Surface Lift** (`0 8px 32px rgba(0,0,0,0.06)` to `0 12px 36px rgba(0,0,0,0.09)`): Hover state for cards. The surface rises in response to attention.
- **Button Rest** (`0 4px 14px rgba(21,128,61,0.22)`): Primary buttons at rest. Green-tinted shadow reinforces the brand color.
- **Button Lift** (`0 6px 20px rgba(21,128,61,0.32)` to `0 8px 24px rgba(21,128,61,0.35)`): Primary button hover. Shadow deepens and rises.
- **Modal Overlay** (`0 8px 40px rgba(0,0,0,0.14)`): Settings modal, admin dropdowns. The highest elevation in the system.
- **Navbar Scroll** (`0 1px 12px rgba(0,0,0,0.3)`): Fixed navbar after scroll. Higher opacity because it must separate from content.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (hover, elevation, focus). A card with a permanent shadow is an exception, not the norm.

**The Green Shadow Rule.** Primary button shadows carry Mbo Forest tint (`rgba(21,128,61,X)`), not neutral black. This ties elevation to brand identity. Neutral cards use neutral shadows.

## 5. Components

### Buttons

Buttons are tactile and confident. They have visible weight at rest and lift on hover. Every variant has a clear hover state — nothing is static.

- **Shape:** Rounded at 10px (md). Submit buttons at 11px. Ghost/danger buttons at 8px (sm). Full-pill (100px) for filter pills and status tags only.
- **Primary (`button-primary`):** Mbo Forest background, white text, 13px 28px padding. Green-tinted shadow at rest (`0 4px 14px rgba(21,128,61,0.22)`). Hover: deepens to Mbo Forest Deep, lifts 1-2px, shadow intensifies. Disabled: opacity 0.55, cursor not-allowed.
- **Outline (`button-outline`):** Transparent background, Ink Secondary text, 1.5px Border Default. Hover: border turns Mbo Forest, background becomes Green Tint BG.
- **Submit (`button-submit`):** Full-width variant of Primary. 13px padding, 11px radius. Used on login, register, and form submission.
- **Ghost (`button-ghost`):** Green Tint BG background, Mbo Forest text, 1px Green Tint Border. Hover: background becomes Green Tint Hover. Used for secondary actions in notification and application cards.
- **Danger (`button-danger`):** Red Tint BG background, Red Error Deep text, 1px Red Tint Border. Hover: background deepens. Used for destructive actions (delete account, clear notifications).
- **Filter Pill:** Full-pill radius (100px), 6px 14px padding. Inactive: Surface Input background, Border Default. Active: Mbo Forest background, white text.

### Cards

Cards are the primary content container. They are substantial but not heavy — white surface, subtle border, soft shadow at rest, clear lift on hover.

- **Shape:** 14-16px radius (lg–xl) for content cards. 20px (2xl) for profile and settings cards. 24px (3xl) for login/register cards.
- **Surface Card (`card-surface`):** White background, 0.5-1px Border Default, Surface Rest shadow. Padding varies by context: 20-24px for content cards, 40px for auth cards.
- **Hover (`card-surface-hover`):** Border transitions to Green Tint Border (for interactive cards), shadow rises to Surface Lift, card lifts 2-6px via translateY.
- **Programme Cards:** Colored top strip (4px height) in the category color. Icon in a tinted background circle. White body with title, description, and action button.
- **Status Cards:** Left border colored by status (green for approved, amber for pending, red for rejected). Application cards use this pattern.
- **Auth Card:** 24px radius, 40px padding, triple-layer shadow (Surface Rest + Surface Float + `0 24px 64px rgba(0,0,0,0.04)`). Border Card border. Used on login, register, and forgot password.

### Inputs

Inputs are clearly interactive — light gray at rest, white on focus, with a green focus ring that's visible but not aggressive.

- **Shape:** 10px radius (md), 42-44px height, 0 14px horizontal padding.
- **Rest (`input-field`):** Surface Input background, 1-1.5px Border Default, Ink Primary text, Ink Muted placeholder.
- **Focus (`input-field-focus`):** White background, Mbo Forest border, `0 0 0 3px rgba(21,128,61,0.08)` focus ring.
- **Error:** Red Error border, Red Tint BG background.
- **Disabled:** Surface Hover background, opacity 0.5, cursor not-allowed.
- **Textarea:** Same styling, 10px radius, 11px 14px padding, min-height 90-120px.
- **Select:** Custom chevron via absolute-positioned icon. Native appearance removed.

### Navigation

- **Navbar:** Fixed top, 64px height. White/transparent at top, white with subtle shadow on scroll. 2px Mbo Forest bottom border. Desktop: horizontal links with green hover. Mobile: hamburger menu with slide-down panel.
- **Dashboard Sidebar:** Dark Section background (`#0a1f13`), 240px expanded / 64px collapsed. Icon + label nav items with green active state and badge counters.
- **Verifier Sidebar:** Same dark background, icon-only at rest (64px), expands on hover to show labels. CSS custom properties control the transition: `--admin-sidebar-collapsed: 64px`, `--admin-sidebar-expanded: 240px`, `--admin-transition: 0.22s cubic-bezier(0.4, 0, 0.2, 1)`.

### Status Badges

- **Shape:** Full-pill (100px), 5-6px 10-12px padding, 10-11px font size, 600-700 weight.
- **Approved/Active:** Green Tint BG, Mbo Forest text, Green Tint Border.
- **Pending/Flagged:** Amber Tint BG, Amber Deep text, Amber Tint Border.
- **Rejected/Error:** Red Tint BG, Red Error Dark text, Red Tint Border.
- **Neutral:** Surface Input background, Ink Tertiary text, Border Default.

### Toggle Switches

- **Shape:** 100px radius track, circular thumb.
- **Off:** Border Default background, thumb at left.
- **On:** Mbo Forest background, thumb slides right via `translateX(18px)`.
- **Transition:** 0.2s ease on background and transform.

## 6. Do's and Don'ts

### Do
- **Use Mbo Forest sparingly.** One primary button, one active link, one focus ring per screen section. Let the tinted backgrounds carry green atmosphere.
- **Use tinted backgrounds for category identity.** Green = success/action, amber = attention/warning, red = error/danger, blue/purple/cyan = programme type. The tint system is semantic.
- **Let cards lift on hover.** The soft terrain elevation system is a core part of the tactile feel. Static cards feel dead.
- **Pair Sora headings with DM Sans body.** Never use Sora for running text or DM Sans for headings. The pairing is deliberate.
- **Keep shadows low-opacity.** No shadow exceeds 0.08 opacity for neutral cards or 0.35 for green-tinted button shadows. Hard shadows break the soft terrain.
- **Use the focus ring everywhere.** `0 0 0 3px rgba(21,128,61,0.08)` on every focused input, button, and interactive element. Consistency builds trust.
- **Respect mobile-first.** All components must work at 375px viewport width. Test card grids, form layouts, and navigation at small sizes.

### Don't
- **Don't add a second accent color.** Mbo Forest + Amber Gold is the complete accent system. Blue, purple, and cyan are category markers, not accents.
- **Don't use gradient text.** The system uses solid Mbo Forest for emphasis. Gradient text (`background-clip: text`) is a fintech cliché this system rejects.
- **Don't use glassmorphism or backdrop-filter blur.** The soft terrain comes from shadows and tinted backgrounds, not transparency effects.
- **Don't nest cards inside cards.** Cards are the atomic content container. Nesting creates visual clutter and breaks the elevation system.
- **Don't use border-radius above 24px on cards.** 24px (3xl) is the ceiling for auth cards. Content cards top out at 16-20px. Over-rounding reads as a codex tell.
- **Don't pair 1px borders with shadows ≥16px blur on the same element.** Pick one: a defined border or a soft shadow. The ghost-card pattern (both together) is banned.
- **Don't use uppercase tracked labels as form field labels.** Form labels are sentence-case at 12-13px. Uppercase labels are for section kickers and category badges only.
- **Don't ship a page with no motion.** Every section needs at least one entrance animation (fadeUp, slideIn) or hover response. Static pages feel unfinished.
- **Don't animate without a reduced-motion fallback.** Every animation needs `@media (prefers-reduced-motion: reduce)` — typically a crossfade or instant transition.