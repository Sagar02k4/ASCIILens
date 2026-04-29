#pragma once

#include <string>
#include <vector>

// ============================================================
// AsciiLens — Preset Definitions (PRD P1-P2)
// 4 presets: Cyberpunk (default), Classic, Blocky, Minimal
// Each controls: charset, contrast, defaultDensity, palette
// ============================================================

struct Color {
    unsigned char r, g, b;
    Color() : r(0), g(0), b(0) {}
    Color(unsigned char r, unsigned char g, unsigned char b) : r(r), g(g), b(b) {}
};

struct Preset {
    std::string name;
    std::string id;
    std::string charset;        // brightness-sorted: darkest → lightest
    float contrast;             // contrast multiplier
    int defaultDensity;         // 0-100
    std::vector<Color> palette; // brightness band colors
};

// Get preset by ID. Returns nullptr if not found.
const Preset* getPreset(const std::string& id);

// Get all preset definitions
const std::vector<Preset>& getAllPresets();

// Get default preset ID
const std::string& getDefaultPresetId();
