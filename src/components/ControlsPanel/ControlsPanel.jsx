// ============================================================
// AsciiLens — ControlsPanel Component (AF-103, AF-104)
// Collapsible right panel (desktop), non-blocking
// ============================================================

import React from 'react';
import './ControlsPanel.css';
import './sections.css';

export default function ControlsPanel({ isOpen, onToggle, children }) {
  return (
    <>
      {/* Toggle button */}
      <button
        className={`controls-toggle ${isOpen ? 'controls-toggle--open' : ''}`}
        onClick={onToggle}
        id="controls-toggle"
        aria-label={isOpen ? 'Close controls' : 'Open controls'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      </button>

      {/* Panel */}
      <aside
        className={`controls-panel ${isOpen ? 'controls-panel--open' : 'controls-panel--closed'}`}
        id="controls-panel"
      >
        <div className="controls-panel-header">
          <h2 className="controls-panel-title">Controls</h2>
          <button
            className="btn-icon controls-close"
            onClick={onToggle}
            aria-label="Close controls"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="controls-panel-content">
          {children}
        </div>
      </aside>
    </>
  );
}
