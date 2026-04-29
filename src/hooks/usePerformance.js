// ============================================================
// AsciiLens — usePerformance Hook (AF-060 to AF-068)
// React state wrapper around WASM PerformanceMonitor
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  perfGetFPS,
  perfGetRecommendedResolution,
  perfGetMode,
  initPerformanceMonitor,
  perfReset,
} from '../engine/wasmLoader.js';
import { PERF_MODES } from '../utils/constants.js';

export function usePerformance(initialResolution, minRes, maxRes, wasmReady) {
  const [fps, setFps] = useState(0);
  const [mode, setMode] = useState(PERF_MODES.STABLE);
  const [recommendedResolution, setRecommendedResolution] = useState(initialResolution);
  const intervalRef = useRef(null);

  // Initialize WASM performance monitor
  useEffect(() => {
    if (wasmReady) {
      initPerformanceMonitor(minRes, maxRes, initialResolution);
    }
  }, [wasmReady, minRes, maxRes, initialResolution]);

  // Poll WASM performance state at regular intervals
  useEffect(() => {
    if (!wasmReady) return;

    intervalRef.current = setInterval(() => {
      const currentFps = perfGetFPS();
      const currentRes = perfGetRecommendedResolution();
      const currentMode = perfGetMode();

      setFps(Math.round(currentFps));
      setRecommendedResolution(currentRes);
      setMode(currentMode === 0 ? PERF_MODES.STABLE : PERF_MODES.DEGRADED);
    }, 500); // Update UI twice per second

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [wasmReady]);

  const resetPerformance = useCallback((resolution) => {
    if (wasmReady) {
      perfReset(resolution);
      setRecommendedResolution(resolution);
      setMode(PERF_MODES.STABLE);
    }
  }, [wasmReady]);

  return {
    fps,
    mode,
    recommendedResolution,
    resetPerformance,
  };
}
