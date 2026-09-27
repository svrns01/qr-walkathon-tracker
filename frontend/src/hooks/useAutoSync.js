import { useEffect } from "react";
import { runSync } from "../services/scanService";

export function useAutoSync() {
  useEffect(() => {

    // Try once when the application starts
    if (navigator.onLine) {
      runSync().catch(() => {});
    }

    // Try when internet connection returns
    const handleOnline = () => {
      console.log("Internet connection restored.");
      runSync().catch(() => {});
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };

  }, []);
}