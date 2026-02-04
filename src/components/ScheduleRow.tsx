import React, { useRef } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { Schedule } from "../types";

// Global render counter for proof artifact
let globalRenderCount = 0;
export function getGlobalRenderCount() {
  return globalRenderCount;
}
export function resetGlobalRenderCount() {
  globalRenderCount = 0;
}

interface ScheduleRowProps {
  schedule: Schedule;
  onToggle: (id: string) => void;
  showRenderCount?: boolean;
}

/**
 * PERFORMANCE FIX APPLIED:
 * - Wrapped with React.memo to prevent re-renders when props haven't changed
 * - Parent must use useCallback for onToggle to make memo effective
 *
 * Without memo: toggling ONE row causes ALL 24 rows to re-render
 * With memo: only the toggled row re-renders
 */
export const ScheduleRow = React.memo(function ScheduleRow({
  schedule,
  onToggle,
  showRenderCount = false,
}: ScheduleRowProps) {
  // Track renders for this specific row
  const renderCount = useRef(0);
  renderCount.current += 1;
  globalRenderCount += 1;

  // Animation for toggle feedback
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggle = () => {
    // Trigger animation
    scale.value = withSequence(
      withSpring(1.02, { damping: 15 }),
      withSpring(1, { damping: 15 }),
    );
    onToggle(schedule.id);
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{schedule.time}</Text>
        {showRenderCount && (
          <Text style={styles.renderCount}>renders: {renderCount.current}</Text>
        )}
      </View>

      <Text style={styles.temp}>{schedule.targetTemp}°</Text>

      <Switch
        value={schedule.enabled}
        onValueChange={handleToggle}
        trackColor={{ false: "#3d3d54", true: "#4da6ff" }}
        thumbColor="#fff"
      />
    </Animated.View>
  );
});

/*
 * ============================================================
 * BUGGY VERSION (for comparison - DO NOT USE in production)
 * ============================================================
 *
 * This version lacks React.memo, causing ALL 24 rows to re-render
 * whenever ANY row is toggled, because the parent re-renders and
 * passes new props (even if unchanged) to all children.
 *
 * export function ScheduleRowBuggy({
 *   schedule,
 *   onToggle,
 *   showRenderCount = false,
 * }: ScheduleRowProps) {
 *   const renderCount = useRef(0);
 *   renderCount.current += 1;
 *   globalRenderCount += 1;
 *   // ... same implementation without React.memo wrapper
 * }
 */

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    marginBottom: 8,
  },
  timeContainer: {
    flex: 1,
  },
  time: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  renderCount: {
    fontSize: 10,
    color: "#ff6b6b",
    marginTop: 2,
  },
  temp: {
    fontSize: 16,
    color: "#4da6ff",
    marginRight: 16,
    minWidth: 40,
    textAlign: "right",
  },
});
