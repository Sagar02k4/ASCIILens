// ============================================================
// AsciiLens — useRenderLoop Hook
// AF-002, AF-003, AF-007, AF-008, AF-155, AF-158
// requestAnimationFrame loop: Video → Canvas → PixelBuffer → WASM → ASCII
// ============================================================

import { useRef, useEffect, useCallback, useState } from 'react';
import { processFrame, perfTick } from '../engine/wasmLoader.js';

export function useRenderLoop({
  videoRef,
  settings,
  paused,
  wasmReady,
  onFrame,
  renderUI = true,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Create hidden canvas on mount
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    canvasRef.current = canvas;
  }, []);

  // Main render loop
  const renderLoop = useCallback((timestamp) => {
    if (paused || !wasmReady) {
      rafRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    // AF-007: requestAnimationFrame is the loop mechanism
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Match canvas to video dimensions
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    // AF-002: Draw video frame to hidden canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // AF-003: Extract pixel buffer
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Tick performance monitor
    perfTick(timestamp);

    // AF-004, AF-005: Pass to WASM, receive ASCII
    const frame = processFrame(
      imageData.data,
      canvas.width,
      canvas.height,
      settings
    );

    if (frame) {
      if (renderUI) {
        setCurrentFrame(frame);
      }
      if (onFrame) onFrame(frame);
    }

    // Continue loop
    rafRef.current = requestAnimationFrame(renderLoop);
  }, [videoRef, settings, paused, wasmReady, onFrame, renderUI]);

  // Start/stop loop
  useEffect(() => {
    if (wasmReady) {
      setIsRunning(true);
      rafRef.current = requestAnimationFrame(renderLoop);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      setIsRunning(false);
    };
  }, [renderLoop, wasmReady]);

  return {
    currentFrame,
    isRunning,
    canvasRef,
  };
}
