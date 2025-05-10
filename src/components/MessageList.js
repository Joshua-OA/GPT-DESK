import React from "react";
import "../styles/MessageList.css";

// Use API if available, or mock for development
const api = window.api || {
	copy: (text) => navigator.clipboard.writeText(text),
};

const MessageList = ({ messages }) => {
	// Handle copy text on right-click or double-click
	const handleCopyText = (text) => {
		try {
			api.copy(text);
		} catch (error) {
			console.error("Failed to copy text:", error);
		}
	};

	if (messages.length === 0) {
		return (
			<div className="empty-state">
				<div className="empty-icon">✨</div>
				<h3>Welcome to GPT-DESK</h3>
				<p>Your AI assistant is ready. Start a conversation!</p>
			</div>
		);
	}

	return (
		<div className="message-list">
			{messages.map((message, index) => (
				<div
					key={index}
					className={`message ${
						message.role === "user" ? "user-message" : "assistant-message"
					}`}>
					<div className="message-avatar">
						{message.role === "user" ? "👤" : "🤖"}
					</div>
					<div
						className="message-content no-drag"
						onDoubleClick={() => handleCopyText(message.content)}
						onContextMenu={(e) => {
							e.preventDefault();
							handleCopyText(message.content);
						}}>
						{message.content}
					</div>
				</div>
			))}
		</div>
	);
};

export default MessageList;
