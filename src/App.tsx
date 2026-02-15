import { useEffect, useState } from "react";
import useCounterStore from "./store";

export default function App() {
  const { count, increment, decrement, reset } = useCounterStore();
  const [altitudeFeet, setAltitudeFeet] = useState<number | null>(null);
  const [logoLightStatus, setLogoLightStatus] = useState<string>("");

  useEffect(() => {
    let unsubscribe = () => {};

    const connectRendererToSim = async () => {
      if (!window.simconnect) {
        return;
      }

      const initialAltitude = await window.simconnect.getCurrentAltitude();
      setAltitudeFeet(initialAltitude);

      unsubscribe = window.simconnect.onAltitudeUpdate((nextAltitude) => {
        setAltitudeFeet(nextAltitude);
      });
    };

    connectRendererToSim();

    return () => {
      unsubscribe();
    };
  }, []);

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
      <h1>Electron + React + Zustand</h1>
      <p className="value">
        Player altitude: {altitudeFeet === null ? "Waiting for data..." : `${altitudeFeet.toFixed(2)} ft`}
      </p>
      <p className="value">Count: {count}</p>
      <div className="actions">
        <button onClick={decrement}>-1</button>
        <button onClick={increment}>+1</button>
        <button onClick={reset}>Reset</button>
        <button onClick={handleLogoLightOn}>logo light on</button>
      </div>
      {logoLightStatus ? <p className="value">{logoLightStatus}</p> : null}
    </main>
  );
}
