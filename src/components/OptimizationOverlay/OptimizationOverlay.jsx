// ============================================================
// AsciiLens — OptimizationOverlay Component (AF-072 to AF-080)
// Blurred bg + progress + checkmark + success message
// ============================================================

import React, { useState, useEffect } from 'react';
import './OptimizationOverlay.css';

export default function OptimizationOverlay({ isActive, onComplete }) {
  const [stage, setStage] = useState('progress'); // 'progress' | 'complete'
  const [progress, setProgress] = useState(0);

  const onCompleteRef = React.useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isActive) {
      setStage('progress');
      setProgress(0);
      return;
    }

    // Real-time optimization calibration
    const startTime = Date.now();
    const duration = 4500; // 4.5 seconds
    let rafId;
    
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        setStage('complete');
        // Auto transition to LIVE after 1.5s (AF-077)
        setTimeout(() => {
          if (onCompleteRef.current) onCompleteRef.current();
        }, 1500);
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };
    
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="opt-overlay" id="optimization-overlay">
      {/* AF-072: Blurred background */}
      <div className="opt-blur" />

      <div className="opt-content">
        {stage === 'progress' ? (
          <>
            {/* AF-073: "Optimizing…" text */}
            <div className="opt-spinner" />
            <h3 className="opt-title" id="optimizing-text">Optimizing…</h3>

            {/* AF-074: Progress indicator */}
            <div className="opt-progress-track">
              <div
                className="opt-progress-fill"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="opt-desc">Calibrating for your device</p>
          </>
        ) : (
          <>
            {/* AF-075: Checkmark */}
            <div className="opt-checkmark" id="optimization-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* AF-076: "Optimized for your device" */}
            <h3 className="opt-title opt-title--success" id="optimized-message">
              Optimized for your device
            </h3>
          </>
        )}
      </div>
    </div>
  );
}
