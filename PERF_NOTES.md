# Performance Notes

## The Issue: Unnecessary List Re-renders

**What was the bug?**

Without `React.memo` on `ScheduleRow`, toggling any single schedule caused all 24 rows to re-render. This happens because:

1. Parent component (`ScheduleList`) re-renders when Redux state changes
2. Parent passes new props to all children (even if the actual values are the same)
3. Without memoization, React re-renders all children by default

On mid-range Android devices, 24 unnecessary re-renders (each with an animation setup) causes visible jank.

**Why it matters for RN:**

React Native's JS-to-native bridge means every re-render has real cost. Unlike web where the DOM diffing is cheap, RN must serialize component updates across the bridge. Lists are particularly vulnerable since N items means N× the overhead.

---

## The Fix

Two changes were required:

1. **Wrap `ScheduleRow` with `React.memo`** — prevents re-render unless props actually changed
2. **Use `useCallback` for `onToggle` in parent** — without this, a new function reference is created each render, defeating memo

```tsx
// ScheduleRow.tsx
export const ScheduleRow = React.memo(function ScheduleRow({ ... }) {
  // ...
});

// ScheduleList.tsx
const handleToggle = useCallback((id: string) => {
  dispatch(toggleSchedule(id));
}, [dispatch]);
```

---

## Proof: Before vs After

Built-in render counters show the difference. Tap "Show Renders" in the Schedules section to enable.

| Scenario      | Before (no memo) | After (with memo) |
| ------------- | ---------------- | ----------------- |
| Toggle 1 row  | +24 renders      | +1 render         |
| Toggle 3 rows | +72 renders      | +3 renders        |

**How to test the buggy version:**

In `ScheduleRow.tsx`, temporarily remove the `React.memo` wrapper:

```tsx
// Change this:
export const ScheduleRow = React.memo(function ScheduleRow({ ... }) {

// To this:
export function ScheduleRow({ ... }) {
```

Then toggle any schedule and observe the render counts spike to +24 per toggle.

---

## Notes

- The render counter is per-row (`renderCount.current`) and global (`globalRenderCount`)
- Animation still triggers on the toggled row — memo doesn't prevent the actual state change, just unnecessary sibling re-renders
- For very long lists (100+ items), consider `FlashList` or virtualization as an additional optimization
