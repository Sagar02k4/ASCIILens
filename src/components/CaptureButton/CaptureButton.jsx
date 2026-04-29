// ============================================================
// AsciiLens — CaptureButton Component (AF-044, AF-099)
// Large capture button, thumb-friendly on mobile
// ============================================================

import React from 'react';
import './CaptureButton.css';

export default function CaptureButton({ onClick, disabled, isMobile, historyFrames = [], onViewHistory }) {
  return (
    <div className={`capture-btn-wrapper ${isMobile ? 'capture-btn-wrapper--mobile' : ''}`}>
      {/* History Thumbnails */}
      {historyFrames.map((frame, index) => {
        const reverseIndex = historyFrames.length - 1 - index;
        return (
          <button 
            key={`history-${index}`}
            className="gallery-preview-btn" 
            onClick={() => onViewHistory(frame)}
            aria-label={`View captured photo ${index + 1}`}
            style={{ right: `calc(100% + ${16 + reverseIndex * 56}px)` }}
          >
            <div 
              className="gallery-preview-html" 
              dangerouslySetInnerHTML={{ __html: frame.html }} 
            />
          </button>
        );
      })}

      {/* Main Capture Button */}
      <button
        className={`capture-btn ${disabled ? 'capture-btn--disabled' : ''}`}
        onClick={onClick}
        disabled={disabled}
        id="capture-button"
        aria-label="Capture ASCII art"
      >
        <div className="capture-btn-inner">
          <div className="capture-btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="4"/>
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
}
