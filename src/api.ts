import { ActiveScenarioData } from './types';

type AvailableEventsItem = {
    aircraft: string;
    simbriefId?: string;
    categories: { name: string; events: string[] }[];
};

export async function fetchAvailableEvents(apiBackend: string): Promise<AvailableEventsItem[]> {
    const response = await fetch(`${apiBackend}/scenario/availableEvents`);
    if (!response.ok) {
        throw new Error(`Failed to fetch available events: ${response.status}`);
    }
    return response.json();
}

export async function fetchAppVersion(apiBackend: string): Promise<string> {
    const response = await fetch(`${apiBackend}/appversion`);
    if (!response.ok) {
        throw new Error(`Failed to fetch app version: ${response.status}`);
    }
    const data = await response.json();
    return data.version as string;
}

export async function fetchActiveScenario(apiBackend: string, token: string): Promise<ActiveScenarioData> {
    const url = new URL(`${apiBackend}/scenario/activeScenario`);
    url.searchParams.set('token', token);
    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error(`Failed to fetch scenario: ${response.status}`);
    }
    return response.json();
}

export async function recordScenarioRun(apiBackend: string, scenarioId: string, token: string): Promise<void> {
    await fetch(`${apiBackend}/scenario/${scenarioId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
    });
}
