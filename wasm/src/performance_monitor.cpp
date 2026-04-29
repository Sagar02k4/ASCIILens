#include "performance_monitor.h"
#include <cstring>

// ============================================================
// AsciiLens — Performance Monitor Implementation
// All thresholds are PRD HARD REQUIREMENTS
// AF-060 to AF-068
// ============================================================

PerformanceMonitor::PerformanceMonitor(int minRes, int maxRes, int currentRes)
    : minResolution_(minRes)
    , maxResolution_(maxRes)
    , currentResolution_(currentRes)
    , frameIndex_(0)
    , frameCount_(0)
    , averageFPS_(60.0)
    , mode_(0)  // stable
    , lowFPSStart_(-1.0)
    , highFPSStart_(-1.0)
    , lastScaleTime_(-1.0)
{
    std::memset(frameTimes_, 0, sizeof(frameTimes_));
}

void PerformanceMonitor::tick(double currentTimeMs) {
    frameTimes_[frameIndex_] = currentTimeMs;
    frameIndex_ = (frameIndex_ + 1) % FPS_SAMPLE_SIZE;
    if (frameCount_ < FPS_SAMPLE_SIZE) frameCount_++;

    computeAverageFPS();
    updateScaling(currentTimeMs);
}

void PerformanceMonitor::computeAverageFPS() {
    if (frameCount_ < 2) {
        averageFPS_ = 60.0;
        return;
    }

    // Calculate average frame time over the sample window
    int newest = (frameIndex_ - 1 + FPS_SAMPLE_SIZE) % FPS_SAMPLE_SIZE;
    int oldest = (frameIndex_ - frameCount_ + FPS_SAMPLE_SIZE) % FPS_SAMPLE_SIZE;

    double timeDelta = frameTimes_[newest] - frameTimes_[oldest];
    if (timeDelta <= 0.0) {
        averageFPS_ = 60.0;
        return;
    }

    averageFPS_ = (frameCount_ - 1) * 1000.0 / timeDelta;
}

void PerformanceMonitor::updateScaling(double currentTimeMs) {
    // AF-065: Enforce cooldown between scaling actions
    if (lastScaleTime_ > 0 && (currentTimeMs - lastScaleTime_) < COOLDOWN) {
        return;
    }

    // AF-062: Check for sustained low FPS → degrade
    if (averageFPS_ < DEGRADE_FPS) {
        // Start timing if not already
        if (lowFPSStart_ < 0) {
            lowFPSStart_ = currentTimeMs;
        }
        // Reset high FPS timer
        highFPSStart_ = -1.0;

        // Check if sustained long enough
        double elapsed = currentTimeMs - lowFPSStart_;
        if (elapsed >= DEGRADE_WINDOW) {
            // AF-064: Step-based scaling — decrease quality by 1 step (higher resolution value = larger steps = lower quality)
            if (currentResolution_ < maxResolution_) {  // Fix: Upper bound
                currentResolution_ += 1;               // Fix: exactly 1 step down in quality
                mode_ = 1;                              // AF-068: degraded
                lastScaleTime_ = currentTimeMs;
                lowFPSStart_ = -1.0;                    // Reset timer
            }
        }
    }
    // AF-063: Check for sustained high FPS → stable
    else if (averageFPS_ >= STABLE_FPS) {
        // Start timing if not already
        if (highFPSStart_ < 0) {
            highFPSStart_ = currentTimeMs;
        }
        // Reset low FPS timer
        lowFPSStart_ = -1.0;

        // Check if sustained long enough
        double elapsed = currentTimeMs - highFPSStart_;
        if (elapsed >= STABLE_WINDOW) {
            mode_ = 0;  // AF-068: stable
            // Could step up quality if above min, but only if previously degraded
            if (currentResolution_ > minResolution_) {  // Fix: lower bound
                // Only step up if we're in degraded state
                if (mode_ == 1) {
                    currentResolution_ -= 1; // Fix: higher quality
                    lastScaleTime_ = currentTimeMs;
                }
            }
            highFPSStart_ = -1.0;
        }
    }
    else {
        // FPS is between thresholds — reset timers
        lowFPSStart_ = -1.0;
        highFPSStart_ = -1.0;
    }
}

double PerformanceMonitor::getFPS() const {
    return averageFPS_;
}

int PerformanceMonitor::getRecommendedResolution() const {
    return currentResolution_;
}

int PerformanceMonitor::getMode() const {
    return mode_;
}

void PerformanceMonitor::reset(int resolution) {
    currentResolution_ = resolution;
    frameIndex_ = 0;
    frameCount_ = 0;
    averageFPS_ = 60.0;
    mode_ = 0;
    lowFPSStart_ = -1.0;
    highFPSStart_ = -1.0;
    lastScaleTime_ = -1.0;
    std::memset(frameTimes_, 0, sizeof(frameTimes_));
}
