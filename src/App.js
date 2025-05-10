import React, { useState, useEffect } from "react";
import ChatWindow from "./components/ChatWindow";
import TitleBar from "./components/TitleBar";
import "./styles/App.css";

// Create a mock API for development when not running in Electron
const mockApi = {
	sendMessage: async () => ({
		choices: [
			{
				message: {
					content:
						"This is a mock response in development mode. Connect an OpenRouter API key in Electron.",
				},
			},
		],
	}),
	setApiKey: async () => ({ success: true }),
	getApiKey: async () => ({ exists: false }),
	minimize: () => console.log("Mock: Window minimized"),
	maximize: () => console.log("Mock: Window maximized"),
	close: () => console.log("Mock: Window closed"),
	getSettings: async () => ({}),
	saveSettings: async () => ({ success: true }),
};

// Use the real API if available, otherwise use mock
const api = window.api || mockApi;

function App() {
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [model, setModel] = useState("openai/gpt-4.1");
	const [apiKeySet, setApiKeySet] = useState(false);

	// Check if API key is set on app start
	useEffect(() => {
		const checkApiKey = async () => {
			try {
				const result = await api.getApiKey();
				setApiKeySet(result.exists);
			} catch (error) {
				console.error("Failed to check API key:", error);
			}
		};

		checkApiKey();
	}, []);

	const handleSendMessage = async (message) => {
		if (!message.trim()) return;

		// Add user message to chat
		const userMessage = { role: "user", content: message };
		setMessages((prev) => [...prev, userMessage]);

		// Set loading state
		setLoading(true);

		try {
			// Ensure we have a valid model ID - fallback to a safe default if needed
			const requestModel = model || "openai/gpt-4.1";

			// Call the preload API to send message securely
			const response = await api.sendMessage(requestModel, message);

			// Check for errors
			if (response.error) {
				// If we get a model-specific error, try falling back to a known working model
				if (response.error.includes("model") && model !== "openai/gpt-4.1") {
					setModel("openai/gpt-4.1");
					setMessages((prev) => [
						...prev,
						{
							role: "assistant",
							content: `The selected model was unavailable. I've switched to a default model. Please try again.`,
						},
					]);
				} else {
					setMessages((prev) => [
						...prev,
						{
							role: "assistant",
							content: `Error: ${response.error}`,
						},
					]);
				}
				return;
			}

			// Add AI response to chat
			if (response.choices && response.choices.length > 0) {
				const aiMessage = {
					role: "assistant",
					content: response.choices[0].message.content,
				};
				setMessages((prev) => [...prev, aiMessage]);
			}
		} catch (error) {
			console.error("Error sending message:", error);
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: "Sorry, there was an error processing your request.",
				},
			]);
		} finally {
			setLoading(false);
		}
	};

	const handleSetApiKey = async (key) => {
		try {
			await api.setApiKey(key);
			setApiKeySet(true);
		} catch (error) {
			console.error("Failed to set API key:", error);
		}
	};

	return (
		<div className="app">
			<TitleBar />
			<ChatWindow
				messages={messages}
				onSendMessage={handleSendMessage}
				loading={loading}
				apiKeySet={apiKeySet}
				onSetApiKey={handleSetApiKey}
				model={model}
				onChangeModel={setModel}
			/>
		</div>
	);
}

export default App;
