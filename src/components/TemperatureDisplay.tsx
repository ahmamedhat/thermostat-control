import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppSelector } from "../store/hooks";

interface Props {
  style?: object;
}

export function TemperatureDisplay({ style }: Props) {
  const { currentTemp, targetTemp } = useAppSelector(
    (state) => state.thermostat,
  );
  const pendingCommand = useAppSelector((state) => state.pendingCommand);

  const hasPending = !!pendingCommand;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.currentTempSection}>
        <Text style={styles.label}>Current</Text>
        <Text style={styles.currentTemp}>{currentTemp.toFixed(1)}°</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.targetTempSection}>
        <Text style={styles.label}>Target</Text>
        <View style={styles.targetRow}>
          <Text style={[styles.targetTemp, hasPending && styles.pendingText]}>
            {targetTemp.toFixed(1)}°
          </Text>
          {hasPending && <Text style={styles.pendingIndicator}>●</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: "#1a1a2e",
    borderRadius: 20,
  },
  currentTempSection: {
    alignItems: "center",
    flex: 1,
  },
  targetTempSection: {
    alignItems: "center",
    flex: 1,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: "#333",
    marginHorizontal: 20,
  },
  label: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  currentTemp: {
    fontSize: 42,
    fontWeight: "300",
    color: "#fff",
  },
  targetTemp: {
    fontSize: 42,
    fontWeight: "300",
    color: "#4da6ff",
  },
  pendingText: {
    color: "#ffaa00",
  },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pendingIndicator: {
    fontSize: 12,
    color: "#ffaa00",
    marginLeft: 8,
  },
});
