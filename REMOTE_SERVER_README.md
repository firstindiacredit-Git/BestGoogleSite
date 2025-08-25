# RemoteApp Server Setup

This directory contains the Socket.IO server needed for the RemoteApp to function properly.

## Problem Solved

The error `Request URL: http://localhost:8080/socket.io/?EIO=4&transport=polling&t=raxey3lz` occurs because the RemoteApp is trying to connect to a Socket.IO server that wasn't running.

## Quick Setup

### 1. Install Dependencies

```bash
# Copy the server package.json to the root directory
cp server-package.json package.json

# Install dependencies
npm install
```

### 2. Start the Server

```bash
# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

### 3. Verify Server is Running

The server will start on port 8080. You can verify it's working by visiting:
- **Health Check:** http://localhost:8080/health
- **Server Info:** http://localhost:8080/server-info
- **Available Hosts:** http://localhost:8080/hosts

## Server Features

The server handles all real-time communication for the RemoteApp:

- **Host Management:** Tracks connected remote desktop hosts
- **Client Connections:** Manages client connections to hosts
- **Screen Sharing:** Relays screen data between hosts and clients
- **Remote Control:** Handles mouse, keyboard, and scroll events
- **Password Authentication:** Manages connection passwords
- **Screen Recording:** Handles recording status and completion
- **Keep-Alive:** Maintains connection health

## How It Works

1. **Host Connection:** When the Electron app (host) connects, it sends a `host-ready` event
2. **Client Discovery:** The server broadcasts available hosts to all connected clients
3. **Connection Request:** When a client wants to connect, it sends a `connect-to-host` request
4. **Host Approval:** The host can accept or reject the connection
5. **Real-time Control:** Once connected, all mouse/keyboard events are relayed through the server

## Troubleshooting

### Server Won't Start
- Check if port 8080 is already in use
- Ensure all dependencies are installed
- Check Node.js version (requires Node.js 14+)

### Connection Issues
- Verify the server is running on port 8080
- Check browser console for connection errors
- Ensure CORS is properly configured

### Host Not Appearing
- Make sure the Electron app is running and connected
- Check server logs for connection events
- Verify the host is sending `host-ready` events

## Development

For development, you can use nodemon for auto-restart:

```bash
npm install -g nodemon
npm run dev
```

## Production Deployment

For production, consider:
- Using a process manager like PM2
- Setting up SSL/TLS certificates
- Configuring proper CORS origins
- Setting up monitoring and logging

## API Endpoints

- `GET /health` - Server health check
- `GET /server-info` - Server statistics
- `GET /hosts` - List available hosts

## Socket.IO Events

### Host Events
- `host-ready` - Host announces availability
- `connection-request` - Client requests connection
- `connection-response` - Host responds to connection request

### Client Events
- `connect-to-host` - Client connects to host
- `request-screen` - Request screen data
- `remote-mouse-move` - Mouse movement
- `remote-mouse-click` - Mouse clicks
- `remote-key-press` - Keyboard input

### Shared Events
- `keep-alive` - Connection health check
- `screen-data` - Screen sharing data
- `password-auth` - Password authentication
- `recording-status` - Screen recording status
