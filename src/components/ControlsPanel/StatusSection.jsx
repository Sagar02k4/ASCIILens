// ============================================================
// AsciiLens — StatusSection Component (AF-123 to AF-125)
// FPS meter + Performance mode label
// ============================================================

import React from 'react';
import { PERF_MODES } from '../../utils/constants.js';

export default function StatusSection({ fps, performanceMode }) {
  const isStable = performanceMode === PERF_MODES.STABLE;

  return (
    <div className="control-section" id="status-section">
      <div className="section-label">STATUS</div>

      {/* AF-061, AF-124: FPS meter */}
      <div className="control-row">
        <span className="control-label">FPS</span>
        <span
          className={`status-fps ${fps < 20 ? 'status-fps--low' : fps >= 30 ? 'status-fps--good' : 'status-fps--mid'}`}
          id="fps-meter"
        >
          {fps}
        </span>
      </div>

      {/* AF-068, AF-125: Performance mode label */}
      <div className="control-row">
        <span className="control-label">Performance</span>
        <span
          className={`status-mode ${isStable ? 'status-mode--stable' : 'status-mode--degraded'}`}
          id="performance-mode"
        >
          {isStable ? '● Stable' : '● Degraded'}
        </span>
      </div>
    </div>
  );
}
