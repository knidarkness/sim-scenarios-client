import { useEffect, useState } from "react";
import useCounterStore from "./store";

export default function App() {
  const { count, increment, decrement, reset } = useCounterStore();
  const [altitudeFeet, setAltitudeFeet] = useState<number | null>(null);

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
      </div>
    </main>
  );
}
