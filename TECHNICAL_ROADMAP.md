# Clothing Shop — Technical Roadmap

> Generated: 2026-05-14
> Author: CTO Agent
> Based on full codebase audit (COM-2)

---

## Priority Key

| Priority | Window | Meaning |
|----------|--------|---------|
| **P0** | Now | Bug fix, blocking issue, or critical quality gap |
| **P1** | This sprint | Clear value, self-contained, low risk |
| **P2** | Next sprint | Dependent on P1 work or needs more design |
| **P3** | Backlog | Architectural shift or nice-to-have |

---

## P0 — Fix Now

### 1. Color button disabled state is broken

**Problem:** In `js/app.js` `renderProducts()`, the `disabled` variable is declared with `var` inside the size loop, so it's hoisted to function scope. After the size loop ends, `disabled` retains the **last size's** value. The color loop then reuses this same `disabled` variable for all color buttons, ignoring per-color stock. Additionally, `cStock` is computed but never used.

**Impact:** Color buttons may show incorrect disabled/enabled state. Users can attempt to add out-of-stock color variants to cart (caught by later stock checks, but confusing UX).

**Fix:** Compute per-color stock in the color loop using `hasAnyStock(p.id, c.value)` and derive `disabled` from that.

---

## P1 — This Sprint

### 2. README out of sync with codebase

**Problem:** README lists only `data.js` and `app.js`, missing `showcase.js` and `comments.js`. The feature table also omits buyer showcase, points, and comments.

**Fix:** Update the project structure diagram and feature list.

**Files:** `README.md`

---

### 3. Toast function duplicated across three files

**Problem:** `showToast()` is defined identically in `app.js`, `showcase.js`, and `comments.js` (~15 lines each).

**Fix:** Extract into `data.js` (the only non-IIFE file) or create a shared utility. Since `data.js` currently has no IIFE and runs first, adding a `window._cloth.showToast` there is the simplest fix.

**Files:** `js/data.js`, `js/app.js`, `js/showcase.js`, `js/comments.js`

---

### 4. Unhandled localStorage corruption

**Problem:** All five `JSON.parse()` calls (across `app.js`, `showcase.js`, `comments.js`) will throw an uncatchable error and crash the page if localStorage data is corrupted.

**Fix:** Wrap every `JSON.parse` from localStorage in a try-catch that falls back to a safe default (empty array/object/zero). Use a helper function like `safeParse(key, fallback)`.

**Files:** `js/app.js`, `js/showcase.js`, `js/comments.js`

---

### 5. Navigation links cause page jump

**Problem:** `<a href="#">` used for tab navigation without `return false` or `event.preventDefault()`. Clicking adds `#` to the URL and scrolls to top.

**Fix:** Change to `<button>` elements or add `onclick="return false"`.

**Files:** `index.html`

---

### 6. `escapeQuote` gap on `data-name` attribute

**Problem:** Color button HTML uses `data-name="' + c.name + '"` without `escapeQuote`. If a color name contains a quote, it breaks the HTML attribute.

**Fix:** Apply `escapeQuote(c.name)`.

**Files:** `js/app.js` (line ~133)

---

## P2 — Next Sprint

### 7. Accessibility baseline

**Problem:** Multiple ARIA issues: no `role="dialog"` on modals, no focus management, no `aria-expanded` on cart toggle, no `aria-live` on toast notifications, `<a href="#">` used as buttons, no `:focus-visible` styles, skipped heading levels, color buttons have no `aria-label`.

**Fix:** A single pass covering:
- Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby` to all 4 modals
- Add hidden `<h2>` headings to section boundaries
- Trap focus inside open modals
- Add `aria-label` to color buttons using `data-name`
- Change `<nav>` links to `<button>` elements
- Add `aria-expanded` binding to cart toggle
- Add `role="alert"` to toast container
- Add `:focus-visible` outline styles in CSS

**Files:** `index.html`, `css/style.css`, `js/app.js`, `js/showcase.js`, `js/comments.js`

---

### 8. Order history (lost on completion)

**Problem:** After checkout, the success modal shows order details once, then the data is gone. No way to view past orders.

**Fix:** Persist completed orders to a new localStorage key (`clothing_orders`). Add a simple order history view accessible from the nav bar.

**Files:** `js/app.js`, `index.html`, `css/style.css`

---

### 9. Quantity selector on product cards

**Problem:** Users must add to cart first, then open the drawer to adjust quantity. Standard e-commerce lets users pick quantity before adding.

**Fix:** Add a numeric `<input type="number">` or +/- stepper next to the "Add to Cart" button on each product card.

**Files:** `js/app.js`, `css/style.css`

---

### 10. Star rating on comments

**Problem:** Comments are text-only with no rating scale.

**Fix:** Add a 1–5 star selector to the comment form. Store and display rating alongside the text. Show average rating on product cards.

**Files:** `js/comments.js`, `js/app.js`, `css/style.css`, `index.html`

---

## P3 — Architecture & Backlog

### 11. Content Security Policy (CSP) readiness

**Problem:** All event handlers use inline `onclick` attributes in `innerHTML` strings. This prevents deploying a strict CSP without `'unsafe-inline'`.

**Fix:** Migrate from inline `onclick` to event delegation using `addEventListener` on a parent container. This is a significant refactor of `app.js`'s `renderProducts()`, `showcase.js`'s `renderShowcase()`, and `comments.js`'s `renderComments()`.

**Dependency:** Must come after P1-P2 items to avoid merge conflicts on the same lines.

---

### 12. `data.js` module cleanup

**Problem:** `data.js` declares globals (`var PRODUCTS`, `var LS_KEYS`) without IIFE encapsulation. The three JS modules communicate through the shared `window._cloth` namespace with a fragile load ordering constraint.

**Fix:** Wrap `data.js` in its own IIFE that exports to `window._cloth`. Then add an init-ordering check (or queuing mechanism) so modules can load in any order.

**Dependency:** Better done before adding new modules.

---

### 13. Product images (replace emoji)

**Problem:** Products use emoji as placeholder images. A real clothing shop needs actual product photos.

**Fix:** Add an `image` field to the product data. Replace emoji in card rendering with `<img>` tags. Consider a placeholder service (e.g., ` picsum.photos`) for development.

**Files:** `js/data.js`, `js/app.js`, `css/style.css`

---

### 14. Search & sort

**Problem:** No way to search products by name or sort by price/name.

**Fix:** Add a search input in the header. Add sort dropdown (price low-high, price high-low, name A-Z). Both operate on the client side against the 8-product array (no backend needed).

---

### 15. Wishlist / favorites

**Problem:** No way to save favorites.

**Fix:** Add a heart/favorite toggle on each product card. Persist to a new `clothing_wishlist` localStorage key. Add a wishlist view.

---

### 16. Formatted price utility

**Problem:** Price display is raw `p.price` concatenated with `"¥"`. No currency formatting, no localization support.

**Fix:** Add a `formatPrice(n)` utility. Initially outputs `"¥" + n.toFixed(2)`. Could later support locale-aware formatting.

---

### 17. Backend evaluation

**Problem:** The project is pure frontend. Cart and orders live only in localStorage per browser. A real deployment would need at minimum:

- Lightweight API (Node.js/Express or serverless functions)
- Database for products, inventory, orders, users
- Image hosting/CDN
- Payment integration (Stripe, Alipay, WeChat Pay)

**Decision required:** Is the project intended to remain frontend-only, or should a backend be introduced?

**Trade-off:** Adding a backend enables real orders and multi-device sync but adds deployment complexity, hosting costs, and maintenance burden. For a "small system development" project, staying frontend-only with localStorage is appropriate unless a specific need drives backend adoption.

---

## Summary

| Priority | Count | Focus |
|----------|-------|-------|
| P0 | 1 | Bug: color button disabled state |
| P1 | 5 | README, toast dedup, localStorage safety, nav jump, escape edge case |
| P2 | 4 | Accessibility, order history, quantity picker, star ratings |
| P3 | 7 | CSP, module cleanup, images, search/sort, wishlist, price util, backend eval |

**Total actionable items: 17**

---

## Appendices

### A: localStorage schema reference

| Key | Type | Used By |
|-----|------|---------|
| `clothing_stock` | `{pid_size_color: qty}` | app.js |
| `clothing_cart` | `[{id, name, price, size, color, colorValue, quantity, emoji}]` | app.js |
| `clothing_showcase` | `[{id, imageData, description, date}]` | showcase.js |
| `clothing_points` | string number | showcase.js |
| `clothing_comments` | `{pid: [{id, nickname, content, date}]}` | comments.js |

### B: Module dependency graph

```
data.js (globals: PRODUCTS, LS_*)
  └─> app.js (window._cloth = full API)
        └─> showcase.js (window._cloth.* augmentation)
              └─> comments.js (window._cloth.* augmentation)
```

All dependencies are mandatory — `app.js` must load before `showcase.js`, which must load before `comments.js`.
