# Pavira Signature Luxury Component Library

This document defines the strict, reusable UI component library for Pavira Signature. **All future development must assemble pages using these components exclusively. Do not create new, ad-hoc UI styles.**

---

## 1. Buttons

### `PrimaryButton`
- **Purpose:** Primary calls to action (Checkout, Add to Cart, Submit).
- **Styles:** Fully rounded pill (`rounded-full`), `bg-[#D4AF37]`, `text-[#0B3B2E]`.
- **Hover:** Expand tracking/letter-spacing slightly, add `shadow-[0_0_20px_rgba(212,175,55,0.4)]`, lift `y: -2px`.
- **Loading:** Render a subtle spinning SVG in place of text; button disabled.
- **Disabled:** `opacity-50`, cursor-not-allowed, remove hover effects.
- **Accessibility:** `aria-disabled`, `aria-label`, visible `:focus-visible` ring.

### `SecondaryButton`
- **Purpose:** Secondary actions (View Details, Cancel).
- **Styles:** Transparent background, `border border-[#D4AF37]/50`, `text-[#D4AF37]`.
- **Hover:** Background fills with `#D4AF37]/10`, border strengthens to `border-[#D4AF37]`.

### `GhostButton`
- **Purpose:** Tertiary actions (Text links, subtle CTAs).
- **Styles:** No border, transparent background, `text-[#F5F0E6]/80`.
- **Hover:** `text-[#D4AF37]`, gold underline expands from center `0` to `100%`.

### `IconButton`
- **Purpose:** Heart, Cart, Search toggles.
- **Styles:** Circular `w-10 h-10`, flex center.
- **Hover:** `rotate`, `scale-110`, or magnetic pull depending on context.

---

## 2. Inputs

### `LuxuryInput` & `LuxuryTextarea`
- **Styles:** Glassmorphism (`bg-[#112F24]/50`), `border border-[#D4AF37]/20`, `text-[#F5F0E6]`. Pill shape for inputs (`rounded-full`), rounded corners for textarea (`rounded-2xl`).
- **Focus:** `border-[#D4AF37]/60`, `ring-1 ring-[#D4AF37]/30`, inner shadow.
- **Validation:** 
  - *Error:* `border-[#D32F2F]`, shake animation.
  - *Success:* `border-[#2E8B57]`.
- **Mobile:** Font size `16px` minimum to prevent iOS zoom.

### `LuxurySearch`
- **Styles:** Includes a leading `Search` icon (`text-[#D4AF37]/50`).
- **Focus:** Icon changes to solid `#D4AF37`.

### `LuxurySelect`
- **Styles:** Custom SVG dropdown arrow (ChevronDown). Follows input glassmorphism.

### `LuxuryCheckbox` & `LuxuryRadio`
- **Styles:** Custom `#D4AF37` accent color. Hover state adds gold halo.

---

## 3. Cards

### `LuxuryProductCard`
- **Layout:** Aspect-ratio image container (1:1 or 3:4). Gradient overlay at bottom.
- **Spacing:** `p-6` for internal content.
- **Hover Effects:** Magnetic 3D tilt, image scales `1.08x`, floating action buttons translate into view.

### `CollectionCard`
- **Layout:** Wide editorial format. Image on left/right, text opposite.
- **Hover:** Image zoom, text crossfade.

### `ReviewCard` / `OrderCard` / `DashboardCard`
- **Layout:** Standard glassmorphism container. `bg-[#112F24]/60 backdrop-blur-xl`.
- **Spacing:** `p-6`.
- **Hover:** Subtle border transition `border-[#D4AF37]/10` to `border-[#D4AF37]/30`.

---

## 4. Overlays

### `SearchOverlay`
- **Animation:** Full-screen fade in `opacity`, content drops in from `y: -50px`.
- **Focus:** Auto-focus input on mount. Trap focus within overlay.

### `QuickViewModal` / `ConfirmDialog` / `ImageLightbox`
- **Animation:** `scale: 0.95` to `1`, `opacity: 0` to `1`, `type: "spring"`.
- **Focus:** Trap focus. Escape key to close.

---

## 5. Drawers

### `CartDrawer` / `NotificationDrawer` / `MobileNavDrawer`
- **Sizes:** `w-full md:w-[450px]`.
- **Animation:** Slide in from right (`x: "100%"` to `x: 0`). Slide from top for MobileNav.
- **Responsive:** Fills entire screen width on mobile, fixed width on desktop.

---

## 6. Navigation

### `Header`
- **States:** 
  - Top: Transparent, no border.
  - Scrolled: Glassmorphism (`bg-[#0B3B2E]/75`, `backdrop-blur-24px`), gold border, drop shadow.

### `Footer`
- **States:** Static. 5-section layout.

### `Breadcrumbs`
- **States:** `text-[#F5F0E6]/50` for parents, `text-[#D4AF37]` for current page. Slash separators.

### `AccountMenu`
- **States:** Dropdown opens downwards with `spring` animation.

---

## 7. Typography Components

- `<DisplayText>`: `font-serif text-5xl md:text-7xl leading-tight`.
- `<SectionTitle>`: `font-serif text-3xl md:text-5xl text-[#F5F0E6]`.
- `<BodyText>`: `font-sans text-base text-[#F5F0E6]/80 leading-relaxed`.
- `<CaptionText>`: `font-sans text-xs uppercase tracking-[0.3em] text-[#D4AF37]`.
- `<QuoteText>`: `font-serif italic text-2xl text-[#D4AF37] border-l-2 border-[#D4AF37] pl-4`.

---

## 8. Section Components

- `<CollectionHero>`: Cinematic 100vh or 60vh layout. Parallax image/svg.
- `<CollectionCTA>`: Centered layout, max-w-2xl, leading into a `<PrimaryButton>`.
- `<FeaturedCollection>`: Asymmetrical masonry grid. First 2 items larger.
- `<NewsletterSection>`: Two-column layout (Text left, Input right).
- `<BrandStorySection>`: Editorial layout. Text overlaps imagery.

---

## 9. Animation Presets

Import from `lib/motion.ts`:

- `pageReveal`: `{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }`
- `fadeUp`: `{ initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0, transition: { type: "spring" } } }`
- `staggerContainer`: `{ initial: "hidden", animate: "show", variants: { show: { transition: { staggerChildren: 0.1 } } } }`
- `drawerMotion`: `{ initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } }`
- `modalMotion`: `{ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 } }`
- `hoverLift`: `{ whileHover: { y: -5, boxShadow: "0 10px 20px rgba(212,175,55,0.2)" } }`

---

## 10. Code Examples

**Ideal Component Usage Pattern:**

```tsx
import { 
  SectionTitle, 
  CaptionText, 
  PrimaryButton 
} from "@/components/ui/Typography";
import { LuxuryProductCard } from "@/components/cards";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { motion } from "framer-motion";

export default function FeaturedExhibition({ products }) {
  return (
    <section className="py-32 px-6 container mx-auto">
      <motion.div variants={fadeUp} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
        <CaptionText className="mb-4">Curated Pieces</CaptionText>
        <SectionTitle className="mb-12">The Signature Gallery</SectionTitle>
      </motion.div>

      <motion.div 
        variants={staggerContainer} 
        initial="hidden" 
        whileInView="show" 
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {products.map(product => (
          <motion.div key={product.id} variants={fadeUp}>
            <LuxuryProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-16 text-center">
        <PrimaryButton href="/products">View Entire Collection</PrimaryButton>
      </div>
    </section>
  );
}
```
