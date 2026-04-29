// ============================================================
// AsciiLens — CameraPanel Component
// AF-006, AF-009, AF-010, AF-052, AF-053, AF-101
// ASCII preview + LIVE pulse indicator
// ============================================================

import React from 'react';
import './CameraPanel.css';

export default function CameraPanel({ frame, isLive, isCaptured, isMobile }) {
  return (
    <div className={`camera-panel ${isMobile ? 'camera-panel--mobile' : ''}`} id="camera-panel">
      {/* AF-009, AF-010: LIVE pulse indicator */}
      {isLive && !isCaptured && (
        <div className="live-indicator" id="live-indicator">
          <span className="live-dot"></span>
          <span className="live-text">LIVE</span>
        </div>
      )}

      {/* AF-052: "This is captured (not live)" message */}
      {isCaptured && (
        <div className="captured-indicator" id="captured-indicator">
          <span className="captured-text">This is captured (not live)</span>
        </div>
      )}

      {/* AF-006: ASCII preview in monospace */}
      <div className="ascii-output" id="ascii-output">
        {frame ? (
          <pre
            className="ascii-pre"
            dangerouslySetInnerHTML={{ __html: frame.html }}
            style={{ '--cols': frame.cols }}
          />
        ) : (
          <div className="ascii-placeholder">
            <div className="ascii-placeholder-icon">⌘</div>
            <p>Waiting for camera...</p>
          </div>
        )}
      </div>
    </div>
  );
}
