@echo off
echo Starting RemoteApp Server...
echo.
echo This will start the Socket.IO server needed for the RemoteApp to function.
echo The server will run on http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo.

node remote-server.js

pause
