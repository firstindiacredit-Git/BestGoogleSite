const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Enable CORS for all routes
app.use(cors());

// Store connected hosts and clients
const connectedHosts = new Map();
const connectedClients = new Map();

// Basic health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  // Handle host ready event
  socket.on("host-ready", (data) => {
    console.log(`Host ready: ${socket.id}`, data);

    const hostInfo = {
      id: socket.id,
      computerName: data.computerName || "Unknown Computer",
      machineId: data.machineId || socket.id,
      timestamp: new Date().toISOString(),
    };

    connectedHosts.set(socket.id, hostInfo);

    // Notify all clients about available host
    socket.broadcast.emit("host-available", hostInfo);

    console.log(`Available hosts: ${connectedHosts.size}`);
  });

  // Handle client connection to host
  socket.on("connect-to-host", (hostId) => {
    console.log(`Client ${socket.id} connecting to host ${hostId}`);

    const host = connectedHosts.get(hostId);
    if (host) {
      // Send connection request to host
      socket.to(hostId).emit("connection-request", {
        clientId: socket.id,
        timestamp: new Date().toISOString(),
      });

      connectedClients.set(socket.id, {
        hostId,
        timestamp: new Date().toISOString(),
      });
    } else {
      socket.emit("error", { message: "Host not found" });
    }
  });

  // Handle connection response from host
  socket.on("connection-response", (data) => {
    console.log(`Connection response from host:`, data);

    if (data.accepted) {
      // Notify client that connection was accepted
      socket.to(data.clientId).emit("connection-accepted", {
        hostId: socket.id,
        hostName: connectedHosts.get(socket.id)?.computerName || "Unknown Host",
      });
    } else {
      // Notify client that connection was rejected
      socket.to(data.clientId).emit("connection-rejected");
    }
  });

  // Handle screen data requests
  socket.on("request-screen", (data) => {
    console.log(`Screen request from ${data.from} to ${data.to}`);
    socket.to(data.to).emit("request-screen", data);
  });

  // Handle screen data
  socket.on("screen-data", (data) => {
    socket.to(data.to).emit("screen-data", data);
  });

  // Handle remote mouse movement
  socket.on("remote-mouse-move", (data) => {
    socket.to(data.to).emit("remote-mouse-move", data);
  });

  // Handle remote mouse click
  socket.on("remote-mouse-click", (data) => {
    socket.to(data.to).emit("remote-mouse-click", data);
  });

  // Handle remote mouse scroll
  socket.on("remote-mouse-scroll", (data) => {
    socket.to(data.to).emit("remote-mouse-scroll", data);
  });

  // Handle remote key press
  socket.on("remote-key-press", (data) => {
    socket.to(data.to).emit("remote-key-press", data);
  });

  // Handle keep-alive pings
  socket.on("keep-alive", () => {
    socket.emit("keep-alive-response");
  });

  // Handle password authentication
  socket.on("password-auth", (data) => {
    socket.to(data.to).emit("password-auth", data);
  });

  // Handle password auth response
  socket.on("password-auth-response", (data) => {
    socket.to(data.to).emit("password-auth-response", data);
  });

  // Handle password set notification
  socket.on("password-set-notification", (data) => {
    socket.broadcast.emit("password-set-notification", data);
  });

  // Handle recording status
  socket.on("recording-status", (data) => {
    socket.to(data.to).emit("recording-status", data);
  });

  // Handle recording complete
  socket.on("recording-complete", (data) => {
    socket.to(data.to).emit("recording-complete", data);
  });

  // Handle disconnect
  socket.on("disconnect", (reason) => {
    console.log(`Disconnected: ${socket.id} - ${reason}`);

    // Remove from hosts if it was a host
    if (connectedHosts.has(socket.id)) {
      connectedHosts.delete(socket.id);
      socket.broadcast.emit("host-disconnected", socket.id);
      console.log(`Host disconnected: ${socket.id}`);
    }

    // Remove from clients if it was a client
    if (connectedClients.has(socket.id)) {
      const clientInfo = connectedClients.get(socket.id);
      connectedClients.delete(socket.id);

      // Notify host about client disconnect
      socket.to(clientInfo.hostId).emit("client-disconnected", socket.id);
      console.log(`Client disconnected: ${socket.id}`);
    }

    console.log(
      `Remaining hosts: ${connectedHosts.size}, clients: ${connectedClients.size}`
    );
  });
});

// Get server info endpoint
app.get("/server-info", (req, res) => {
  res.json({
    connectedHosts: connectedHosts.size,
    connectedClients: connectedClients.size,
    totalConnections: io.engine.clientsCount,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Get available hosts endpoint
app.get("/hosts", (req, res) => {
  const hosts = Array.from(connectedHosts.values());
  res.json(hosts);
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`🚀 RemoteApp Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Server info: http://localhost:${PORT}/server-info`);
  console.log(`🖥️  Available hosts: http://localhost:${PORT}/hosts`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
