import { useState } from "react";
import { ActiveScenarioResponse } from "./types";

export default function App() {
  const [token, setToken] = useState<string>("");
  const [logoLightStatus, setLogoLightStatus] = useState<string>("");

  const fetchScenarios = async (token: string) => {
    try {
      const url = new URL("http://localhost:3000/scenario/activeScenario");
      url.searchParams.set("token", token);
      console.log("Fetching scenarios with token:", token);
      const response = await fetch(url.toString());
      const scenario = await response.json() as ActiveScenarioResponse;
      console.log("Scenarios:", scenario.activeScenario);
    } catch (error) {
      console.error("Failed to fetch scenarios:", error);
    }
  };

  const activateScenarios = async (token: string) => {
    
  };

  const handleLogoLightOn = async () => {
    try {
      if (!window.simconnect) {
        setLogoLightStatus("SimConnect bridge unavailable");
        return;
      }

      await window.simconnect.setLogoLightOn();
      setLogoLightStatus("Logo light event sent");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setLogoLightStatus(`Failed: ${message}`);
    }
  };

  return (
    <main className="app">
      <h1>Sim Scenarios Client</h1>
      <div>
        <input type="text" onChange={(e) => setToken(e.target.value)} value={token} />
        <button onClick={() => fetchScenarios(token)}>Fetch Scenarios</button>
      </div>
      <div className="actions">
        <button onClick={handleLogoLightOn}>logo light on</button>
      </div>
      {logoLightStatus ? <p className="value">{logoLightStatus}</p> : null}
    </main>
  );
}
