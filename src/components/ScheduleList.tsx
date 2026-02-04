import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleSchedule } from "../store/thermostatSlice";
import {
  ScheduleRow,
  getGlobalRenderCount,
  resetGlobalRenderCount,
} from "./ScheduleRow";

interface Props {
  readonly style?: object;
}

export function ScheduleList({ style }: Props) {
  const dispatch = useAppDispatch();
  const schedules = useAppSelector((state) => state.schedules);

  // State for showing render counts (debug mode)
  const [showRenderCounts, setShowRenderCounts] = useState(false);
  const [lastRenderSnapshot, setLastRenderSnapshot] = useState(0);

  /**
   * PERFORMANCE FIX: useCallback prevents creating new function reference on each render.
   * Without this, even with React.memo on ScheduleRow, rows would still re-render
   * because onToggle prop would be a new function each time.
   */
  const handleToggle = useCallback(
    (id: string) => {
      // Snapshot render count before toggle for comparison
      if (showRenderCounts) {
        setLastRenderSnapshot(getGlobalRenderCount());
      }
      dispatch(toggleSchedule(id));
    },
    [dispatch, showRenderCounts],
  );

  const toggleDebugMode = () => {
    if (!showRenderCounts) {
      resetGlobalRenderCount();
    }
    setShowRenderCounts(!showRenderCounts);
  };

  const currentRenderCount = getGlobalRenderCount();
  const rendersSinceSnapshot = currentRenderCount - lastRenderSnapshot;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Schedules</Text>
        <Pressable
          style={({ pressed }) => [
            styles.debugButton,
            showRenderCounts && styles.debugButtonActive,
            pressed && styles.debugButtonPressed,
          ]}
          onPress={toggleDebugMode}
        >
          <Text style={styles.debugButtonText}>
            {showRenderCounts ? "Hide Counts" : "Show Renders"}
          </Text>
        </Pressable>
      </View>

      {showRenderCounts && (
        <View style={styles.renderStats}>
          <Text style={styles.renderStatsText}>
            Total renders: {currentRenderCount}
          </Text>
          {lastRenderSnapshot > 0 && (
            <Text style={styles.renderStatsText}>
              Last toggle: +{rendersSinceSnapshot} renders
              {rendersSinceSnapshot <= 2 && " ✓"}
              {rendersSinceSnapshot > 10 && " (perf issue!)"}
            </Text>
          )}
        </View>
      )}

      {schedules.map((schedule) => (
        <ScheduleRow
          key={schedule.id}
          schedule={schedule}
          onToggle={handleToggle}
          showRenderCount={showRenderCounts}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  debugButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#2d2d44",
    borderRadius: 6,
  },
  debugButtonActive: {
    backgroundColor: "#4d3d2e",
  },
  debugButtonPressed: {
    backgroundColor: "#3d3d54",
  },
  debugButtonText: {
    fontSize: 12,
    color: "#fff",
  },
  renderStats: {
    backgroundColor: "#2d1a1a",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  renderStatsText: {
    fontSize: 12,
    color: "#ff6b6b",
    fontFamily: "monospace",
  },
});
