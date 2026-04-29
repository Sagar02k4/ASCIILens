// ============================================================
// AsciiLens — WASM Loader (AF-157, AF-158)
// Loads and initializes the Emscripten WASM module
// ============================================================

let wasmModule = null;
let wasmPromise = null;
let wasmReady = false;
let wasmError = null;

/**
 * Initialize the WASM module.
 * Must be called once at app startup.
 */
export async function initWasm() {
  if (wasmModule) return wasmModule;
  if (wasmPromise) return wasmPromise;

  wasmPromise = (async () => {
    try {
    // Import the ES6 Emscripten glue code
    const { default: createAsciiEngine } = await import('../../wasm/build/ascii_engine.mjs');

    wasmModule = await createAsciiEngine({
      locateFile: (path) => {
        if (path.endsWith('.wasm')) {
          return new URL('../../wasm/build/ascii_engine.wasm', import.meta.url).href;
        }
        return path;
      },
    });

    wasmReady = true;
    console.log('[AsciiLens] WASM engine loaded successfully');
    return wasmModule;
  } catch (err) {
    wasmError = err;
    console.error('[AsciiLens] Failed to load WASM engine:', err);
    throw err;
  }
  })();
  return wasmPromise;
}

/**
 * Get the WASM module (must be initialized first).
 */
export function getWasm() {
  return wasmModule;
}

/**
 * Check if WASM is ready.
 */
export function isWasmReady() {
  return wasmReady;
}

/**
 * Process a frame through the WASM engine.
 * AF-159: JS passes pixel buffer to WASM
 * AF-160: JS passes settings to WASM
 * AF-161: WASM returns ASCII buffer to JS
 */
export function processFrame(pixelData, width, height, settings) {
  if (!wasmModule) return null;

  // Allocate memory in WASM heap for pixel data
  const numBytes = pixelData.length;
  const ptr = wasmModule._malloc(numBytes);
  
  try {
    // Safely copy data into wasm heap (protects against detachment)
    wasmModule.HEAPU8.set(pixelData, ptr);

    const result = wasmModule.processFrame(
      ptr,
      width,
      height,
      settings.density || 50,
      settings.resolution || 8,
      settings.presetId || 'cyberpunk',
      settings.useCustomColor || false,
      settings.colorR || 0,
      settings.colorG || 255,
      settings.colorB || 0,
      settings.useTrueColor || false,
      settings.customCharset || '',
      settings.useCustomChar || false,
      settings.customChar || '',
      settings.inverted || false
    );

    // Copy result data before freeing (Embind val objects)
    const frame = {
      html: result.html,
      compactText: result.compactText,
      fullText: result.fullText,
      rows: result.rows,
      cols: result.cols,
    };

    return frame;
  } catch (err) {
    console.error("[AsciiLens] Error in processFrame:", err);
    return null;
  } finally {
    wasmModule._free(ptr);
  }
}

/**
 * Initialize performance monitor in WASM.
 */
export function initPerformanceMonitor(minRes, maxRes, currentRes) {
  if (wasmModule) wasmModule.initPerformanceMonitor(minRes, maxRes, currentRes);
}

export function perfTick(timeMs) {
  if (wasmModule) wasmModule.perfTick(timeMs);
}

export function perfGetFPS() {
  return wasmModule ? wasmModule.perfGetFPS() : 0;
}

export function perfGetRecommendedResolution() {
  return wasmModule ? wasmModule.perfGetRecommendedResolution() : 8;
}

export function perfGetMode() {
  return wasmModule ? wasmModule.perfGetMode() : 0;
}

export function perfReset(resolution) {
  if (wasmModule) wasmModule.perfReset(resolution);
}

export function getPresets() {
  if (!wasmModule) return [];
  return wasmModule.getPresets();
}

export function getDefaultPresetId() {
  if (!wasmModule) return 'cyberpunk';
  return wasmModule.getDefaultPresetId();
}
