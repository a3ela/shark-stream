# Code Review: Fixes & Refactoring Opportunities

## Critical Bugs

### 1. Form submission not wired (`app/(root)/request/page.tsx`)
The request form has no `onSubmit` handler. Users can submit but nothing happens (page reloads).
- Add `onSubmit` handler that calls `submitSiteRequest` server action
- Use controlled inputs with `useState`
- Show success/error feedback after submission

### 2. Avatar initial crash (`app/(admin)/dashboard/users/page.tsx:77`)
`(row.name ?? "?")[0].toUpperCase()` crashes when `name` is empty string `""` — `""[0]` is `undefined`, causing `.toUpperCase()` to throw.
- Fix: `(row.name || "?")[0]?.toUpperCase() ?? "?"`

### 3. `alert()` blocking UI (`app/(admin)/dashboard/users/page.tsx`)
Uses `alert("Failed to create user")` which is blocking and inaccessible.
- Replace with inline error state or toast notification

---

## TypeScript Issues

### 4. `as any` type assertions (`app/(admin)/dashboard/sites/page.tsx`)
`columns={columns as any}` and `data={data.items as Record<string, unknown>[]}` bypass TypeScript entirely.
- Type `DataTable` component properly with generics
- Remove `as any` casts

### 5. Unsafe role access (`app/(admin)/layout.tsx`)
`const role = (session.user as { role?: string }).role;` uses type assertion without proper interface.
- Define a `SessionUser` interface with optional `role` field
- Use typed session from better-auth

---

## Accessibility

### 6. Missing `aria-current` on active nav items
Affects: `navbar.tsx`, `admin/sidebar.tsx`, `category-sidebar.tsx`
- Add `aria-current={isActive ? "page" : undefined}` to active navigation links

### 7. Missing form labels
Affects: `search-bar.tsx`, `signin/page.tsx`, all admin modals
- Add `aria-label` or `<label htmlFor>` to all inputs without labels

### 8. Missing `:focus-visible` styles (`globals.css`)
Admin sidebar items, filter tabs, pagination buttons have no keyboard focus indicator.
- Add `:focus-visible` outline styles to `.admin-sidebar__nav-item`, `.admin-filter-tab`, `.pagination__btn`

### 9. Decorative elements not hidden (`banner.tsx`)
Dashed circles and decorative elements lack `aria-hidden="true"`.
- Add `aria-hidden="true"` to purely decorative elements

---

## Performance

### 10. No `AbortController` for paginated requests
Affects: `users/page.tsx`, `categories/page.tsx`, `requests/page.tsx`, `sites/page.tsx`
- Rapid pagination/filtering can cause race conditions where stale responses overwrite fresh data
- Add `AbortController` to cancel in-flight requests on cleanup

### 11. Categories fetched on every page change (`sites/page.tsx`)
`getPaginatedCategories(1, 100)` called inside `fetchData` which runs on every pagination change.
- Fetch categories once on mount, cache in state
- Or use React `cache()` for the server action

---

## Code Quality

### 12. Filename typo (`components/sites/dectionary.tsx`)
Should be `dictionary.tsx`.
- Rename file and update imports

### 13. Duplicate modal components
`components/ui/modal.tsx` (unused) and `components/admin/modal.tsx` (in use) with different features.
- Consolidate into a single modal with: Escape key, scroll lock, focus trap, ARIA attributes
- Remove unused `ui/modal.tsx` or make admin use the improved version

### 14. Dead link in navbar (`navbar.tsx`)
Links to `/contact` but no contact page exists.
- Remove link or create the page

### 15. `useTransition` misuse
Affects all admin CRUD pages. `useTransition` wraps async data mutations but doesn't provide concurrent rendering benefits here.
- Replace with explicit `isLoading` state per action

### 16. Missing error boundaries
All data-fetching `useEffect` hooks lack try/catch. API failures leave UI in perpetual loading.
- Add error state to each page
- Display user-friendly error message with retry option

---

## Hydration

### 17. Potential hydration mismatch (`app/layout.tsx`)
`ThemeProvider` sets `data-theme` on `<html>` after mount, which can cause hydration warnings.
- Add `suppressHydrationWarning` to `<html>` element in root layout

---

## CSS/Maintainability

### 18. Large monolithic CSS (`globals.css` - 1184 lines)
Admin styles ship to all public pages unnecessarily.
- Split admin CSS into separate file imported only in admin layout

### 19. Hardcoded colors (`banner.tsx`, `stat-card.tsx`)
Uses hardcoded rgba/hex values instead of CSS custom properties.
- Replace with CSS variables for theme consistency

### 20. Missing `prefers-reduced-motion` (`globals.css`)
Animations run unconditionally, which can affect users with vestibular disorders.
- Add `@media (prefers-reduced-motion: reduce)` to disable animations

---

## Summary Priority

| Priority | Items |
|----------|-------|
| **Fix Now** | 1 (form), 2 (crash), 3 (alert), 14 (dead link) |
| **Should Fix** | 4 (any types), 6-9 (a11y), 10 (race conditions), 12 (typo), 17 (hydration) |
| **Nice to Have** | 5 (types), 11 (perf), 13 (dedup), 15 (cleanup), 16 (errors), 18-20 (CSS) |
