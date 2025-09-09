# AllMyTab Chrome Extension

A Chrome extension that replaces your new tab page with AllMyTab - a customizable dashboard featuring tools, bookmarks, and more.

## Features

- 🏠 **Custom New Tab**: Replaces Chrome's default new tab with AllMyTab
- 🎯 **Auto-focus Address Bar**: Automatically focuses the address bar for quick typing
- ⚙️ **Settings Panel**: Easy access to extension settings via popup
- 🔧 **Tool Integration**: Access to all AllMyTab tools and features
- 📱 **Responsive Design**: Works on all screen sizes
- 🌙 **Dark Mode Support**: Follows your system theme preferences

## Installation

### Method 1: Load Unpacked (Development)

1. **Build the Extension**:
   ```bash
   cd chrome-extension
   node build.js
   ```

2. **Install in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the `dist` folder
   - The extension will be installed and active

### Method 2: Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store soon.

## Usage

### Basic Usage

1. **Open a New Tab**: Press `Ctrl+T` or click the new tab button
2. **AllMyTab Loads**: Your custom dashboard will appear
3. **Start Typing**: The address bar will be automatically focused for quick searches

### Keyboard Shortcuts

- `Ctrl+L` or `Alt+D`: Focus address bar
- `Escape`: Clear focus from address bar
- `Ctrl+Enter`: Open AllMyTab website (from popup)

### Settings

Click the extension icon in the toolbar to access settings:

- **Auto-focus Address Bar**: Automatically focus address bar on new tab
- **Show Loading Screen**: Display loading animation while AllMyTab loads
- **Open AllMyTab Website**: Quick access to the main website
- **Focus Address Bar**: Manually focus the address bar
- **Reload Extension**: Restart the extension

## File Structure

```
chrome-extension/
├── manifest.json          # Extension manifest
├── newtab.html           # New tab page that loads AllMyTab
├── background.js         # Background service worker
├── content.js           # Content script for address bar focus
├── popup.html           # Settings popup
├── popup.js             # Popup functionality
├── icons/               # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── build.js             # Build script
├── create-icons.js      # Icon generation script
├── generate-icons.html  # Icon generator tool
└── README.md           # This file
```

## Development

### Prerequisites

- Node.js (v14 or higher)
- Chrome browser
- Basic knowledge of Chrome extension development

### Building

```bash
# Build the extension
node build.js

# Clean build directory
node build.js clean
```

### Testing

1. Build the extension using the build script
2. Load the `dist` folder as an unpacked extension in Chrome
3. Test functionality by opening new tabs
4. Check the extension popup for settings

### Debugging

- Use Chrome DevTools to debug the extension
- Check the background script in `chrome://extensions/`
- Use console logs in content scripts and popup

## Configuration

### Manifest Permissions

The extension requires minimal permissions:

- `storage`: Save user settings
- `activeTab`: Access current tab for address bar focus
- `tabs`: Manage tabs and new tab creation
- `host_permissions`: Access AllMyTab website

### Settings Storage

Settings are stored in Chrome's sync storage:

```javascript
{
  "auto_focus_address_bar": true,
  "show_loading_screen": true,
  "allmytab_url": "https://allmytab.com/search"
}
```

## Troubleshooting

### Common Issues

1. **Extension Not Working**:
   - Check if extension is enabled in `chrome://extensions/`
   - Reload the extension
   - Check console for errors

2. **Address Bar Not Focusing**:
   - Ensure "Auto-focus Address Bar" is enabled in settings
   - Try manually focusing with `Ctrl+L`
   - Check if other extensions are interfering

3. **AllMyTab Not Loading**:
   - Check internet connection
   - Verify AllMyTab website is accessible
   - Check browser console for errors

4. **Settings Not Saving**:
   - Check Chrome sync settings
   - Clear extension data and reconfigure
   - Restart Chrome

### Support

For support and bug reports:
- Visit [AllMyTab.com](https://allmytab.com)
- Check the extension popup for quick actions
- Use the feedback form on the website

## Privacy

This extension:
- ✅ Does not collect personal data
- ✅ Only accesses AllMyTab website
- ✅ Stores settings locally in Chrome
- ✅ Does not track browsing activity
- ✅ Open source and transparent

## License

This extension is part of the AllMyTab project. See the main project for license information.

## Changelog

### Version 1.0.0
- Initial release
- New tab page replacement
- Auto-focus address bar
- Settings popup
- Icon generation tools
- Build system

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Roadmap

- [ ] Chrome Web Store publication
- [ ] Additional keyboard shortcuts
- [ ] Theme customization
- [ ] Offline mode support
- [ ] Performance optimizations
- [ ] User analytics (optional)
