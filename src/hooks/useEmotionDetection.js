import { useState, useEffect, useCallback, useRef } from 'react';
import { detectEmotion } from '../services/faceApiService';

/**
 * Custom hook to manage the camera and periodic emotion detection.
 */
export const useEmotionDetection = (videoRef, isActive) => {
  const [emotionData, setEmotionData] = useState({
    emotion: null,
    confidence: 0,
    status: 'Initializing...',
    facesCount: 0
  });
  
  const detectionIntervalRef = useRef(null);

  const startDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    // Detect every 2 seconds
    detectionIntervalRef.current = setInterval(async () => {
      if (videoRef.current && isActive) {
        const result = await detectEmotion(videoRef.current);
        setEmotionData(result);
      }
    }, 2000);
  }, [videoRef, isActive]);

  const stopDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      startDetection();
    } else {
      stopDetection();
    }

    return () => {
      stopDetection();
    };
  }, [isActive, startDetection, stopDetection]);

  return { emotionData };
};
