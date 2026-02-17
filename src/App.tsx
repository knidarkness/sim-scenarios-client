import { useState } from "react";
import { ActiveScenarioResponse } from "./types";

export default function App() {
  const [token, setToken] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [scenarios, setScenarios] = useState<ActiveScenarioResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchScenarios = async (token: string) => {
    try {
      setError(null);
      
      const url = new URL("https://api.simscenario.net/scenario/activeScenario");
      // const url = new URL("http://localhost:3000/scenario/activeScenario");
      url.searchParams.set("token", token);
      console.log("Fetching scenarios with token:", token);
      const response = await fetch(url.toString());
      if (response.status !== 200) {
        setError("Failed to fetch scenarios");
        return null;
      }
      const scenario = await response.json() as ActiveScenarioResponse;
      console.log("Scenarios:", scenario.activeScenario);
      setScenarios(scenario);
      return scenario;
    } catch (error) {
      console.error("Failed to fetch scenarios:", error);
      setError("Failed to fetch scenarios. Please check the console for details.");
      return null;
    }
  };

  const activateScenarios = async (token: string) => {
    const scenarios = await fetchScenarios(token);
    if (!scenarios) {
      console.error("No scenarios to activate");
      return;
    }
    await window.simconnect?.setScenarios(scenarios);
    setIsRunning(true);
  };

  const stopScenarios = () => {
    window.simconnect?.clearScenarios();
    setIsRunning(false);
  }

  return (
    <main className="app">
      <h1>Sim Scenarios Client</h1>
      <div className="token-input">
        <input type="text" disabled={isRunning} className="token-input-field" onChange={(e) => setToken(e.target.value)} value={token} />
        {
          isRunning ? (
            <button className="action-button stop-button" onClick={stopScenarios}>Stop</button>
          ) : (
            <button className="action-button activate-button" onClick={() => activateScenarios(token)}>Activate</button>
          )
        }
      </div>
      <div className="message-box">
        {
          error ? (
            <p className="error-message">{error}</p>
          ) : <p className="message-p">{isRunning ? `Scenarios are running. ${scenarios?.activeScenario?.scenarios?.filter(s => s.isActive).length || 0} events are scheduled.` : "Scenarios are stopped."}</p>
        }
      </div>
    </main>
  );
}
