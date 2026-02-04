import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DebugControls,
  OfflineToggle,
  StatusBar as SyncStatusBar,
  TemperatureDisplay,
  TemperatureStepper,
} from "../src/components";
import { useAppDispatch } from "../src/store/hooks";
import { fetchCurrentState } from "../src/store/thermostatThunks";

export default function ThermostatScreen() {
  const dispatch = useAppDispatch();

  // Poll for current temperature updates
  useEffect(() => {
    // Initial fetch
    dispatch(fetchCurrentState());

    // Poll every 10 seconds for current temp updates
    const interval = setInterval(() => {
      dispatch(fetchCurrentState());
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <TemperatureDisplay style={styles.section} />

          <TemperatureStepper style={styles.section} />

          <SyncStatusBar style={styles.section} />

          <OfflineToggle style={styles.section} />

          <DebugControls style={styles.section} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f0f1a",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 32,
  },
  section: {
    marginBottom: 16,
  },
});
