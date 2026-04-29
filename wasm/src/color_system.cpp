#include "color_system.h"

// ============================================================
// AsciiLens — Color System Implementation (PRD P9)
// AF-026, AF-027, AF-029
// ============================================================

Color resolveColor(
    int brightness,
    bool useCustomColor,
    const Color& userColor,
    const std::vector<Color>& presetPalette
) {
    // AF-026, AF-027: If custom color enabled, apply single-tone across ALL chars
    if (useCustomColor) {
        // Modulate the user color by brightness for depth perception
        float factor = static_cast<float>(brightness) / 255.0f;
        return Color(
            static_cast<unsigned char>(userColor.r * factor),
            static_cast<unsigned char>(userColor.g * factor),
            static_cast<unsigned char>(userColor.b * factor)
        );
    }

    // AF-029: Otherwise, map brightness to preset palette bands
    if (presetPalette.empty()) {
        return Color(brightness, brightness, brightness);
    }

    int paletteSize = static_cast<int>(presetPalette.size());
    int index = (brightness * (paletteSize - 1)) / 255;
    if (index < 0) index = 0;
    if (index >= paletteSize) index = paletteSize - 1;

    return presetPalette[index];
}
