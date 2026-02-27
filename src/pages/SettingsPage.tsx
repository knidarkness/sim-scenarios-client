import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useClientAppStore from "../store";

export default function SettingsPage() {
    const navigate = useNavigate();
    const { fsuipcWebSocketAddress, backendApiAddress, setFsuipcWebSocketAddress, setBackendApiAddress, fenixApiURL, setFenixApiURL } = useClientAppStore();

    const [fsuipcAddress, setFsuipcAddress] = useState(fsuipcWebSocketAddress);
    const [apiAddress, setApiAddress] = useState(backendApiAddress);
    const [fenixAddress, setFenixAddress] = useState(fenixApiURL);
    
    const [saved, setSaved] = useState(false);

    function handleSave() {
        setFsuipcWebSocketAddress(fsuipcAddress);
        setBackendApiAddress(apiAddress);
        setFenixApiURL(fenixAddress);
        window.simconnect?.setAircraftHandlerOptions({ wsAddress: fsuipcAddress, fenixApiURL: fenixAddress });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <main className="app">
            <div className="app-header">
                <p className="app-title">Settings</p>
            </div>

            <div className="settings-form">
                <div className="settings-field">
                    <label className="settings-label">FSUIPC WebSocket Address</label>
                    <input
                        className="token-input-field"
                        type="text"
                        placeholder="e.g. ws://localhost:2048/fsuipc/"
                        value={fsuipcAddress}
                        onChange={(e) => setFsuipcAddress(e.target.value)}
                    />
                </div>

                <div className="settings-field">
                    <label className="settings-label">Fenix API Address</label>
                    <input
                        className="token-input-field"
                        type="text"
                        placeholder="e.g. http://localhost:8083"
                        value={fenixAddress}
                        onChange={(e) => setFenixAddress(e.target.value)}
                    />
                </div>

                <div className="settings-field">
                    <label className="settings-label">Back-end API Address</label>
                    <input
                        className="token-input-field"
                        type="text"
                        placeholder="e.g. http://localhost:3000"
                        value={apiAddress}
                        onChange={(e) => setApiAddress(e.target.value)}
                    />
                </div>

                <div className="settings-actions">
                    <button className="back-button" onClick={() => navigate("/")}>← Back</button>
                    <button className="save-button" onClick={handleSave}>Save</button>
                    {saved && <span className="saved-indicator">Saved!</span>}
                </div>
            </div>
        </main>
    );
}
