import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ApiSetTargetResponse,
  ApiThermostatState,
  ThermostatStoreState,
} from "../types";

const initialState: ThermostatStoreState = {
  thermostat: {
    currentTemp: 21.5,
    targetTemp: 22,
    lastUpdatedTs: 0,
  },
  pendingCommand: null,
  syncStatus: {
    isOnline: true,
    isSyncing: false,
    lastError: null,
    lastSyncTs: null,
  },
  localIntentTs: 0,
};

const thermostatSlice = createSlice({
  name: "thermostat",
  initialState,
  reducers: {
    /**
     * Optimistically update target temp (immediate UI feedback).
     * Also creates/updates the pending command for sync.
     */
    setTargetOptimistic(
      state,
      action: PayloadAction<{ target: number; clientTs: number }>,
    ) {
      const { target, clientTs } = action.payload;

      // Update UI immediately
      state.thermostat.targetTemp = target;
      state.localIntentTs = clientTs;

      // Queue command (coalesce: just keep latest)
      state.pendingCommand = {
        targetTemp: target,
        clientTs,
        retryCount: state.pendingCommand?.retryCount ?? 0,
      };

      // Clear any previous error when user takes new action
      state.syncStatus.lastError = null;
    },

    /**
     * Mark sync as in progress
     */
    syncStart(state) {
      state.syncStatus.isSyncing = true;
      state.syncStatus.lastError = null;
    },

    /**
     * Handle successful sync response.
     * Implements out-of-order protection via timestamp comparison.
     */
    syncSuccess(state, action: PayloadAction<ApiSetTargetResponse>) {
      const response = action.payload;

      state.syncStatus.isSyncing = false;
      state.syncStatus.lastSyncTs = Date.now();

      // Out-of-order protection: only accept if this response
      // corresponds to our latest intent (or newer than any acknowledged state)
      if (response.requestClientTs < state.localIntentTs) {
        // Stale response - user has made a newer change since this request was sent
        // Keep the pending command if it exists (it's the newer intent)
        return;
      }

      // Check for conflict: server returned different target than requested
      const hasConflict =
        state.pendingCommand &&
        response.targetTemp !== state.pendingCommand.targetTemp;

      if (hasConflict) {
        // Conflict resolution: "Client-intent-wins-if-newer"
        // If user's local intent timestamp is the same as this request's clientTs,
        // the user hasn't made any new changes, so we accept the server's value.
        // Otherwise, keep the local intent and re-queue.

        if (state.localIntentTs === response.requestClientTs) {
          // No newer local changes - accept server's resolution
          state.thermostat.targetTemp = response.targetTemp;
          state.thermostat.lastUpdatedTs = response.serverTs;
          state.pendingCommand = null;
        } else {
          // User made newer changes - keep pending command for next sync
          // Don't update UI (already shows user's intent)
        }
      } else {
        // No conflict - clear pending if this was the command we sent
        if (state.pendingCommand?.clientTs === response.requestClientTs) {
          state.pendingCommand = null;
        }
        state.thermostat.lastUpdatedTs = response.serverTs;
      }
    },

    /**
     * Handle sync failure
     */
    syncFailure(state, action: PayloadAction<string>) {
      state.syncStatus.isSyncing = false;
      state.syncStatus.lastError = action.payload;

      // Increment retry count on pending command
      if (state.pendingCommand) {
        state.pendingCommand.retryCount += 1;
      }
    },

    /**
     * Update state from server fetch (for current temp updates)
     */
    updateFromServer(state, action: PayloadAction<ApiThermostatState>) {
      const serverState = action.payload;

      state.thermostat.currentTemp = serverState.currentTemp;

      // Only update target if we don't have a pending local change
      if (
        !state.pendingCommand &&
        serverState.serverTs > state.thermostat.lastUpdatedTs
      ) {
        state.thermostat.targetTemp = serverState.targetTemp;
        state.thermostat.lastUpdatedTs = serverState.serverTs;
      }
    },

    /**
     * Toggle online/offline mode
     */
    setOnlineStatus(state, action: PayloadAction<boolean>) {
      state.syncStatus.isOnline = action.payload;
      if (action.payload) {
        // Coming back online - clear error to allow retry
        state.syncStatus.lastError = null;
      }
    },

    /**
     * Clear pending command (e.g., after user acknowledges conflict)
     */
    clearPending(state) {
      state.pendingCommand = null;
    },

    /**
     * Reset error state for retry
     */
    clearError(state) {
      state.syncStatus.lastError = null;
    },
  },
});

export const {
  setTargetOptimistic,
  syncStart,
  syncSuccess,
  syncFailure,
  updateFromServer,
  setOnlineStatus,
  clearPending,
  clearError,
} = thermostatSlice.actions;

export default thermostatSlice.reducer;
