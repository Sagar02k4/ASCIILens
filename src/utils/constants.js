// ============================================================
// AsciiLens — All Constants (PRD Hard Requirements)
// ============================================================

// TIMING (HARD REQUIREMENTS - PRD P2, P3)
export const FLASH_DURATION_MS = 100;          // AF-046: Flash is exactly 100ms
export const SHIMMER_DURATION_MS = 250;        // AF-048: Shimmer is exactly 250ms
export const DEGRADE_FPS_THRESHOLD = 20;       // AF-062: <20 FPS triggers degrade
export const STABLE_FPS_THRESHOLD = 30;        // AF-063: ≥30 FPS marks stable
export const DEGRADE_WINDOW_MS = 6000;         // AF-062: 5-7s sustained, using 6s
export const STABLE_WINDOW_MS = 5000;          // AF-063: 5s sustained
export const SCALING_COOLDOWN_MS = 4500;       // AF-065: 4-5s between scaling actions
export const MAX_CAPTURE_HISTORY = 2;          // AF-094 to AF-097: Last 2 captures

// RESOLUTION BOUNDS (AF-066, AF-067)
export const MIN_RESOLUTION = 2;               // AF-066: Lower bound
export const MAX_RESOLUTION = 16;              // AF-067: Upper bound
export const DEFAULT_RESOLUTION_DESKTOP = 8;   // AF-040: Desktop default
export const DEFAULT_RESOLUTION_MOBILE = 4;    // AF-100: Mobile lower default
export const RESOLUTION_STEP = 1;              // AF-064: Step-based scaling

// DENSITY
export const DEFAULT_DENSITY = 50;             // AF-037
export const MIN_DENSITY = 10;
export const MAX_DENSITY = 100;

// PERFORMANCE MONITOR
export const FPS_SAMPLE_SIZE = 60;             // Rolling average window

// DEFAULT PRESET
export const DEFAULT_PRESET = 'cyberpunk';     // AF-015: Cyberpunk is default

// localStorage KEYS (AF-082 to AF-093)
export const LS_KEYS = {
  PRESET: 'asciilens_preset',                 // AF-082
  DENSITY: 'asciilens_density',               // AF-084
  RESOLUTION: 'asciilens_resolution',          // AF-086
  COLOR: 'asciilens_color',                    // AF-088
  CUSTOM_CHAR: 'asciilens_customChar',         // AF-090
  OPTIMIZATION: 'asciilens_optimized',         // AF-092
};

// MOBILE BREAKPOINT
export const MOBILE_BREAKPOINT = 768;          // AF-098

// APP PHASES
export const PHASES = {
  FIRST_TIME: 'first-time',
  OPTIMIZING: 'optimizing',
  LIVE: 'live',
  CAPTURED: 'captured',
  RESULT: 'result',
};

// PERFORMANCE MODES
export const PERF_MODES = {
  STABLE: 'stable',
  DEGRADED: 'degraded',
};

// CHARSET PRESETS
export const PRESET_CHARSETS = [
  { id: 'rich', label: 'Rich', chars: '@#%$&?!*+;:~' },
  { id: 'standard', label: 'Standard', chars: '@%#*+=-:.' },
  { id: 'blocks', label: 'Blocks', chars: '█▓▒░' },
  { id: 'minimal', label: 'Minimal', chars: '.:-=+*#' },
  { id: 'dots', label: 'Dots', chars: '⣿⣷⣯⣟⡿⢿⣻⣽' },
];
