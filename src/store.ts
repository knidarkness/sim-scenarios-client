import { create } from "zustand";

type ClientAppStore = {
  fsuipcWebSocketAddress: string;
  backendApiAddress: string;

  setFsuipcWebSocketAddress: (address: string) => void;
  setBackendApiAddress: (address: string) => void;
};

const useClientAppStore = create<ClientAppStore>((set) => ({
  fsuipcWebSocketAddress: "",
  backendApiAddress: "",
  setFsuipcWebSocketAddress: (address: string) => set({ fsuipcWebSocketAddress: address }),
  setBackendApiAddress: (address: string) => set({ backendApiAddress: address }),
}));

export default useClientAppStore;
