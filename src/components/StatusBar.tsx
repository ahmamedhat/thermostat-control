import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { retrySync } from "../store/thermostatThunks";

interface Props {
  style?: object;
}

export function StatusBar({ style }: Props) {
  const dispatch = useAppDispatch();
  const syncStatus = useAppSelector((state) => state.syncStatus);
  const pendingCommand = useAppSelector((state) => state.pendingCommand);

  const handleRetry = () => {
    dispatch(retrySync());
  };

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return "#888";
    if (syncStatus.lastError) return "#ff6b6b";
    if (syncStatus.isSyncing) return "#ffaa00";
    if (pendingCommand) return "#ffaa00";
    return "#4ade80";
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return "Offline";
    if (syncStatus.lastError) return "Sync failed";
    if (syncStatus.isSyncing) return "Syncing...";
    if (pendingCommand) return "Pending";
    return "Connected";
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.statusRow}>
        <View
          style={[styles.indicator, { backgroundColor: getStatusColor() }]}
        />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {syncStatus.lastError && syncStatus.isOnline && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText} numberOfLines={1}>
            {syncStatus.lastError}
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryPressed,
            ]}
            onPress={handleRetry}
          >
            <Text style={styles.retryText}>Retry now</Text>
          </Pressable>
        </View>
      )}

      {pendingCommand && !syncStatus.lastError && (
        <Text style={styles.pendingInfo}>
          Queued: {pendingCommand.targetTemp.toFixed(1)}°
          {pendingCommand.retryCount > 0 &&
            ` (${pendingCommand.retryCount} retries)`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    height: 80,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#ccc",
    fontWeight: "500",
  },
  errorContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    fontSize: 12,
    color: "#ff6b6b",
    flex: 1,
    marginRight: 12,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#2d2d44",
    borderRadius: 6,
  },
  retryPressed: {
    backgroundColor: "#3d3d54",
  },
  retryText: {
    fontSize: 12,
    color: "#4da6ff",
    fontWeight: "600",
  },
  pendingInfo: {
    marginTop: 6,
    fontSize: 12,
    color: "#888",
  },
});
