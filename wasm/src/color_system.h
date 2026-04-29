#pragma once

#include "presets.h"

// ============================================================
// AsciiLens — Color System (PRD P9)
// C++ Color userColor; bool useCustomColor;
// Logic: if (useCustomColor) applySingleColor(userColor)
//        else usePresetPalette()
// AF-021 to AF-029
// ============================================================

/**
 * Resolve the color for a pixel based on brightness.
 * If useCustomColor is true, returns the custom color (single-tone, AF-027).
 * Otherwise, maps brightness to the preset palette (AF-019).
 */
Color resolveColor(
    int brightness,
    bool useCustomColor,
    const Color& userColor,
    const std::vector<Color>& presetPalette
);
