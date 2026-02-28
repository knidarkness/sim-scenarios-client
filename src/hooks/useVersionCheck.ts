import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAppVersion } from "../api";
import useClientAppStore from "../store";

export function useVersionCheck(apiBackend: string) {
    const navigate = useNavigate();
    const ignoredUpdateVersion = useClientAppStore((state) => state.ignoredUpdateVersion);
    const setIgnoredUpdateVersion = useClientAppStore((state) => state.setIgnoredUpdateVersion);
    const setLatestAppVersion = useClientAppStore((state) => state.setLatestAppVersion);

    useEffect(() => {
        if (ignoredUpdateVersion) return;
        const checkVersion = async () => {
            const currentAppVersion = await window.simconnect?.getAppVersion();
            try {
                const latestAppVersion = await fetchAppVersion(apiBackend);
                const currentVersionParts = currentAppVersion?.split(".").map((part) => parseInt(part)) || [0, 0, 0];
                const latestVersionParts = latestAppVersion?.split(".").map((part) => parseInt(part)) || [0, 0, 0];
                
                setLatestAppVersion(latestAppVersion);
                for (let i = 0; i < 3; i++) {
                    if (latestVersionParts[i] > currentVersionParts[i]) {
                        navigate("/update", { state: { latestAppVersion } });
                        return;
                    }
                }
            } catch (error) {
                console.error("Failed to check app version:", error);
            }
        };
        checkVersion();
    }, [apiBackend, ignoredUpdateVersion, navigate, setIgnoredUpdateVersion, setLatestAppVersion]);
}
