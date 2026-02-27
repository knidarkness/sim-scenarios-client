import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActiveScenarioData } from "../types";
import useClientAppStore from "../store";

export default function HomePage() {
    const navigate = useNavigate();
    const [token, setToken] = useState<string>("");

    const apiBackend = useClientAppStore((state) => state.backendApiAddress);
    const ignoredUpdateVersion = useClientAppStore((state) => state.ignoredUpdateVersion);
    const setIgnoredUpdateVersion = useClientAppStore((state) => state.setIgnoredUpdateVersion);
    const setAvailableEvents = useClientAppStore((state) => state.setAvailableEvents);
    const setLatestAppVersion = useClientAppStore((state) => state.setLatestAppVersion);

    const [scenarios, setScenarios] = useState<ActiveScenarioData | null>(null);

    const [scenarioState, setScenarioState] = useState<'not-fetched' | 'fetched' | 'activated' | 'fetch-failed'>('not-fetched');

    useEffect(() => {
        const fetchAvailableEvents = async () => {
            try {
                const response = await fetch(`${apiBackend}/scenario/availableEvents`);
                if (!response.ok) {
                    console.error("Failed to fetch available events:", response.status);
                    return;
                }
                const events = await response.json();
                setAvailableEvents(events);
                await window.simconnect?.setAvailableEvents(events);
                console.log("Available events loaded from API:", events.length, "aircraft");
            } catch (error) {
                console.error("Failed to fetch available events:", error);
            }
        };
        fetchAvailableEvents();
    }, [apiBackend, setAvailableEvents]);

    useEffect(() => {
        const checkVersion = async () => {
            if (ignoredUpdateVersion) {
                return;
            }
            const currentAppVersion = await window.simconnect?.getAppVersion();
            try {
                const latestAppVersionResponse = await fetch(`${apiBackend}/appversion`);
                const latestAppVersionData = await latestAppVersionResponse.json();
                const latestAppVersion: string = latestAppVersionData.version;
                const patchVersionLatest = parseInt(latestAppVersion.split(".").pop() || "0");
                const patchVersionCurrent = parseInt(currentAppVersion?.split(".").pop() || "0");

                setLatestAppVersion(latestAppVersion);

                if (patchVersionLatest > patchVersionCurrent) {
                    navigate("/update", { state: { latestAppVersion } });
                }
            } catch (error) {
                console.error("Failed to check app version:", error);
            }

        };
        checkVersion();
    }, [apiBackend, ignoredUpdateVersion, navigate, setIgnoredUpdateVersion, setLatestAppVersion]);

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
            const scenario = await response.json() as ActiveScenarioData;
            console.log("Scenarios:", scenario);
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
                return `Scenarios are ready. ${scenarios?.events?.filter((s) => s.isActive).length || 0} events can be scheduled for ${scenarios?.aircraft || "unknown aircraft"}.`;
            case 'activated':
                return `Scenarios are running. ${scenarios?.events?.filter((s) => s.isActive).length || 0} events are scheduled for ${scenarios?.aircraft || "unknown aircraft"}.`;
            case 'fetch-failed':
                return "Failed to fetch scenarios. Please check the token and try again.";
            default:
                return "";
        }
    };

    const getMessageBoxClass = () => {
        switch (scenarioState) {
            case 'fetch-failed': return "message-box message-box--error";
            case 'fetched': return "message-box message-box--ready";
            case 'activated': return "message-box message-box--active";
            default: return "message-box";
        }
    };

    return (
        <main className="app">
            <div className="app-header">
                <p className="app-title">Sim Scenarios</p>
            </div>
            <div className="token-input">
                <label className="token-input-label">Scenario code</label>
                <input
                    type="text"
                    className="token-input-field"
                    disabled={scenarioState === 'activated'}
                    onChange={(e) => setToken(e.target.value)}
                    value={token}
                    placeholder="Paste your scenario token here"
                />
            </div>
            <div className={getMessageBoxClass()}>
                <p className="message-p">{getMessage()}</p>
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
