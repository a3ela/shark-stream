# Fix: localStorage is not defined (SSR Error)

## Problem

`components/sites/dectionary.tsx:37` accesses `localStorage` inside a `useState` initializer. During Next.js server-side rendering, `localStorage` is not available, causing a runtime error.

## Solution

Guard the `localStorage` read with a `typeof window` check, following the existing pattern in `providers/theme-provider.tsx:19`.

## Changes

### `components/sites/dectionary.tsx`

Replace the `favorites` state initializer (lines 36-39):

```tsx
const [favorites, setFavorites] = useState<string[]>(() => {
  const saved = localStorage.getItem("sharkstream-favorites");
  return saved ? JSON.parse(saved) : [];
});
```

With:

```tsx
const [favorites, setFavorites] = useState<string[]>(() => {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("sharkstream-favorites");
  return saved ? JSON.parse(saved) : [];
});
```

## Validation

- Run `next dev` and confirm the error no longer appears
- Verify favorites still persist across page reloads in the browser
