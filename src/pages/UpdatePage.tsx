import { useNavigate } from "react-router-dom";
import useClientAppStore from "../store";


export default function UpdatePage() {
	const navigate = useNavigate();
	const setIgnoredUpdateVersion = useClientAppStore((state) => state.setIgnoredUpdateVersion);
	const installerUrl = import.meta.env.VITE_INSTALLER_URL ?? 'https://dl.simscenarios.net/Sim%20Scenarios%20Setup.exe';
	
	const ignoreUpdate = () => {
		setIgnoredUpdateVersion(true);

		navigate("/");
	};

	return (
		<main className="app">
			<div className="settings-header">
				<h1>Update Required</h1>
			</div>

			<div className="message-box" style={{ marginTop: "24px", textAlign: "left" }}>
				<p className="message-p" style={{ marginBottom: "12px" }}>
					You cannot use this app until you update it to the latest version.
				</p>
				<a
					href={installerUrl}
					target="_blank"
					rel="noreferrer"
					style={{ color: "#0c4a6e", fontWeight: 600 }}
				>
					Download updated installer
				</a>
			</div>

			<div className="action-buttons-container">
				<button className="action-button" onClick={ignoreUpdate}>Ignore</button>
			</div>
		</main>
	);
}