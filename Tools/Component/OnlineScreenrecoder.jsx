import React, { useState, useRef } from "react";
import { Back } from "./back";

const OnlineScreenrecoder = () => {
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const videoRef = useRef(null);
  const [fileName, setFileName] = useState("screen-record");
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startCapture = async () => {
    setRecording(true);
    setRecordingTime(0);
    try {
      const displayMediaOptions = {
        video: true,
        audio: true,
      };
      const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      videoRef.current.srcObject = stream;
      videoRef.current.autoplay = true;
      videoRef.current.muted = true;

      const options = { mimeType: "video/webm; codecs=vp8" };
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks([event.data]);
          const blob = new Blob([event.data], { type: "video/webm" });
          videoRef.current.src = URL.createObjectURL(blob);
          videoRef.current.muted = false;
        }
      };

      stream.getVideoTracks()[0].onended = () => stopCapture();
      mediaRecorder.start();

      // Start the timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error: ", err);
    }
  };

  const stopCapture = () => {
    setRecording(false);
    if (videoRef.current.srcObject) {
      let tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    // Clear the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const saveRecording = () => {
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `${fileName}.webm`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const shareRecording = () => {
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const file = new File([blob], `${fileName}.webm`, { type: "video/webm" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator
        .share({
          files: [file],
          title: fileName,
          text: `${fileName}.webm`,
          url: window.location.href,
        })
        .then(() => console.log("Share was successful."))
        .catch((error) => console.error("Sharing failed", error));
    } else {
      console.error("Your system does not support sharing files.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[30px] shadow-lg border-2 border-gray-100">
          <Back />
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Screen Recorder
            </h1>

            <div className="space-y-8">
              {/* Record Button */}
              <div className="flex justify-center">
                <button
                  onClick={recording ? stopCapture : startCapture}
                  className={`relative group p-4 rounded-full shadow-lg transition-all duration-200 ${
                    recording 
                      ? "bg-red-500 hover:bg-red-600" 
                      : "bg-teal-500 hover:bg-teal-600"
                  }`}
                >
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {recording ? "Stop Recording" : "Start Recording"}
                  </span>
                  {recording ? (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <rect x="6" y="6" width="8" height="8" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="6" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Video Preview */}
              <div className="relative rounded-xl overflow-hidden bg-gray-900">
                {recording && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-2">
                    <span className="animate-pulse w-2 h-2 bg-white rounded-full"></span>
                    <span>{formatTime(recordingTime)}</span>
                  </div>
                )}
                <video
                  ref={videoRef}
                  className="w-full aspect-video"
                  controls
                  autoPlay
                ></video>
              </div>

              {/* File Name Input */}
              <div className="max-w-md mx-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recording Name
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition-colors"
                    placeholder="Enter file name..."
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-400 text-sm">.webm</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {recordedChunks.length > 0 && (
                <div className="flex justify-center gap-4">
                  <button
                    onClick={saveRecording}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors group relative"
                  >
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Download Recording
                    </span>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                  <button
                    onClick={shareRecording}
                    className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors group relative"
                  >
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Share Recording
                    </span>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineScreenrecoder;
