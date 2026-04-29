#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "ascii_engine.h"
#include "performance_monitor.h"
#include "presets.h"

// ============================================================
// AsciiLens — Embind Bindings (JS ↔ WASM Interface)
// PRD P9-P10: Pass pixel buffer + settings, receive ASCII buffer
// AF-159, AF-160, AF-161
// ============================================================

using namespace emscripten;

// Global performance monitor instance
static PerformanceMonitor* g_perfMonitor = nullptr;

// Initialize performance monitor
void initPerformanceMonitor(int minRes, int maxRes, int currentRes) {
    if (g_perfMonitor) delete g_perfMonitor;
    g_perfMonitor = new PerformanceMonitor(minRes, maxRes, currentRes);
}

// Tick performance monitor
void perfTick(double timeMs) {
    if (g_perfMonitor) g_perfMonitor->tick(timeMs);
}

double perfGetFPS() {
    return g_perfMonitor ? g_perfMonitor->getFPS() : 0.0;
}

int perfGetRecommendedResolution() {
    return g_perfMonitor ? g_perfMonitor->getRecommendedResolution() : 8;
}

int perfGetMode() {
    return g_perfMonitor ? g_perfMonitor->getMode() : 0;
}

void perfReset(int resolution) {
    if (g_perfMonitor) g_perfMonitor->reset(resolution);
}

/**
 * Process a frame from JavaScript.
 * AF-159: JS passes pixel buffer to WASM
 * AF-160: JS passes settings (density, color, char, preset) to WASM
 * AF-161: WASM returns ASCII buffer to JS
 *
 * Returns a JS object with: { text, compactText, fullText, grid, rows, cols }
 * grid is a flat array of { char, r, g, b } objects
 */
val processFrameJS(
    uintptr_t pixelDataPtr,
    int width,
    int height,
    int density,
    int resolution,
    std::string presetId,
    bool useCustomColor,
    int colorR, int colorG, int colorB,
    bool useTrueColor,
    std::string customCharset,
    bool useCustomChar,
    std::string customCharStr,
    bool inverted
) {
    const unsigned char* pixelData = reinterpret_cast<const unsigned char*>(pixelDataPtr);

    EngineSettings settings;
    settings.density = density;
    settings.resolution = resolution;
    settings.presetId = presetId;
    settings.useCustomColor = useCustomColor;
    settings.customColor = Color(colorR, colorG, colorB);
    settings.useTrueColor = useTrueColor;
    settings.customCharset = customCharset;
    settings.useCustomChar = useCustomChar;
    settings.customChar = customCharStr.empty() ? '\0' : customCharStr[0];
    settings.inverted = inverted;
    settings.enableEdgeDetection = false;

    AsciiFrame frame = processFrame(pixelData, width, height, settings);

    // Build result object for JavaScript
    val result = val::object();
    result.set("rows", frame.rows);
    result.set("cols", frame.cols);

    // Build text representation for rendering
    std::string htmlStr;
    htmlStr.reserve(frame.rows * frame.cols * 15); // Estimate for RLE colored spans

    const char hex_chars[] = "0123456789abcdef";

    for (int row = 0; row < frame.rows; row++) {
        int lastR = -1, lastG = -1, lastB = -1;
        bool spanOpen = false;

        for (int col = 0; col < frame.cols; col++) {
            const AsciiCell& cell = frame.cells[row * frame.cols + col];
            
            if (cell.r != lastR || cell.g != lastG || cell.b != lastB) {
                if (spanOpen) htmlStr += "</span>";
                
                htmlStr += "<span style=\"color:#";
                htmlStr += hex_chars[cell.r >> 4];
                htmlStr += hex_chars[cell.r & 0x0F];
                htmlStr += hex_chars[cell.g >> 4];
                htmlStr += hex_chars[cell.g & 0x0F];
                htmlStr += hex_chars[cell.b >> 4];
                htmlStr += hex_chars[cell.b & 0x0F];
                htmlStr += "\">";
                
                lastR = cell.r;
                lastG = cell.g;
                lastB = cell.b;
                spanOpen = true;
            }

            if (cell.character == '<') htmlStr += "&lt;";
            else if (cell.character == '>') htmlStr += "&gt;";
            else if (cell.character == '&') htmlStr += "&amp;";
            else if (cell.character == ' ') htmlStr += "&nbsp;";
            else htmlStr += cell.character;
        }
        
        if (spanOpen) htmlStr += "</span>";
        if (row < frame.rows - 1) htmlStr += "\n";
    }

    result.set("html", htmlStr);
    result.set("compactText", frameToCompactText(frame));
    result.set("fullText", frameToFullText(frame));

    return result;
}

// Get preset info for JS
val getPresetsJS() {
    const auto& presets = getAllPresets();
    val result = val::array();

    for (size_t i = 0; i < presets.size(); i++) {
        val p = val::object();
        p.set("name", presets[i].name);
        p.set("id", presets[i].id);
        p.set("charset", presets[i].charset);
        p.set("contrast", presets[i].contrast);
        p.set("defaultDensity", presets[i].defaultDensity);

        // Palette as flat array [r,g,b, r,g,b, ...]
        val palette = val::array();
        for (const auto& c : presets[i].palette) {
            palette.call<void>("push", c.r);
            palette.call<void>("push", c.g);
            palette.call<void>("push", c.b);
        }
        p.set("palette", palette);

        result.call<void>("push", p);
    }

    return result;
}

std::string getDefaultPresetIdJS() {
    return getDefaultPresetId();
}

// Embind module
EMSCRIPTEN_BINDINGS(ascii_engine) {
    // Core processing
    function("processFrame", &processFrameJS);

    // Presets
    function("getPresets", &getPresetsJS);
    function("getDefaultPresetId", &getDefaultPresetIdJS);

    // Performance monitor
    function("initPerformanceMonitor", &initPerformanceMonitor);
    function("perfTick", &perfTick);
    function("perfGetFPS", &perfGetFPS);
    function("perfGetRecommendedResolution", &perfGetRecommendedResolution);
    function("perfGetMode", &perfGetMode);
    function("perfReset", &perfReset);
}
