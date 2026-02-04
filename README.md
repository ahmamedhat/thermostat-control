# Thermostat Control

Offline-first thermostat control demo built with Expo React Native, TypeScript, Redux, and Thunk.

## Features

- **Optimistic UI**: Temperature changes reflect immediately, regardless of network state
- **Offline queue**: Commands queue automatically when offline, flush on reconnect
- **Out-of-order protection**: Stale API responses won't overwrite newer user intent
- **Conflict handling**: Server disagreements resolved with "client-intent-wins-if-newer" rule
- **Debug tools**: Force conflict simulation for testing edge cases
- **Schedules list**: 24 schedule rows with toggle animations, optimized with React.memo

## Running the app

```bash
npm install
npm start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

## Project Structure

```
src/
  components/     # UI components (display, stepper, status, toggles)
  services/       # Mock API with latency/failure simulation
  store/          # Redux slice, thunks, typed hooks
  types/          # TypeScript interfaces
app/
  _layout.tsx     # Root layout with Redux Provider
  index.tsx       # Main thermostat screen
```

## Testing Scenarios

1. **Basic sync**: Adjust temperature with good connection, watch status indicator
2. **Offline queue**: Enable offline mode, change temp, disable offline — queued command syncs
3. **Failure recovery**: With ~15% failure rate, watch retry mechanism in action
4. **Conflict simulation**: Tap "Force Conflict Once", then change temp — see how conflict resolves
5. **Out-of-order**: Rapid temperature changes — UI stays consistent despite variable latency
6. **Render performance**: Tap "Show Renders" in Schedules section, toggle a row — see only 1 render occurs (not 24)

See `DECISIONS.md` for architectural trade-offs and `PERF_NOTES.md` for the performance optimization.
