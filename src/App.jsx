// ============================================================
// AsciiLens — App.jsx (Root Component)
// Phase 10: Full integration of all hooks, components, and state
// Implements appPhase state machine and all UX flows
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { initWasm, isWasmReady, getPresets as getWasmPresets } from './engine/wasmLoader.js';
import { useCamera } from './hooks/useCamera.js';
import { useRenderLoop } from './hooks/useRenderLoop.js';
import { usePerformance } from './hooks/usePerformance.js';
import { usePersistence } from './hooks/usePersistence.js';
import { useCapture } from './hooks/useCapture.js';
import {
  PHASES, DEFAULT_PRESET, DEFAULT_DENSITY, DEFAULT_RESOLUTION_DESKTOP,
  DEFAULT_RESOLUTION_MOBILE, MIN_RESOLUTION, MAX_RESOLUTION, MOBILE_BREAKPOINT,
  PRESET_CHARSETS,
} from './utils/constants.js';
import { isMobileViewport, hexToRgb } from './utils/helpers.js';

// Components
import CameraPanel from './components/CameraPanel/CameraPanel.jsx';
import CaptureButton from './components/CaptureButton/CaptureButton.jsx';
import FlashEffect from './components/FlashEffect/FlashEffect.jsx';
import ControlsPanel from './components/ControlsPanel/ControlsPanel.jsx';
import StyleSection from './components/ControlsPanel/StyleSection.jsx';
import LookSection from './components/ControlsPanel/LookSection.jsx';
import CharacterSection from './components/ControlsPanel/CharacterSection.jsx';
import QualitySection from './components/ControlsPanel/QualitySection.jsx';
import StatusSection from './components/ControlsPanel/StatusSection.jsx';
import SettingsMenu from './components/SettingsMenu/SettingsMenu.jsx';
import ResultOverlay from './components/ResultOverlay/ResultOverlay.jsx';
import FirstTimeFlow from './components/FirstTimeFlow/FirstTimeFlow.jsx';
import OptimizationOverlay from './components/OptimizationOverlay/OptimizationOverlay.jsx';
import MobileBottomSheet from './components/MobileBottomSheet/MobileBottomSheet.jsx';
import { Analytics } from '@vercel/analytics/react';

function App() {
  // ---- WASM State ----
  const [wasmReady, setWasmReady] = useState(false);
  const [wasmError, setWasmError] = useState(null);

  // ---- App Phase ----
  const [appPhase, setAppPhase] = useState(PHASES.FIRST_TIME);

  // ---- Mobile Detection ----
  const [isMobile, setIsMobile] = useState(isMobileViewport(MOBILE_BREAKPOINT));

  // ---- Hooks ----
  const persistence = usePersistence();
  const camera = useCamera();

  // ---- Settings State (initialized from persistence) ----
  const [activePreset, setActivePreset] = useState(DEFAULT_PRESET);
  const [density, setDensity] = useState(DEFAULT_DENSITY);
  const [resolution, setResolution] = useState(DEFAULT_RESOLUTION_DESKTOP);
  const [colorEnabled, setColorEnabled] = useState(false);
  const [colorValue, setColorValue] = useState('#00ff00');
  const [trueColorEnabled, setTrueColorEnabled] = useState(false);
  const [inverted, setInverted] = useState(false);
  const [customChar, setCustomChar] = useState('');
  const [activeCharset, setActiveCharset] = useState('rich');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [optimizedAt, setOptimizedAt] = useState(null);
  const [controlsPanelOpen, setControlsPanelOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [presets, setPresets] = useState([]);

  // ---- Initialize WASM ----
  useEffect(() => {
    initWasm().then(() => {
      setWasmReady(true);
      // Load presets from WASM
      const wasmPresets = getWasmPresets();
      if (wasmPresets) {
        const presetList = [];
        for (let i = 0; i < wasmPresets.length; i++) {
          presetList.push(wasmPresets[i]);
        }
        setPresets(presetList);
      }
    }).catch(err => {
      setWasmError(err);
      console.error('[AsciiLens] WASM init failed:', err);
    });
  }, []);

  // ---- Restore persisted settings ----
  useEffect(() => {
    if (persistence.savedSettings) {
      const s = persistence.savedSettings;
      setActivePreset(s.preset || DEFAULT_PRESET);
      setDensity(s.density ?? DEFAULT_DENSITY);
      setResolution(s.resolution ?? (isMobile ? DEFAULT_RESOLUTION_MOBILE : DEFAULT_RESOLUTION_DESKTOP));
      setColorEnabled(s.color?.enabled ?? false);
      setColorValue(s.color?.value || '#00ff00');
      setTrueColorEnabled(s.color?.trueColor ?? false);
      setCustomChar(s.customChar?.value || '');
      setOptimizedAt(s.optimization?.timestamp || null);

      // AF-138: Skip first-time flow if not first visit
      if (!persistence.isFirstVisit) {
        setAppPhase(PHASES.LIVE);
      }
    }
  }, [persistence.savedSettings, persistence.isFirstVisit, isMobile]);

  // ---- Mobile resize detection ----
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileViewport(MOBILE_BREAKPOINT));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---- Engine Settings (memoized for render loop) ----
  const engineSettings = useMemo(() => {
    const rgb = hexToRgb(colorValue);
    const activeCharsetObj = PRESET_CHARSETS.find(cs => cs.id === activeCharset);
    
    return {
      density,
      resolution,
      presetId: activePreset === 'custom' ? DEFAULT_PRESET : activePreset,
      useCustomColor: colorEnabled && !trueColorEnabled,
      useTrueColor: colorEnabled && trueColorEnabled,
      colorR: rgb.r,
      colorG: rgb.g,
      colorB: rgb.b,
      customCharset: activeCharsetObj ? activeCharsetObj.chars : '',
      useCustomChar: customChar.length > 0,
      customChar: customChar || '',
      inverted,
    };
  }, [density, resolution, activePreset, colorEnabled, colorValue, trueColorEnabled, activeCharset, customChar, inverted]);

  // ---- Render Loop ----
  const isPaused = appPhase === PHASES.CAPTURED || appPhase === PHASES.RESULT;
  const renderLoop = useRenderLoop({
    videoRef: camera.videoRef,
    settings: engineSettings,
    paused: isPaused,
    renderUI: appPhase !== PHASES.OPTIMIZING,
    wasmReady: wasmReady && camera.permission === 'granted',
    onFrame: null,
  });

  // ---- Performance ----
  const perf = usePerformance(
    isMobile ? DEFAULT_RESOLUTION_MOBILE : DEFAULT_RESOLUTION_DESKTOP,
    MIN_RESOLUTION,
    MAX_RESOLUTION,
    wasmReady
  );

  // ---- Capture ----
  const capture = useCapture({
    currentFrame: renderLoop.currentFrame,
    onCaptureStart: () => {
      camera.pauseCamera();
      setAppPhase(PHASES.RESULT);
    },
    onCaptureComplete: () => {},
    soundEnabled,
  });

  // ---- Handlers ----

  // AF-020: Preset change
  const handlePresetChange = useCallback((presetId) => {
    setActivePreset(presetId);
    persistence.savePreset(presetId);
    // Reset density to preset default
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setDensity(preset.defaultDensity || DEFAULT_DENSITY);
      persistence.saveDensity(preset.defaultDensity || DEFAULT_DENSITY);
    }
    
    // Fix: Reset all "Custom" overrides so the preset can be seen clearly!
    setColorEnabled(false);
    setTrueColorEnabled(false);
    setInverted(false);
    setCustomChar('');
    
    // Also save these to persistence
    persistence.saveColor(false, colorValue, false);
    persistence.saveCustomChar(false, '');
  }, [persistence, presets, colorValue]);

  // AF-111: Auto-switch to Custom when settings change
  const markAsCustom = useCallback(() => {
    if (activePreset !== 'custom') {
      setActivePreset('custom');
    }
  }, [activePreset]);

  // AF-038: Density change
  const handleDensityChange = useCallback((value) => {
    setDensity(value);
    persistence.saveDensity(value);
    markAsCustom();
  }, [persistence, markAsCustom]);

  // AF-040: Resolution change
  const handleResolutionChange = useCallback((value) => {
    setResolution(value);
    persistence.saveResolution(value);
    markAsCustom();
  }, [persistence, markAsCustom]);

  // AF-021: Color toggle
  const handleColorToggle = useCallback(() => {
    const newValue = !colorEnabled;
    setColorEnabled(newValue);
    persistence.saveColor(newValue, colorValue, trueColorEnabled);
    markAsCustom();
  }, [colorEnabled, colorValue, trueColorEnabled, persistence, markAsCustom]);

  // AF-025: Color change
  const handleColorChange = useCallback((hex) => {
    setColorValue(hex);
    persistence.saveColor(colorEnabled, hex, trueColorEnabled);
  }, [colorEnabled, trueColorEnabled, persistence]);

  // True Color toggle
  const handleTrueColorToggle = useCallback(() => {
    const newValue = !trueColorEnabled;
    setTrueColorEnabled(newValue);
    persistence.saveColor(colorEnabled, colorValue, newValue);
    markAsCustom();
  }, [trueColorEnabled, colorEnabled, colorValue, persistence, markAsCustom]);

  // AF-042: Invert toggle
  const handleInvertToggle = useCallback(() => {
    setInverted(prev => !prev);
    markAsCustom();
  }, [markAsCustom]);

  // AF-032: Custom char change
  const handleCustomCharChange = useCallback((char) => {
    setCustomChar(char);
    persistence.saveCustomChar(char.length > 0, char);
    if (char.length > 0) markAsCustom();
  }, [persistence, markAsCustom]);

  // AF-031: Charset selection
  const handleCharsetChange = useCallback((charsetId) => {
    setActiveCharset(charsetId);
    setCustomChar('');
    persistence.saveCustomChar(false, '');
  }, [persistence]);

  // First-time flow handlers
  const handleRequestPermission = useCallback(() => {
    camera.requestPermission();
  }, [camera]);

  const handleOptimize = useCallback(() => {
    setAppPhase(PHASES.OPTIMIZING);
  }, []);

  const handleDefault = useCallback(() => {
    persistence.setIsFirstVisit(false);
    setAppPhase(PHASES.LIVE);
  }, [persistence]);

  const handleOptimizationComplete = useCallback(() => {
    const now = Date.now();
    setOptimizedAt(now);
    persistence.saveOptimization(true, now);
    persistence.setIsFirstVisit(false);
    
    // Apply recommended resolution
    setResolution(perf.recommendedResolution);
    persistence.saveResolution(perf.recommendedResolution);
    
    setAppPhase(PHASES.LIVE);
  }, [persistence, perf.recommendedResolution]);

  // Capture handler
  const handleCapture = useCallback(() => {
    setAppPhase(PHASES.CAPTURED);
    capture.triggerCapture();
  }, [capture]);

  // History handler
  const handleViewHistory = useCallback((frame) => {
    if (frame) {
      capture.viewHistoryFrame(frame);
      camera.pauseCamera();
      setAppPhase(PHASES.RESULT);
    }
  }, [capture, camera]);

  // Retake handler (AF-148)
  const handleRetake = useCallback(() => {
    capture.retake();
    camera.resumeCamera();
    setAppPhase(PHASES.LIVE);
  }, [capture, camera]);

  // Settings handlers
  const handleRunOptimization = useCallback(() => {
    setSettingsOpen(false);
    setAppPhase(PHASES.OPTIMIZING);
  }, []);

  const handleReset = useCallback(() => {
    persistence.clearAll();
    setActivePreset(DEFAULT_PRESET);
    setDensity(DEFAULT_DENSITY);
    setResolution(isMobile ? DEFAULT_RESOLUTION_MOBILE : DEFAULT_RESOLUTION_DESKTOP);
    setColorEnabled(false);
    setColorValue('#00ff00');
    setTrueColorEnabled(false);
    setInverted(false);
    setCustomChar('');
    setSoundEnabled(true);
    setOptimizedAt(null);
    setSettingsOpen(false);
  }, [persistence, isMobile]);

  // ---- Control Sections (shared between desktop and mobile) ----
  const controlSections = (
    <>
      <StyleSection
        activePreset={activePreset}
        onSelectPreset={handlePresetChange}
        presets={presets}
      />
      <LookSection
        colorEnabled={colorEnabled}
        onColorToggle={handleColorToggle}
        colorValue={colorValue}
        onColorChange={handleColorChange}
        trueColorEnabled={trueColorEnabled}
        onTrueColorToggle={handleTrueColorToggle}
        inverted={inverted}
        onInvertToggle={handleInvertToggle}
      />
      <CharacterSection
        activeCharset={activeCharset}
        customChar={customChar}
        onSelectCharset={handleCharsetChange}
        onCustomCharChange={handleCustomCharChange}
      />
      <QualitySection
        density={density}
        onDensityChange={handleDensityChange}
        resolution={resolution}
        onResolutionChange={handleResolutionChange}
      />
      <StatusSection
        fps={perf.fps}
        performanceMode={perf.mode}
      />
    </>
  );

  // ---- Render ----

  // WASM loading state
  if (!wasmReady && !wasmError) {
    return (
      <div className="app-container">
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', gap: '16px'
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '48px',
            color: 'var(--accent-cyan)', textShadow: '0 0 30px rgba(0,240,255,0.3)'
          }}>A</div>
          <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Loading WASM engine...
          </p>
        </div>
      </div>
    );
  }

  // WASM error state
  if (wasmError) {
    return (
      <div className="app-container">
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', gap: '16px', padding: '24px'
        }}>
          <p style={{ color: 'var(--accent-red)', fontFamily: 'var(--font-ui)', fontSize: '16px' }}>
            Failed to load WASM engine
          </p>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', textAlign: 'center' }}>
            {wasmError.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" id="app-container">
      {/* Hidden video element for camera */}
      <video
        ref={camera.videoRef}
        style={{ display: 'none' }}
        playsInline
        muted
        autoPlay
      />

      {/* AF-135 to AF-138: First-time flow */}
      {appPhase === PHASES.FIRST_TIME && (
        <FirstTimeFlow
          cameraPermission={camera.permission}
          onRequestPermission={handleRequestPermission}
          onOptimize={handleOptimize}
          onDefault={handleDefault}
          errorMessage={camera.permission === 'denied' ? 'Enable camera from browser settings' : null}
        />
      )}

      {/* AF-072 to AF-080: Optimization overlay */}
      {appPhase === PHASES.OPTIMIZING && (
        <OptimizationOverlay
          isActive={true}
          onComplete={handleOptimizationComplete}
        />
      )}

      {/* Live / Captured / Result states */}
      {(appPhase === PHASES.LIVE || appPhase === PHASES.CAPTURED || appPhase === PHASES.RESULT) && (
        <div className="app-main">
          {/* Camera Panel */}
          <CameraPanel
            frame={appPhase === PHASES.RESULT ? capture.capturedFrame : renderLoop.currentFrame}
            isLive={appPhase === PHASES.LIVE}
            isCaptured={appPhase === PHASES.RESULT}
            isMobile={isMobile}
          />

          {/* Flash/Shimmer effects */}
          <FlashEffect
            isFlashing={capture.isFlashing}
            isShimmering={capture.isShimmering}
          />

          {/* Capture Button (Mobile) */}
          {isMobile && appPhase === PHASES.LIVE && (
            <CaptureButton
              onClick={handleCapture}
              disabled={!renderLoop.currentFrame}
              isMobile={isMobile}
              historyFrames={capture.captureHistory}
              onViewHistory={handleViewHistory}
            />
          )}

          {/* Result Overlay */}
          {appPhase === PHASES.RESULT && (
            <ResultOverlay
              frame={capture.capturedFrame}
              onCopyCompact={capture.copyCompact}
              onCopyFull={capture.copyFull}
              onDownload={capture.downloadImage}
              onRetake={handleRetake}
            />
          )}

          {/* Desktop: Controls Panel (AF-102, AF-103, AF-104) */}
          {!isMobile && (
            <ControlsPanel
              isOpen={controlsPanelOpen}
              onToggle={() => setControlsPanelOpen(prev => !prev)}
            >
              {controlSections}
            </ControlsPanel>
          )}

          {/* Mobile: Bottom Sheet (AF-098, AF-107) */}
          {isMobile && (
            <MobileBottomSheet>
              {controlSections}
            </MobileBottomSheet>
          )}

          {/* Switch Camera icon */}
          {appPhase === PHASES.LIVE && (
            <button
              className="btn-icon"
              style={{
                position: 'fixed',
                top: 'var(--space-md)',
                right: isMobile ? 'calc(var(--space-md) + 48px)' : (controlsPanelOpen ? `calc(var(--panel-width) + 108px)` : '108px'),
                zIndex: 'var(--z-panel)',
                transition: 'right var(--transition-slow)',
              }}
              onClick={camera.switchCamera}
              id="switch-camera-icon"
              aria-label="Switch camera"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M21.5 2v6h-6" />
                <path d="M21.34 15.57a10 10 0 1 1-.92-12.28l5.57 5.57" />
              </svg>
            </button>
          )}

          {/* Settings icon (AF-126) */}
          <button
            className="btn-icon"
            style={{
              position: 'fixed',
              top: 'var(--space-md)',
              right: isMobile ? 'var(--space-md)' : (controlsPanelOpen ? `calc(var(--panel-width) + 60px)` : '60px'),
              zIndex: 'var(--z-panel)',
              transition: 'right var(--transition-slow)',
            }}
            onClick={() => setSettingsOpen(true)}
            id="settings-icon"
            aria-label="Open settings"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>

          {/* Capture button for desktop (non-mobile, inside panel area) */}
          {!isMobile && appPhase === PHASES.LIVE && (
            <div style={{
              position: 'fixed',
              bottom: 'var(--space-xl)',
              left: controlsPanelOpen ? `calc(50% - var(--panel-width) / 2)` : '50%',
              transform: 'translateX(-50%)',
              zIndex: 'var(--z-panel)',
              transition: 'left var(--transition-slow)',
            }}>
              <CaptureButton
                onClick={handleCapture}
                disabled={!renderLoop.currentFrame}
                isMobile={false}
                historyFrames={capture.captureHistory}
                onViewHistory={handleViewHistory}
              />
            </div>
          )}
        </div>
      )}

      {/* Settings Menu (AF-126 to AF-134) */}
      <SettingsMenu
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onRunOptimization={handleRunOptimization}
        onReset={handleReset}
        soundEnabled={soundEnabled}
        onSoundToggle={() => setSoundEnabled(prev => !prev)}
        optimizedAt={optimizedAt}
      />
      <Analytics />
    </div>
  );
}

export default App;
