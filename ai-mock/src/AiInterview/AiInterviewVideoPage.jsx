import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Square, Video, AlertCircle, CheckCircle, Loader, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AiInterviewPage() {
  const navigate = useNavigate();
  
  // States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('idle'); // idle, recording, processing, error
  const [processingStep, setProcessingStep] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState('');
  
  // Refs
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopCamera();
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startInterview = async () => {
    try {
      setError('');
      setCurrentStatus('recording');
      
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;
      
      // Show video preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Setup MediaRecorder
      const options = { mimeType: 'video/webm;codecs=vp9' };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        await processRecording();
      };

      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

    } catch (err) {
      console.error('Error starting interview:', err);
      setError('Could not access camera/microphone. Please grant permissions.');
      setCurrentStatus('error');
    }
  };

  const endInterview = () => {
    if (mediaRecorderRef.current && isRecording) {
      setIsRecording(false);
      mediaRecorderRef.current.stop();
      setCurrentStatus('processing');
      setProcessingStep('Preparing your video...');
      setAnalysisProgress(10);
    }
  };

  const processRecording = async () => {
    try {
      // Create video blob
      setProcessingStep('Creating video file...');
      setAnalysisProgress(20);
      
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      chunksRef.current = [];

      // Stop camera
      stopCamera();

      // Upload to backend
      setProcessingStep('Uploading video to server...');
      setAnalysisProgress(30);

      const formData = new FormData();
      formData.append('video', blob, 'interview.webm');

      const response = await fetch('http://localhost:5000/upload-video', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload video');
      }

      setProcessingStep('Analyzing your performance...');
      setAnalysisProgress(50);

      const data = await response.json();

      if (data.success) {
        // Simulate analysis progress
        await simulateAnalysisProgress();
        
        setProcessingStep('Complete!');
        setAnalysisProgress(100);
        
        // Navigate to report with results
        setTimeout(() => {
          navigate('/report', { 
            state: { 
              videoUrl: data.video_url, 
              analysisUrl: data.analysis_url 
            } 
          });
        }, 500);

      } else {
        throw new Error(data.error || 'Analysis failed');
      }

    } catch (err) {
      console.error('Processing error:', err);
      setError(`Failed to process interview: ${err.message}`);
      setCurrentStatus('error');
    }
  };

  const simulateAnalysisProgress = () => {
    return new Promise((resolve) => {
      const steps = [
        { text: 'Analyzing facial expressions...', duration: 2000, progress: 60 },
        { text: 'Detecting eye contact...', duration: 2000, progress: 70 },
        { text: 'Transcribing your speech...', duration: 2500, progress: 80 },
        { text: 'Evaluating communication skills...', duration: 1500, progress: 85 },
        { text: 'Generating your report...', duration: 1000, progress: 95 }
      ];

      let stepIndex = 0;
      
      const runStep = () => {
        if (stepIndex < steps.length) {
          const step = steps[stepIndex];
          setProcessingStep(step.text);
          setAnalysisProgress(step.progress);
          stepIndex++;
          setTimeout(runStep, step.duration);
        } else {
          resolve();
        }
      };

      runStep();
    });
  };

  const restartInterview = () => {
    setCurrentStatus('idle');
    setRecordingTime(0);
    setError('');
    setProcessingStep('');
    setAnalysisProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Interview Practice</h1>
          <p className="text-gray-300">
            {currentStatus === 'idle' && 'Click Start Interview to begin your practice session'}
            {currentStatus === 'recording' && 'Recording your interview - speak naturally and maintain eye contact'}
            {currentStatus === 'processing' && 'Analyzing your performance - please wait'}
            {currentStatus === 'error' && 'An error occurred - please try again'}
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Video Area */}
          <div className="relative bg-gray-900 aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span className="font-semibold">REC {formatTime(recordingTime)}</span>
              </div>
            )}

            {/* Idle Overlay */}
            {currentStatus === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                <div className="text-center text-white">
                  <Camera className="w-20 h-20 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-medium">Camera will activate when you start</p>
                </div>
              </div>
            )}

            {/* Processing Overlay */}
            {currentStatus === 'processing' && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/95 to-purple-900/95">
                <div className="text-center text-white max-w-md px-6">
                  <Loader className="w-16 h-16 mx-auto mb-6 animate-spin" />
                  <h3 className="text-2xl font-bold mb-4">{processingStep}</h3>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                    <div 
                      className="bg-white h-3 rounded-full transition-all duration-500"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  <p className="text-sm opacity-80">{analysisProgress}% complete</p>
                  
                  <p className="mt-6 text-sm opacity-70">
                    This usually takes 30-60 seconds. Please don't close this window.
                  </p>
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {currentStatus === 'error' && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-900/90">
                <div className="text-center text-white max-w-md px-6">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Something went wrong</h3>
                  <p className="mb-6">{error}</p>
                  <button
                    onClick={restartInterview}
                    className="bg-white text-red-900 px-6 py-3 rounded-lg font-semibold hover:bg-red-50"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-6 bg-slate-800">
            {currentStatus === 'idle' && (
              <div className="text-center">
                <button
                  onClick={startInterview}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg transform hover:scale-105 flex items-center gap-3 mx-auto"
                >
                  <Video className="w-6 h-6" />
                  Start Interview
                </button>
                
                {/* Instructions */}
                <div className="mt-8 grid md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <Camera className="w-8 h-8 text-indigo-400 mb-2" />
                    <h4 className="font-semibold text-white mb-1">Position Yourself</h4>
                    <p className="text-sm text-gray-300">Sit in a well-lit area facing the camera</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <Mic className="w-8 h-8 text-indigo-400 mb-2" />
                    <h4 className="font-semibold text-white mb-1">Speak Clearly</h4>
                    <p className="text-sm text-gray-300">Answer questions naturally and confidently</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <Clock className="w-8 h-8 text-indigo-400 mb-2" />
                    <h4 className="font-semibold text-white mb-1">Take Your Time</h4>
                    <p className="text-sm text-gray-300">Record for at least 30 seconds</p>
                  </div>
                </div>
              </div>
            )}

            {currentStatus === 'recording' && (
              <div className="text-center">
                <button
                  onClick={endInterview}
                  className="bg-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-red-700 transition-all shadow-lg transform hover:scale-105 flex items-center gap-3 mx-auto"
                >
                  <Square className="w-6 h-6" />
                  End Interview & Get Report
                </button>
                
                <p className="mt-4 text-sm text-gray-300">
                  Recording: {formatTime(recordingTime)} • Click "End Interview" when you're done
                </p>
                
                {recordingTime < 30 && (
                  <div className="mt-4 bg-yellow-900/50 border border-yellow-700 rounded-lg p-3 max-w-md mx-auto">
                    <p className="text-sm text-yellow-300">
                      💡 Tip: Record for at least 30 seconds for accurate analysis
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStatus === 'processing' && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-indigo-400">
                  <Loader className="w-5 h-5 animate-spin" />
                  <span className="font-medium text-white">Processing... Please wait</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        {currentStatus === 'idle' && (
          <div className="mt-8 bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">What We Analyze:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Facial Expressions</h4>
                  <p className="text-sm text-gray-300">Detect emotions and engagement levels</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Eye Contact</h4>
                  <p className="text-sm text-gray-300">Measure camera engagement percentage</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Speech Fluency</h4>
                  <p className="text-sm text-gray-300">Count filler words and analyze clarity</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Speech Transcription</h4>
                  <p className="text-sm text-gray-300">Get full transcript of your speech</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}