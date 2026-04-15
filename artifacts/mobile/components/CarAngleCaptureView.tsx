import React, { useCallback } from "react";
import { Platform, StyleSheet } from "react-native";
import type { CarAngle, CarPhotos } from "@/context/AppContext";

// ── Types ──────────────────────────────────────────────────────────────────────

interface CarAngleCaptureViewProps {
  modelUrl: string;
  onComplete: (photos: Partial<CarPhotos>) => void;
  onError?: (message: string) => void;
}

// ── Angle definitions ──────────────────────────────────────────────────────────

const CAPTURE_ANGLES: { key: CarAngle; orbit: string }[] = [
  { key: "frontThreeQuarter", orbit: "315deg 75deg auto" },
  { key: "front",             orbit: "0deg 85deg auto"   },
  { key: "driverSide",        orbit: "270deg 85deg auto" },
  { key: "rear",              orbit: "180deg 85deg auto" },
  { key: "passengerSide",     orbit: "90deg 85deg auto"  },
];

// ── HTML builder ───────────────────────────────────────────────────────────────

function buildCaptureHtml(modelUrl: string): string {
  const anglesJson = JSON.stringify(CAPTURE_ANGLES);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js"></script>
  <script nomodule src="https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer-legacy.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:100%;height:100%;background:#09192A;overflow:hidden}
    model-viewer{width:100%;height:100%;background-color:#09192A;--poster-color:#09192A;}
  </style>
</head>
<body>
  <model-viewer id="mv" src="${modelUrl}"
    camera-controls="false"
    auto-rotate="false"
    shadow-intensity="1"
    environment-image="neutral"
    exposure="1.2"
    alt="Angle capture">
  </model-viewer>
  <script>
    var ANGLES = ${anglesJson};

    function post(data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
    }

    function blobToDataUri(blob) {
      return new Promise(function(resolve) {
        var r = new FileReader();
        r.onloadend = function() { resolve(r.result); };
        r.readAsDataURL(blob);
      });
    }

    function wait(ms) {
      return new Promise(function(r) { setTimeout(r, ms); });
    }

    async function captureAll() {
      var mv = document.getElementById('mv');
      var results = {};
      for (var i = 0; i < ANGLES.length; i++) {
        var entry = ANGLES[i];
        mv.cameraOrbit = entry.orbit;
        await wait(700);
        try {
          var blob = await mv.toBlob({ mimeType: 'image/jpeg', idealAspect: false });
          var dataUri = await blobToDataUri(blob);
          results[entry.key] = dataUri;
        } catch(e) {
          post({ type: 'angle-error', key: entry.key, error: e && e.message ? e.message : String(e) });
        }
      }
      post({ type: 'capture-complete', results: results });
    }

    var mv = document.getElementById('mv');
    mv.addEventListener('load', function() {
      setTimeout(captureAll, 500);
    });
    mv.addEventListener('error', function() {
      post({ type: 'capture-error', error: 'Model failed to load' });
    });
  </script>
</body>
</html>`;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function CarAngleCaptureView({
  modelUrl,
  onComplete,
  onError,
}: CarAngleCaptureViewProps) {
  // Web platform: model-viewer works in iframes but ReactNativeWebView bridge
  // is not available. Defer web support — skip rendering on web.
  if (Platform.OS === "web") return null;

  // Lazy import WebView only on native to avoid bundler issues on web
  const { WebView } = require("react-native-webview");

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data) as {
          type: string;
          results?: Partial<CarPhotos>;
          key?: string;
          error?: string;
        };
        if (msg.type === "capture-complete") {
          onComplete(msg.results ?? {});
        } else if (msg.type === "capture-error") {
          onError?.(msg.error ?? "Capture failed");
        }
        // angle-error: individual angle failed — capture continues, onComplete fires at end
      } catch {
        onError?.("Invalid message from capture WebView");
      }
    },
    [onComplete, onError]
  );

  return (
    <WebView
      style={styles.hidden}
      source={{ html: buildCaptureHtml(modelUrl) }}
      onMessage={handleMessage}
      javaScriptEnabled
      originWhitelist={["*"]}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: "absolute",
    bottom: -2000,
    left: 0,
    width: 320,
    height: 240,
  },
});
