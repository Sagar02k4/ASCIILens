// ============================================================
// AsciiLens — useCapture Hook
// AF-044 to AF-053, AF-054 to AF-059, AF-094 to AF-097, AF-134
// Manages: flash→shimmer→freeze→result, export, history
// ============================================================

import { useState, useCallback, useRef } from 'react';
import { FLASH_DURATION_MS, SHIMMER_DURATION_MS, MAX_CAPTURE_HISTORY } from '../utils/constants.js';

export function useCapture({ currentFrame, onCaptureStart, onCaptureComplete, soundEnabled }) {
  const [isFlashing, setIsFlashing] = useState(false);      // AF-046
  const [isShimmering, setIsShimmering] = useState(false);   // AF-048
  const [capturedFrame, setCapturedFrame] = useState(null);  // AF-050
  const [captureHistory, setCaptureHistory] = useState([]);  // AF-094 to AF-097
  const captureInProgress = useRef(false);

  // AF-044: Trigger capture flow
  const triggerCapture = useCallback(() => {
    if (captureInProgress.current || !currentFrame) return;
    captureInProgress.current = true;

    // Freeze the current frame immediately
    const frozenFrame = { ...currentFrame };

    // AF-134: Play sound if enabled
    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      } catch (e) {
        // Audio not supported, continue silently
      }
    }

    // AF-045, AF-046: Flash effect (100ms)
    setIsFlashing(true);

    setTimeout(() => {
      // AF-046: Flash ends at exactly 100ms
      setIsFlashing(false);

      // AF-047, AF-048, AF-049: Shimmer starts AFTER flash ends (250ms)
      setIsShimmering(true);

      setTimeout(() => {
        // AF-048: Shimmer ends at exactly 250ms after it started
        setIsShimmering(false);

        // AF-050: Freeze frame
        setCapturedFrame(frozenFrame);

        // AF-051: Camera pauses (via callback)
        if (onCaptureStart) onCaptureStart();

        // AF-094 to AF-097: Add to history (max 2, silent replacement)
        setCaptureHistory(prev => {
          const newHistory = [...prev, frozenFrame];
          // AF-096, AF-097: Silent replacement — keep only last 2
          if (newHistory.length > MAX_CAPTURE_HISTORY) {
            return newHistory.slice(-MAX_CAPTURE_HISTORY);
          }
          return newHistory;
        });

        if (onCaptureComplete) onCaptureComplete(frozenFrame);
        captureInProgress.current = false;
      }, SHIMMER_DURATION_MS); // AF-048: exactly 250ms

    }, FLASH_DURATION_MS); // AF-046: exactly 100ms

  }, [currentFrame, onCaptureStart, onCaptureComplete, soundEnabled]);

  // AF-148: Retake — return to live
  const retake = useCallback(() => {
    setCapturedFrame(null);
  }, []);

  const viewHistoryFrame = useCallback((frame) => {
    setCapturedFrame(frame);
  }, []);

  // AF-055: Copy compact ASCII
  const copyCompact = useCallback(async () => {
    if (capturedFrame?.compactText) {
      try {
        await navigator.clipboard.writeText(capturedFrame.compactText);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, [capturedFrame]);

  // AF-057: Copy full ASCII
  const copyFull = useCallback(async () => {
    if (capturedFrame?.fullText) {
      try {
        await navigator.clipboard.writeText(capturedFrame.fullText);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, [capturedFrame]);

  // AF-059: Download as image
  const downloadImage = useCallback(() => {
    if (!capturedFrame) return;

    // Create a canvas and render the ASCII art as an image
    const canvas = document.createElement('canvas');
    const fontSize = 10;
    const lineHeight = fontSize * 1.2;
    const charWidth = fontSize * 0.6;

    canvas.width = capturedFrame.cols * charWidth + 20;
    canvas.height = capturedFrame.rows * lineHeight + 20;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
    ctx.textBaseline = 'top';

    // Parse the HTML to extract chars and colors
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = capturedFrame.html;
    const spans = tempDiv.querySelectorAll('span');

    let x = 10;
    let y = 10;
    let col = 0;

    spans.forEach(span => {
      ctx.fillStyle = span.style.color || '#00ff00';
      const char = span.textContent === '\u00a0' ? ' ' : span.textContent;
      ctx.fillText(char, x, y);
      x += charWidth;
      col++;
      if (col >= capturedFrame.cols) {
        col = 0;
        x = 10;
        y += lineHeight;
      }
    });

    // Download
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asciilens-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, [capturedFrame]);

  return {
    triggerCapture,
    isFlashing,
    isShimmering,
    capturedFrame,
    captureHistory,
    retake,
    viewHistoryFrame,
    copyCompact,
    copyFull,
    downloadImage,
  };
}
