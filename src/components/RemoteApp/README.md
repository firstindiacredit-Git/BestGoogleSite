# RemoteApp Integration

This directory contains the RemoteApp that has been integrated into the main website.

## Integration Details

The RemoteApp has been modified to work within the main website's routing system:

### Files Modified:

1. **RemoteAppWrapper.jsx** - Main wrapper component that manages internal state and authentication
2. **Main.jsx** - Modified to accept `user` and `onLogout` props
3. **Login.jsx** - Modified to accept `onLoginSuccess` and `onSignupClick` props
4. **Signup.jsx** - Modified to accept `onSignupSuccess` and `onLoginClick` props
5. **index.css** - Added styles for the RemoteApp container
6. **mockApi.js** - Mock API for testing authentication functionality

### How it works:

1. When users click the "REMOTE" button in SearchPage.jsx, it sets `activeComponent` to "Remote"
2. The SearchPage renders `<RemoteAppWrapper />` when `activeComponent === "Remote"`
3. RemoteAppWrapper manages internal state and renders the appropriate component (Login, Signup, or Main)
4. The RemoteApp works like Linktree - no external routing, everything stays within the main app
5. Authentication state is managed internally and persists across sessions

### Dependencies:

The RemoteApp requires these dependencies (already available in main project):
- `antd` (Ant Design UI components)
- `@ant-design/icons` (Ant Design icons)
- `socket.io-client` (WebSocket client for real-time communication)
- `axios` (HTTP client)
- `react-router-dom` (Routing)

### Usage:

The RemoteApp is automatically available when users click the "REMOTE" button in the main navigation. It provides:

- Remote desktop connection functionality
- User authentication (login/signup)
- Real-time screen sharing
- Remote control capabilities

### Demo Credentials:

For testing purposes, you can use these demo credentials:

**Primary Demo Account:**
- **Email:** demo@example.com
- **Password:** demo123

**Additional Test Accounts:**
- **Email:** admin@example.com | **Password:** admin123
- **Email:** user@example.com | **Password:** user123  
- **Email:** test@example.com | **Password:** test123

### Authentication Flow:

1. **Login Page** - Users can log in with existing credentials
2. **Signup Page** - New users can create accounts
3. **Main App** - Only accessible after successful authentication
4. **Logout** - Available in the user dropdown menu

### Styling:

The RemoteApp uses a dark theme with custom CSS that's scoped to the `.remote-app-container` class to avoid conflicts with the main website's styling.
