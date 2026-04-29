// ============================================================
// AsciiLens — CharacterSection Component (AF-116 to AF-119)
// Preset characters + single-character input
// ============================================================

import React from 'react';
import { PRESET_CHARSETS } from '../../utils/constants.js';

export default function CharacterSection({
  activeCharset,
  customChar,
  onSelectCharset,
  onCustomCharChange,
}) {
  return (
    <div className="control-section" id="character-section">
      <div className="section-label">CHARACTER</div>

      {/* AF-117: Preset character options */}
      <div className="charset-grid">
        {PRESET_CHARSETS.map(cs => (
          <button
            key={cs.id}
            className={`charset-btn ${activeCharset === cs.id ? 'charset-btn--active' : ''}`}
            onClick={() => onSelectCharset(cs.id)}
            title={cs.chars}
            id={`charset-${cs.id}`}
          >
            <span className="charset-preview">{cs.chars.slice(0, 3)}</span>
            <span className="charset-label">{cs.label}</span>
          </button>
        ))}
      </div>

      {/* AF-032, AF-033, AF-118: Single-character input */}
      <div className="custom-char-row">
        <span className="control-label">Custom Character</span>
        <input
          type="text"
          className="custom-char-input"
          value={customChar}
          onChange={(e) => {
            // AF-033: Only allow 1 character
            const val = e.target.value.slice(-1);
            onCustomCharChange(val);
          }}
          maxLength={1}
          placeholder="?"
          id="custom-char-input"
        />
      </div>
    </div>
  );
}
