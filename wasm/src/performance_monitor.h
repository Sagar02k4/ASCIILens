#pragma once

// ============================================================
// AsciiLens — Performance Monitor (PRD P3, P10)
// FPS-based adaptive scaling with HARD timing requirements
// AF-060 to AF-068
// ============================================================

class PerformanceMonitor {
public:
    /**
     * @param minResolution  Lower bound for resolution (AF-066)
     * @param maxResolution  Upper bound for resolution (AF-067)
     * @param currentResolution Starting resolution
     */
    PerformanceMonitor(int minResolution, int maxResolution, int currentResolution);

    /**
     * Call once per frame. Updates FPS average.
     * AF-060
     */
    void tick(double currentTimeMs);

    /**
     * Get current averaged FPS. AF-061
     */
    double getFPS() const;

    /**
     * Get recommended resolution after adaptive scaling. AF-064
     */
    int getRecommendedResolution() const;

    /**
     * Get current performance mode. AF-068
     * 0 = stable, 1 = degraded
     */
    int getMode() const;

    /**
     * Reset monitor to initial state.
     */
    void reset(int resolution);

private:
    // Configuration
    int minResolution_;        // AF-066
    int maxResolution_;        // AF-067
    int currentResolution_;

    // FPS tracking
    static const int FPS_SAMPLE_SIZE = 60;
    double frameTimes_[60];
    int frameIndex_;
    int frameCount_;
    double averageFPS_;

    // State
    int mode_;                 // 0 = stable, 1 = degraded

    // Timing for thresholds
    double lowFPSStart_;       // When FPS first dropped below threshold
    double highFPSStart_;      // When FPS first went above threshold
    double lastScaleTime_;     // Last time we scaled (for cooldown)

    // Constants (HARD REQUIREMENTS from PRD)
    static constexpr double DEGRADE_FPS = 20.0;     // AF-062
    static constexpr double STABLE_FPS = 30.0;       // AF-063
    static constexpr double DEGRADE_WINDOW = 1500.0;  // AF-062: 1.5s
    static constexpr double STABLE_WINDOW = 1500.0;   // AF-063: 1.5s
    static constexpr double COOLDOWN = 1000.0;         // AF-065: 1s

    void updateScaling(double currentTimeMs);
    void computeAverageFPS();
};
