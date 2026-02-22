import { create } from "zustand";

type ClientAppStore = {
  fsuipcWebSocketAddress: string;
  backendApiAddress: string;
  ignoredUpdateVersion: boolean;

  setFsuipcWebSocketAddress: (address: string) => void;
  setBackendApiAddress: (address: string) => void;
  setIgnoredUpdateVersion: (ignoreFlag: boolean) => void;
};

const useClientAppStore = create<ClientAppStore>((set) => ({
  fsuipcWebSocketAddress: "ws://localhost:2048/fsuipc/",
  backendApiAddress: import.meta.env.DEV
                ? import.meta.env.VITE_API_BASE_URL
                : "https://api.simscenario.net",
  ignoredUpdateVersion: false,
  setFsuipcWebSocketAddress: (address: string) => set({ fsuipcWebSocketAddress: address }),
  setBackendApiAddress: (address: string) => set({ backendApiAddress: address }),
  setIgnoredUpdateVersion: (ignoreFlag: boolean) => set({ ignoredUpdateVersion: ignoreFlag }),
}));

export default useClientAppStore;
