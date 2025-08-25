import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import 'antd/dist/reset.css';
import {
    Layout,
    Button,
    Typography,
    Space,
    Badge,
    Row,
    Col,
    Input,
    Modal,
    message,
    Alert,
    ConfigProvider
} from "antd";
import {
    DesktopOutlined,
    PoweroffOutlined,
    LinkOutlined,
    DownloadOutlined,
    CloseCircleOutlined,
    LaptopOutlined,
    CloseOutlined,
    LockOutlined,
    RightOutlined,
    CodeOutlined,
    AppstoreOutlined,
    TeamOutlined,
    EyeOutlined,
    VideoCameraOutlined,
    StopOutlined,
    DeleteOutlined
} from "@ant-design/icons";

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

// Create socket with reconnection options
const socket = io(
    "https://flydesk.pizeonfly.com",
    // "http://192.168.29.140:8080",
    // "http://localhost:8080",
    {
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
    });

function Main({ user, onLogout }) {
    const canvasRef = useRef(null);
    const [hostId, setHostId] = useState("");
    const [availableHosts, setAvailableHosts] = useState([]);
    const [connected, setConnected] = useState(false);
    const [keyboardActive, setKeyboardActive] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState("Connected");
    const [modifierKeys, setModifierKeys] = useState({
        shift: false,
        control: false,
        alt: false,
        meta: false,
        capsLock: false
    });
    const [fullScreenMode, setFullScreenMode] = useState(false);
    const [currentHostInfo, setCurrentHostInfo] = useState(null);
    const [sessionCode, setSessionCode] = useState("");
    const [codeInputVisible, setCodeInputVisible] = useState(false);
    const [pendingConnection, setPendingConnection] = useState(false);
    const [pendingHostInfo, setPendingHostInfo] = useState(null);
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingStatus, setRecordingStatus] = useState(null);
    const [recordingProgress, setRecordingProgress] = useState(null);
    const [recordedFiles, setRecordedFiles] = useState([]);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const [recording, setRecording] = useState(false);
    const [recordedVideo, setRecordedVideo] = useState(null);
    const [recordingModalVisible, setRecordingModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [connectByPasswordVisible, setConnectByPasswordVisible] = useState(false);
    const [hostPassword, setHostPassword] = useState("");
    const [machineIdInput, setMachineIdInput] = useState("");
    const [savedHosts, setSavedHosts] = useState(() => {
        // Load saved hosts from localStorage
        try {
            const saved = localStorage.getItem('savedHosts');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load saved hosts", e);
            return [];
        }
    });





    useEffect(() => {
        // Socket connection listeners
        socket.on("connect", () => {
            setConnectionStatus("Connected");
            
            // Show success message when connected and auto-hide after 3 seconds
            message.success("Server Connected Successfully!", 3);

            if (hostId) {
                socket.emit("connect-to-host", hostId);
                socket.emit("request-screen", {
                    to: hostId,
                    from: socket.id
                });
            }
        });

        socket.on("disconnect", (reason) => {
            setConnectionStatus(`Disconnected: ${reason}. Reconnecting...`);
        });

        socket.io.on("reconnect_attempt", (attempt) => {
            setConnectionStatus(`Reconnecting... (attempt ${attempt})`);
        });

        socket.io.on("reconnect", () => {
            setConnectionStatus("Reconnected!");
            setTimeout(() => {
                setConnectionStatus("Connected");
            }, 2000);
        });

        // Keep-alive ping
        const pingInterval = setInterval(() => {
            if (socket.connected) {
                socket.emit("keep-alive");
            }
        }, 15000);

        // Host availability handler
        socket.on("host-available", (hostInfo) => {
            setAvailableHosts(prev => {
                const exists = prev.some(host => host.id === hostInfo.id);
                if (exists) {
                    return prev.map(host =>
                        host.id === hostInfo.id ? hostInfo : host
                    );
                } else {
                    return [...prev, hostInfo];
                }
            });
        });

        // Screen data handler
        socket.on("screen-data", (data) => {
            if (!canvasRef.current) return;

            const img = new Image();
            img.onload = () => {
                const ctx = canvasRef.current.getContext('2d');
                ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
            };
            img.src = data.imageData;
        });

        // Key event handlers
        const handleKeyDown = (e) => {
            if (!hostId) return;

            // Track modifier keys
            if (e.key === 'Shift') setModifierKeys(prev => ({ ...prev, shift: true }));
            else if (e.key === 'Control') setModifierKeys(prev => ({ ...prev, control: true }));
            else if (e.key === 'Alt') setModifierKeys(prev => ({ ...prev, alt: true }));
            else if (e.key === 'Meta') setModifierKeys(prev => ({ ...prev, meta: true }));
            else if (e.key === 'CapsLock') setModifierKeys(prev => ({ ...prev, capsLock: !prev.capsLock }));

            e.preventDefault();

            socket.emit("remote-key-event", {
                to: hostId,
                type: "down",
                key: e.key,
                code: e.code,
                keyCode: e.keyCode,
                modifiers: {
                    shift: e.shiftKey,
                    control: e.ctrlKey,
                    alt: e.altKey,
                    meta: e.metaKey,
                    capsLock: e.getModifierState('CapsLock')
                }
            });
        };

        const handleKeyUp = (e) => {
            if (!hostId) return;

            // Update modifier key states
            if (e.key === 'Shift') setModifierKeys(prev => ({ ...prev, shift: false }));
            else if (e.key === 'Control') setModifierKeys(prev => ({ ...prev, control: false }));
            else if (e.key === 'Alt') setModifierKeys(prev => ({ ...prev, alt: false }));
            else if (e.key === 'Meta') setModifierKeys(prev => ({ ...prev, meta: false }));

            e.preventDefault();

            socket.emit("remote-key-event", {
                to: hostId,
                type: "up",
                key: e.key,
                code: e.code,
                keyCode: e.keyCode,
                modifiers: {
                    shift: e.shiftKey,
                    control: e.ctrlKey,
                    alt: e.altKey,
                    meta: e.metaKey,
                    capsLock: e.getModifierState('CapsLock')
                }
            });
        };

        // Add keyboard listeners
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        // Connection handlers
        socket.on("host-disconnect-ack", () => {
            setHostId("");
            setConnected(false);
            setKeyboardActive(false);
        });

        socket.on("code-accepted", (hostInfo) => {
            message.success("Code accepted! Waiting for host approval...");
            setPendingConnection(true);
            setPendingHostInfo(hostInfo);
        });

        socket.on("code-rejected", (data) => {
            message.error(data.message || "Invalid session code");
            setPendingConnection(false);
        });

        socket.on("connection-accepted", (hostInfo) => {
            message.success("Connection approved by host!");
            setPendingConnection(false);

            setHostId(hostInfo.hostId);
            setConnected(true);
            setFullScreenMode(true);
            setCurrentHostInfo({
                id: hostInfo.hostId,
                name: hostInfo.hostName
            });

            socket.emit("connect-to-host", hostInfo.hostId);
            socket.emit("request-screen", {
                to: hostInfo.hostId,
                from: socket.id
            });

            setKeyboardActive(true);
        });

        socket.on("connection-rejected", () => {
            message.error("Connection rejected by host");
            setPendingConnection(false);
            setPendingHostInfo(null);
        });

        socket.on("recording-status", (data) => {
            setRecordingStatus(data.status);
            if (data.progress) {
                setRecordingProgress(data.progress);
            }
            if (data.error) {
                message.error(`Recording error: ${data.error}`);
            }

            if (data.status === "recording") {
                setIsRecording(true);
            } else if (["error", "stopped", "cancelled"].includes(data.status)) {
                setIsRecording(false);
            }
        });

        socket.on("recording-complete", (data) => {
            setIsRecording(false);
            setRecordingStatus("completed");

            message.success(`Recording completed! Duration: ${Math.floor(data.duration / 60)}:${(data.duration % 60).toString().padStart(2, '0')}`);

            // Add to recorded files list
            setRecordedFiles(prev => [...prev, {
                id: data.recordingId,
                duration: data.duration,
                size: data.fileSize,
                date: new Date().toLocaleString(),
                path: data.filePath
            }]);
        });

        // Add password-related event listeners
        socket.on("password-set-notification", (data) => {
            message.success("Password set successfully for this connection!");

            // Save this host in localStorage for future connections
            const newSavedHost = {
                hostId: data.hostId,
                machineId: data.machineId,
                name: currentHostInfo?.name || "Unknown Host",
                lastConnected: new Date().toISOString()
            };

            setSavedHosts(prev => {
                // Update if exists, add if not
                const updated = prev.some(h => h.machineId === data.machineId)
                    ? prev.map(h => h.machineId === data.machineId ? { ...h, ...newSavedHost } : h)
                    : [...prev, newSavedHost];

                // Save to localStorage
                localStorage.setItem('savedHosts', JSON.stringify(updated));
                return updated;
            });
        });

        socket.on("password-auth-response", (data) => {
            if (data.success) {
                message.success("Password accepted!");
            } else {
                message.error(data.message || "Password authentication failed");
            }
        });

        return () => {
            // Cleanup
            socket.off("host-available");
            socket.off("screen-data");
            socket.off("connect");
            socket.off("disconnect");
            socket.io.off("reconnect_attempt");
            socket.io.off("reconnect");
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            clearInterval(pingInterval);
            socket.off("password-set-notification");
            socket.off("password-auth-response");
        };
    }, [hostId, modifierKeys]);

    // Save hosts to localStorage when they change
    useEffect(() => {
        localStorage.setItem('savedHosts', JSON.stringify(savedHosts));
    }, [savedHosts]);

    const connectToHost = (hostInfo) => {
        setHostId(hostInfo.id);
        setConnected(true);
        setFullScreenMode(true);
        setCurrentHostInfo(hostInfo);

        socket.emit("connect-to-host", hostInfo.id);
        socket.emit("request-screen", {
            to: hostInfo.id,
            from: socket.id
        });

        setKeyboardActive(true);
    };

    // Mouse handlers
    const handleMouseMove = (e) => {
        if (!hostId) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;

        const scaledX = x * scaleX;
        const scaledY = y * scaleY;

        socket.emit("remote-mouse-move", {
            to: hostId,
            x: scaledX,
            y: scaledY,
            screenWidth: canvasRef.current.width,
            screenHeight: canvasRef.current.height
        });
    };

    const handleMouseClick = (e) => {
        e.preventDefault();
        if (!hostId) return;

        let button = "left";
        if (e.button === 1) button = "middle";
        if (e.button === 2) button = "right";

        socket.emit("remote-mouse-click", {
            to: hostId,
            button: button
        });
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        return false;
    };

    const handleMouseWheel = (e) => {
        if (!hostId) return;
        e.preventDefault();

        const delta = e.deltaY || e.detail || e.wheelDelta;

        socket.emit("remote-mouse-scroll", {
            to: hostId,
            deltaY: delta
        });
    };

    // Define the handleDisconnect function first 
    const handleDisconnect = () => {
        // Stop recording if it's active
        if (recording) {
            stopRecording();
        }

        // Then handle disconnection
        if (hostId) {
            socket.emit("client-disconnect-request", {
                from: socket.id,
                to: hostId
            });

            setTimeout(() => {
                setHostId("");
                setConnected(false);
                setKeyboardActive(false);
                setCurrentHostInfo(null);
            }, 500);
        }
        setFullScreenMode(false);
    };

    const showCodeInput = () => {
        setCodeInputVisible(true);
    };

    const handleCodeSubmit = () => {
        if (!sessionCode || sessionCode.length !== 6) {
            message.error("Please enter a valid 6-digit code");
            return;
        }

        socket.emit("connect-with-code", { code: sessionCode });
        setCodeInputVisible(false);
    };

    const showVideoModal = () => {
        setVideoModalVisible(true);
    };

    const closeVideoModal = () => {
        setVideoModalVisible(false);
    };

    // Global CSS styles
    const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              margin: 0;
        padding: 0;
        background-color: transparent;
        color: #FFFFFF;
        -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    * {
      box-sizing: border-box;
    }
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.3; }
      100% { opacity: 1; }
    }
    
    .dark .ant-modal .ant-modal-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.88);
        font-weight: 600;
        font-size: 16px;
        line-height: 1.5;
        word-wrap: break-word;
        background-color: transparent;
    }
    
    .remote-app-container .ant-btn-primary {
        background: #6366f1;
        border-color: #6366f1;
    }
    
    .shadow-indigo-custom {
        --tw-shadow: 0 10px 30px #6366f1;
        --tw-shadow-colored: 0 10px 30px var(--tw-shadow-color);
        box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
    }
  `;

    // Add these functions to start and stop recording
    const startRecording = async () => {
        try {
            // Request screen capture with audio
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            // Reset recorded chunks
            recordedChunksRef.current = [];

            // Create media recorder
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            // Handle data availability
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            // Handle recording stop
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                setRecordedVideo(url);
                setRecordingModalVisible(true);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            // Start recording
            mediaRecorder.start();
            setRecording(true);
            message.success("Screen recording started");
        } catch (error) {
            console.error("Error starting recording:", error);
            message.error("Failed to start recording: " + error.message);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
            message.success("Recording stopped");
        }
    };

    const closeRecordingModal = () => {
        setRecordingModalVisible(false);
    };

    // Add a new function to handle connecting with password
    const handlePasswordConnect = () => {
        if (!machineIdInput || !hostPassword) {
            message.error("Please enter both Machine ID and Password");
            return;
        }

        socket.emit("connect-with-password", {
            machineId: machineIdInput,
            password: hostPassword
        });

        setConnectByPasswordVisible(false);
        setMachineIdInput("");
        setHostPassword("");
    };

    // Add this to show the password connect modal
    const showConnectByPassword = () => {
        setConnectByPasswordVisible(true);
    };

    // Add a helper to connect to a saved host
    const connectToSavedHost = (host) => {
        setMachineIdInput(host.machineId);
        setConnectByPasswordVisible(true);
    };

    // With confirmation dialog
    const deleteSavedHost = (machineId) => {
        console.log('Deleting host with machine ID:', machineId);
        console.log('Current savedHosts:', savedHosts);

        if (window.confirm('Are you sure you want to delete this connection?')) {
            const updatedHosts = savedHosts.filter(host => host.machineId !== machineId);
            console.log('Updated savedHosts:', updatedHosts);

            setSavedHosts(updatedHosts);
            localStorage.setItem('savedHosts', JSON.stringify(updatedHosts));
            message.success('Connection deleted successfully');
        }
    };


    


    return (
        <div className="min-h-screen bg-transparent remote-app-container">
            {/* Inject global styles */}
            <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

            
            
           

            {fullScreenMode ? (
                // Fullscreen mode when connected to a host - with updated UI
                <div className="w-full h-screen flex flex-col bg-transparent overflow-hidden">
                    <div className="flex justify-between items-center px-6 py-3 bg-transparent backdrop-blur-md border-b border-white/5">
                        <Space>
                            <Badge color="#00FFFF" status="processing" />
                            <Text className="dark:text-white text-black font-medium">
                                Connected to: {currentHostInfo ? currentHostInfo.name : `Host ${hostId.substring(0, 8)}`}
                            </Text>
                            <Text className="text-red-500 dark:text-white text-xs">
                                <span className="dark:text-white text-green-500">Live session</span>
                            </Text>
                        </Space>

                        <Space>
                            {/* Add recording button */}
                            <Button
                                type={recording ? "danger" : "primary"}
                                icon={recording ? <StopOutlined /> : <VideoCameraOutlined />}
                                onClick={recording ? stopRecording : startRecording}
                                className={`mr-2.5 h-9 flex items-center justify-center font-medium rounded-md ${
                                    recording 
                                        ? 'bg-red-500/20 border-red-500/50 text-red-500' 
                                        : 'bg-blue-500/20 border-blue-500/50 text-white'
                                }`}
                            >
                                {recording ? 'Stop Recording' : 'Record Screen'}
                            </Button>

                            {/* Existing disconnect button */}
                            <Button
                                type="primary"
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={handleDisconnect}
                                className="bg-white/10 border-white/5 text-white font-medium rounded-md h-9 flex items-center justify-center backdrop-blur-md"
                            >
                                Exit Session
                            </Button>
                        </Space>
                    </div>

                    <div className="flex-1 flex justify-center items-center bg-transparent relative p-0 overflow-hidden">
                        <div className="relative rounded-lg overflow-hidden shadow-2xl max-w-full max-h-[calc(100vh-90px)]">
                            <canvas
                                ref={canvasRef}
                                width="1280"
                                height="720"
                                onMouseMove={handleMouseMove}
                                onMouseDown={handleMouseClick}
                                onContextMenu={handleContextMenu}
                                onWheel={handleMouseWheel}
                                className="w-auto h-auto max-w-full max-h-[calc(100vh-100px)] block"
                            />
                            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] rounded-lg"></div>
                        </div>
                    </div>
                </div>
            ) : (
                // Framer-inspired modern layout
                <div className="min-h-screen flex flex-col bg-transparent dark:text-white text-black font-['Inter',sans-serif]">


                    {/* Main Content Area with Hero Section */}
                    <main className="flex-1">
                        {/* Hero Section */}
                        <section className="bg-transparent py-1 px-5 text-center dark:text-white text-black relative overflow-hidden min-h-[calc(100vh-80px)] flex items-center justify-center">
                            {/* Background effects */}
                            <div className="absolute top-[5%] left-[10%] w-[500px] h-[500px] rounded-full bg-transparent blur-[40px] z-0"></div>
                            <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-transparent blur-[40px] z-0"></div>

                            <div className="max-w-7xl mx-auto relative z-10 w-full">
                                {/* Main Title */}
                                <Title level={1} className="dark:text-white text-black  mb-5 font-bold tracking-[-0.03em] leading-tight">
                                    <span className="dark:text-white text-indigo-500">Remote Control Made</span> <br /> <span className="dark:text-white text-indigo-500">Simple & Secure</span>
                                    </Title>
                                
                                <Paragraph className="text-[clamp(1rem,2vw,1.25rem)] dark:text-white/70 text-black/70 max-w-2xl mx-auto mb-15 leading-relaxed font-normal">
                                    <span className="dark:text-white text-gray-600">Connect securely to any computer anywhere in the world with FLYDESK's powerful remote desktop solution.</span>
                                    </Paragraph>

                                {/* Two Main Options */}
                                <Row gutter={[20, 20]} justify="center" className="mt-10">
                                    {/* Session Code Connection */}
                                    <Col xs={24} md={12} lg={8}>
                                        <div className="bg-[#0000000d] backdrop-blur-md rounded-2xl p-10 h-full shadow-2xl border border-white/5 transition-all duration-300 ease-in-out cursor-pointer hover:transform hover:-translate-y-1 hover:shadow-3xl" onClick={showCodeInput}>
                                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-transparent flex items-center justify-center shadow-indigo-custom">
                                                <LinkOutlined className="text-3xl dark:text-white text-indigo-500" />
                                </div>

                                            <Title level={3} className="dark:text-white text-black mb-4 font-semibold text-2xl text-center">
                                                <span className="dark:text-white text-indigo-500 font-bold">Connect with Session Code</span>
                                    </Title>

                                            <Paragraph className="dark:text-white/70 text-black/70 mb-6 text-sm text-center leading-relaxed">
                                                <span className="dark:text-white text-gray-600">Enter the 6-digit session code provided by the host your computer to establish a secure remote connection.</span>
                                    </Paragraph>

                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<LinkOutlined />}
                                                className="h-12 text-base font-medium px-8 bg-indigo-500 border-transparent rounded-lg transition-all duration-200 ease-in-out w-full"
                                            >
                                                <span className="">Enter Session Code</span>
                                    </Button>

                                    {pendingConnection && pendingHostInfo && (
                                                <div className="mt-5">
                                            <Alert
                                                message="Connection Request Pending"
                                                description={`Waiting for ${pendingHostInfo.hostName} to approve your connection...`}
                                                type="warning"
                                                showIcon
                                                        className="bg-orange-500/30 border-orange-500/80"
                                            />
                                        </div>
                                    )}
                                </div>
                                    </Col>

                                    {/* Download App */}
                                    <Col xs={24} md={12} lg={8}>
                                        <div className="bg-[#0000000d] backdrop-blur-md rounded-2xl p-10 h-full shadow-2xl border border-white/5 transition-all duration-300 ease-in-out cursor-pointer hover:transform hover:-translate-y-1 hover:shadow-3xl">
                                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-transparent flex items-center justify-center shadow-indigo-custom">
                                                <DownloadOutlined className="text-3xl dark:text-white text-indigo-500" />
                                </div>

                                            <Title level={3} className="dark:text-white text-black mb-4 font-semibold text-2xl text-center">
                                                <span className="dark:text-white text-indigo-500 font-bold">Download FLYDESK App</span>
                                </Title>

                                            <Paragraph className="dark:text-white/70 text-black/70 mb-6 text-sm text-center leading-relaxed">
                                                <span className="dark:text-white text-gray-600">Install the FLYDESK app on your computer to enable remote access and generate session codes for secure connections.</span>
                                </Paragraph>

                                            <a href="https://remotedesk-downloads.s3.ap-south-1.amazonaws.com/FlyDeskApp+Setup+1.0.0.exe" className="no-underline">
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<DownloadOutlined />}
                                                    className="h-12 text-base font-medium px-8 bg-indigo-500 border-transparent rounded-lg shadow-[0_4px_20px_rgba(139,92,246,0.3)] transition-all duration-200 ease-in-out w-full"
                                                >
                                                    <span className="">Download App</span>
                                    </Button>
                                </a>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Security Note */}
                                <div className="mt-10 p-8 bg-[#0000000d] backdrop-blur-md rounded-xl border border-blue-400/10 max-w-2xl mx-auto">
                                    <div className="flex items-center justify-center gap-4 mb-4">
                                        <LockOutlined className="text-2xl text-indigo-500" />
                                        <Text className="text-indigo-500 text-lg font-semibold">
                                            <span className="dark:text-white text-indigo-500">Your Security is Our Priority</span>
                          </Text>
                        </div>
                                    <Paragraph className="dark:text-white/80 text-black/80 text-sm text-center m-0 leading-relaxed">
                                        <span className="dark:text-white text-gray-600">All connections require explicit approval from the host computer. 
                                        Your computer remains completely secure until you authorize access. 
                                        No authorization, no access—it's that simple.</span>
                                    </Paragraph>
                                </div>
                            </div>
                        </section>
                    </main>

                    
                </div>
            )}

            {/* Custom Ant Design Dark Modal */}
            <ConfigProvider
                theme={{
                    components: {
                        Modal: {
                            contentBg: 'transparent',
                            titleColor: 'rgba(255,255,255,0.85)',
                            footerBg: 'transparent',
                        },
                        Input: {
                            colorBgContainer: 'transparent',
                            colorText: 'white',
                        },
                        Button: {
                            defaultColor: 'rgba(255,255,255,0.65)',
                            defaultBg: 'transparent',
                        }
                    },
                }}
            >
                <Modal
                    title={<span className="dark:text-white text-black font-bold text-xl">Enter Session Code</span>}
                    open={codeInputVisible}
                    onCancel={() => setCodeInputVisible(false)}
                    centered
                    closeIcon={<CloseOutlined className="dark:text-white text-black" />}
                    footer={[
                        <Button key="cancel" onClick={() => setCodeInputVisible(false)} className="dark:text-white text-black dark:bg-gray-800 bg-gray-200 border-gray-600">
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            onClick={handleCodeSubmit}
                            className="bg-gradient-to-r from-blue-600 to-blue-400 border-transparent text-white font-medium"
                        >
                            Connect
                        </Button>
                    ]}
                    styles={{
                        mask: { backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.5)' },
                        content: {
                            borderRadius: '20px',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: document.documentElement.classList.contains('dark') ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)',
                        },
                        header: { 
                            borderBottom: document.documentElement.classList.contains('dark') ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                            background: 'transparent',
                            padding: '24px 24px 16px 24px'
                        },
                        footer: { 
                            borderTop: document.documentElement.classList.contains('dark') ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                            background: 'transparent',
                            padding: '16px 24px 24px 24px'
                        },
                        body: { 
                            padding: '32px 24px', 
                            background: 'transparent' 
                        }
                    }}
                    className="dark:bg-gray-900 dark:border-gray-700"
                >
                    <div className="text-center">
                        <div className="mb-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <LinkOutlined className="text-2xl text-white" />
                            </div>
                            <Text className="dark:text-white text-gray-700 text-lg font-medium">
                                Enter the 6-digit session code
                            </Text>
                        </div>
                        
                        {/* OTP Input Boxes */}
                        <div className="flex justify-center gap-3 mb-8">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                        <Input
                                    key={index}
                                    maxLength={1}
                            size="large"
                                    className="w-14 h-14 text-center text-2xl font-bold border-2 dark:border-gray-600 border-gray-300 focus:border-blue-500 rounded-xl dark:bg-gray-800 bg-white dark:text-white text-gray-800"
                            style={{
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }}
                                    value={sessionCode[index] || ''}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                        if (value) {
                                            const newCode = sessionCode.split('');
                                            newCode[index] = value;
                                            setSessionCode(newCode.join(''));
                                            
                                            // Auto-focus next input
                                            if (index < 5) {
                                                const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
                                                if (nextInput) nextInput.focus();
                                            }
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Backspace' && !sessionCode[index] && index > 0) {
                                            const newCode = sessionCode.split('');
                                            newCode[index - 1] = '';
                                            setSessionCode(newCode.join(''));
                                            
                                            // Focus previous input
                                            const prevInput = document.querySelector(`input[data-index="${index - 1}"]`);
                                            if (prevInput) prevInput.focus();
                                        }
                                    }}
                                    data-index={index}
                                />
                            ))}
                        </div>
                        
                        <div className="flex justify-center gap-4">
                            <Button
                                type="text"
                                onClick={() => setSessionCode('')}
                                className="dark:text-gray-400 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400"
                            >
                                Clear
                            </Button>
                            <Button
                                type="text"
                                onClick={() => {
                                    // Auto-fill with demo code (for testing)
                                    setSessionCode('123456');
                                }}
                                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Demo Code
                            </Button>
                        </div>
                        
                        <div className="mt-6">
                            <Text className="dark:text-gray-400 text-gray-500 text-sm">
                                Enter the 6-digit code provided by the host computer
                        </Text>
                        </div>
                    </div>
                </Modal>
            </ConfigProvider>

            <Modal
                title={null}
                open={videoModalVisible}
                onCancel={closeVideoModal}
                footer={null}
                centered
                width="80%"
                closeIcon={<CloseOutlined style={{ color: "rgba(255,255,255,0.65)" }} />}
                styles={{
                    mask: { backdropFilter: 'blur(5px)', background: 'transparent' },
                    content: {
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        border: '1px solid #333',
                        background: 'transparent',
                        padding: '0'
                    },
                    body: { padding: '0' }
                }}
            >
                <div style={{
                    position: "relative",
                    width: "100%",
                    height: "0",
                    paddingBottom: "56.25%", // 16:9 aspect ratio
                    overflow: "hidden"
                }}>
                    <video
                        src="Images/video.mp4"
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{
                            position: "absolute",
                            top: "0",
                            left: "0",
                            width: "100%",
                            height: "100%",
                            objectFit: "contain"
                        }}
                    />
                </div>
            </Modal>

            <Modal
                title="Session Recording"
                open={recordingModalVisible}
                onCancel={closeRecordingModal}
                footer={[
                    <Button key="close" onClick={closeRecordingModal}>
                        Close
                    </Button>,
                    <Button
                        key="download"
                        type="primary"
                        href={recordedVideo}
                        download="flydesk-recording.webm"
                    >
                        Download Recording
                    </Button>
                ]}
                width={800}
            >
                {recordedVideo && (
                    <div>
                        <p>Your session recording is ready. You can preview it below or download it to your device.</p>
                        <div style={{ marginTop: '20px' }}>
                            <video
                                src={recordedVideo}
                                controls
                                style={{ width: '100%', borderRadius: '8px' }}
                            />
                        </div>
                    </div>
                )}
            </Modal>

            {/* Password Connection Modal */}
            <Modal
                title="Connect with Password"
                open={connectByPasswordVisible}
                onCancel={() => setConnectByPasswordVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setConnectByPasswordVisible(false)}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={handlePasswordConnect}>
                        Connect
                    </Button>
                ]}
                centered
            >
                <div style={{ padding: "20px 0" }}>
                    <Input
                        placeholder="Machine ID"
                        value={machineIdInput}
                        onChange={(e) => setMachineIdInput(e.target.value)}
                        style={{ marginBottom: 16 }}
                    />
                    <Input.Password
                        placeholder="Access Password"
                        value={hostPassword}
                        onChange={(e) => setHostPassword(e.target.value)}
                        style={{ marginBottom: 16 }}
                    />
                    <Text type="secondary">
                        Enter the machine ID and password provided by the host.
                    </Text>
                </div>
            </Modal>
        </div>
    );
}

export default Main;
