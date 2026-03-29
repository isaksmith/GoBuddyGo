import React from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface ModelViewerProps {
  html: string;
  style?: StyleProp<ViewStyle>;
  scrollEnabled?: boolean;
}

export default function ModelViewer({ html, style, scrollEnabled }: ModelViewerProps) {
  if (Platform.OS === "web") {
    return (
      <View style={[styles.fill, style]}>
        <iframe
          srcDoc={html}
          style={iframeStyle}
          sandbox="allow-scripts allow-same-origin"
          scrolling={scrollEnabled === false ? "no" : "auto"}
        />
      </View>
    );
  }

  const { WebView } = require("react-native-webview");
  return (
    <WebView
      source={{ html }}
      style={style}
      originWhitelist={["*"]}
      javaScriptEnabled
      domStorageEnabled
      allowFileAccess
      mixedContentMode="always"
      scrollEnabled={scrollEnabled}
    />
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});

const iframeStyle: React.CSSProperties = {
  border: "none",
  width: "100%",
  height: "100%",
  display: "block",
};
