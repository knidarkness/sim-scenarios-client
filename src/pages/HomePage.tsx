import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActiveScenarioData } from "../types";
import useClientAppStore from "../store";
import { SpoilersSection } from "../components/SpoilersSection";
import { fetchAvailableEvents, fetchActiveScenario, recordScenarioRun } from "../api";
import { useVersionCheck } from "../hooks/useVersionCheck";

export default function HomePage() {
    const navigate = useNavigate();
    const [token, setToken] = useState<string>("");

    const apiBackend = useClientAppStore((state) => state.backendApiAddress);
    const setAvailableEvents = useClientAppStore((state) => state.setAvailableEvents);

    useVersionCheck(apiBackend);

    const [scenarios, setScenarios] = useState<ActiveScenarioData | null>(null);

    const [scenarioState, setScenarioState] = useState<'not-fetched' | 'fetched' | 'activated' | 'fetch-failed'>('not-fetched');
    const [eventStatuses, setEventStatuses] = useState<Record<string, 'armed' | 'triggered'> | undefined>(undefined);

    useEffect(() => {
        const loadAvailableEvents = async () => {
            try {
                const events = await fetchAvailableEvents(apiBackend);
                setAvailableEvents(events);
                await window.simconnect?.setAvailableEvents(events);
                console.log("Available events loaded from API:", events.length, "aircraft");
            } catch (error) {
                console.error("Failed to fetch available events:", error);
            }
        };
        loadAvailableEvents();
    }, [apiBackend, setAvailableEvents]);

    useEffect(() => {
        if (scenarioState !== 'activated') {
            setEventStatuses(undefined);
            return;
        }
        const poll = async () => {
            const statuses = await window.simconnect?.getEventStatuses();
            if (statuses) setEventStatuses(statuses);
        };
        poll();
        const interval = setInterval(poll, 1000);
        return () => clearInterval(interval);
    }, [scenarioState]);

    const preFetchScenarios = async (token: string) => {
        try {
            const scenario = await fetchActiveScenario(apiBackend, token);
            console.log("Scenarios:", scenario);
            setScenarios(scenario);
            await window.simconnect?.setScenarios(scenario);
            setScenarioState('fetched');
        } catch (error) {
            console.error("Failed to fetch scenarios:", error);
            setScenarioState('fetch-failed');
        }
    };

    const activateScenarios = async () => {
        console.log("Activating scenarios");
        await window.simconnect?.setScenarios(scenarios);
        await window.simconnect?.activateScenarios();
        setScenarioState('activated');
        if (scenarios?._id && scenarios?.token) {
            recordScenarioRun(apiBackend, scenarios._id, scenarios.token)
                .catch((error) => console.error("Failed to record scenario run:", error));
        }
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
            <div className="token-input">
                <label className="token-input-label">Scenario code</label>
                <div className="token-input-wrapper">
                    <input
                        type="text"
                        className="token-input-field"
                        disabled={scenarioState === 'activated'}
                        onChange={(e) => setToken(e.target.value)}
                        value={token}
                        placeholder="Paste your scenario token here"
                    />
                    <button
                        className="token-paste-button"
                        disabled={scenarioState === 'activated'}
                        title="Paste from clipboard"
                        onClick={async () => {
                            const text = await navigator.clipboard.readText();
                            setToken(text);
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="2" width="10" height="4" rx="1" />
                            <path d="M5 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1" />
                            <rect x="9" y="2" width="10" height="4" rx="1" />
                            <path d="M9 12h6M9 16h6" />
                        </svg>
                    </button>
                </div>
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
            <div className="spoilers-area">
                {scenarios && (scenarioState === 'fetched' || scenarioState === 'activated') ? (
                    <SpoilersSection events={scenarios.events} eventStatuses={eventStatuses} />
                ) : (
                    <div className="spoilers-placeholder" />
                )}
            </div>
        </main>
    );
}
