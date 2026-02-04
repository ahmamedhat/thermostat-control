import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setTargetTemp } from "../store/thermostatThunks";

const MIN_TEMP = 15;
const MAX_TEMP = 30;
const STEP = 0.5;

interface Props {
  style?: object;
}

export function TemperatureStepper({ style }: Props) {
  const dispatch = useAppDispatch();
  const targetTemp = useAppSelector((state) => state.thermostat.targetTemp);
  const isSyncing = useAppSelector((state) => state.syncStatus.isSyncing);

  const handleDecrease = useCallback(() => {
    const newTarget = Math.max(MIN_TEMP, targetTemp - STEP);
    dispatch(setTargetTemp(newTarget));
  }, [dispatch, targetTemp]);

  const handleIncrease = useCallback(() => {
    const newTarget = Math.min(MAX_TEMP, targetTemp + STEP);
    dispatch(setTargetTemp(newTarget));
  }, [dispatch, targetTemp]);

  const canDecrease = targetTemp > MIN_TEMP;
  const canIncrease = targetTemp < MAX_TEMP;

  return (
    <View style={[styles.container, style]}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          !canDecrease && styles.buttonDisabled,
          pressed && canDecrease && styles.buttonPressed,
        ]}
        onPress={handleDecrease}
        disabled={!canDecrease}
      >
        <Text style={[styles.buttonText, !canDecrease && styles.textDisabled]}>
          −
        </Text>
      </Pressable>

      <View style={styles.displayContainer}>
        <Text style={styles.displayTemp}>{targetTemp.toFixed(1)}°</Text>
        {isSyncing && (
          <View style={styles.syncingContainer}>
            <ActivityIndicator size="small" />
          </View>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          !canIncrease && styles.buttonDisabled,
          pressed && canIncrease && styles.buttonPressed,
        ]}
        onPress={handleIncrease}
        disabled={!canIncrease}
      >
        <Text style={[styles.buttonText, !canIncrease && styles.textDisabled]}>
          +
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2d2d44",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    backgroundColor: "#3d3d54",
  },
  buttonDisabled: {
    backgroundColor: "#1d1d2e",
  },
  buttonText: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "300",
  },
  textDisabled: {
    color: "#555",
  },
  displayContainer: {
    minWidth: 120,
    alignItems: "center",
    marginHorizontal: 24,
  },
  displayTemp: {
    fontSize: 48,
    fontWeight: "200",
    color: "#4da6ff",
  },
  syncingContainer: {
    position: "absolute",
    bottom: -25,
  },
});
