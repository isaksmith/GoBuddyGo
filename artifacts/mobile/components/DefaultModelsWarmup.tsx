import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import ModelViewer from "@/components/ModelViewer";
import {
  getBuddyCarModelUrl,
  getCruiserModelUrl,
  getJeepModelUrl,
  getMiniCoopModelUrl,
} from "@/context/AppContext";

function modelHtml(modelUrl: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js"></script><script nomodule src="https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer-legacy.js"></script><style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;background:#09192A;overflow:hidden}model-viewer{width:100%;height:100%;background-color:#09192A;--poster-color:#09192A;}</style></head><body><model-viewer src="${modelUrl}" camera-orbit="225deg 65deg auto" camera-controls="false" interaction-prompt="none" auto-rotate="false" shadow-intensity="1" environment-image="neutral" exposure="1.2" alt="Warmup model"></model-viewer></body></html>`;
}

export function DefaultModelsWarmup() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setEnabled(true), 250);
    return () => clearTimeout(timer);
  }, []);

  const urls = useMemo(
    () => [getBuddyCarModelUrl(), getJeepModelUrl(), getMiniCoopModelUrl(), getCruiserModelUrl()],
    []
  );

  if (!enabled) return null;

  return (
    <View style={styles.hiddenWarmupLayer} pointerEvents="none">
      {urls.map((url) => (
        <View key={url} style={styles.warmupCell}>
          <ModelViewer html={modelHtml(url)} cacheKey={url} scrollEnabled={false} style={styles.warmupCell} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenWarmupLayer: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0.01,
    left: -9999,
    top: -9999,
  },
  warmupCell: {
    width: 1,
    height: 1,
  },
});
