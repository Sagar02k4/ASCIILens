// ============================================================
// AsciiLens — QualitySection Component (AF-120 to AF-122)
// Density slider + Resolution slider
// ============================================================

import React from 'react';
import { MIN_DENSITY, MAX_DENSITY, MIN_RESOLUTION, MAX_RESOLUTION } from '../../utils/constants.js';

export default function QualitySection({
  density,
  onDensityChange,
  resolution,
  onResolutionChange,
}) {
  return (
    <div className="control-section" id="quality-section">
      <div className="section-label">QUALITY</div>

      {/* AF-037, AF-121: Density slider */}
      <div className="slider-group">
        <div className="control-row">
          <span className="control-label">Density</span>
          <span className="control-value">{density}</span>
        </div>
        <input
          type="range"
          className="custom-slider"
          min={MIN_DENSITY}
          max={MAX_DENSITY}
          value={density}
          onChange={(e) => onDensityChange(parseInt(e.target.value, 10))}
          id="density-slider"
        />
      </div>

      {/* AF-039, AF-122: Resolution slider */}
      <div className="slider-group">
        <div className="control-row">
          <span className="control-label">Resolution</span>
          <span className="control-value">{resolution}</span>
        </div>
        <input
          type="range"
          className="custom-slider"
          min={MIN_RESOLUTION}
          max={MAX_RESOLUTION}
          value={resolution}
          onChange={(e) => onResolutionChange(parseInt(e.target.value, 10))}
          id="resolution-slider"
        />
      </div>
    </div>
  );
}
