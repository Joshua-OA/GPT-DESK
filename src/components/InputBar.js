import React, { useState, useEffect, useRef } from "react";
import "../styles/InputBar.css";

// Use API if available, or mock for development
const api = window.api || {
	copy: (text) => navigator.clipboard.writeText(text),
	paste: async () => navigator.clipboard.readText(),
};

const InputBar = ({ onSendMessage, disabled, loading }) => {
	const [message, setMessage] = useState("");
	const textareaRef = useRef(null);

	// Enable copy/paste functionality
	useEffect(() => {
		const handlePaste = async (e) => {
			// Use the api.paste if available, otherwise fallback
			try {
				// If we have direct paste event data, use it
				if (e.clipboardData && e.clipboardData.getData) {
					const text = e.clipboardData.getData("text/plain");
					if (text) {
						e.preventDefault();
						document.execCommand("insertText", false, text);
					}
				} else {
					// Try through our API
					const text = await api.paste();
					if (text && textareaRef.current) {
						// Insert at cursor position
						const start = textareaRef.current.selectionStart;
						const end = textareaRef.current.selectionEnd;
						const newText =
							message.substring(0, start) + text + message.substring(end);
						setMessage(newText);
					}
				}
			} catch (error) {
				console.error("Paste failed:", error);
			}
		};

		// Add event listeners to the textarea
		if (textareaRef.current) {
			// For paste functionality
			textareaRef.current.addEventListener("paste", handlePaste);
		}

		return () => {
			// Cleanup event listeners
			if (textareaRef.current) {
				textareaRef.current.removeEventListener("paste", handlePaste);
			}
		};
	}, [message]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (message.trim() && !disabled) {
			onSendMessage(message);
			setMessage("");
		}
	};

	return (
		<form className="input-bar" onSubmit={handleSubmit}>
			<textarea
				ref={textareaRef}
				className="message-input no-drag"
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				placeholder={disabled ? "Set API key first" : "Type your message..."}
				disabled={disabled}
				onKeyDown={(e) => {
					// Handle Enter key for sending
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						handleSubmit(e);
					}

					// Handle keyboard shortcuts
					if (e.metaKey || e.ctrlKey) {
						// Shortcuts are handled by the application menu
						// This just ensures the event bubbles properly
					}
				}}
			/>
			<button
				type="submit"
				className="send-button no-drag"
				disabled={disabled || !message.trim()}>
				{loading ? (
					<div className="loader"></div>
				) : (
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg">
						<path
							d="M22 2L11 13"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M22 2L15 22L11 13L2 9L22 2Z"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				)}
			</button>
		</form>
	);
};

export default InputBar;
