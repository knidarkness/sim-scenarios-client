export default function UpdatePage() {
	const installerUrl = import.meta.env.VITE_INSTALLER_URL ?? 'https://dl.simscenarios.net/Sim%20Scenarios%20Setup.exe';

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
		</main>
	);
}