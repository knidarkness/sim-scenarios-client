# Sim Scenarios Client

A Windows desktop application for Microsoft Flight Simulator (MSFS) that executes training scenarios created on [simscenario.net](https://simscenario.net). It monitors live simulator data and triggers aircraft system failures when defined flight conditions are met.

## How it works

1. The user creates a scenario on the web app and receives a **token**.
2. The client fetches the active scenario from the back-end API using that token.
3. The **EventScheduler** connects to MSFS via [SimConnect](https://docs.flightsimulator.com/html/Programming_Tools/SimConnect/SimConnect_SDK.htm) and polls flight data (altitude, airspeed, gear position, flap position) at a regular interval.
4. When a scenario condition is satisfied (e.g. *"altitude descending through 3000 ft"*), the corresponding failure event is injected into the simulator.

Aircraft-specific events (e.g. PMDG 737, PMDG 777, Black Square Baron/Bonanza) are dispatched through either a SimConnect SimEvents (for PMDG), or a **FSUIPC WebSocket** connection (HTML Events for Blacksquare addons), which allows sending vendor SDK commands that are not exposed via standard SimConnect.

## Architecture

```
Electron main process
├── EventScheduler       — connects to SimConnect, polls sim state, fires events on condition match
│   └── XXX_Handler      — per-aircraft adapter (PMDG, Black Square, …)
└── IPC bridge           — exposes SimConnect control to the renderer

Electron renderer (React + Vite)
├── HomePage             — token entry, scenario fetch & activation
├── SettingsPage         — configurable API and FSUIPC WebSocket addresses
└── UpdatePage           — prompts when a newer client version is available
```

## Supported aircraft

| Aircraft | Handler |
|---|---|
| PMDG 737 (all versions) | `pmdg737handler.ts` |
| PMDG 777 (all versions) | `pmdg777handler.ts` |
| Black Square Baron 58 | `blacksquareBaron58Handler.ts` |
| Black Square Bonanza | `blacksquareBonanzaHandler.ts` |
| Black Square Bonanza Turbine | `blacksquareBonanzaTurbineHandler.ts` |

## Prerequisites

- Microsoft Flight Simulator (2020 or 2024) running on the same machine
- [FSUIPC7](http://www.fsuipc.com/) with the WebSocket server enabled — required for Black Square aircraft

## Development

```bash
npm install
npm run dev          # Start renderer (Vite) + Electron concurrently
```

## Tech stack

- [Electron](https://www.electronjs.org/) — desktop shell
- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) — renderer UI
- [node-simconnect](https://github.com/EvenAR/node-simconnect) — SimConnect bindings for Node.js
- [Zustand](https://github.com/pmndrs/zustand) — client state
- [ws](https://github.com/websockets/ws) — FSUIPC WebSocket communication
