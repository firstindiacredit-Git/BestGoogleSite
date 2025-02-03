import React, { useState, useEffect, useRef } from 'react';
import { Back } from './back';

const OnlineWebcamTest = () => {
    const [videoTracks, setVideoTracks] = useState(null);
    const [audioTracks, setAudioTracks] = useState(null);
    const [alertVisible, setAlertVisible] = useState(false);
    const [selectedCameraIndex, setSelectedCameraIndex] = useState(0);
    const [selectedMicIndex, setSelectedMicIndex] = useState(0);
    const [cameraOptions, setCameraOptions] = useState([]);
    const [micOptions, setMicOptions] = useState([]);
    const [isTestingActive, setIsTestingActive] = useState(false);
    const [hasCapture, setHasCapture] = useState(false);
    const videoRef = useRef(null);
    const imageRef = useRef(null);
    const micCanvasRef = useRef(null);
    const [cameraSettings, setCameraSettings] = useState({
        name: '',
        resolution: '',
        width: '',
        height: '',
        aspectRatio: '',
        brightness: '',
        contrast: '',
        facingMode: '',
        frameRate: '',
        saturation: '',
        sharpness: ''
    });
    const [micSettings, setMicSettings] = useState({
        name: '',
        autoGainControl: '',
        channels: '',
        echoCancellation: '',
        latency: '',
        noiseSuppression: '',
        sampleRate: '',
        sampleSize: ''
    });

    useEffect(() => {
        initPolyfill();
        initDeviceSelection();
        return () => stopVideo();
    }, []);

    const initPolyfill = () => {
        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }
        if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = function (constraints) {
                const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                if (!getUserMedia) {
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                }
                return new Promise((resolve, reject) => {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            };
        }
    };

    const initDeviceSelection = () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.log('enumerateDevices() not supported.');
            return;
        }

        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const cams = [];
                const mics = [];
                let camIndex = 0;
                let micIndex = 0;

                devices.forEach(device => {
                    if (device.kind === 'videoinput') {
                        cams.push(`Camera #${++camIndex}`);
                    } else if (device.kind === 'audioinput') {
                        mics.push(`Microphone #${++micIndex}`);
                    }
                });

                setCameraOptions(cams);
                setMicOptions(mics);
            })
            .catch(err => {
                console.log(err.name + ': ' + err.message);
            });
    };

    const initVideo = () => {
        stopVideo();
        setIsTestingActive(true);
        setHasCapture(false);

        const constraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            },
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                facingMode: "user"
            }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                const videoTrackList = stream.getVideoTracks();
                const audioTrackList = stream.getAudioTracks();

                setVideoTracks(videoTrackList);
                setAudioTracks(audioTrackList);
                
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play()
                        .then(() => {
                            setTimeout(() => {
                                if (videoTrackList && videoTrackList.length > 0) {
                                    const videoTrack = videoTrackList[0];
                                    const settings = videoTrack.getSettings();
                                    
                                    setCameraSettings({
                                        name: videoTrack.label || 'Unknown',
                                        resolution: `${settings.width || 0}x${settings.height || 0}`,
                                        width: settings.width || 'N/A',
                                        height: settings.height || 'N/A',
                                        aspectRatio: settings.aspectRatio || 'N/A',
                                        brightness: settings.brightness || 'N/A',
                                        contrast: settings.contrast || 'N/A',
                                        facingMode: settings.facingMode || 'N/A',
                                        frameRate: Math.round(settings.frameRate) || 'N/A',
                                        saturation: settings.saturation || 'N/A',
                                        sharpness: settings.sharpness || 'N/A'
                                    });
                                }

                                if (audioTrackList && audioTrackList.length > 0) {
                                    const audioTrack = audioTrackList[0];
                                    const settings = audioTrack.getSettings();
                                    
                                    setMicSettings({
                                        name: audioTrack.label || 'Unknown',
                                        autoGainControl: settings.autoGainControl ? 'Yes' : 'No',
                                        channels: settings.channelCount || 'N/A',
                                        echoCancellation: settings.echoCancellation ? 'Yes' : 'No',
                                        latency: settings.latency || 'N/A',
                                        noiseSuppression: settings.noiseSuppression ? 'Yes' : 'No',
                                        sampleRate: settings.sampleRate || 'N/A',
                                        sampleSize: settings.sampleSize || 'N/A'
                                    });
                                }
                            }, 500);
                        });
                }
            })
            .catch(err => {
                console.error('Error accessing media devices:', err);
                setAlertVisible(true);
            });
    };

    const stopVideo = () => {
        if (videoTracks) {
            videoTracks.forEach(track => track.stop());
        }
        setIsTestingActive(false);
    };

    const getImage = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        imageRef.current.src = canvas.toDataURL('image/png');
        setHasCapture(true);
    };

    const downloadImage = () => {
        const link = document.createElement('a');
        link.download = 'captured-image.png';
        link.href = imageRef.current.src;
        link.click();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-[30px] shadow-lg border-2 border-gray-100">
                    <Back />
                    <div className="p-6">
                        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
                            Webcam Test
                        </h1>

                        {alertVisible && (
                            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="ml-3 text-sm text-red-700">
                                        Unable to access camera or microphone. Please check your permissions.
                                    </p>
                                    <button 
                                        onClick={() => setAlertVisible(false)}
                                        className="ml-auto text-red-400 hover:text-red-500"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column - Video and Controls */}
                            <div className="space-y-6">
                                {/* Device Selection */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Camera
                                        </label>
                                        <select
                                            value={selectedCameraIndex}
                                            onChange={(e) => setSelectedCameraIndex(Number(e.target.value))}
                                            className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition-colors"
                                        >
                                            {cameraOptions.map((cam, index) => (
                                                <option key={index} value={index}>{cam}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Microphone
                                        </label>
                                        <select
                                            value={selectedMicIndex}
                                            onChange={(e) => setSelectedMicIndex(Number(e.target.value))}
                                            className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition-colors"
                                        >
                                            {micOptions.map((mic, index) => (
                                                <option key={index} value={index}>{mic}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Video Preview */}
                                <div className="relative rounded-xl overflow-hidden bg-gray-900">
                                    <video
                                        ref={videoRef}
                                        className="w-full aspect-video"
                                        autoPlay
                                        playsInline
                                        muted
                                    ></video>
                                    {!isTestingActive && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                            <p className="text-white text-lg">Click Start Test to begin</p>
                                        </div>
                                    )}
                                </div>

                                {/* Control Buttons */}
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={isTestingActive ? stopVideo : initVideo}
                                        className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 ${
                                            isTestingActive
                                                ? "bg-red-500 hover:bg-red-600 text-white"
                                                : "bg-teal-500 hover:bg-teal-600 text-white"
                                        } transition-colors`}
                                    >
                                        {isTestingActive ? (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                                </svg>
                                                <span>Stop Test</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>Start Test</span>
                                            </>
                                        )}
                                    </button>

                                    {isTestingActive && (
                                        <button
                                            onClick={getImage}
                                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>Take Photo</span>
                                        </button>
                                    )}
                                </div>

                                {/* Captured Image */}
                                {hasCapture && (
                                    <div className="space-y-4">
                                        <div className="relative rounded-xl overflow-hidden bg-gray-900">
                                            <img
                                                ref={imageRef}
                                                className="w-full"
                                                alt="Captured"
                                            />
                                        </div>
                                        <div className="flex justify-center">
                                            <button
                                                onClick={downloadImage}
                                                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                <span>Download Photo</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Device Info */}
                            <div className="space-y-6">
                                {/* Camera Settings */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Camera Information</h3>
                                    <div className="divide-y divide-gray-200">
                                        {Object.entries(cameraSettings).map(([key, value]) => (
                                            <div key={key} className="py-3 flex justify-between">
                                                <span className="text-sm font-medium text-gray-500">
                                                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                                </span>
                                                <span className="text-sm text-gray-900">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Microphone Settings */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Microphone Information</h3>
                                    <div className="divide-y divide-gray-200">
                                        {Object.entries(micSettings).map(([key, value]) => (
                                            <div key={key} className="py-3 flex justify-between">
                                                <span className="text-sm font-medium text-gray-500">
                                                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                                </span>
                                                <span className="text-sm text-gray-900">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnlineWebcamTest;
