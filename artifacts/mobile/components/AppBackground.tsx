import React from "react";
import { StyleSheet, View } from "react-native";

export function AppBackground({ children }: { children?: React.ReactNode }) {
  return (
    <View style={styles.root}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#87CEEB",
  },
});
