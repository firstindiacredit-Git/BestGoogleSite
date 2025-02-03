import React, { useState, useRef, useEffect } from 'react';
import { Back } from './back';

const OnlineVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [micPermission, setMicPermission] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const timerRef = useRef(null);
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      drawVisualizer();
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };
  
  const pauseRecording = () => {
    if (isPaused) {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      clearInterval(timerRef.current);
    }
    setIsPaused(!isPaused);
  };
  
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    streamRef.current.getTracks().forEach(track => track.stop());
    setIsRecording(false);
    setIsPaused(false);
    clearInterval(timerRef.current);
  };
  
  const drawVisualizer = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    analyserRef.current.fftSize = 2048;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!isRecording) return;
      
      requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0ea5e9';
      ctx.beginPath();
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;
        
        ctx.moveTo(x, canvas.height);
        ctx.lineTo(x, canvas.height - barHeight);
        
        x += barWidth + 1;
      }
      
      ctx.stroke();
    };
    
    draw();
  };
  
  const testMicrophone = async () => {
    setIsTesting(true);
    setTestMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission(true);
      
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      let startTime = Date.now();
      let hasSound = false;
      
      const checkSound = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        
        if (average > 10) {
          hasSound = true;
        }
        
        if (Date.now() - startTime < 2000 && !hasSound) {
          requestAnimationFrame(checkSound);
        } else {
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
          setIsTesting(false);
          setTestMessage(hasSound ? "Microphone is working properly!" : "No sound detected. Please check your microphone.");
          setTimeout(() => {
            setTestMessage('');
          }, 2000);
        }
      };
      
      checkSound();
    } catch (err) {
      console.error('Error testing microphone:', err);
      setMicPermission(false);
      setIsTesting(false);
      setTestMessage('Error accessing microphone. Please check permissions.');
      setTimeout(() => {
        setTestMessage('');
      }, 2000);
    }
  };

  const downloadRecording = () => {
    if (audioBlob) {
      const url = window.URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'recording.webm';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[30px] shadow-lg border-2 border-gray-100">
          <Back />
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Voice Recorder
            </h1>

            <div className="space-y-8">
              {/* Test Microphone Button */}
              <div className="flex justify-center">
                <button
                  onClick={testMicrophone}
                  disabled={isTesting || isRecording}
                  className="inline-flex items-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative group"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Test Microphone
                </button>
              </div>

              {testMessage && (
                <div className={`text-center text-sm ${testMessage.includes('working') ? 'text-green-600' : 'text-red-600'}`}>
                  {testMessage}
                </div>
              )}

              {/* Visualizer */}
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={100}
                  className="w-full h-32 rounded-xl bg-slate-50"
                />
                {isRecording && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {formatTime(recordingTime)}
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center items-center gap-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg group relative"
                  >
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Start Recording
                    </span>
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="6" />
                    </svg>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={pauseRecording}
                      className="p-4 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors shadow-lg group relative"
                    >
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {isPaused ? 'Resume' : 'Pause'}
                      </span>
                      {isPaused ? (
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={stopRecording}
                      className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg group relative"
                    >
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Stop Recording
                      </span>
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <rect x="6" y="6" width="8" height="8" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Audio Player */}
              {audioURL && (
                <div className="space-y-4">
                  <audio controls className="w-full" src={audioURL}>
                    Your browser does not support the audio element.
                  </audio>
                  <div className="flex justify-center">
                    <button
                      onClick={downloadRecording}
                      className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Recording
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineVoiceRecorder;