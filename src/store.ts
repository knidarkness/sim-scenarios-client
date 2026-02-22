import { create } from "zustand";

type ClientAppStore = {
  fsuipcWebSocketAddress: string;
  backendApiAddress: string;

  setFsuipcWebSocketAddress: (address: string) => void;
  setBackendApiAddress: (address: string) => void;
};

const useClientAppStore = create<ClientAppStore>((set) => ({
  fsuipcWebSocketAddress: "ws://localhost:2048/fsuipc/",
  backendApiAddress: import.meta.env.DEV
                ? import.meta.env.VITE_API_BASE_URL
                : "https://api.simscenario.net",
  setFsuipcWebSocketAddress: (address: string) => set({ fsuipcWebSocketAddress: address }),
  setBackendApiAddress: (address: string) => set({ backendApiAddress: address }),
}));

export default useClientAppStore;
