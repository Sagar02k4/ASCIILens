#include "ascii_engine.h"
#include "color_system.h"
#include <cmath>
#include <algorithm>
#include <sstream>

// ============================================================
// AsciiLens — ASCII Engine Implementation
// Core conversion: pixel buffer → ASCII art
// AF-004, AF-005, AF-159, AF-160, AF-161
// ============================================================

/**
 * Calculate pixel brightness using standard luminance formula.
 * Y = 0.299*R + 0.587*G + 0.114*B
 */
static inline int calcBrightness(unsigned char r, unsigned char g, unsigned char b) {
    return static_cast<int>(0.299f * r + 0.587f * g + 0.114f * b);
}

/**
 * Map brightness to a character from the charset.
 * AF-016: Each preset defines its own character set
 * AF-034: Custom char overrides preset charset
 */
static char mapCharacter(
    int brightness,
    const std::string& charset,
    bool useCustomChar,
    char customChar,
    bool inverted
) {
    // AF-034: If custom char is set, always return it
    if (useCustomChar && customChar != '\0') {
        return customChar;
    }

    if (charset.empty()) return ' ';

    // AF-042: Invert brightness if toggled
    int b = inverted ? (255 - brightness) : brightness;

    // Map brightness (0-255) to charset index
    int len = static_cast<int>(charset.length());
    int index = (b * (len - 1)) / 255;
    index = std::max(0, std::min(index, len - 1));

    return charset[index];
}

AsciiFrame processFrame(
    const unsigned char* pixelData,
    int width,
    int height,
    const EngineSettings& settings
) {
    AsciiFrame frame;

    // Get preset
    const Preset* preset = getPreset(settings.presetId);
    if (!preset) {
        preset = getPreset("cyberpunk"); // Fallback to default
    }

    // Calculate effective resolution (step size in pixels)
    // Higher resolution value = larger steps = fewer chars (lower detail)
    // AF-040: Resolution slider adjusts output resolution
    int step = std::max(1, settings.resolution);

    // AF-038: Density affects character spacing
    // Map density (0-100) to a spacing multiplier
    float densityFactor = 1.0f + (100 - settings.density) * 0.02f;
    int effectiveStepX = static_cast<int>(step * densityFactor * 0.5f); // Chars are ~2:1 width:height
    int effectiveStepY = static_cast<int>(step * densityFactor);

    if (effectiveStepX < 1) effectiveStepX = 1;
    if (effectiveStepY < 1) effectiveStepY = 1;

    // Calc effective grid dimensions
    frame.cols = width / effectiveStepX;
    frame.rows = height / effectiveStepY;

    if (frame.cols < 1) frame.cols = 1;
    if (frame.rows < 1) frame.rows = 1;

    frame.cells.resize(frame.rows * frame.cols);

    // AF-017: Apply contrast from preset and fixed gamma
    float contrast = preset->contrast;
    float gamma = 2.2f;

    // Precalculate LUTs for Gamma, Contrast, and Character/Color mapping
    char charLut[256];
    Color colorLut[256];
    
    for (int i = 0; i < 256; i++) {
        // Brightness to 0-1
        float normalized = i / 255.0f;
        // Gamma correction
        float gammaScaled = std::pow(normalized, 1.0f / gamma);
        int b = static_cast<int>(gammaScaled * 255.0f);
        
        // Apply contrast
        b = static_cast<int>((b - 128) * contrast + 128);
        b = std::max(0, std::min(255, b));

        std::string effectiveCharset = settings.customCharset.empty() ? preset->charset : settings.customCharset;
        charLut[i] = mapCharacter(b, effectiveCharset, settings.useCustomChar, settings.customChar, settings.inverted);
        colorLut[i] = resolveColor(b, settings.useCustomColor, settings.customColor, preset->palette);
    }

    // Process each cell with Block Averaging
    for (int row = 0; row < frame.rows; row++) {
        for (int col = 0; col < frame.cols; col++) {
            int startX = col * effectiveStepX;
            int startY = row * effectiveStepY;
            int endX = std::min(startX + effectiveStepX, width);
            int endY = std::min(startY + effectiveStepY, height);

            long sumR = 0, sumG = 0, sumB = 0;
            int count = 0;

            for (int py = startY; py < endY; py++) {
                int rowOffset = py * width;
                for (int px = startX; px < endX; px++) {
                    int pixelIndex = (rowOffset + px) * 4;
                    sumR += pixelData[pixelIndex];
                    sumG += pixelData[pixelIndex + 1];
                    sumB += pixelData[pixelIndex + 2];
                    count++;
                }
            }

            int r = count > 0 ? (sumR / count) : 0;
            int g = count > 0 ? (sumG / count) : 0;
            int b = count > 0 ? (sumB / count) : 0;

            // Calculate brightness
            int brightness = calcBrightness(r, g, b);

            // Optional Edge Detection
            if (settings.enableEdgeDetection) {
                if (endX - startX > 1 && endY - startY > 1) {
                    int tlIdx = (startY * width + startX) * 4;
                    int brIdx = ((endY - 1) * width + (endX - 1)) * 4;
                    
                    int bTL = calcBrightness(pixelData[tlIdx], pixelData[tlIdx+1], pixelData[tlIdx+2]);
                    int bBR = calcBrightness(pixelData[brIdx], pixelData[brIdx+1], pixelData[brIdx+2]);
                    int edgeDiff = std::abs(bTL - bBR);
                    
                    // Blend edge strength into brightness
                    brightness = std::min(255, brightness + edgeDiff / 2);
                }
            }

            // Map via LUT
            char ch = charLut[brightness];
            Color color;
            if (settings.useTrueColor) {
                color = Color(r, g, b);
            } else {
                color = colorLut[brightness];
            }

            // Store cell
            int cellIndex = row * frame.cols + col;
            frame.cells[cellIndex].character = ch;
            frame.cells[cellIndex].r = color.r;
            frame.cells[cellIndex].g = color.g;
            frame.cells[cellIndex].b = color.b;
        }
    }

    return frame;
}

std::string frameToCompactText(const AsciiFrame& frame) {
    // AF-055: compact = minimal whitespace, no trailing spaces
    std::string result;
    result.reserve(frame.rows * (frame.cols + 1));

    for (int row = 0; row < frame.rows; row++) {
        // Find last non-space character
        int lastNonSpace = -1;
        for (int col = frame.cols - 1; col >= 0; col--) {
            if (frame.cells[row * frame.cols + col].character != ' ') {
                lastNonSpace = col;
                break;
            }
        }

        for (int col = 0; col <= lastNonSpace; col++) {
            result += frame.cells[row * frame.cols + col].character;
        }
        if (row < frame.rows - 1) result += '\n';
    }

    return result;
}

std::string frameToFullText(const AsciiFrame& frame) {
    // AF-057: full = all characters including trailing spaces
    std::string result;
    result.reserve(frame.rows * (frame.cols + 1));

    for (int row = 0; row < frame.rows; row++) {
        for (int col = 0; col < frame.cols; col++) {
            result += frame.cells[row * frame.cols + col].character;
        }
        if (row < frame.rows - 1) result += '\n';
    }

    return result;
}
