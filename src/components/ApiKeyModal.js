import React, { useState } from "react";
import "../styles/ApiKeyModal.css";

const ApiKeyModal = ({ onSave, onCancel }) => {
	const [apiKey, setApiKey] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!apiKey.trim()) {
			setError("Please enter your OpenRouter API key");
			return;
		}

		// Simple validation - OpenRouter keys typically start with 'sk-'
		if (!apiKey.startsWith("sk-")) {
			setError(
				'This doesn\'t look like a valid OpenRouter API key. It should start with "sk-"'
			);
			return;
		}

		onSave(apiKey);
	};

	return (
		<div className="modal-overlay">
			<div className="api-key-modal">
				<h2>Enter OpenRouter API Key</h2>
				<p className="modal-description">
					Your API key is stored locally and securely. It's used to connect to
					OpenRouter's AI services.
				</p>

				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label htmlFor="apiKey">API Key</label>
						<input
							id="apiKey"
							type="password"
							value={apiKey}
							onChange={(e) => {
								setApiKey(e.target.value);
								setError("");
							}}
							placeholder="sk-xxxxxxx"
							className={`no-drag ${error ? "error" : ""}`}
						/>
						{error && <div className="error-message">{error}</div>}
					</div>

					<div className="modal-actions">
						<button type="button" className="cancel-button" onClick={onCancel}>
							Cancel
						</button>
						<button type="submit" className="save-button">
							Save Key
						</button>
					</div>
				</form>

				<p className="help-text">
					Need an API key?{" "}
					<a
						href="https://openrouter.ai/keys"
						target="_blank"
						rel="noopener noreferrer">
						Get one from OpenRouter
					</a>
				</p>
			</div>
		</div>
	);
};

export default ApiKeyModal;
