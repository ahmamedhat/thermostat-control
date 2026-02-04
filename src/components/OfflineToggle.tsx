import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleOnlineMode } from "../store/thermostatThunks";

interface Props {
  style?: object;
}

export function OfflineToggle({ style }: Props) {
  const dispatch = useAppDispatch();
  const isOnline = useAppSelector((state) => state.syncStatus.isOnline);

  const handleToggle = (value: boolean) => {
    // Toggle is "Offline mode" so invert the value for online status
    dispatch(toggleOnlineMode(!value));
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Offline Mode</Text>
        <Text style={styles.sublabel}>
          {isOnline
            ? "Commands sync immediately"
            : "Commands queued until online"}
        </Text>
      </View>
      <Switch
        value={!isOnline}
        onValueChange={handleToggle}
        trackColor={{ false: "#3d3d54", true: "#4da6ff" }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
  },
  labelContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  sublabel: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
});
