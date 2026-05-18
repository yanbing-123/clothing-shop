# Clothing Shop — Technical Roadmap

> Generated: 2026-05-14
> Updated: 2026-05-18
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

## P0 — Fix Now ✅ DONE

### 1. Color button disabled state is broken ✅ FIXED

**Problem:** In `js/app.js` `renderProducts()`, the `disabled` variable is declared with `var` inside the size loop, so it's hoisted to function scope. After the size loop ends, `disabled` retains the **last size's** value. The color loop then reuses this same `disabled` variable for all color buttons, ignoring per-color stock. Additionally, `cStock` is computed but never used.

**Impact:** Color buttons may show incorrect disabled/enabled state. Users can attempt to add out-of-stock color variants to cart (caught by later stock checks, but confusing UX).

**Fix:** Compute per-color stock in the color loop using `hasAnyStock(p.id, c.value)` and derive `disabled` from that. Applied in `app.js:131-136`. Also fixed `escapeQuote(c.name)` on `data-name` attribute (item 6).

---

## P1 — This Sprint

### 2. README out of sync with codebase ✅ FIXED

**Problem:** README listed only `data.js` and `app.js`, missing `showcase.js`, `comments.js`, `reviews.js`, `orders.js`, and `wishlist.js`. The feature table also omitted buyer showcase, points, comments, reviews, orders, and wishlist.

**Fix:** Updated the project structure diagram, feature list, and added localStorage schema reference. Rewrote `README.md`.

**Files:** `README.md`

---

### 3. Toast function duplicated across files ✅ FIXED

**Problem:** `showToast()` was defined identically in `app.js`, `showcase.js`, `comments.js`, `reviews.js`, `orders.js`, and `wishlist.js` (~15 lines each, 6 copies total).

**Fix:** Extracted into `data.js` as a global function (loaded first, no IIFE). Removed all 6 duplicate definitions.

**Files:** `js/data.js`, `js/app.js`, `js/showcase.js`, `js/comments.js`, `js/reviews.js`, `js/orders.js`, `js/wishlist.js`

---

### 4. Unhandled localStorage corruption ✅ FIXED

**Problem:** Multiple `JSON.parse()` calls (across `app.js`, `showcase.js`, `comments.js`, `orders.js`) would throw uncatchable errors and crash the page if localStorage data was corrupted.

**Fix:** Added `safeParse(key, fallback)` helper in `data.js`. Replaced all unsafe `JSON.parse(localStorage.getItem(...))` calls across all modules. `reviews.js` and `wishlist.js` already had try-catch blocks.

**Files:** `js/data.js`, `js/app.js`, `js/showcase.js`, `js/comments.js`, `js/orders.js`

---

### 5. Navigation links cause page jump ✅ FIXED

**Problem:** `<a href="#">` used for tab navigation. Clicking adds `#` to the URL and scrolls to top.

**Fix:** Changed all nav links to `href="javascript:void(0)"`.

**Files:** `index.html`

---

### 6. `escapeQuote` gap on `data-name` attribute ✅ FIXED

**Problem:** Color button HTML used `data-name="' + c.name + '"` without `escapeQuote`. If a color name contains a quote, it breaks the HTML attribute.

**Fix:** Applied `escapeQuote(c.name)`. Fixed together with item 1 in `app.js:135`.

**Files:** `js/app.js`

---

## P2 — Next Sprint

### 7. Accessibility baseline ✅ DONE

**Problem:** Multiple ARIA issues: no `role="dialog"` on modals, no focus management, no `aria-expanded` on cart toggle, no `aria-live` on toast notifications, no `:focus-visible` styles, skipped heading levels, color buttons have no `aria-label`.

**Fix Applied:**
- Added `role="dialog"`, `aria-modal="true"`, `aria-labelledby` to all 7 modals (checkout, success, upload, comments, reviews, cart drawer)
- Added `aria-label` to navigation, filter toolbar, sections, header buttons
- Added `aria-expanded` to cart toggle button (updated in `app.js:toggleDrawer`)
- Added `aria-live="polite"` to cart bar, drawer items, comments list, reviews list, orders container, wishlist grid
- Added focus management (focus first input on modal open) to checkout, upload, comments, reviews, success modals
- Added keyboard support (arrow keys) to star selector in reviews
- Added `.sr-only` class for screen reader only content
- Added `:focus-visible` styles in CSS for keyboard navigation focus indicators
- Added `aria-required="true"` and `role="alert"` to form error messages

**Files:** `index.html`, `css/style.css`, `js/app.js`, `js/showcase.js`, `js/comments.js`, `js/reviews.js`

---

### 8. Order history (lost on completion) ✅ DONE

**Status:** Already implemented via `orders.js` with order history view, delete, and clear functionality.

---

### 9. Quantity selector on product cards

**Problem:** Users must add to cart first, then open the drawer to adjust quantity. Standard e-commerce lets users pick quantity before adding.

**Fix:** Add a numeric `<input type="number">` or +/- stepper next to the "Add to Cart" button on each product card.

**Files:** `js/app.js`, `css/style.css`

---

### 10. Star rating on comments ✅ DONE

**Status:** Already implemented via `reviews.js` with 1-5 star rating, text reviews, and average rating display on product cards.

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

### 14. Search & sort ✅ PARTIAL

**Status:** Search is already implemented (`searchInput` in header, `searchProducts()` in `app.js`). Sort dropdown (price low-high, price high-low, name A-Z) is still needed.

---

### 15. Wishlist / favorites ✅ DONE

**Status:** Already implemented via `wishlist.js` with heart toggle on product cards, localStorage persistence, and dedicated wishlist view.

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

| Priority | Count | Focus | Status |
|----------|-------|-------|--------|
| P0 | 1 | Bug: color button disabled state | ✅ DONE |
| P1 | 5 | README, toast dedup, localStorage safety, nav jump, escape edge case | ✅ DONE |
| P2 | 4 | Accessibility baseline, quantity picker | Completed: 1, Remaining: 1 (item 9), Already done: 2 (items 8, 10) |
| P3 | 7 | CSP, module cleanup, images, search/sort, wishlist, price util, backend eval | Partial (search & wishlist done) |

**Total actionable items: 17 | Completed: 12 | Remaining: 5**

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
