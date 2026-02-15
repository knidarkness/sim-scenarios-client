/// <reference types="vite/client" />

interface Window {
	simconnect: {
		getCurrentAltitude: () => Promise<number | null>;
		setLogoLightOn: () => Promise<{ ok: true }>;
		onAltitudeUpdate: (callback: (altitudeFeet: number) => void) => () => void;
	};
}
