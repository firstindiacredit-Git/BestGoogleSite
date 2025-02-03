import React, { useState, useEffect, useRef } from 'react';
import { Back } from './back';

const OnlineScreenshot = () => {
    const [isCaptured, setIsCaptured] = useState(false);
    const [dataAvailableCount, setDataAvailableCount] = useState(0);
    const videoElem = useRef(null);
    const canvasElem = useRef(null);
    const mediaRecorder = useRef(null);
    const recordedChunks = useRef([]);
    const [showBrowserWarning, setShowBrowserWarning] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState('png');
    const [shareError, setShareError] = useState('');
    const [fileName, setFileName] = useState('screenshot');

    useEffect(() => {
        checkBrowser();
    }, []);

    const checkBrowser = () => {
        if (
            typeof navigator.mediaDevices !== 'object' ||
            typeof navigator.mediaDevices.getDisplayMedia !== 'function'
        ) {
            setShowBrowserWarning(true);
        }
    };

    const startCapture = async () => {
        try {
            const displayMediaOptions = {
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
                audio: false,
            };
            const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
            videoElem.current.srcObject = stream;
            videoElem.current.play();
            videoElem.current.muted = true;

            mediaRecorder.current = new MediaRecorder(stream, {
                mimeType: 'video/webm; codecs=vp8',
            });

            mediaRecorder.current.ondataavailable = handleDataAvailable;
            mediaRecorder.current.start(100);

            stream.getVideoTracks()[0].onended = stopCapture;
        } catch (err) {
            console.error('Error starting capture:', err);
        }
    };

    const handleDataAvailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.current.push(event.data);
            setDataAvailableCount((prev) => prev + 1);

            if (dataAvailableCount === 1) {
                stopCapture();
            } else if (dataAvailableCount === 2) {
                const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
                videoElem.current.src = URL.createObjectURL(blob);
                videoElem.current.autoplay = false;
                videoElem.current.muted = true;
            }
        }
    };

    const stopCapture = () => {
        if (videoElem.current.srcObject) {
            videoElem.current.srcObject.getTracks().forEach((track) => track.stop());
            videoElem.current.srcObject = null;
        }
    };

    const onCanPlay = () => {
        if (document.hidden) {
            document.addEventListener(
                'visibilitychange',
                () => {
                    if (!document.hidden) {
                        setTimeout(setCanvas, 500);
                    }
                },
                { once: true }
            );
        } else {
            setTimeout(setCanvas, 500);
        }
    };

    const setCanvas = () => {
        const ctx = canvasElem.current.getContext('2d');
        canvasElem.current.width = videoElem.current.videoWidth;
        canvasElem.current.height = videoElem.current.videoHeight;
        ctx.drawImage(videoElem.current, 0, 0);
        setIsCaptured(true);
        videoElem.current.style.display = 'none';
        canvasElem.current.style.display = 'block';
    };

    const saveScreenshot = () => {
        if (!canvasElem.current) return;
        
        const link = document.createElement('a');
        const imageData = canvasElem.current.toDataURL(`image/${selectedFormat}`);
        
        link.download = `${fileName}.${selectedFormat}`;
        link.href = imageData;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const shareScreenshot = async () => {
        if (!canvasElem.current) return;
        
        try {
            const blob = await new Promise(resolve => {
                canvasElem.current.toBlob(resolve, `image/${selectedFormat}`);
            });
            
            const file = new File([blob], `${fileName}.${selectedFormat}`, { 
                type: `image/${selectedFormat}` 
            });

            if (navigator.share) {
                await navigator.share({
                    files: [file],
                    title: fileName,
                    text: `Check out this screenshot: ${fileName}`
                });
            } else {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            [file.type]: blob
                        })
                    ]);
                    alert('Screenshot copied to clipboard!');
                } catch (err) {
                    setShareError('Sharing not supported on this device/browser');
                }
            }
        } catch (err) {
            console.error('Error sharing:', err);
            setShareError('Failed to share screenshot');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-[30px] shadow-lg border-2 border-gray-100">
                    <Back />
                    <div className="p-6">
                        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
                            Screenshot Tool
                        </h1>

                        {showBrowserWarning && (
                            <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <p className="ml-3 text-sm text-amber-700">
                                        Your browser doesn't support screen capture. Please use Chrome, Firefox, or Safari.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Capture Button */}
                            <div className="flex justify-center">
                                <button
                                    onClick={startCapture}
                                    className="relative group px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors shadow-lg flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>Capture Screenshot</span>
                                </button>
                            </div>

                            {/* Preview Area */}
                            <div className="relative rounded-xl overflow-hidden bg-gray-900">
                                <video 
                                    ref={videoElem} 
                                    onCanPlay={onCanPlay}
                                    className="w-full aspect-video"
                                    controls
                                ></video>
                                <canvas 
                                    ref={canvasElem} 
                                    style={{ display: 'none' }}
                                    className="w-full"
                                ></canvas>
                            </div>

                            {isCaptured && (
                                <div className="space-y-6">
                                    {shareError && (
                                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-red-700">{shareError}</p>
                                                </div>
                                                <div className="ml-auto pl-3">
                                                    <button
                                                        type="button"
                                                        className="inline-flex text-red-400 hover:text-red-500"
                                                        onClick={() => setShareError('')}
                                                    >
                                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* File Name and Format */}
                                    <div className="max-w-md mx-auto">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Screenshot Name
                                        </label>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={fileName}
                                                    onChange={(e) => setFileName(e.target.value)}
                                                    className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition-colors"
                                                    placeholder="Enter file name..."
                                                />
                                            </div>
                                            <select
                                                value={selectedFormat}
                                                onChange={(e) => setSelectedFormat(e.target.value)}
                                                className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition-colors"
                                            >
                                                <option value="png">PNG</option>
                                                <option value="jpeg">JPEG</option>
                                                <option value="webp">WebP</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={saveScreenshot}
                                            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download
                                        </button>
                                        <button
                                            onClick={shareScreenshot}
                                            className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg>
                                            Share
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

export default OnlineScreenshot;
