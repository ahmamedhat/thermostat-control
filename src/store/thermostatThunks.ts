import * as api from "../services/api";
import { AppDispatch, RootState } from "./index";
import {
  clearError,
  setOnlineStatus,
  setTargetOptimistic,
  syncFailure,
  syncStart,
  syncSuccess,
  updateFromServer,
} from "./thermostatSlice";

/**
 * Set target temperature with optimistic update and async sync.
 * Handles offline queueing automatically.
 */
export function setTargetTemp(target: number) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const clientTs = Date.now();

    // Optimistic update - UI responds immediately
    dispatch(setTargetOptimistic({ target, clientTs }));

    const { syncStatus } = getState();

    // If offline, just queue (already done by optimistic update)
    if (!syncStatus.isOnline) {
      return;
    }

    // Attempt sync
    await dispatch(syncPendingCommand());
  };
}

/**
 * Attempt to sync the pending command to server.
 * Handles failures gracefully - command stays queued for retry.
 */
export function syncPendingCommand() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const { pendingCommand, syncStatus } = state;

    // Nothing to sync or already syncing
    if (!pendingCommand || syncStatus.isSyncing || !syncStatus.isOnline) {
      return;
    }

    dispatch(syncStart());

    try {
      const response = await api.setTarget(
        pendingCommand.targetTemp,
        pendingCommand.clientTs,
      );

      dispatch(syncSuccess(response));

      // Check if there's still a pending command (user made changes during sync)
      const newState = getState();
      if (newState.pendingCommand && newState.syncStatus.isOnline) {
        // Recursively sync the new pending command
        await dispatch(syncPendingCommand());
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      dispatch(syncFailure(message));
    }
  };
}

/**
 * Toggle online mode. When coming back online, flush pending commands.
 */
export function toggleOnlineMode(isOnline: boolean) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setOnlineStatus(isOnline));

    if (isOnline) {
      // Flush pending commands on reconnect
      const { pendingCommand } = getState();
      if (pendingCommand) {
        await dispatch(syncPendingCommand());
      }
    }
  };
}

/**
 * Retry syncing after a failure
 */
export function retrySync() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(clearError());

    const { pendingCommand, syncStatus } = getState();
    if (pendingCommand && syncStatus.isOnline) {
      await dispatch(syncPendingCommand());
    }
  };
}

/**
 * Fetch current state from server (for current temp updates).
 * Respects offline mode and doesn't overwrite local pending changes.
 */
export function fetchCurrentState() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const { syncStatus } = getState();

    if (!syncStatus.isOnline) {
      return;
    }

    try {
      const serverState = await api.fetchState();
      dispatch(updateFromServer(serverState));
    } catch (error) {
      // Silent fail for background fetch - don't disrupt user
      console.warn("Background fetch failed:", error);
    }
  };
}
