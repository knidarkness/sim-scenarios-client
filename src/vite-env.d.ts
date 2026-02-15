/// <reference types="vite/client" />

interface Window {
	simconnect: {
		getCurrentAltitude: () => Promise<number | null>;
		onAltitudeUpdate: (callback: (altitudeFeet: number) => void) => () => void;
	};
}
