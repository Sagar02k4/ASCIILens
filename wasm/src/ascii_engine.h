#pragma once

#include "presets.h"
#include <string>
#include <vector>

// ============================================================
// AsciiLens — ASCII Engine (PRD P8-P9)
// Core: pixel buffer → ASCII buffer
// Pipeline: Video → Canvas → Pixel Buffer → WASM → ASCII → Render
// AF-004, AF-005, AF-159 to AF-161
// ============================================================

/**
 * Settings passed from JS to WASM for each frame.
 * AF-160: JS passes settings (density, color, char, preset)
 */
struct EngineSettings {
    int density;                 // 0-100 (AF-038)
    int resolution;              // grid step size in pixels (AF-040)
    std::string presetId;        // 'cyberpunk'|'classic'|'blocky'|'minimal' (AF-015)
    bool useCustomColor;         // AF-026
    Color customColor;           // AF-025: user-selected color
    bool useTrueColor;           // Use actual camera colors
    std::string customCharset;   // Custom charset string overriding preset
    bool useCustomChar;          // AF-034
    char customChar;             // AF-032: single character
    bool inverted;               // AF-042
    bool enableEdgeDetection;    // Optional feature flag for edge detection
};

/**
 * A single cell in the ASCII grid.
 */
struct AsciiCell {
    char character;
    unsigned char r, g, b;
};

/**
 * Result of processing a frame.
 * AF-005, AF-161: WASM returns ASCII buffer to JS
 */
struct AsciiFrame {
    std::vector<AsciiCell> cells;
    int rows;
    int cols;
};

/**
 * Process a single video frame into ASCII art.
 * AF-004: Pixel buffer is passed to WASM module
 * AF-005: WASM returns ASCII character buffer
 *
 * @param pixelData  RGBA pixel data (4 bytes per pixel)
 * @param width      Frame width in pixels
 * @param height     Frame height in pixels
 * @param settings   All rendering settings
 * @return           Processed ASCII frame
 */
AsciiFrame processFrame(
    const unsigned char* pixelData,
    int width,
    int height,
    const EngineSettings& settings
);

/**
 * Generate a compact text representation (for copy compact).
 * AF-055
 */
std::string frameToCompactText(const AsciiFrame& frame);

/**
 * Generate a full text representation (for copy full).
 * AF-057
 */
std::string frameToFullText(const AsciiFrame& frame);
