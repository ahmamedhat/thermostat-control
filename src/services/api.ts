/**
 * Mock API service for thermostat control
 *
 * Simulates realistic network conditions:
 * - Variable latency (200ms - 2000ms)
 * - Random failures (~15% chance)
 * - Out-of-order response potential (via latency variance)
 * - Conflict simulation for testing
 */

import { ApiSetTargetResponse, ApiThermostatState } from "../types";

// Simulated server state
let serverState: ApiThermostatState = {
  currentTemp: 21.5,
  targetTemp: 22,
  serverTs: Date.now(),
};

// Debug flags for conflict testing
let forceConflictOnce = false;
let conflictOffset = 2; // How much to offset the target in conflict mode

/**
 * Enable a forced conflict on the next setTarget call.
 * The server will respond with a different target than requested.
 */
export function enableForceConflict(offset: number = 2): void {
  forceConflictOnce = true;
  conflictOffset = offset;
}

export function isConflictPending(): boolean {
  return forceConflictOnce;
}

/**
 * Simulate random network latency
 */
function randomLatency(): number {
  // Base latency 200-800ms, occasionally much higher (simulating network issues)
  const base = 200 + Math.random() * 600;
  const spike = Math.random() < 0.15 ? Math.random() * 1200 : 0;
  return base + spike;
}

/**
 * Simulate random failures (~15% chance)
 */
function shouldFail(): boolean {
  return Math.random() < 0.15;
}

/**
 * Fetch current thermostat state from "server"
 */
export async function fetchState(): Promise<ApiThermostatState> {
  const latency = randomLatency();

  await new Promise((resolve) => setTimeout(resolve, latency));

  if (shouldFail()) {
    throw new Error("Network error: Failed to fetch thermostat state");
  }

  // Slowly drift current temp toward target (simulation of heating)
  const drift = (serverState.targetTemp - serverState.currentTemp) * 0.1;
  serverState.currentTemp =
    Math.round((serverState.currentTemp + drift) * 10) / 10;
  serverState.serverTs = Date.now();

  return { ...serverState };
}

/**
 * Set target temperature on "server"
 *
 * @param target - Desired target temperature
 * @param clientTs - Client-side timestamp for request correlation
 */
export async function setTarget(
  target: number,
  clientTs: number,
): Promise<ApiSetTargetResponse> {
  const latency = randomLatency();

  await new Promise((resolve) => setTimeout(resolve, latency));

  if (shouldFail()) {
    throw new Error("Network error: Failed to set target temperature");
  }

  let finalTarget = target;

  // Handle forced conflict scenario
  if (forceConflictOnce) {
    forceConflictOnce = false;
    finalTarget = target + conflictOffset;
    // Clamp to reasonable range
    finalTarget = Math.max(15, Math.min(30, finalTarget));
  }

  serverState.targetTemp = finalTarget;
  serverState.serverTs = Date.now();

  return {
    success: true,
    targetTemp: finalTarget,
    serverTs: serverState.serverTs,
    requestClientTs: clientTs,
  };
}

/**
 * Reset server state (useful for testing)
 */
export function resetServerState(): void {
  serverState = {
    currentTemp: 21.5,
    targetTemp: 22,
    serverTs: Date.now(),
  };
  forceConflictOnce = false;
}
