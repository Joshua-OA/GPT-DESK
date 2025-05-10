const { contextBridge, ipcRenderer, clipboard } = require("electron");

// Handle standard keyboard shortcuts for copy, paste, etc.
document.addEventListener("DOMContentLoaded", () => {
	// Enable clipboard operations
	window.addEventListener("keydown", (e) => {
		// Command+C or Ctrl+C (copy)
		if ((e.metaKey || e.ctrlKey) && e.key === "c") {
			const selection = window.getSelection().toString();
			if (selection) {
				clipboard.writeText(selection);
			}
		}

		// Command+V or Ctrl+V (paste)
		if ((e.metaKey || e.ctrlKey) && e.key === "v") {
			// Let the default browser behavior handle this
			// This is just to ensure the event is properly captured
		}

		// Command+A or Ctrl+A (select all)
		if ((e.metaKey || e.ctrlKey) && e.key === "a") {
			// The default select all behavior should work with this
		}
	});
});

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
	// Send message to AI through OpenRouter
	sendMessage: (model, message) =>
		ipcRenderer.invoke("send-message", { model, message }),

	// API key management (store securely in main process)
	setApiKey: (key) => ipcRenderer.invoke("set-api-key", key),
	getApiKey: () => ipcRenderer.invoke("get-api-key"),

	// Window controls
	minimize: () => ipcRenderer.send("minimize-window"),
	maximize: () => ipcRenderer.send("maximize-window"),
	close: () => ipcRenderer.send("close-window"),
	toggleVisibility: () => ipcRenderer.send("toggle-visibility"),

	// Clipboard operations
	copy: (text) => {
		if (text) clipboard.writeText(text);
	},
	paste: () => clipboard.readText(),

	// Settings and preferences (to be implemented)
	getSettings: () => ipcRenderer.invoke("get-settings"),
	saveSettings: (settings) => ipcRenderer.invoke("save-settings", settings),
});
