import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActiveScenarioResponse } from "../types";
import useClientAppStore from "../store";

export default function HomePage() {
    const navigate = useNavigate();
    const [token, setToken] = useState<string>("");

    const apiBackend = useClientAppStore((state) => state.backendApiAddress);

    const [scenarios, setScenarios] = useState<ActiveScenarioResponse | null>(null);

    const [scenarioState, setScenarioState] = useState<'not-fetched' | 'fetched' | 'activated' | 'fetch-failed'>('not-fetched');

    useEffect(() => {
        const checkVersion = async () => {
            const currentAppVersion = await window.simconnect?.getAppVersion();
            try {
                const latestAppVersionResponse = await fetch(`${apiBackend}/appversion`);
                const latestAppVersionData = await latestAppVersionResponse.json();
                const latestAppVersion = latestAppVersionData.version;
                if (currentAppVersion && latestAppVersion && currentAppVersion !== latestAppVersion) {
                    navigate("/update");
                }
            } catch (error) {
                console.error("Failed to check app version:", error);
            }

        };
        checkVersion();
    }, [apiBackend, navigate]);

    const fetchScenarios = async (token: string) => {
        try {
            const url = new URL(`${apiBackend}/scenario/activeScenario`);
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
            <div className="token-input">
                <label className="token-input-label">Please paste your scenario code below</label>
                <input
                    type="text"
                    className="token-input-field"
                    disabled={scenarioState === 'activated'}
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
                <button className="action-button settings-button" disabled={scenarioState === 'activated'} onClick={() => navigate("/settings")}>Settings</button>
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
