// ============================================================
// AsciiLens — FirstTimeFlow Component (AF-069 to AF-071, AF-135 to AF-138)
// Camera permission + Optimize/Default choice
// ============================================================

import React from 'react';
import './FirstTimeFlow.css';

export default function FirstTimeFlow({
  cameraPermission,
  onRequestPermission,
  onOptimize,
  onDefault,
  errorMessage,
}) {
  return (
    <div className="ftf-container" id="first-time-flow">
      <div className="ftf-card">
        {/* Logo */}
        <div className="ftf-logo">
          <span className="ftf-logo-char">A</span>
          <span className="ftf-logo-text">AsciiLens</span>
        </div>

        <p className="ftf-tagline">
          Turn your camera into customizable ASCII art—fast, smooth, and expressive.
        </p>

        {/* Step 1: Camera Permission (AF-135) */}
        {cameraPermission !== 'granted' && (
          <div className="ftf-step">
            <div className="ftf-step-icon">📷</div>
            <h3 className="ftf-step-title">Camera Access Required</h3>
            <p className="ftf-step-desc">
              AsciiLens needs your camera to create real-time ASCII art.
            </p>

            {/* AF-136: Error message if denied */}
            {cameraPermission === 'denied' && (
              <div className="ftf-error" id="camera-error">
                {errorMessage || 'Enable camera from browser settings'}
              </div>
            )}

            <button
              className="btn btn-primary ftf-btn"
              onClick={onRequestPermission}
              id="request-camera-btn"
            >
              {cameraPermission === 'denied' ? 'Try Again' : 'Enable Camera'}
            </button>
          </div>
        )}

        {/* Step 2: Optimize/Default choice (AF-069 to AF-071) */}
        {cameraPermission === 'granted' && (
          <div className="ftf-step ftf-step--choice">
            <div className="ftf-step-icon">⚡</div>
            <h3 className="ftf-step-title">Optimize for Your Device?</h3>
            <p className="ftf-step-desc">
              We can calibrate settings for the best performance on your device.
            </p>

            <div className="ftf-choice-btns">
              {/* AF-070: Optimize is primary CTA */}
              <button
                className="btn btn-primary ftf-btn ftf-btn--primary"
                onClick={onOptimize}
                id="optimize-btn"
              >
                ⚡ Optimize
              </button>

              {/* AF-071: Default is secondary */}
              <button
                className="btn btn-secondary ftf-btn"
                onClick={onDefault}
                id="default-btn"
              >
                Use Default
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
