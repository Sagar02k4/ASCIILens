// ============================================================
// AsciiLens — LookSection Component (AF-112 to AF-115)
// Color toggle, RGB picker (conditional), invert toggle
// ============================================================

import React from 'react';

export default function LookSection({
  colorEnabled,
  onColorToggle,
  colorValue,
  onColorChange,
  trueColorEnabled,
  onTrueColorToggle,
  inverted,
  onInvertToggle,
}) {
  return (
    <div className="control-section" id="look-section">
      <div className="section-label">LOOK</div>

      {/* AF-021, AF-113: Color toggle */}
      <div className="control-row">
        <span className="control-label">Color</span>
        <div
          className={`toggle-switch ${colorEnabled ? 'active' : ''}`}
          onClick={onColorToggle}
          role="switch"
          aria-checked={colorEnabled}
          id="color-toggle"
        />
      </div>

      {/* AF-024, AF-114: RGB color picker (visible only when color is ON) */}
      {colorEnabled && (
        <div className="color-picker-wrapper" id="color-picker" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="control-row" style={{ marginTop: '4px', marginBottom: '4px' }}>
             <label style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
               <input 
                  type="checkbox" 
                  checked={trueColorEnabled} 
                  onChange={onTrueColorToggle} 
                  style={{ marginRight: '8px', cursor: 'pointer' }} 
               />
               Camera Colors (True Color)
             </label>
          </div>
          {!trueColorEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={colorValue}
                onChange={(e) => onColorChange(e.target.value)}
                className="color-picker-input"
                id="color-picker-input"
              />
              <span className="color-picker-value">{colorValue}</span>
            </div>
          )}
        </div>
      )}

      {/* AF-041, AF-115: Invert toggle */}
      <div className="control-row">
        <span className="control-label">Invert</span>
        <div
          className={`toggle-switch ${inverted ? 'active' : ''}`}
          onClick={onInvertToggle}
          role="switch"
          aria-checked={inverted}
          id="invert-toggle"
        />
      </div>
    </div>
  );
}
