import useCounterStore from "./store";

export default function App() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <main className="app">
      <h1>Electron + React + Zustand</h1>
      <p className="value">Count: {count}</p>
      <div className="actions">
        <button onClick={decrement}>-1</button>
        <button onClick={increment}>+1</button>
        <button onClick={reset}>Reset</button>
      </div>
    </main>
  );
}
