// ============================================================
// AsciiLens — StyleSection Component (AF-108 to AF-111)
// Presets with hover preview + auto-switch to Custom
// ============================================================

import React, { useState } from 'react';

const PRESET_EMOJIS = {
  cyberpunk: '🌆',
  classic: '💻',
  blocky: '🧱',
  minimal: '✨',
};

export default function StyleSection({ activePreset, onSelectPreset, presets }) {
  const [hoveredPreset, setHoveredPreset] = useState(null);

  return (
    <div className="control-section" id="style-section">
      <div className="section-label">STYLE</div>

      <div className="preset-grid">
        {presets.map(preset => (
          <button
            key={preset.id}
            className={`preset-card ${activePreset === preset.id ? 'preset-card--active' : ''}`}
            onClick={() => onSelectPreset(preset.id)}
            onMouseEnter={() => setHoveredPreset(preset.id)}
            onMouseLeave={() => setHoveredPreset(null)}
            id={`preset-${preset.id}`}
          >
            <span className="preset-emoji">{PRESET_EMOJIS[preset.id] || '🎨'}</span>
            <span className="preset-name">{preset.name}</span>

            {/* AF-110: Hover preview with precomputed thumbnail */}
            {hoveredPreset === preset.id && (
              <div className="preset-preview">
                <pre className="preset-preview-text">
                  {preset.charset.slice(0, 12)}
                </pre>
              </div>
            )}
          </button>
        ))}

        {/* AF-111: Custom preset indicator */}
        {activePreset === 'custom' && (
          <div className="preset-card preset-card--active preset-card--custom">
            <span className="preset-emoji">🎛️</span>
            <span className="preset-name">Custom</span>
          </div>
        )}
      </div>
    </div>
  );
}
