import * as faceapi from 'face-api.js';

let modelsLoaded = false;

/**
 * Loads the face-api models.
 * Assumes the models are placed in the /models directory in the public folder.
 */
export const loadFaceApiModels = async () => {
  if (modelsLoaded) return;
  
  try {
    const MODEL_URL = '/models';
    
    // We only need tiny face detector and face expression models for this feature
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);
    
    modelsLoaded = true;
    console.log('Face API models loaded successfully');
  } catch (error) {
    console.error('Error loading face-api models:', error);
    throw new Error('Failed to load emotion detection models.');
  }
};

/**
 * Detects face and emotion from a video element.
 * @param {HTMLVideoElement} videoElement 
 * @returns {Object} { emotion, confidence, facesCount }
 */
export const detectEmotion = async (videoElement) => {
  if (!modelsLoaded) {
    await loadFaceApiModels();
  }

  if (!videoElement || videoElement.paused || videoElement.ended) {
    return { emotion: null, confidence: 0, facesCount: 0 };
  }

  try {
    const detections = await faceapi
      .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detections.length === 0) {
      return { emotion: null, confidence: 0, facesCount: 0, status: 'No Face Detected' };
    }

    if (detections.length > 1) {
      return { emotion: null, confidence: 0, facesCount: detections.length, status: 'Multiple Faces Detected' };
    }

    const face = detections[0];
    const expressions = face.expressions;

    // Find the emotion with the highest confidence
    let highestEmotion = '';
    let maxConfidence = 0;

    for (const [emotion, confidence] of Object.entries(expressions)) {
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        highestEmotion = emotion;
      }
    }

    return {
      emotion: highestEmotion, // e.g., 'happy', 'sad', 'angry', 'neutral', 'surprised', 'fearful', 'disgusted'
      confidence: Math.round(maxConfidence * 100),
      facesCount: 1,
      status: 'Face Detected'
    };
  } catch (error) {
    console.error('Error during emotion detection:', error);
    return { emotion: null, confidence: 0, facesCount: 0, status: 'Detection Error' };
  }
};
