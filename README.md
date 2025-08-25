# BestGoogleSite - All-in-One Web Application

A comprehensive web application featuring multiple tools and utilities including a Remote Desktop application.

## Features

- **Remote Desktop Control** - Real-time remote desktop functionality
- **Multiple Tools** - Calculator, Calendar, Weather, and more
- **User Authentication** - Login/signup system
- **Responsive Design** - Works on desktop and mobile devices

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

### 3. Start the RemoteApp Server (Required for Remote Desktop)

The RemoteApp requires a Socket.IO server to function. You have two options:

#### Option A: Use the provided scripts
```bash
# Windows
start-remote-server.bat

# Unix/Linux/Mac
chmod +x start-remote-server.sh
./start-remote-server.sh
```

#### Option B: Manual start
```bash
# Install server dependencies
npm install express socket.io cors

# Start the server
node remote-server.js
```

The RemoteApp server will run on `http://localhost:8080`.

### 4. Access the Application

- **Main App:** http://localhost:5173
- **RemoteApp Server Health:** http://localhost:8080/health

## RemoteApp Setup

The RemoteApp allows you to control remote computers. To use it:

1. **Start the server** (see step 3 above)
2. **Run the Electron host app** (in `remote-electron-app-main/` directory)
3. **Access RemoteApp** through the main web application
4. **Connect to available hosts** and control them remotely

### Demo Credentials

For testing the RemoteApp login:
- **Email:** demo@example.com
- **Password:** demo123

## Development

This project uses:
- **React 18** with Vite
- **Socket.IO** for real-time communication
- **Ant Design** for UI components
- **Express.js** for the RemoteApp server

## Troubleshooting

### RemoteApp Connection Issues

If you see connection errors in the RemoteApp:

1. **Check if the server is running:**
   ```bash
   curl http://localhost:8080/health
   ```

2. **Verify the server is on port 8080:**
   - The RemoteApp expects the server on `localhost:8080`
   - Check if another application is using port 8080

3. **Check server logs:**
   - Look for connection events in the server console
   - Verify hosts are connecting properly

### Common Issues

- **Port 8080 in use:** Change the port in `remote-server.js` or stop the conflicting application
- **CORS errors:** The server is configured to allow all origins for development
- **Socket.IO connection fails:** Ensure the server is running before accessing the RemoteApp

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── RemoteApp/          # Remote Desktop application
│   │   └── ...                 # Other components
│   └── ...
├── remote-electron-app-main/   # Electron host application
├── remote-server.js           # Socket.IO server
├── start-remote-server.bat    # Windows server starter
└── start-remote-server.sh     # Unix server starter
```

## License

This project is licensed under the ISC License.
