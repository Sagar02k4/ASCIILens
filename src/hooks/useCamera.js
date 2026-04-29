// ============================================================
// AsciiLens — useCamera Hook (AF-001, AF-135, AF-136, AF-154)
// Manages camera stream lifecycle via getUserMedia
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';

export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [permission, setPermission] = useState('pending'); // AF-135: pending|granted|denied
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user');

  // AF-154: Request camera via getUserMedia
  const requestPermission = useCallback(async (targetMode) => {
    const currentTargetMode = typeof targetMode === 'string' ? targetMode : facingMode;
    try {
      setPermission('pending');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentTargetMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setPermission('granted'); // AF-135: granted

      // Attach to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(e => console.error('Play failed:', e));
      }
    } catch (err) {
      console.error('[AsciiLens] Camera access denied:', err);
      setPermission('denied'); // AF-136: denied
    }
  }, [facingMode]);

  const switchCamera = useCallback(() => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    requestPermission(newMode);
  }, [facingMode, requestPermission]);

  // Guarantee that the video element always has the stream if it remounts or updates
  useEffect(() => {
    if (videoRef.current && stream && videoRef.current.srcObject !== stream) {
      console.log('[AsciiLens] Binding stream to video element');
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error('Play failed:', e));
    }
  }, [stream]);

  // AF-051: Pause camera
  const pauseCamera = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  // AF-148: Resume camera
  const resumeCamera = useCallback(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.play();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    stream,
    permission,
    requestPermission,
    pauseCamera,
    resumeCamera,
    switchCamera,
    facingMode,
  };
}
