// ============================================================
// AsciiLens — ResultOverlay Component (AF-054 to AF-059, AF-144 to AF-148)
// Captured result: copy compact/full, download, retake
// ============================================================

import React, { useState } from 'react';
import './ResultOverlay.css';

export default function ResultOverlay({
  frame,
  onCopyCompact,
  onCopyFull,
  onDownload,
  onRetake,
}) {
  const [copyFeedback, setCopyFeedback] = useState('');

  const handleCopy = async (type) => {
    const success = type === 'compact' ? await onCopyCompact() : await onCopyFull();
    setCopyFeedback(success ? `Copied ${type}!` : 'Copy failed');
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  if (!frame) return null;

  return (
    <div className="result-overlay" id="result-overlay">
      <div className="result-actions">
        {/* AF-054, AF-055: Copy compact */}
        <button
          className="btn btn-secondary result-btn"
          onClick={() => handleCopy('compact')}
          id="copy-compact-btn"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy Compact
        </button>

        {/* AF-056, AF-057: Copy full */}
        <button
          className="btn btn-secondary result-btn"
          onClick={() => handleCopy('full')}
          id="copy-full-btn"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy Full
        </button>

        {/* AF-058, AF-059: Download image */}
        <button
          className="btn btn-secondary result-btn"
          onClick={onDownload}
          id="download-btn"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </button>

        {/* AF-147, AF-148: Retake */}
        <button
          className="btn btn-primary result-btn"
          onClick={onRetake}
          id="retake-btn"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
          </svg>
          Retake
        </button>
      </div>

      {/* Copy feedback toast */}
      {copyFeedback && (
        <div className="result-toast">{copyFeedback}</div>
      )}
    </div>
  );
}
