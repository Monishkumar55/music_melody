import React, { useEffect, useRef, useState } from 'react';

const CameraFeed = ({ onVideoPlay, isActive }) => {
  const videoRef = useRef(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameraError, setCameraError] = useState('');

  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }, 
          audio: false 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setPermissionDenied(false);
        setCameraError('');
      } catch (err) {
        console.error('Error accessing camera:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionDenied(true);
          setCameraError('Camera permission was denied. Please allow camera access to use emotion detection.');
        } else {
          setCameraError('Unable to access camera. Please ensure you have a working webcam.');
        }
      }
    };

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

  if (permissionDenied || cameraError) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-2xl border border-gray-700 p-6 text-center">
        <div className="text-red-400">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium">{cameraError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black border border-gray-800 shadow-xl aspect-video">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onPlay={() => {
          if (onVideoPlay) onVideoPlay(videoRef);
        }}
        className="w-full h-full object-cover transform scale-x-[-1]" // Mirrors the camera
      />
      
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <p className="text-gray-300 font-medium">Camera Paused</p>
        </div>
      )}
      
      {/* Recording indicator */}
      {isActive && (
        <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-white uppercase tracking-wider">Live</span>
        </div>
      )}
    </div>
  );
};

export default CameraFeed;
