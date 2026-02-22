import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActiveScenarioResponse } from "../types";

export default function HomePage() {
    const navigate = useNavigate();
    const [token, setToken] = useState<string>("");
    const [scenarios, setScenarios] = useState<ActiveScenarioResponse | null>(null);

    const [scenarioState, setScenarioState] = useState<'not-fetched' | 'fetched' | 'activated' | 'fetch-failed'>('not-fetched');

    const fetchScenarios = async (token: string) => {
        try {
            const apiBase = import.meta.env.DEV
                ? import.meta.env.VITE_API_BASE_URL
                : "https://api.simscenario.net";
            const url = new URL(`${apiBase}/scenario/activeScenario`);
            url.searchParams.set("token", token);
            console.log("Fetching scenarios with token:", token);
            const response = await fetch(url.toString());
            if (response.status !== 200) {
                setScenarioState('fetch-failed');
                return null;
            }
            const scenario = await response.json() as ActiveScenarioResponse;
            console.log("Scenarios:", scenario.activeScenario);
            setScenarios(scenario);
            return scenario;
        } catch (error) {
            console.error("Failed to fetch scenarios:", error);
            setScenarioState('fetch-failed');
            return null;
        }
    };

    const activateScenarios = async () => {
        console.log("Activating scenarios");
        await window.simconnect?.setScenarios(scenarios);
        await window.simconnect?.activateScenarios();
        setScenarioState('activated');
    };

    const preFetchScenarios = async (token: string) => {
        const scenarios = await fetchScenarios(token);
        if (!scenarios) {
            return;
        }
        await window.simconnect?.setScenarios(scenarios);
        setScenarioState('fetched');
    };

    const stopScenarios = () => {
        window.simconnect?.clearScenarios();
        setScenarioState('fetched');
        // setScenarios(null);
    };

    const getMessage = () => {
        switch (scenarioState) {
            case 'not-fetched':
                return "Please fetch scenario to start";
            case 'fetched':
                return `Scenarios are ready. ${scenarios?.activeScenario?.scenarios?.filter((s) => s.isActive).length || 0} events can be scheduled.`;
            case 'activated':
                return `Scenarios are running. ${scenarios?.activeScenario?.scenarios?.filter((s) => s.isActive).length || 0} events are scheduled.`;
            case 'fetch-failed':
                return "Failed to fetch scenarios. Please check the token and try again.";
            default:
                return "";
        }
    }

    return (
        <main className="app">
            <div className="main-header">
                <h1>Sim Scenarios Client</h1>
            </div>
            <div className="token-input">
                <input
                    type="text"
                    disabled={scenarioState === 'activated'}
                    className="token-input-field"
                    onChange={(e) => setToken(e.target.value)}
                    value={token}
                />

            </div>
            <div className="message-box">
                <p className="message-p">
                    {getMessage()}
                </p>
            </div>
            <div className="action-buttons-container">
                <button className="action-button settings-button" onClick={() => navigate("/settings")}>Settings</button>
                {scenarioState === 'activated' ? (
                    <button className="action-button stop-button" onClick={stopScenarios}>Stop</button>
                ) : (
                    <>
                        <button className="action-button activate-button" disabled={scenarioState !== 'fetched'} onClick={() => activateScenarios()}>Activate</button>
                        <button className="action-button prefetch-button" onClick={() => preFetchScenarios(token)}>Fetch</button>
                    </>
                )}
            </div>
        </main>
    );
}
