import React from "react";
import "../styles/TitleBar.css";

// Use the real API if available, otherwise use mock
const api = window.api || {
	minimize: () => console.log("Mock: Window minimized"),
	maximize: () => console.log("Mock: Window maximized"),
	close: () => console.log("Mock: Window closed"),
	toggleVisibility: () => console.log("Mock: Toggle visibility"),
};

const TitleBar = () => {
	// Window control handlers
	const handleClose = () => api.close();
	const handleMinimize = () => api.minimize();
	const handleToggleVisibility = () => api.toggleVisibility();

	return (
		<div className="title-bar">
			<div className="title">GPT-DESK</div>
			<div className="window-controls">
				<button className="control toggle" onClick={handleToggleVisibility}>
					<svg width="12" height="12" viewBox="0 0 12 12">
						<path
							d="M2 6 L10 6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
						/>
					</svg>
				</button>
				<button className="control minimize" onClick={handleMinimize}>
					<svg width="12" height="12" viewBox="0 0 12 12">
						<rect x="2" y="5" width="8" height="2" fill="currentColor" />
					</svg>
				</button>
				<button className="control close" onClick={handleClose}>
					<svg width="12" height="12" viewBox="0 0 12 12">
						<path
							d="M2.4 1L1 2.4L4.6 6L1 9.6L2.4 11L6 7.4L9.6 11L11 9.6L7.4 6L11 2.4L9.6 1L6 4.6L2.4 1Z"
							fill="currentColor"
						/>
					</svg>
				</button>
			</div>
		</div>
	);
};

export default TitleBar;
