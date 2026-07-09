# Pavira Signature Design System

This file serves as the single source of truth for all future frontend development at Pavira Signature. Any new feature, page, or component must strictly adhere to the standards outlined below.

---

## 1. Brand Identity

The brand identity of Pavira Signature is centered around **luxury handcrafted mandala art**. The aesthetic must consistently convey the following keywords:

- Timeless
- Artisanal
- Elegant
- Sacred Geometry
- Premium
- Immersive
- Gallery Experience

Every UI interaction should feel less like a standard ecommerce transaction and more like attending an exclusive art exhibition.

---

## 2. Color System

We utilize a deeply rich, emerald-inspired dark mode aesthetic accented by striking metallic gold.

### Core Colors
| Token | Hex Code | Usage | Tailwind Example |
|---|---|---|---|
| **Primary** | `#0B3B2E` | Main background, full-bleed sections | `bg-[#0B3B2E]` |
| **Surface** | `#112F24` | Cards, panels, dropdowns | `bg-[#112F24]` |
| **Dark Surface** | `#07271F` | Footer, deep background elements | `bg-[#07271F]` |
| **Accent (Gold)** | `#D4AF37` | Buttons, icons, highlights, borders | `text-[#D4AF37]` |
| **Text Primary** | `#F5F0E6` | Headings, main paragraph text | `text-[#F5F0E6]` |
| **Text Secondary**| `rgba(245,240,230,0.7)` | Subtitles, helper text, muted info | `text-[#F5F0E6]/70` |

### System Colors
| Token | Hex Code | Usage | Tailwind Example |
|---|---|---|---|
| **Success** | `#2E8B57` | Success messages, completed states | `text-[#2E8B57]` |
| **Warning** | `#F5A623` | Warnings, alerts, pending states | `text-[#F5A623]` |
| **Error** | `#D32F2F` | Form errors, destructive actions | `text-[#D32F2F]` |

---

## 3. Typography

The typographic hierarchy relies on a sophisticated serif for display and headings, paired with a highly legible sans-serif for body copy.

- **Headings & Display:** `Playfair Display`
- **Body & UI Elements:** `Inter`

### Typography Scale
| Token | Font Family | Size / Line-Height | Tailwind Mapping |
|---|---|---|---|
| **Display XL** | Playfair Display | `72px` / `1.1` | `text-7xl font-serif leading-[1.1]` |
| **Display L** | Playfair Display | `48px` / `1.2` | `text-5xl font-serif leading-tight` |
| **Heading 1** | Playfair Display | `36px` / `1.2` | `text-4xl font-serif leading-tight` |
| **Heading 2** | Playfair Display | `30px` / `1.3` | `text-3xl font-serif leading-snug` |
| **Heading 3** | Playfair Display | `24px` / `1.3` | `text-2xl font-serif leading-snug` |
| **Body** | Inter | `16px` / `1.6` | `text-base font-sans leading-relaxed` |
| **Caption** | Inter | `12px` / `1.5` | `text-xs font-sans tracking-widest uppercase` |

---

## 4. Spacing Scale

Our spacing system ensures breathing room and premium negative space, utilizing multiples of 4px.

- `space-1` (4px) - Micro-adjustments
- `space-2` (8px) - Between tight UI elements (icon + text)
- `space-4` (16px) - Inner component padding
- `space-6` (24px) - Outer component padding
- `space-8` (32px) - Standard section gutters
- `space-12` (48px) - Section spacing on mobile
- `space-20` (80px) - Section spacing on desktop
- `space-32` (128px) - Hero / massive layout spacing

---

## 5. Border Radius

Rounded corners should be elegant and intentional, never cartoonish.

- **Cards / Images:** `16px` (`rounded-2xl`)
- **Drawers / Modals:** `24px` (`rounded-3xl` or custom top/bottom radii)
- **Buttons / Inputs:** `9999px` (`rounded-full`) for a sophisticated pill shape.
- **Small UI Elements (Badges):** `8px` (`rounded-lg`)

---

## 6. Shadows

Shadows in a dark theme must be subtle and colored to add depth without looking muddy. We rely on gold-tinted drop shadows rather than pure black.

- **Base Shadow:** `shadow-[0_4px_20px_rgba(0,0,0,0.3)]`
- **Luxury Glow (Hover):** `shadow-[0_0_20px_rgba(212,175,55,0.15)]`
- **Intense Glow (Active):** `shadow-[0_0_30px_rgba(212,175,55,0.3)]`

---

## 7. Glassmorphism Standards

Glassmorphism is the primary textural element used to create depth between the rich `#0B3B2E` background and interactive surfaces.

### Rules by Component:
- **Cards (ProductCard):** 
  - Background: `bg-[#112F24]/65`
  - Blur: `backdrop-blur-xl` (24px)
  - Border: `border border-[#D4AF37]/15`
- **Drawers (Cart):**
  - Background: `bg-[#0B3B2E]/95`
  - Blur: `backdrop-blur-2xl` (40px)
  - Border: `border-l border-[#D4AF37]/20`
- **Dropdowns (Account Menu):**
  - Background: `bg-[#0B3B2E]/95`
  - Blur: `backdrop-blur-xl`
  - Border: `border border-[#D4AF37]/20`
- **Modals / Search Overlay:**
  - Background: `bg-[#0B3B2E]/90`
  - Blur: `backdrop-blur-2xl`
  - Border: `border border-[#D4AF37]/20`

---

## 8. Animation Standards

All animations are powered by **Framer Motion**. Do not use abrupt CSS state changes for major layout shifts.

- **Page Reveal:** Fade up opacity `0` to `1`, `y` `20px` to `0px` over `0.6s`.
- **Stagger:** For lists and grids, use `staggerChildren: 0.1` and `delayChildren: 0.2`.
- **Drawer Open:** `initial={{ x: "100%" }}` to `animate={{ x: 0 }}`, using `type: "spring", stiffness: 100, damping: 20`.
- **Dropdown Open:** `initial={{ opacity: 0, y: 10, scale: 0.95 }}` with spring physics.
- **Modal Open:** `initial={{ opacity: 0, scale: 0.95, y: -50 }}` with spring physics.
- **Hover Lift:** `whileHover={{ y: -5 }}` for generic buttons.
- **Magnetic Hover:** For Product Cards, utilize `useMotionValue` and `useTransform` mapped to mouse coordinates `(e.clientX, e.clientY)` to create a 3D `rotateX` and `rotateY` physics effect.

---

## 9. Component Standards

- **Header:** Sticky. Transparent at `scrollY=0`, transitions to Glassmorphism at `scrollY > 50`. Features gold underline animations for active routes.
- **Footer:** Deep background `#07271F`. Must include the rotating Mandala watermark in the background. 5-section layout (Newsletter, Story, Nav, Services, Social).
- **Product Card:** Magnetic 3D tilt hover. Image scales to `1.08x` on hover. Quick action buttons appear on hover using glassmorphism pills.
- **Buttons:** Fully rounded (`rounded-full`). Gold background (`bg-[#D4AF37]`) with dark text (`text-[#0B3B2E]`). Expandable tracking/letter-spacing on hover.
- **Inputs:** Fully rounded pill shapes. Borderless or subtle gold borders (`border-[#D4AF37]/20`), transitioning to stronger gold on focus.
- **Account Menu / Cart Drawer:** Must trap focus, disable background scrolling, and include an explicit close icon (`X` from Lucide).

---

## 10. Mobile Standards

- **Breakpoints:** Rely on Tailwind's default breakpoints (`md: 768px`, `lg: 1024px`, `xl: 1280px`).
- **Spacing:** Reduce `space-20` to `space-12` on mobile screens to prevent massive gaps.
- **Animation Behavior:** Disable heavy physics (like Magnetic Tilt) on touch devices to ensure performance and prevent jank.
- **Navigation:** Mobile navigation must be a full-screen `#0B3B2E` overlay preventing background scrolling, triggered by a hamburger menu.

---

## 11. Accessibility Standards

- **Contrast:** Ensure Text Secondary (`#F5F0E6/70`) over Primary Background (`#0B3B2E`) passes WCAG AA contrast ratios.
- **Keyboard Navigation:** All interactive elements (`<button>`, `<a>`, `<input>`) must have discernible `:focus-visible` states (e.g., a gold outline or ring).
- **Reduced Motion:** Respect OS-level reduced motion preferences. If the user prefers reduced motion, heavy 3D physics and infinite spinning mandalas should gracefully degrade to simple fades.

---

## 12. Performance Standards

- **Dynamic Imports:** Any heavy background components (e.g., complex SVGs, particle systems like `PremiumVisuals`) MUST be dynamically imported via `next/dynamic` with `{ ssr: false }` to avoid blocking the main thread.
- **Image Loading:** Use `next/image` exclusively. Above-the-fold images must use `priority=true`. Product gallery images should defer to standard lazy loading.
- **Animation Limits:** Do not animate box-shadows or layouts directly if possible. Animate `transform` and `opacity` to take advantage of GPU acceleration.

---

## 13. Future Component Checklist

Before submitting a PR for any new feature, verify the following:
- [ ] Does the component background utilize the proper Glassmorphism tokens?
- [ ] Are buttons rounded to pills with gold backgrounds?
- [ ] Are animations smooth and powered by Framer Motion?
- [ ] Does it work flawlessly on mobile breakpoints?
- [ ] Is the data properly hooked into the global Zustand store (if applicable)?
- [ ] Does the UI feel like a luxury art exhibition?
