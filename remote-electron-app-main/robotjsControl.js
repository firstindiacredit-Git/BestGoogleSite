// electron-app/robotjsControl.js

const { BrowserWindow } = require("electron");
const robot = require("robotjs");
const io = require("socket.io-client");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load the HTML file
  win.loadFile(path.join(__dirname, 'index.html'));

  // Connect to the socket.io server
  // const socket = io("http://15.206.194.12:8080"); // Change to your server IP if needed
  const socket = io("http://192.168.29.140:8080", "http://localhost:5173"); // Change to your server IP if needed

  // Handle connection
  socket.on("connect", () => {
    console.log("Connected as host with ID:", socket.id);
    win.webContents.send('connection-id', socket.id);
    socket.emit("host-ready");
  });

  // Handle controller connection
  socket.on("controller-connected", (controllerId) => {
    console.log("Controller connected:", controllerId);
    win.webContents.send('status-update', `Controller ${controllerId} connected`);
  });

  // Handle mouse movement
  socket.on("remote-mouse-move", (data) => {
    try {
      const { x, y } = data;
      robot.moveMouse(x, y);
      win.webContents.send('status-update', `Mouse moved to ${x},${y}`);
    } catch (err) {
      console.error("Error handling mouse move:", err);
    }
  });

  // Handle key press
  socket.on("remote-key-press", (data) => {
    try {
      const { key } = data;
      robot.keyTap(key);
      win.webContents.send('status-update', `Key pressed: ${key}`);
    } catch (err) {
      console.error("Error handling key press:", err);
    }
  });

  // Handle mouse click
  socket.on("remote-mouse-click", (data) => {
    try {
      const { button } = data;
      robot.mouseClick(button || "left");
      win.webContents.send('status-update', `Mouse clicked: ${button || "left"}`);
    } catch (err) {
      console.error("Error handling mouse click:", err);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Disconnected from server");
    win.webContents.send('status-update', 'Disconnected from server');
  });

  // Handle window close
  win.on('closed', () => {
    socket.disconnect();
  });
}

module.exports = { createWindow };
