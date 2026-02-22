import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useClientAppStore from "../store";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { fsuipcWebSocketAddress, backendApiAddress, setFsuipcWebSocketAddress, setBackendApiAddress } = useClientAppStore();

  const [fsuipcAddress, setFsuipcAddress] = useState(fsuipcWebSocketAddress);
  const [apiAddress, setApiAddress] = useState(backendApiAddress);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setFsuipcWebSocketAddress(fsuipcAddress);
    setBackendApiAddress(apiAddress);
    window.simconnect?.setAircraftHandlerOptions({ wsAddress: fsuipcAddress });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="app">
      <div className="settings-header">
        <button className="back-button" onClick={() => navigate("/")}>← Back</button>
        <h1>Settings</h1>
      </div>

      <div className="message-box" style={{ marginTop: "24px", textAlign: "left" }}>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: "6px" }}>
            FSUIPC WebSocket Address
          </label>
          <input
            className="token-input-field"
            style={{ width: "100%" }}
            type="text"
            placeholder="e.g. ws://localhost:2048/fsuipc/"
            value={fsuipcAddress}
            onChange={(e) => setFsuipcAddress(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: "6px" }}>
            Back-end API Address
          </label>
          <input
            className="token-input-field"
            style={{ width: "100%" }}
            type="text"
            placeholder="e.g. http://localhost:3000"
            value={apiAddress}
            onChange={(e) => setApiAddress(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={handleSave} style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid #0ea5e9", cursor: "pointer" }}>
            Save
          </button>
          {saved && <span style={{ color: "#0ea5e9", fontWeight: 500 }}>Saved!</span>}
        </div>
      </div>
    </main>
  );
}
