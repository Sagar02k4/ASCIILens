#include "presets.h"

// ============================================================
// AsciiLens — Preset Implementations (PRD P1-P2)
// AF-011 to AF-020
// ============================================================

static const std::string DEFAULT_PRESET_ID = "cyberpunk"; // AF-015

static std::vector<Preset> presets = {
    // AF-011: Cyberpunk (DEFAULT)
    {
        "Cyberpunk",
        "cyberpunk",
        "@#%$&?!*+;:~-,.` ",  // AF-016: rich charset
        1.2f,                   // AF-017: higher contrast
        50,                     // AF-018: default density
        {                       // AF-019: neon palette
            Color(0, 240, 255),   // cyan
            Color(0, 180, 220),
            Color(0, 120, 180),
            Color(80, 60, 160),
            Color(233, 69, 96),   // pink
            Color(180, 40, 80),
            Color(100, 20, 60),
            Color(30, 10, 30)
        }
    },
    // AF-012: Classic
    {
        "Classic",
        "classic",
        "@%#*+=-:. ",           // AF-016: standard charset
        1.0f,                    // AF-017: normal contrast
        50,                      // AF-018
        {                        // AF-019: green terminal
            Color(0, 255, 65),
            Color(0, 210, 50),
            Color(0, 170, 40),
            Color(0, 130, 30),
            Color(0, 90, 20),
            Color(0, 60, 15),
            Color(0, 35, 10),
            Color(0, 15, 5)
        }
    },
    // AF-013: Blocky
    {
        "Blocky",
        "blocky",
        "\xe2\x96\x88\xe2\x96\x93\xe2\x96\x92\xe2\x96\x91 ",  // █▓▒░ (UTF-8)
        1.3f,                    // AF-017: higher contrast for blocks
        40,                      // AF-018: denser for block chars
        {                        // AF-019: amber/gold
            Color(255, 171, 0),
            Color(220, 140, 0),
            Color(180, 110, 0),
            Color(140, 80, 0),
            Color(100, 55, 0),
            Color(70, 35, 0),
            Color(40, 20, 0),
            Color(20, 10, 0)
        }
    },
    // AF-014: Minimal
    {
        "Minimal",
        "minimal",
        ".:-=+*#  ",            // AF-016: minimal charset
        0.8f,                    // AF-017: lower contrast (softer)
        60,                      // AF-018
        {                        // AF-019: cool gray-blue
            Color(180, 190, 220),
            Color(150, 160, 190),
            Color(120, 130, 160),
            Color(90, 100, 130),
            Color(65, 72, 100),
            Color(45, 50, 75),
            Color(30, 33, 50),
            Color(15, 16, 25)
        }
    }
};

const Preset* getPreset(const std::string& id) {
    for (const auto& p : presets) {
        if (p.id == id) return &p;
    }
    return nullptr;
}

const std::vector<Preset>& getAllPresets() {
    return presets;
}

const std::string& getDefaultPresetId() {
    return DEFAULT_PRESET_ID;
}
