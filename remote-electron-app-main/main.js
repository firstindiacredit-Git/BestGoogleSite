// electron-app/robotjsControl.js

const { app, BrowserWindow, desktopCapturer, ipcMain } = require("electron");
const robot = require("robotjs");
const io = require("socket.io-client");
const path = require("path");
const os = require('os');
const fs = require('fs');
const { dialog } = require('electron');
const crypto = require('crypto');

let globalSocket = null;
let currentClientId = null;

// Add these variables for screen recording state
let isRecording = false;
let recordingStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let recordingStartTime = null;
let recordingClient = null;

// Function to generate or retrieve the machine ID
function getMachineId() {
  const idFilePath = path.join(app.getPath('userData'), 'machine_id.txt');
  
  try {
    // Try to read existing ID
    if (fs.existsSync(idFilePath)) {
      return fs.readFileSync(idFilePath, 'utf8').trim();
    }
    
    // Generate a new ID if none exists
    const cpuInfo = os.cpus()[0]?.model || '';
    const networkInterfaces = os.networkInterfaces();
    let macAddress = '';
    
    // Get first non-internal MAC address
    Object.keys(networkInterfaces).forEach(ifname => {
      networkInterfaces[ifname].forEach(iface => {
        if (!iface.internal && iface.mac !== '00:00:00:00:00:00') {
          macAddress = iface.mac;
        }
      });
    });
    
    // Create a unique ID based on hardware info and a random component
    const rawId = `${cpuInfo}-${macAddress}-${os.hostname()}-${Math.random()}`;
    const machineId = crypto.createHash('md5').update(rawId).digest('hex');
    
    // Save the ID for future use
    fs.writeFileSync(idFilePath, machineId);
    
    return machineId;
  } catch (err) {
    console.error("Error generating machine ID:", err);
    // Fallback to a random ID if we couldn't generate a stable one
    return crypto.randomBytes(16).toString('hex');
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'icon.png'),
  });

  // Load the HTML file
  win.loadFile(path.join(__dirname, 'index.html'));

  // Generate or retrieve machine ID
  const machineId = getMachineId();
  console.log("Machine ID:", machineId);

  // Connect to the socket.io server with reconnection settings
  const socket = io(
    "http://15.206.194.12:8080",
    {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 60000, // Increase timeout
      autoConnect: true,
      path: '/socket.io',
      transports: ['websocket', 'polling'], // Try websocket first
      upgrade: true,
      rememberUpgrade: true,
      forceJSONP: false,
      extraHeaders: {
        "User-Agent": "ElectronApp/1.0"
      }
    });

  // Store socket reference globally
  globalSocket = socket;

  let screenShareInterval = null;
  let pingInterval = null;

  // Track if session code was received
  let sessionCodeReceived = false;

  // Handle connection
  socket.on("connect", () => {
    console.log("Connected as host with ID:", socket.id);

    // Get computer name
    const computerName = os.hostname() || "Unknown Computer";

    win.webContents.send('connection-id', socket.id);
    win.webContents.send('connect');
    win.webContents.send('status-update', 'Connected to server, sending host-ready...');

    // Wait a little before sending host-ready
    setTimeout(() => {
      // Emit host-ready with computer name and machine ID
      console.log("Sending host-ready with machine ID:", machineId);
      socket.emit("host-ready", { 
        computerName,
        machineId 
      });

      // Additional attempt after a delay
      setTimeout(() => {
        if (!sessionCodeReceived) {
          console.log("Re-sending host-ready event...");
          socket.emit("host-ready", { 
            computerName,
            machineId
          });
        }
      }, 5000);
    }, 1000);

    // Setup ping interval to keep connection alive
    if (pingInterval) clearInterval(pingInterval);
    pingInterval = setInterval(() => {
      if (socket.connected) {
        console.log("Sending keep-alive ping");
        socket.emit("keep-alive");
      }
    }, 5000); // More frequent pings
  });

  // Handle connection requests
  socket.on("connection-request", (data) => {
    console.log("Connection request from:", data.clientId);
    win.webContents.send('connection-request', data);
  });

  // Handle connection response from renderer
  ipcMain.on('respond-to-connection', (event, data) => {
    if (socket.connected) {
      socket.emit("connection-response", data);

      if (data.accepted) {
        currentClientId = data.clientId;
        win.webContents.send('status-update', `Accepted connection from ${data.clientId}`);
      } else {
        win.webContents.send('status-update', 'Connection rejected');
      }
    } else {
      win.webContents.send('status-update', 'Not connected to server');
    }
  });

  // Handle controller connection
  socket.on("controller-connected", (controllerId) => {
    console.log("Controller connected:", controllerId);
    currentClientId = controllerId;
    win.webContents.send('status-update', `Controller ${controllerId} connected`);
  });

  // Start screen sharing when requested
  socket.on("request-screen", async (data) => {
    try {
      console.log("Screen sharing requested by:", data.from);
      currentClientId = data.from;
      win.webContents.send('status-update', 'Starting screen sharing...');

      // Clear any existing interval
      if (screenShareInterval) {
        clearInterval(screenShareInterval);
      }

      // Function to capture and send screen
      const sendScreen = async () => {
        try {
          const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 960, height: 720 }
          });

          if (sources.length > 0) {
            const imageDataUrl = sources[0].thumbnail.toDataURL('image/jpeg', 0.3);
            socket.emit("screen-data", {
              to: data.from,
              imageData: imageDataUrl
            });
          }
        } catch (err) {
          console.error("Error capturing screen:", err);
        }
      };

      // Send initial screen capture
      await sendScreen();

      screenShareInterval = setInterval(sendScreen, 1000);
    } catch (err) {
      console.error("Error setting up screen sharing:", err);
      win.webContents.send('status-update', 'Screen sharing error: ' + err.message);
    }
  });

  // Handle when controller disconnects
  socket.on("controller-disconnected", () => {
    currentClientId = null;
    if (screenShareInterval) {
      clearInterval(screenShareInterval);
      screenShareInterval = null;
    }
    win.webContents.send('status-update', 'Controller disconnected');
  });

  // Handle mouse movement with improved positioning
  socket.on("remote-mouse-move", (data) => {
    try {
      const { x, y, screenWidth, screenHeight } = data;

      // Get the local screen size
      const { width: localWidth, height: localHeight } = robot.getScreenSize();

      // Convert the coordinates proportionally based on the remote screen size
      const scaledX = Math.round((x / screenWidth) * localWidth);
      const scaledY = Math.round((y / screenHeight) * localHeight);

      console.log(`Mouse move: Original(${x},${y}) => Scaled(${scaledX},${scaledY})`);

      // Move the mouse to the scaled position
      robot.moveMouse(scaledX, scaledY);
    } catch (err) {
      console.error("Error handling mouse move:", err);
    }
  });

  // Handle improved key events (down/up)
  socket.on("remote-key-event", (data) => {
    try {
      const { type, key, modifiers } = data;
      console.log(`Received key ${type}:`, key, "Modifiers:", JSON.stringify(modifiers));

      // Map keys from browser format to robotjs format
      const keyMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'Backspace': 'backspace',
        'Delete': 'delete',
        'Enter': 'enter',
        'Tab': 'tab',
        'Escape': 'escape',
        'Home': 'home',
        'End': 'end',
        'PageUp': 'pageup',
        'PageDown': 'pagedown',
        ' ': 'space',
        'Control': 'control',
        'Shift': 'shift',
        'Alt': 'alt',
        'Meta': 'command',
        'CapsLock': 'caps_lock'
      };

      // Explicitly define the toggle state as a string value
      const toggleState = (type === 'down') ? 'down' : 'up';

      // Special handling for CapsLock
      if (key === 'CapsLock') {
        // Instead of trying to toggle CapsLock (which can be problematic),
        // let's use a key tap approach
        if (type === 'down') {
          robot.keyTap('caps_lock');
          console.log("Tapped caps_lock key");
        }
        win.webContents.send('status-update', `CapsLock tap`);
        return;
      }

      // Get robotjs key
      let robotKey = keyMap[key] || key.toLowerCase();

      // Build modifier array
      const activeModifiers = [];
      if (modifiers.shift) activeModifiers.push('shift');
      if (modifiers.control) activeModifiers.push('control');
      if (modifiers.alt) activeModifiers.push('alt');
      if (modifiers.meta) activeModifiers.push('command');

      // For modifier keys themselves
      if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta') {
        robot.keyToggle(robotKey, toggleState);
      }
      // For regular keys with modifiers
      else if (activeModifiers.length > 0 && type === 'down') {
        robot.keyTap(robotKey, activeModifiers);
      }
      // For regular keys
      else {
        if (type === 'down') {
          robot.keyToggle(robotKey, 'down');
        } else {
          robot.keyToggle(robotKey, 'up');
        }
      }

      win.webContents.send('status-update', `Key ${type}: ${key}`);
    } catch (err) {
      console.error(`Error handling key ${type}:`, err);
      console.error("Key data:", data);
      win.webContents.send('status-update', `Error with key ${type}: ${data.key} - ${err.message}`);
    }
  });

  // Handle mouse click
  socket.on("remote-mouse-click", (data) => {
    try {
      const { button } = data;
      robot.mouseClick(button || "left");
    } catch (err) {
      console.error("Error handling mouse click:", err);
    }
  });

  // Handle mouse scrolling
  socket.on("remote-mouse-scroll", (data) => {
    try {
      const { deltaY } = data;

      // In browser wheel events:
      // deltaY > 0 means scroll down, deltaY < 0 means scroll up
      // For robotjs, we need to convert this to direction and amount

      // Determine scroll direction
      const direction = deltaY < 0 ? "up" : "down";

      // Calculate scroll amount (normalize it to something reasonable)
      // Average wheel delta is around 100-125 per scroll "click"
      const scrollAmount = Math.ceil(Math.abs(deltaY) / 100);

      console.log(`Scroll ${direction} by ${scrollAmount}`);

      // Execute the scroll
      for (let i = 0; i < scrollAmount; i++) {
        robot.scrollMouse(1, direction);
      }

      win.webContents.send('status-update', `Scrolled ${direction}`);
    } catch (err) {
      console.error("Error handling mouse scroll:", err);
    }
  });

  // Handle session code from server
  socket.on("session-code", (code) => {
    // console.log("Received session code from server:", code);
    sessionCodeReceived = true;
    win.webContents.send('session-code', code);
    win.webContents.send('status-update', 'Session code received!');
  });

  // Add reconnect handlers
  socket.on('reconnect_attempt', (attempt) => {
    console.log(`Reconnection attempt #${attempt}`);
    win.webContents.send('status-update', `Reconnecting (attempt ${attempt})...`);
    win.webContents.send('reconnect_attempt');
  });

  socket.on('reconnect', () => {
    console.log("Reconnected to server");
    win.webContents.send('status-update', 'Reconnected to server');

    // Reset flag
    sessionCodeReceived = false;

    // Re-send host-ready on reconnection
    const computerName = os.hostname() || "Unknown Computer";
    console.log("Re-sending host-ready after reconnection");
    socket.emit("host-ready", { computerName });
  });

  // Add explicit disconnect handler with more info
  socket.on('disconnect', (reason) => {
    console.log(`Disconnected from server: ${reason}`);
    win.webContents.send('status-update', `Disconnected: ${reason}. Reconnecting...`);
    win.webContents.send('disconnect');
  });

  // Handle window close
  win.on('closed', () => {
    // Only clean up if we're not deliberately exiting
    if (!global.isAppQuitting) {
      if (screenShareInterval) {
        clearInterval(screenShareInterval);
      }
      if (pingInterval) {
        clearInterval(pingInterval);
      }
      // Don't disconnect socket here, as it might cause the error
    }
  });

  // Handle disconnect client request from renderer
  ipcMain.on('disconnect-client', () => {
    if (currentClientId) {
      console.log(`Manually disconnecting client: ${currentClientId}`);
      socket.emit("disconnect-client", currentClientId);

      // Cleanup
      if (screenShareInterval) {
        clearInterval(screenShareInterval);
        screenShareInterval = null;
      }

      win.webContents.send('status-update', 'Client manually disconnected');
      currentClientId = null;
    } else {
      win.webContents.send('status-update', 'No client connected to disconnect');
    }
  });

  // Add this new socket listener to handle client-initiated disconnects
  socket.on("client-disconnect-request", (data) => {
    // If a client is requesting to disconnect
    if (data.from && data.from === currentClientId) {
      console.log(`Client ${currentClientId} requested to disconnect`);

      // Clean up screen sharing
      if (screenShareInterval) {
        clearInterval(screenShareInterval);
        screenShareInterval = null;
      }

      // Update UI
      win.webContents.send('status-update', 'Client disconnected by their request');

      // Reset the client ID
      currentClientId = null;

      // Acknowledge the disconnect to the client
      socket.emit("host-disconnect-ack", { to: data.from });
    }
  });

  // Add explicit error handler
  socket.on("error", (error) => {
    console.error("Socket error:", error);
    win.webContents.send('status-update', `Socket error: ${error.message}`);
  });

  socket.on("connect_error", (error) => {
    console.error("Connection error:", error);
    win.webContents.send('status-update', `Connection error: ${error.message}`);
  });

  // Handle screen recording requests
  socket.on("start-screen-recording", async (data) => {
    try {
      if (isRecording) {
        // Already recording, send error status
        socket.emit("recording-status", {
          to: data.from,
          status: "error",
          error: "Recording already in progress"
        });
        return;
      }

      win.webContents.send('status-update', 'Starting screen recording...');

      // Store the client that requested recording
      recordingClient = data.from;

      // Get all screen sources
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 0, height: 0 } // Minimize thumbnail size as we don't need it for recording
      });

      if (sources.length === 0) {
        socket.emit("recording-status", {
          to: data.from,
          status: "error",
          error: "No screen sources found"
        });
        return;
      }

      // Notify client that we're setting up recording
      socket.emit("recording-status", {
        to: data.from,
        status: "initializing"
      });

      // Wait for 500ms to let the status message be sent
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create a temporary file path for the recording
      const tempFilePath = path.join(app.getPath('temp'), `screen-recording-${Date.now()}.webm`);

      // Reset recording state
      recordedChunks = [];
      recordingStartTime = Date.now();
      isRecording = true;

      // Get the primary display dimensions
      const { width, height } = robot.getScreenSize();

      // We'll use navigator.mediaDevices.getUserMedia in the render process
      win.webContents.executeJavaScript(`
  (async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: '${sources[0].id}',
            minWidth: ${width},
            maxWidth: ${width},
            minHeight: ${height},
            maxHeight: ${height}
          }
        }
      });
      
      window.recordingStream = stream;
      
      // Create MediaRecorder
      const options = { mimeType: 'video/webm; codecs=vp9' };
      window.mediaRecorder = new MediaRecorder(stream, options);
      
      let chunks = [];
      
      window.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          window.recordingChunks = chunks;
        }
      };
      
      window.mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped');
      };
      
      window.mediaRecorder.start(1000); // Capture in 1-second chunks
      return true;
    } catch (error) {
      console.error('Error setting up recording:', error);
      return false;
    }
  })()
`).then(success => {
        if (success) {
          win.webContents.send('status-update', 'Screen recording started');
          socket.emit("recording-status", {
            to: data.from,
            status: "recording"
          });

          // Set up an interval to check recording progress and send status updates
          const progressInterval = setInterval(() => {
            if (!isRecording) {
              clearInterval(progressInterval);
              return;
            }

            const elapsedSeconds = Math.floor((Date.now() - recordingStartTime) / 1000);
            socket.emit("recording-status", {
              to: data.from,
              status: "recording",
              progress: {
                elapsedTime: elapsedSeconds,
                estimatedSizeKB: Math.floor(win.webContents.executeJavaScript(
                  'window.recordingChunks ? window.recordingChunks.reduce((acc, chunk) => acc + chunk.size, 0) / 1024 : 0'
                ))
              }
            });
          }, 2000);
        } else {
          isRecording = false;
          socket.emit("recording-status", {
            to: data.from,
            status: "error",
            error: "Failed to initialize screen recorder"
          });
        }
      }).catch(err => {
        console.error("Error in screen recording setup:", err);
        isRecording = false;
        socket.emit("recording-status", {
          to: data.from,
          status: "error",
          error: err.message || "Unknown error setting up recorder"
        });
      });

    } catch (err) {
      console.error("Error handling recording request:", err);
      socket.emit("recording-status", {
        to: data.from,
        status: "error",
        error: err.message
      });
    }
  });

  socket.on("stop-screen-recording", async (data) => {
    try {
      // Check if this is the client that started recording
      if (data.from !== recordingClient) {
        socket.emit("recording-status", {
          to: data.from,
          status: "error",
          error: "You did not start this recording"
        });
        return;
      }

      // Check if we're recording
      if (!isRecording) {
        socket.emit("recording-status", {
          to: data.from,
          status: "error",
          error: "No recording is in progress"
        });
        return;
      }

      win.webContents.send('status-update', 'Stopping screen recording...');

      // Update status
      socket.emit("recording-status", {
        to: data.from,
        status: "stopping"
      });

      // Stop the recorder in the renderer process
      const finalChunks = await win.webContents.executeJavaScript(`
        (async () => {
          if (window.mediaRecorder && window.mediaRecorder.state !== 'inactive') {
            return new Promise(resolve => {
              const currentChunks = [...window.recordingChunks];
              
              window.mediaRecorder.onstop = () => {
                const combinedChunks = [...currentChunks, ...window.recordingChunks];
                if (window.recordingStream) {
                  window.recordingStream.getTracks().forEach(track => track.stop());
                  window.recordingStream = null;
                }
                window.mediaRecorder = null;
                window.recordingChunks = [];
                resolve(combinedChunks);
              };
              
              window.mediaRecorder.stop();
            });
          } else {
            return window.recordingChunks || [];
          }
        })()
      `);

      isRecording = false;
      win.webContents.send('status-update', 'Screen recording stopped');

      // Calculate recording details
      const recordingDuration = (Date.now() - recordingStartTime) / 1000;
      const recordingId = `recording-${Date.now()}`;

      if (finalChunks && finalChunks.length > 0) {
        // Create a Blob from the chunks
        const blob = await win.webContents.executeJavaScript(`
          new Promise(resolve => {
            const blob = new Blob(${JSON.stringify(finalChunks.map(c => c.size))}, { type: 'video/webm' });
            resolve(blob.size);
          })
        `);

        // Create a temp file for the recording
        const saveFilePath = await dialog.showSaveDialog(win, {
          title: 'Save Screen Recording',
          defaultPath: path.join(app.getPath('videos'), `screen-recording-${Date.now()}.webm`),
          filters: [{ name: 'WebM Video', extensions: ['webm'] }]
        });

        if (!saveFilePath.canceled) {
          // Save the recording
          for (let i = 0; i < finalChunks.length; i++) {
            const chunk = finalChunks[i];
            // Convert the chunk to an ArrayBuffer
            const arrayBuffer = await win.webContents.executeJavaScript(`
              new Promise(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(Array.from(new Uint8Array(reader.result)));
                reader.readAsArrayBuffer(new Blob([window.recordingChunks[${i}]], { type: 'video/webm' }));
              })
            `);

            // Append to the file
            fs.appendFileSync(saveFilePath.filePath, Buffer.from(arrayBuffer));

            // Send progress update
            socket.emit("recording-status", {
              to: data.from,
              status: "processing",
              progress: {
                current: i + 1,
                total: finalChunks.length,
                percentage: Math.round(((i + 1) / finalChunks.length) * 100)
              }
            });
          }

          // Send completion notice
          socket.emit("recording-complete", {
            to: data.from,
            recordingId,
            duration: recordingDuration,
            fileSize: fs.statSync(saveFilePath.filePath).size,
            filePath: saveFilePath.filePath
          });

          win.webContents.send('status-update', `Recording saved to ${saveFilePath.filePath}`);
        } else {
          socket.emit("recording-status", {
            to: data.from,
            status: "cancelled",
            error: "User cancelled saving the recording"
          });
        }
      } else {
        socket.emit("recording-status", {
          to: data.from,
          status: "error",
          error: "No recording data was captured"
        });
      }

      // Reset recording state
      recordingClient = null;
      recordingStartTime = null;

    } catch (err) {
      console.error("Error stopping recording:", err);
      socket.emit("recording-status", {
        to: data.from,
        status: "error",
        error: err.message
      });

      // Reset recording state
      isRecording = false;
      recordingClient = null;
      recordingStartTime = null;
    }
  });
}

// Initialize the app when Electron is ready
app.whenReady().then(() => {
  // Set initial quitting state
  global.isAppQuitting = false;

  createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Add this to main.js
ipcMain.on('close-app', () => {
  app.quit();
});

// Add this to main.js to safely close the app
ipcMain.on('close-app-safely', () => {
  // Clean up any active connection if it exists
  if (globalSocket && globalSocket.connected && currentClientId) {
    console.log(`Disconnecting client before shutdown: ${currentClientId}`);
    globalSocket.emit("disconnect-client", currentClientId);
    currentClientId = null;
  }

  // Allow a brief moment for any socket messages to be sent
  setTimeout(() => {
    // Safely disconnect the socket if it exists
    if (globalSocket) {
      console.log("Closing socket connection...");
      globalSocket.removeAllListeners();
      globalSocket.disconnect();
      globalSocket = null;
    }

    // Now quit the app
    console.log("Quitting application...");
    app.quit();
  }, 300);
});

// Force quit without attempting to disconnect socket again
ipcMain.on('force-quit-app', () => {
  // Set a flag to indicate we're deliberately closing
  global.isAppQuitting = true;

  // Force quit the app
  app.exit(0); // Using exit(0) instead of quit() for a more forceful exit
});

// Add this near the start of your app initialization
app.on('before-quit', () => {
  global.isAppQuitting = true;
});

module.exports = { createWindow };
//there 


