const {
	app,
	BrowserWindow,
	ipcMain,
	screen,
	Tray,
	Menu,
	globalShortcut,
	MenuItem,
} = require("electron");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const Store = require("electron-store");

// Check if we're in development mode
const isDev = process.env.NODE_ENV === "development";
console.log("Running in", isDev ? "development" : "production", "mode");

// Config storage
const store = new Store({
	encryptionKey: "your-secure-encryption-key", // In production, use a secure key
});

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;
let tray = null;

function createWindow() {
	const { width, height } = screen.getPrimaryDisplay().workAreaSize;

	mainWindow = new BrowserWindow({
		width: 380,
		height: 550,
		x: Math.floor(width / 2) - 190, // Center horizontally
		y: process.platform === "darwin" ? 22 : 0, // Position below menu bar on macOS
		frame: false,
		transparent: true,
		alwaysOnTop: true, // Always stay on top of other windows
		skipTaskbar: true, // Hide from taskbar
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
			webSecurity: true,
			enableRemoteModule: false,
		},
		hasShadow: true,
		resizable: true,
		// Don't show on creation - we'll show it with toggleVisibility
		show: false,
		// Prevent focus stealing on startup
		focusable: false,
		// Use normal window type to fix copy/paste (panel type breaks text selection)
		type: process.platform === "darwin" ? "desktop" : "normal",
	});

	// Additional setup for macOS to treat window as utility panel
	if (process.platform === "darwin") {
		// These properties help ensure the window stays above others without activating desktop
		mainWindow.setWindowButtonVisibility(false);
		// Don't use vibrancy as it doesn't work with desktop-type windows
	}

	// Create application menu with Edit functionality
	setupApplicationMenu();

	// Load the index.html from React in production or dev server in development
	const startURL = isDev
		? "http://localhost:3000"
		: `file://${path.join(__dirname, "./build/index.html")}`;

	console.log("Loading URL:", startURL);
	mainWindow.loadURL(startURL).then(() => {
		// Make the window focusable again after it's fully loaded
		// This prevents focus stealing on startup but allows interaction later
		setTimeout(() => {
			if (mainWindow) {
				mainWindow.setFocusable(true);
				// But still keep it hidden until explicitly toggled
				if (mainWindow.isVisible()) {
					mainWindow.hide();
				}
			}
		}, 1000);
	});

	// Ensure the window doesn't flash briefly on startup
	mainWindow.once("ready-to-show", () => {
		// We explicitly don't show the window here - it will be shown via toggleVisibility

		// Schedule a check to make sure the window is hidden
		setTimeout(() => {
			if (mainWindow && mainWindow.isVisible()) {
				mainWindow.hide();
			}
		}, 100);
	});

	// Important: Override normal window activation to prevent desktop switching
	mainWindow.on("activate", (event) => {
		// Prevent default activation behavior
		event.preventDefault();

		// If window is hidden, use our toggle function instead
		if (!mainWindow.isVisible()) {
			toggleWindowVisibility();
		}
	});

	// Create a tray icon
	if (process.platform === "darwin") {
		try {
			// Check if tray icon exists - for macOS we want the smaller size specifically
			const trayIconPath = path.join(__dirname, "assets/tray-icon-mac.png");
			// Fallback options in order of preference
			const fallbackOptions = [
				path.join(__dirname, "assets/tray-icon.png"),
				path.join(
					__dirname,
					isDev ? "public/favicon.ico" : "build/favicon.ico"
				),
			];

			// Find the first icon that exists
			let iconPath = trayIconPath;
			if (!fs.existsSync(iconPath)) {
				for (const option of fallbackOptions) {
					if (fs.existsSync(option)) {
						iconPath = option;
						break;
					}
				}
			}

			// On Mac, create the tray icon with Template support for dark/light modes
			tray = new Tray(iconPath);
			tray.setIgnoreDoubleClickEvents(true);

			// Set as template image (macOS will render it properly in the menu bar)
			tray.setPressedImage(iconPath);

			const contextMenu = Menu.buildFromTemplate([
				{ label: "Show/Hide", click: () => toggleWindowVisibility() },
				{ type: "separator" },
				{ label: "Quit", click: () => app.quit() },
			]);
			tray.setToolTip("GPT-DESK");
			tray.setContextMenu(contextMenu);

			// On macOS, we want to handle both left and right clicks
			if (process.platform === "darwin") {
				// Left click opens the app
				tray.on("click", (event) => {
					toggleWindowVisibility();
				});

				// Right click opens the context menu (handled automatically)
			} else {
				// On Windows/Linux left click toggles visibility
				tray.on("click", () => toggleWindowVisibility());
			}
		} catch (error) {
			console.error("Failed to create tray icon:", error);
		}
	}

	// Hide dock icon (macOS only)
	if (process.platform === "darwin") {
		app.dock.hide();
	}

	// For development
	if (isDev) {
		mainWindow.webContents.openDevTools({ mode: "detach" });
	}

	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}

app.whenReady().then(() => {
	createWindow();

	// Register a global shortcut to toggle visibility (Default: Command+Shift+Space)
	const shortcutRegistered = globalShortcut.register(
		"CommandOrControl+Shift+Space",
		() => {
			toggleWindowVisibility();
		}
	);

	if (!shortcutRegistered) {
		console.log("Keyboard shortcut registration failed");
	} else {
		console.log("Keyboard shortcut registered: CommandOrControl+Shift+Space");
	}

	// On macOS, don't show window when clicking on dock icon, use toggle instead
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		} else if (mainWindow) {
			// Instead of showing directly (which activates the desktop),
			// use our toggle function
			if (!mainWindow.isVisible()) {
				toggleWindowVisibility();
			}
		}
	});
});

// Clean up global shortcuts when app is about to quit
app.on("will-quit", () => {
	// Unregister all shortcuts
	globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

// Window control handlers
ipcMain.on("minimize-window", () => {
	if (mainWindow) mainWindow.minimize();
});

ipcMain.on("maximize-window", () => {
	if (mainWindow) {
		if (mainWindow.isMaximized()) {
			mainWindow.unmaximize();
		} else {
			mainWindow.maximize();
		}
	}
});

ipcMain.on("close-window", () => {
	if (mainWindow) mainWindow.close();
});

// Function to toggle window visibility
function toggleWindowVisibility() {
	if (!mainWindow) return;

	if (mainWindow.isVisible()) {
		// Store position before hiding
		const position = mainWindow.getPosition();
		store.set("window-position", position);
		mainWindow.hide();
	} else {
		// Get the current active window position as reference
		// For macOS we need to position it over the current application
		const cursorPosition = screen.getCursorScreenPoint();
		const displays = screen.getAllDisplays();
		const currentDisplay =
			displays.find((display) => {
				const { x, y, width, height } = display.bounds;
				return (
					cursorPosition.x >= x &&
					cursorPosition.x < x + width &&
					cursorPosition.y >= y &&
					cursorPosition.y < y + height
				);
			}) || screen.getPrimaryDisplay();

		// Calculate position - center horizontally above cursor
		let xPosition = Math.floor(cursorPosition.x - 380 / 2);

		// Keep window within screen bounds
		if (xPosition < currentDisplay.bounds.x) {
			xPosition = currentDisplay.bounds.x;
		}
		if (
			xPosition + 380 >
			currentDisplay.bounds.x + currentDisplay.bounds.width
		) {
			xPosition = currentDisplay.bounds.x + currentDisplay.bounds.width - 380;
		}

		// Position just below the menu bar on macOS (22px) or at top of screen otherwise
		const yPosition = process.platform === "darwin" ? 22 : 0;

		// Critical step: prevent desktop activation by handling this in specific order

		// 1. Set window level to be on top
		mainWindow.setAlwaysOnTop(true, "floating", 1);

		// 2. Position correctly
		mainWindow.setPosition(xPosition, yPosition);

		// 3. Make window fully interactive but don't steal focus initially
		if (process.platform === "darwin") {
			mainWindow.showInactive();
		} else {
			mainWindow.show();
		}

		// 4. Ensure window is focusable (required for text selection/input)
		mainWindow.setFocusable(true);
	}
}

// IPC handlers for secure API communication
ipcMain.handle("send-message", async (event, { model, message, apiKey }) => {
	try {
		// Use stored API key if not provided in request
		const key = apiKey || store.get("openrouter-api-key");

		if (!key) {
			return {
				error: "API key not found. Please set your OpenRouter API key.",
			};
		}

		const response = await axios.post(
			"https://openrouter.ai/api/v1/chat/completions",
			{
				model: model || "openai/gpt-4-turbo",
				messages: [{ role: "user", content: message }],
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${key}`,
					"HTTP-Referer": "https://gpt-desk.app",
					"X-Title": "GPT-DESK",
				},
			}
		);

		return response.data;
	} catch (error) {
		console.error("API request error:", error);
		return {
			error: error.message || "Failed to communicate with AI service",
			status: error.response?.status,
		};
	}
});

// Store API key securely
ipcMain.handle("set-api-key", (event, key) => {
	store.set("openrouter-api-key", key);
	return { success: true };
});

// Get API key (masked for UI display)
ipcMain.handle("get-api-key", () => {
	const key = store.get("openrouter-api-key");
	if (!key) return { exists: false };
	return {
		exists: true,
		maskedKey: `${key.substring(0, 4)}...${key.substring(key.length - 4)}`,
	};
});

// Settings and preferences handlers
ipcMain.handle("get-settings", () => {
	return store.get("settings") || {};
});

ipcMain.handle("save-settings", (event, settings) => {
	store.set("settings", settings);
	return { success: true };
});

ipcMain.on("toggle-visibility", () => {
	toggleWindowVisibility();
});

// Setup application menu with proper Edit operations to support copy/paste
function setupApplicationMenu() {
	const template = [
		{
			label: "Edit",
			submenu: [
				{ role: "undo" },
				{ role: "redo" },
				{ type: "separator" },
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" },
				{ role: "delete" },
				{ role: "selectAll" },
			],
		},
	];

	// Add mac-specific menu items
	if (process.platform === "darwin") {
		template.unshift({
			label: app.name,
			submenu: [
				{ role: "hide" },
				{ role: "hideothers" },
				{ role: "unhide" },
				{ type: "separator" },
				{
					label: "Quit",
					accelerator: "Command+Q",
					click: () => app.quit(),
				},
			],
		});
	}

	// Set as application menu
	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);

	// Add context menu for text fields
	mainWindow.webContents.on("context-menu", (event, params) => {
		// Only show if there's editable text
		if (params.isEditable || params.selectionText) {
			const contextMenu = Menu.buildFromTemplate([
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" },
				{ type: "separator" },
				{ role: "selectAll" },
			]);
			contextMenu.popup();
		}
	});
}
