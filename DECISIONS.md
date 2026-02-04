# Design Decisions

- **Conflict Resolution: Client-Intent-Wins-If-Newer** — When the server responds with a different target than requested (conflict), we check if the user has made any newer local changes since the request was sent. If yes, we preserve the user's latest intent and re-queue for sync. If no newer changes exist, we accept the server's value. This prioritizes user agency while still allowing server-side corrections when the user hasn't taken further action.

- **Queue Coalescing Over FIFO** — Since intermediate setpoint values don't matter (only the final desired temperature), we maintain a single pending command rather than a queue. Each new user action overwrites the previous pending value. This reduces unnecessary network traffic and simplifies the sync logic without losing any meaningful user intent.

- **Timestamp-Based Out-of-Order Protection** — Every setpoint command carries a `clientTs` timestamp. When a response arrives, we compare its `requestClientTs` against our `localIntentTs` to detect stale responses. This handles the classic race condition where a slow response from an earlier request could overwrite a newer user action. The trade-off is slightly more state to track, but it guarantees UI consistency.

- **Optimistic Updates with Deferred Sync** — The UI updates immediately on user input regardless of network state. In offline mode, commands queue automatically; when back online, we flush the latest pending command. Failed syncs keep the command queued with a retry count. This keeps the app responsive on flaky connections while ensuring eventual consistency.
