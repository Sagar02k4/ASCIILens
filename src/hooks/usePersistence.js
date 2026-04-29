// ============================================================
// AsciiLens — usePersistence Hook (AF-082 to AF-093, AF-138)
// localStorage save/restore for all persisted settings
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { LS_KEYS, DEFAULT_PRESET, DEFAULT_DENSITY, DEFAULT_RESOLUTION_DESKTOP } from '../utils/constants.js';

function loadJSON(key) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[AsciiLens] Failed to save to localStorage:', e);
  }
}

export function usePersistence() {
  const [isFirstVisit, setIsFirstVisit] = useState(true); // AF-138
  const [savedSettings, setSavedSettings] = useState(null);
  const initialized = useRef(false);

  // Load on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // AF-138: Detect first visit
    const hasVisited = localStorage.getItem(LS_KEYS.PRESET) !== null;
    setIsFirstVisit(!hasVisited);

    // Restore all settings
    const settings = {
      preset: loadJSON(LS_KEYS.PRESET) || DEFAULT_PRESET,                // AF-083
      density: loadJSON(LS_KEYS.DENSITY) ?? DEFAULT_DENSITY,              // AF-085
      resolution: loadJSON(LS_KEYS.RESOLUTION) ?? DEFAULT_RESOLUTION_DESKTOP, // AF-087
      color: loadJSON(LS_KEYS.COLOR) || { enabled: false, value: '#00ff00', trueColor: false }, // AF-089
      customChar: loadJSON(LS_KEYS.CUSTOM_CHAR) || { enabled: false, value: '' }, // AF-091
      optimization: loadJSON(LS_KEYS.OPTIMIZATION) || { status: false, timestamp: null }, // AF-093
    };

    setSavedSettings(settings);
  }, []);

  // AF-082: Save preset
  const savePreset = useCallback((preset) => {
    saveJSON(LS_KEYS.PRESET, preset);
  }, []);

  // AF-084: Save density
  const saveDensity = useCallback((density) => {
    saveJSON(LS_KEYS.DENSITY, density);
  }, []);

  // AF-086: Save resolution
  const saveResolution = useCallback((resolution) => {
    saveJSON(LS_KEYS.RESOLUTION, resolution);
  }, []);

  // AF-088: Save color
  const saveColor = useCallback((enabled, value, trueColor = false) => {
    saveJSON(LS_KEYS.COLOR, { enabled, value, trueColor });
  }, []);

  // AF-090: Save custom character
  const saveCustomChar = useCallback((enabled, value) => {
    saveJSON(LS_KEYS.CUSTOM_CHAR, { enabled, value });
  }, []);

  // AF-092: Save optimization status
  const saveOptimization = useCallback((status, timestamp) => {
    saveJSON(LS_KEYS.OPTIMIZATION, { status, timestamp });
  }, []);

  // AF-133: Reset all
  const clearAll = useCallback(() => {
    Object.values(LS_KEYS).forEach(key => localStorage.removeItem(key));
    setIsFirstVisit(true);
    setSavedSettings({
      preset: DEFAULT_PRESET,
      density: DEFAULT_DENSITY,
      resolution: DEFAULT_RESOLUTION_DESKTOP,
      color: { enabled: false, value: '#00ff00', trueColor: false },
      customChar: { enabled: false, value: '' },
      optimization: { status: false, timestamp: null },
    });
  }, []);

  return {
    savedSettings,
    isFirstVisit,
    setIsFirstVisit,
    savePreset,
    saveDensity,
    saveResolution,
    saveColor,
    saveCustomChar,
    saveOptimization,
    clearAll,
  };
}
