import React, { useEffect, useMemo, useRef, useState } from "react";
import { Platform, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

interface ModelViewerProps {
  html: string;
  style?: StyleProp<ViewStyle>;
  scrollEnabled?: boolean;
  cacheKey?: string;
  onProgressChange?: (progress: number) => void;
  onLoadingStateChange?: (isLoading: boolean) => void;
  showLoadingOverlay?: boolean;
}

const loadedModelCache = new Set<string>();
const STALLED_PROGRESS_TIMEOUT_MS = 15000;
const CONNECTION_CHECK_TIMEOUT_MS = 8000;

function extractModelSrcFromHtml(html: string): string | null {
  const match = html.match(/<model-viewer[^>]*\ssrc=\"([^\"]+)\"/i);
  return match?.[1] ?? null;
}

export default function ModelViewer({
  html,
  style,
  scrollEnabled,
  cacheKey,
  onProgressChange,
  onLoadingStateChange,
  showLoadingOverlay = true,
}: ModelViewerProps) {
  const derivedSrc = useMemo(() => extractModelSrcFromHtml(html), [html]);
  const resolvedCacheKey = cacheKey ?? derivedSrc ?? "";
  const initiallyCached = resolvedCacheKey ? loadedModelCache.has(resolvedCacheKey) : false;

  const [progress, setProgress] = useState(initiallyCached ? 1 : 0);
  const [showLoader, setShowLoader] = useState(!initiallyCached);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loadingNotice, setLoadingNotice] = useState<string | null>(null);
  const modelReadyRef = useRef(initiallyCached);

  const loadingPercent = Math.max(0, Math.min(100, Math.round(progress * 100)));

  const instrumentedHTML = useMemo(() => {
    const injection = `
<script>
(function () {
  var didComplete = false;

  function post(type, payload) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
    }
  }

  function bindModelViewer() {
    var mv = document.querySelector('model-viewer');
    if (!mv) {
      post('mv-error', { message: 'model-viewer element not found' });
      return;
    }

    if (!window.customElements || !window.customElements.get('model-viewer')) {
      post('mv-error', {
        message: 'model-viewer library failed to load. Check internet/CDN access to jsdelivr.'
      });
      return;
    }

    function enforceTransparentLayers() {
      try {
        mv.style.background = 'transparent';
        mv.style.backgroundColor = 'transparent';
        mv.style.setProperty('--poster-color', 'transparent');
        var root = mv.shadowRoot;
        if (!root) {
          return;
        }
        var styleEl = root.getElementById('mv-transparent-style');
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = 'mv-transparent-style';
          styleEl.textContent = ':host{background:transparent !important;} .container, .slot.poster, canvas{background:transparent !important;}';
          root.appendChild(styleEl);
        }
      } catch (err) {
        // Best-effort transparency patch; ignore browser-specific access issues.
      }
    }

    enforceTransparentLayers();
    setTimeout(enforceTransparentLayers, 200);
    setTimeout(enforceTransparentLayers, 800);

    post('mv-init', { src: mv.getAttribute('src') || '' });

    mv.addEventListener('progress', function (e) {
      var p = e && e.detail && typeof e.detail.totalProgress === 'number' ? e.detail.totalProgress : 0;
      post('mv-progress', { progress: p });
    });

    mv.addEventListener('load', function () {
      enforceTransparentLayers();
      didComplete = true;
      post('mv-ready', { progress: 1 });
    });

    mv.addEventListener('error', function (e) {
      didComplete = true;
      var message = 'model-viewer emitted an error event';
      if (e && e.detail && e.detail.type) {
        message = String(e.detail.type);
      }
      post('mv-error', { message: message, src: mv.getAttribute('src') || '' });
    });

    setTimeout(function () {
      if (!didComplete) {
        post('mv-slow', { message: 'Large model still loading...', src: mv.getAttribute('src') || '' });
      }
    }, 30000);
  }

  window.addEventListener('error', function (e) {
    var message = e && e.message ? e.message : 'window error';
    post('mv-error', { message: message });
  });

  window.addEventListener('unhandledrejection', function (e) {
    var reason = e && e.reason ? String(e.reason) : 'unhandled rejection';
    post('mv-error', { message: reason });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindModelViewer);
  } else {
    bindModelViewer();
  }
})();
</script>`;

    return html.replace('</body>', `${injection}</body>`);
  }, [html]);

  useEffect(() => {
    if (resolvedCacheKey && loadedModelCache.has(resolvedCacheKey)) {
      modelReadyRef.current = true;
      setProgress(1);
      setShowLoader(false);
      setErrorText(null);
      setLoadingNotice(null);
      return;
    }
    modelReadyRef.current = false;
    setProgress(0);
    setShowLoader(true);
    setErrorText(null);
    setLoadingNotice(null);
  }, [resolvedCacheKey]);

  useEffect(() => {
    if (Platform.OS !== "web" || !showLoader) {
      return;
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.92) {
          return prev;
        }
        return Math.min(0.92, prev + 0.04);
      });
    }, 120);

    return () => clearInterval(timer);
  }, [showLoader]);

  useEffect(() => {
    onProgressChange?.(progress);
  }, [onProgressChange, progress]);

  useEffect(() => {
    onLoadingStateChange?.(showLoader);
  }, [onLoadingStateChange, showLoader]);

  useEffect(() => {
    if (Platform.OS === "web" || !showLoader || !derivedSrc || !/^https?:\/\//.test(derivedSrc)) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;

      setLoadingNotice("Checking model connection...");

      const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      const timeoutId = controller
        ? setTimeout(() => {
            controller.abort();
          }, CONNECTION_CHECK_TIMEOUT_MS)
        : null;

      fetch(derivedSrc, {
        method: "HEAD",
        ...(controller ? { signal: controller.signal } : {}),
      })
        .then((response) => {
          if (timeoutId) clearTimeout(timeoutId);
          if (cancelled) return;
          if (response.ok) {
            setLoadingNotice("Model downloaded slowly. Please wait...");
            return;
          }
          setErrorText(`Model URL returned HTTP ${response.status}\nSource: ${derivedSrc}`);
          setShowLoader(false);
          setLoadingNotice(null);
        })
        .catch(() => {
          if (timeoutId) clearTimeout(timeoutId);
          if (cancelled) return;
          setErrorText(
            `Could not reach model URL within ${Math.round(CONNECTION_CHECK_TIMEOUT_MS / 1000)}s. If you changed Wi-Fi, restart Expo with EXPO_PUBLIC_API_BASE_URL set to your Mac's current IP.\nSource: ${derivedSrc}`
          );
          setShowLoader(false);
          setLoadingNotice(null);
        });
    }, STALLED_PROGRESS_TIMEOUT_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [derivedSrc, showLoader]);

  if (Platform.OS === "web") {
    return (
      <View style={[styles.fill, style]}>
        <iframe
          srcDoc={instrumentedHTML}
          style={showLoader ? hiddenIframeStyle : iframeStyle}
          sandbox="allow-scripts allow-same-origin"
          scrolling={scrollEnabled === false ? "no" : "auto"}
          onLoad={() => {
            setProgress(1);
            setShowLoader(false);
            setLoadingNotice(null);
          }}
        />
        {errorText && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorTitle}>3D Render Error</Text>
            <Text style={styles.errorBody}>{errorText}</Text>
          </View>
        )}
        {showLoader && showLoadingOverlay && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Loading 3D... {loadingPercent}%</Text>
            <View style={styles.loadingTrack}>
              <View style={[styles.loadingFill, { width: `${loadingPercent}%` }]} />
            </View>
          </View>
        )}
      </View>
    );
  }

  const { WebView } = require("react-native-webview");
  const preContentTransparencyScript = `
    (function() {
      try {
        document.documentElement.style.background = 'transparent';
        document.documentElement.style.backgroundColor = 'transparent';
        document.body && (document.body.style.background = 'transparent');
        document.body && (document.body.style.backgroundColor = 'transparent');
        var style = document.createElement('style');
        style.textContent = 'html,body{background:transparent !important;background-color:transparent !important;}';
        (document.head || document.documentElement).appendChild(style);
      } catch (e) {}
      true;
    })();
  `;
  const injectedHTML = instrumentedHTML.replace(
    '<body>',
    '<body style="background-color: transparent !important;">'
  );
  return (
    <View style={[styles.webviewContainer, style]}>
      <WebView
        source={{ html: injectedHTML }}
        style={styles.fill}
        containerStyle={styles.webviewTransparentContainer}
        originWhitelist={["*"]}
        javaScriptEnabled
        injectedJavaScriptBeforeContentLoaded={preContentTransparencyScript}
        injectedJavaScriptBeforeContentLoadedForMainFrameOnly
        domStorageEnabled
        cacheEnabled
        allowFileAccess
        mixedContentMode="always"
        scrollEnabled={scrollEnabled}
        opaque={false}
        backgroundColor="transparent"
        onLoadStart={() => {
          modelReadyRef.current = false;
          if (resolvedCacheKey && loadedModelCache.has(resolvedCacheKey)) {
            modelReadyRef.current = true;
            setProgress(1);
            setShowLoader(false);
            setErrorText(null);
            setLoadingNotice(null);
            return;
          }
          setProgress(0.05);
          setShowLoader(true);
          setErrorText(null);
          setLoadingNotice(null);
        }}
        onLoadProgress={(event: { nativeEvent: { progress: number } }) => {
          const p = event.nativeEvent.progress;
          if (typeof p === "number") {
            setProgress((prev) => Math.max(prev, Math.min(0.9, p)));
          }
        }}
        onLoadEnd={() => {
          setProgress((prev) => Math.max(prev, 0.9));
        }}
        onMessage={(event: { nativeEvent: { data: string } }) => {
          try {
            const data = JSON.parse(event.nativeEvent.data) as {
              type?: string;
              payload?: { progress?: number; message?: string; src?: string };
            };
            if (data.type === "mv-progress") {
              const next = typeof data.payload?.progress === "number" ? data.payload.progress : 0;
              setProgress((prev) => Math.max(prev, Math.max(0, Math.min(1, next))));
            }
            if (data.type === "mv-ready") {
              modelReadyRef.current = true;
              if (resolvedCacheKey) {
                loadedModelCache.add(resolvedCacheKey);
              }
              setProgress(1);
              setShowLoader(false);
              setErrorText(null);
              setLoadingNotice(null);
            }
            if (data.type === "mv-slow") {
              setLoadingNotice(data.payload?.message ?? "Still loading model...");
            }
            if (data.type === "mv-error") {
              if (modelReadyRef.current) {
                return;
              }
              const message = data.payload?.message ?? "Unknown model-viewer error";
              const src = data.payload?.src ? `\nSource: ${data.payload.src}` : "";
              setErrorText(`${message}${src}`);
              setShowLoader(false);
              setLoadingNotice(null);
            }
          } catch {
            // Ignore malformed bridge messages from injected HTML.
          }
        }}
        onError={(event: { nativeEvent: { description?: string } }) => {
          const message = event.nativeEvent.description ?? "WebView failed to load";
          setErrorText(message);
          setShowLoader(false);
          setLoadingNotice(null);
        }}
        onHttpError={(event: { nativeEvent: { statusCode: number; description?: string } }) => {
          const message = `WebView HTTP ${event.nativeEvent.statusCode}${event.nativeEvent.description ? `: ${event.nativeEvent.description}` : ""}`;
          setErrorText(message);
          setShowLoader(false);
          setLoadingNotice(null);
        }}
      />
      {errorText && (
        <View style={styles.errorOverlay} pointerEvents="none">
          <Text style={styles.errorTitle}>3D Render Error</Text>
          <Text style={styles.errorBody}>{errorText}</Text>
        </View>
      )}
      {showLoader && showLoadingOverlay && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <Text style={styles.loadingText}>Loading 3D... {loadingPercent}%</Text>
          {loadingNotice && <Text style={styles.loadingSubText}>{loadingNotice}</Text>}
          <View style={styles.loadingTrack}>
            <View style={[styles.loadingFill, { width: `${loadingPercent}%` }]} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "transparent",
  },
  webviewContainer: {
    backgroundColor: "transparent",
    position: "relative",
  },
  webviewTransparentContainer: {
    backgroundColor: "transparent",
  },
  loadingOverlay: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "rgba(9,25,42,0.82)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  loadingSubText: {
    color: "#B8D7E8",
    fontSize: 11,
  },
  loadingTrack: {
    width: "100%",
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.24)",
    overflow: "hidden",
  },
  loadingFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#3ECF8E",
  },
  errorOverlay: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 12,
    backgroundColor: "rgba(115, 26, 43, 0.9)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,119,141,0.8)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  errorTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  errorBody: {
    color: "#FFDDE3",
    fontSize: 11,
  },
  hiddenWebview: {
    opacity: 0,
  },
});

const iframeStyle: React.CSSProperties = {
  border: "none",
  width: "100%",
  height: "100%",
  display: "block",
};

const hiddenIframeStyle: React.CSSProperties = {
  ...iframeStyle,
  opacity: 0,
};
