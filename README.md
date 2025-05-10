# GPT-DESK

A floating AI desktop assistant powered by OpenRouter, allowing you to access various AI models such as GPT-4.1 and Claude 3.

## Features

- **Always on top**: App stays on top of other windows for quick access
- **Intelligent positioning**: Opens near your cursor position without disrupting your workflow
- **Keyboard shortcut**: Press `Cmd+Shift+Space` (Mac) or `Ctrl+Shift+Space` (Windows/Linux) to toggle the app
- **Multiple AI models**: Access various AI models through OpenRouter
- **Secure API key storage**: Your OpenRouter API key is stored securely
- **Clean minimalist interface**: Distraction-free design for productivity

## Installation

1. Clone this repository
2. Install dependencies with `npm install`
3. Run in development mode with `npm run dev`
4. Build for production with `npm run build`

## How to Use

1. Launch the app - it will remain hidden until activated
2. Press `Cmd+Shift+Space` (Mac) or `Ctrl+Shift+Space` (Windows/Linux) to show/hide the app
3. Enter your OpenRouter API key (get one from [OpenRouter](https://openrouter.ai/keys))
4. Select your preferred AI model from the dropdown
5. Start chatting with the AI!

## Window Controls

- **Toggle Visibility**: Hide/show the window without disrupting focus
- **Keyboard Shortcut**: Press `Cmd+Shift+Space` (Mac) or `Ctrl+Shift+Space` (Windows/Linux)
- **Minimize**: Minimize the window
- **Close**: Close the application (it will remain in your system tray)

## Tray Icon

The app creates a tray icon that allows you to:

- Show/hide the window
- Quit the application

## Models

The app supports multiple AI models from OpenRouter, including:

- GPT-4.1
- Claude 3 Opus
- Claude 3 Sonnet
- Claude 3 Haiku
- Mixtral 8x7B
- Llama 3 70B
- And more!

## Development

The app is built with:

- Electron
- React
- OpenRouter API

## Troubleshooting

If you experience issues with certain models, the app will automatically fall back to a default model (GPT-4.1).

## Creating a Tray Icon

For proper display in system trays:

### macOS

- Create a 22x22 pixel PNG file named `tray-icon-mac.png` in the `assets` folder
- For Retina displays, create it at 44x44 physical pixels but 22x22 logical points
- Use a simple monochrome design (black only) with transparent background
- macOS will automatically adjust the color based on light/dark mode

### Windows/Linux

- Create a 16x16 or 32x32 pixel PNG file named `tray-icon.png` in the `assets` folder
- Use colors that look good on both light and dark backgrounds

## License

ISC

## GPT PROMPT

You're helping me build a production-ready macOS desktop AI assistant using:

- React (for UI, via Vite)
- Electron (to wrap the app for macOS)
- OpenRouter (for secure LLM API calls to models like GPT-4, Claude, Mistral)

This app replaces Siri: it's a lightweight, always-on-top, frameless, transparent desktop window that floats like an AI assistant.

### Your responsibilities:

1. Write and debug production-ready code
2. Use Electron best practices for:
   - `BrowserWindow` setup
   - `preload.js` with `contextIsolation: true`
   - Proper use of `app.whenReady()`, `ipcMain`, `ipcRenderer`
3. Securely call OpenRouter’s API via `preload.js` or backend (never expose API keys in React)
4. Include full error handling (network errors, window init failures, null checks)
5. Ensure everything runs cleanly on first launch (no console errors or crashes)
6. Optimize for performance (quick launch, smooth UI, minimal memory footprint)
7. Style with dark mode UI and smooth animations (optional)

### Startup Code Requirements:

- `main.js`: Frameless, always-on-top Electron window with transparent UI
- `preload.js`: Securely exposes a `sendMessage(model, message)` function to React
- React `App.jsx`: Basic chat UI layout (message list, input field, send button)
- All Electron and Node APIs should have error handling and fallbacks
- Structure all IPC or API request logic to fail gracefully with console warnings

I’ll ask for specific files or help. Reply with only the code unless I ask for explanation.

Start by generating:

1. A clean `main.js` with safe window creation and logging
2. A `preload.js` that securely handles OpenRouter API requests with error checks
3. A minimal React `App.jsx` that connects and displays responses
