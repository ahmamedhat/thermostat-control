import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { enableForceConflict, isConflictPending } from "../services/api";

interface Props {
  style?: object;
}

export function DebugControls({ style }: Props) {
  const [conflictArmed, setConflictArmed] = useState(false);

  const handleForceConflict = () => {
    enableForceConflict(2); // Server will respond with +2° offset
    setConflictArmed(true);

    // Reset UI indicator after a few seconds if not triggered
    setTimeout(() => {
      if (!isConflictPending()) {
        setConflictArmed(false);
      }
    }, 5000);
  };

  // Periodically check if conflict was consumed
  React.useEffect(() => {
    if (conflictArmed) {
      const interval = setInterval(() => {
        if (!isConflictPending()) {
          setConflictArmed(false);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [conflictArmed]);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.header}>Debug Controls</Text>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          conflictArmed && styles.buttonArmed,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleForceConflict}
        disabled={conflictArmed}
      >
        <Text style={styles.buttonText}>
          {conflictArmed ? "Conflict Armed" : "Force Conflict Once"}
        </Text>
      </Pressable>

      <Text style={styles.hint}>
        {conflictArmed
          ? "Next setTarget will respond with +2° offset"
          : "Arm a conflict for the next API call"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
  },
  header: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#2d2d44",
    borderRadius: 8,
    alignItems: "center",
  },
  buttonArmed: {
    backgroundColor: "#5c3d2e",
  },
  buttonPressed: {
    backgroundColor: "#3d3d54",
  },
  buttonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  hint: {
    fontSize: 11,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});
