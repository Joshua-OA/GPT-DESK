import React, { useState } from "react";
import "../styles/ModelSelector.css";

const ModelSelector = ({ selectedModel, onChange }) => {
	const [isOpen, setIsOpen] = useState(false);

	// Common model options available on OpenRouter
	const models = [
		{ id: "openai/gpt-4.1", name: "GPT-4.1" },
		{ id: "anthropic/claude-3-opus", name: "Claude 3 Opus" },
		{ id: "anthropic/claude-3.7-sonnet:beta", name: "Claude 3 Sonnet" },
		{ id: "anthropic/claude-3.5-haiku", name: "Claude 3 Haiku" },
		{ id: "mistralai/mixtral-8x7b", name: "Mixtral 8x7B" },
		{ id: "meta-llama/llama-3-70b-instruct", name: "Llama 3 70B" },
		{ id: "google/gemini-2.5-pro-preview", name: "gemini-2.5-pro-preview" },
		{ id: "deepseek/deepseek-prover-v2:free", name: "Deepseek V2" },
	];

	const handleModelSelect = (modelId) => {
		onChange(modelId);
		setIsOpen(false);
	};

	// Find selected model name for display
	const selectedModelName =
		models.find((model) => model.id === selectedModel)?.name || "Select Model";

	return (
		<div className="model-selector">
			<button className="selected-model" onClick={() => setIsOpen(!isOpen)}>
				{selectedModelName}
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
					<path
						d="M6 9L12 15L18 9"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>

			{isOpen && (
				<div className="models-dropdown">
					{models.map((model) => (
						<button
							key={model.id}
							className={`model-option ${
								model.id === selectedModel ? "selected" : ""
							}`}
							onClick={() => handleModelSelect(model.id)}>
							{model.name}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export default ModelSelector;
