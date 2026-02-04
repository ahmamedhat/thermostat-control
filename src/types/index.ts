/**
 * Core thermostat types
 */

export interface ThermostatState {
  currentTemp: number;
  targetTemp: number;
  lastUpdatedTs: number; // Timestamp of last confirmed server state
}

export interface PendingCommand {
  targetTemp: number;
  clientTs: number;
  retryCount: number;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastError: string | null;
  lastSyncTs: number | null;
}

// API response types
export interface ApiThermostatState {
  currentTemp: number;
  targetTemp: number;
  serverTs: number;
}

export interface ApiSetTargetResponse {
  success: boolean;
  targetTemp: number; // The server's accepted target (may differ in conflict scenarios)
  serverTs: number;
  requestClientTs: number; // Echo back client timestamp for correlation
}

// Schedule types
export interface Schedule {
  id: string;
  time: string;
  targetTemp: number;
  enabled: boolean;
}

// Redux state shape
export interface ThermostatStoreState {
  thermostat: ThermostatState;
  pendingCommand: PendingCommand | null;
  syncStatus: SyncStatus;
  localIntentTs: number; // Timestamp of the most recent local user intent
  schedules: Schedule[];
}
