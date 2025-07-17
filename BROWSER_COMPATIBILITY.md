# Universal Browser Compatibility

This ASCII Clock extension now supports both Chrome and Firefox with a single codebase!

## How It Works

The extension uses a **universal compatibility layer** (`js/browser-compatibility.js`) that:
- Detects whether it's running in Chrome or Firefox
- Provides a unified `extensionAPI` object that works in both browsers
- Automatically handles the differences between `chrome.*` and `browser.*` APIs

## Building for Different Browsers

### For Chrome (Default)
The current `manifest.json` is configured for Chrome (Manifest v3).
1. Load the extension directly in Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select this folder

### For Firefox
1. Run the Firefox build script:
   ```powershell
   .\build-firefox.ps1
   ```
2. Load in Firefox:
   - Go to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file

### Switching Between Browsers
- **To Firefox**: Run `.\build-firefox.ps1`
- **To Chrome**: Run `.\build-chrome.ps1`

## Key Differences Handled

| Feature | Chrome (MV3) | Firefox (MV2) |
|---------|--------------|---------------|
| Manifest Version | 3 | 2 |
| API Namespace | `chrome.*` | `browser.*` |
| Background | `service_worker` | `scripts` array |
| Action | `action` | `browser_action` |
| Extension ID | Auto-generated | Explicit in manifest |

## Files Modified

- **`js/browser-compatibility.js`**: Universal compatibility layer
- **`manifest-firefox.json`**: Firefox-specific manifest
- **All JS files**: Updated to use `extensionAPI` instead of `chrome`
- **All HTML files**: Include compatibility layer script
- **Build scripts**: PowerShell scripts for easy switching

## Testing

The extension has been tested to work identically in:
- ✅ Chrome/Chromium (Manifest v3)
- ✅ Firefox (Manifest v2)

All features including alarms, timers, storage, and notifications work across both browsers.
