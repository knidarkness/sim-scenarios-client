import { create } from "zustand";

type ClientAppStore = {
  fsuipcWebSocketAddress: string;
  backendApiAddress: string;
  ignoredUpdateVersion: boolean;
  latestAppVersion: string | null;
  availableEvents: {
    aircraft: string;
    categories: {
        name: string;
        events: string[];
    }[];
}[];

  setFsuipcWebSocketAddress: (address: string) => void;
  setBackendApiAddress: (address: string) => void;
  setIgnoredUpdateVersion: (ignoreFlag: boolean) => void;
  setAvailableEvents: (events: ClientAppStore['availableEvents']) => void;
  setLatestAppVersion: (version: string | null) => void;
};

const useClientAppStore = create<ClientAppStore>((set) => ({
  availableEvents: [],
  fsuipcWebSocketAddress: "ws://localhost:2048/fsuipc/",
  latestAppVersion: null,
  backendApiAddress: import.meta.env.DEV
                ? import.meta.env.VITE_API_BASE_URL
                : "https://api.simscenario.net",
  ignoredUpdateVersion: false,
  setFsuipcWebSocketAddress: (address: string) => set({ fsuipcWebSocketAddress: address }),
  setBackendApiAddress: (address: string) => set({ backendApiAddress: address }),
  setIgnoredUpdateVersion: (ignoreFlag: boolean) => set({ ignoredUpdateVersion: ignoreFlag }),
  setAvailableEvents: (events) => set({ availableEvents: events }),
  setLatestAppVersion: (version: string | null) => set({ latestAppVersion: version }),
}));

export default useClientAppStore;
