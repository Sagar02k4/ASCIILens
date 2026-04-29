// ============================================================
// AsciiLens — FlashEffect Component (AF-045 to AF-049)
// Flash (100ms) → Shimmer (250ms), sequential
// ============================================================

import React from 'react';
import './FlashEffect.css';

export default function FlashEffect({ isFlashing, isShimmering }) {
  if (!isFlashing && !isShimmering) return null;

  return (
    <>
      {/* AF-045, AF-046: White flash overlay, 100ms */}
      {isFlashing && (
        <div className="flash-overlay" id="flash-overlay" />
      )}

      {/* AF-047, AF-048: Shimmer effect, 250ms, starts AFTER flash */}
      {isShimmering && (
        <div className="shimmer-overlay" id="shimmer-overlay" />
      )}
    </>
  );
}
