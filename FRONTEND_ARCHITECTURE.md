# Pavira Signature Frontend Architecture

This document defines the scalable, luxury-focused frontend architecture for Pavira Signature. It provides a blueprint for migrating from the current monolithic state to a modular, high-performance, and deeply immersive React application.

---

## 1. Current Analysis

### Strengths
- **Functional Completeness:** The core ecommerce flow (products, cart, auth, checkout, admin) is fully functional and wired to Supabase.
- **Centralized API:** `services.ts` and `api.ts` provide a solid, centralized foundation for backend communication.
- **State Persistence:** Zustand is correctly configured to persist cart and auth state.

### Weaknesses
- **Monolithic State:** `useStore.ts` contains all application state (auth, cart, wishlist). This creates unnecessary re-renders when unrelated state changes.
- **Tightly Coupled Components:** Business logic (fetching, auth checks, debounce timers) is often written directly inside presentation components (e.g., `page.tsx`).
- **Inconsistent Layouts:** The app currently relies on manually importing `Header` and `Footer` on every single page rather than using Next.js layout wrappers.
- **CSS-in-JS Clutter:** Excessive tailwind utility classes inline without extraction, making components difficult to read and maintain.

---

## 2. Layout Architecture

To eliminate duplicate code (like manually rendering `<Header />` on every page), we will implement domain-specific layout wrappers using Next.js 13+ App Router standard `layout.tsx`.

### `PublicLayout`
- **Used for:** `/`, `/products`, `/products/[id]`, `/about`, `/contact`
- **Responsibilities:** Renders the scroll-aware global `Header`, global `Footer`, and `PremiumVisuals` background.
- **Auth Rules:** Accessible to all users. No auth boundaries.

### `CustomerLayout`
- **Used for:** `/dashboard`, `/dashboard/orders`, `/wishlist`, `/cart`, `/checkout`
- **Responsibilities:** Wraps consumer routes in an authenticated boundary. Verifies token presence before rendering children. Renders the standard `Header` and `Footer`.
- **Auth Rules:** Redirects guests to `/login`.

### `AdminLayout`
- **Used for:** `/admin`, `/admin/products`, `/admin/orders`
- **Responsibilities:** Renders a specialized admin sidebar and top-nav optimized for data density (no luxury glassmorphism needed here).
- **Auth Rules:** Redirects guests to `/login` and strictly verifies `userRole === 'admin'`.

---

## 3. Component Architecture

We will organize `frontend/components/` into a strict, scalable domain hierarchy:

```text
components/
├── layout/           # Shared page wrappers (PublicLayout, AdminLayout)
├── navigation/       # Header, Footer, MobileNav, Breadcrumbs
├── cards/            # LuxuryProductCard, CategoryCard, OrderCard
├── drawers/          # CartDrawer, NotificationDrawer
├── overlays/         # SearchOverlay, QuickViewModal
├── sections/         # CollectionHero, FeaturedCollection, Newsletter
├── forms/            # Inputs, LuxurySelect, AuthForms
├── dashboard/        # Customer-specific UI panels
└── admin/            # Admin-specific tables, charts, forms
```

---

## 4. Global Components

### `Header`
- **Props:** None (State-connected).
- **Dependencies:** `useScrollEffects` hook.
- **Responsibilities:** Transparent-to-glass scroll transition, responsive layout shell.

### `Footer`
- **Props:** None.
- **Dependencies:** None.
- **Responsibilities:** 5-section editorial layout, newsletter CTA.

### `MobileNav`
- **Props:** `isOpen`, `onClose`, `navLinks`.
- **Dependencies:** Framer Motion (`staggerChildren`).
- **Responsibilities:** Fullscreen overlay navigation.

### `AccountMenu`
- **Props:** `isLoggedIn`, `userName`, `userRole`, `handleLogout`.
- **Dependencies:** `authStore`.
- **Responsibilities:** Animated dropdown for user actions.

### `SearchOverlay`
- **Props:** None.
- **Dependencies:** `useSearch` hook, `useRouter`.
- **Responsibilities:** Full-screen search input, redirects to `/products?search=`.

### `CartDrawer`
- **Props:** `isOpen`, `onClose`.
- **Dependencies:** `cartStore`.
- **Responsibilities:** Renders cart items, manages quantity, displays subtotal.

---

## 5. Product Experience

The `/products` directory utilizes specialized components to create the "Art Gallery" aesthetic.

### `CollectionHero`
- Full-bleed cinematic intro, animated SVG mandala.

### `LuxuryFilterBar`
- Sticky horizontal glassmorphism bar. Extracts URL parameter logic into a `useFilter` hook.

### `LuxuryProductCard`
- Receives `product` prop. Contains magnetic 3D hover physics.

### `InfiniteGallery`
- Receives `products[]`. Maps over data using Framer Motion `staggerChildren` to reveal items seamlessly.

### `CollectionCTA`
- Bottom-of-page bespoke commission section.

---

## 6. Hook Architecture

Business logic will be aggressively extracted from components into custom hooks located in `frontend/hooks/`.

- `useAuth()`: Manages login, logout, token validation, and role checks.
- `useCart()`: Wraps Zustand cart actions (add, remove, update, clear).
- `useWishlist()`: Wraps Zustand wishlist actions.
- `useSearch()`: Manages debounce logic and URL parameter hydration for product queries.
- `useScrollEffects()`: Reusable Framer Motion hook returning mapped scroll values (`bg`, `blur`, `border`).
- `useLuxuryMotion()`: Returns standard physics configurations (`spring`, `damping`, `stiffness`) for consistent component animations.

---

## 7. State Architecture

**Current Issue:** `useStore.ts` is a 300+ line monolith holding Cart, Wishlist, Auth, and UI state.

**Recommendation:** Split Zustand into domain-specific slices, then merge them, or create separate stores to prevent unnecessary re-renders.

```text
store/
├── useAuthStore.ts      # user, token, role, login(), logout()
├── useCartStore.ts      # items[], addToCart(), updateQuantity()
├── useWishlistStore.ts  # items[], toggleWishlist()
└── index.ts             # Exports all stores
```

---

## 8. Animation System

To ensure consistency, we will define reusable Framer Motion variants in `frontend/lib/motion.ts`.

- `pageReveal`: Opacity fade + subtle Y translation.
- `fadeUp`: Standard entry animation.
- `staggerContainer`: `staggerChildren: 0.1`.
- `drawerMotion`: X-axis spring translation.
- `modalMotion`: Scale + Opacity spring reveal.
- `hoverLift`: Subtle Y-axis lift for buttons.
- `magneticHover`: 3D `rotateX` / `rotateY` logic.

---

## 9. Design Token System

Tailwind is powerful, but hardcoded hex codes (`bg-[#0B3B2E]`) are error-prone and hard to update globally.

**Recommendation:** Update `tailwind.config.js` to map the `DESIGN_SYSTEM.md` tokens.
- `colors.luxury.primary` (`#0B3B2E`)
- `colors.luxury.accent` (`#D4AF37`)
- `colors.luxury.surface` (`#112F24`)

---

## 10. Performance Architecture

- **Dynamic Imports:** All complex SVG systems (e.g., `PremiumVisuals`, `PremiumMandala`) must use `next/dynamic` to avoid blocking main-thread hydration.
- **Lazy Loading:** Products outside the initial viewport in `InfiniteGallery` must be lazily loaded.
- **Image Strategy:** Strict use of `next/image` with `priority` flags set only on the `CollectionHero` and the top 2 `LuxuryProductCard`s.
- **Animation Limits:** Animations must run on the compositor thread (`opacity`, `transform`). Never animate `box-shadow` or `width`/`height` directly during scroll.

---

## 11. Implementation Order

To execute this architecture safely, development must proceed in the following phases:

1. **Phase 1: Global Layouts** (`app/layout.tsx`, `components/layout/`) - Standardize layouts to remove `<Header/>` and `<Footer/>` duplication.
2. **Phase 2: Header/Footer** (COMPLETED) - Modularize global navigation.
3. **Phase 3: Products** (COMPLETED) - Refactor gallery experience and product cards.
4. **Phase 4: Product Details** (`app/products/[id]/page.tsx`) - Rebuild the individual piece showcase using cinematic layouts.
5. **Phase 5: Cart + Checkout** (`app/checkout/page.tsx`) - Convert checkout into a seamless, high-trust luxury flow.
6. **Phase 6: Auth** (`app/login/page.tsx`, `app/signup/page.tsx`) - Implement glassmorphism forms and extract `useAuthStore`.
7. **Phase 7: Dashboard** (`app/dashboard/page.tsx`) - Refactor customer UI using `CustomerLayout`.
8. **Phase 8: Admin** (`app/admin/page.tsx`) - Refactor admin dashboard for data density using `AdminLayout`.
