import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <main className="app">
      <div className="settings-header">
        <button className="back-button" onClick={() => navigate("/")}>← Back</button>
        <h1>Settings</h1>
      </div>
      <div className="message-box" style={{ marginTop: "24px" }}>
        <p className="message-p">Settings coming soon.</p>
      </div>
    </main>
  );
}
