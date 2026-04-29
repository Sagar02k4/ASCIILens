// ============================================================
// AsciiLens — SettingsMenu Component (AF-126 to AF-134)
// Settings modal with optimization, reset, sound, timestamp
// ============================================================

import React from 'react';
import { timeAgo } from '../../utils/helpers.js';
import './SettingsMenu.css';

export default function SettingsMenu({
  isOpen,
  onClose,
  onRunOptimization,
  onReset,
  soundEnabled,
  onSoundToggle,
  optimizedAt,
}) {
  if (!isOpen) return null;

  return (
    <div className="settings-backdrop" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()} id="settings-menu">
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="settings-content">
          {/* AF-128, AF-132: Run Performance Optimization */}
          <button
            className="btn btn-primary settings-action"
            onClick={onRunOptimization}
            id="run-optimization-btn"
          >
            ⚡ Run Performance Optimization
          </button>

          {/* AF-131: Timestamp */}
          {optimizedAt && (
            <p className="settings-timestamp" id="optimization-timestamp">
              Optimized {timeAgo(optimizedAt)}
            </p>
          )}

          <div className="settings-divider" />

          {/* AF-130, AF-134: Sound toggle */}
          <div className="control-row">
            <span className="control-label">Capture Sound</span>
            <div
              className={`toggle-switch ${soundEnabled ? 'active' : ''}`}
              onClick={onSoundToggle}
              role="switch"
              aria-checked={soundEnabled}
              id="sound-toggle"
            />
          </div>

          <div className="settings-divider" />

          {/* AF-129, AF-133: Reset to default */}
          <button
            className="btn btn-danger settings-action"
            onClick={onReset}
            id="reset-btn"
          >
            ↺ Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}
