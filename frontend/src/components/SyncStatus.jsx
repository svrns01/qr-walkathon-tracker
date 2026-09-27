import { useEffect, useState } from "react";

function SyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncMessage("");
    };

    const handleSyncCompleted = (event) => {
      const result = event.detail;

      if (result.accepted > 0) {
        setSyncMessage("✓ Offline scan updated successfully");
      } else if (result.rejected > 0) {
        setSyncMessage("⚠ Offline scan could not be updated");
      }

      setTimeout(() => {
        setSyncMessage("");
      }, 5000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    window.addEventListener(
      "scanSyncCompleted",
      handleSyncCompleted
    );

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      window.removeEventListener(
        "scanSyncCompleted",
        handleSyncCompleted
      );
    };
  }, []);

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "12px 16px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <strong>
        {isOnline ? "🟢 Online" : "🔴 Offline"}
      </strong>

      {syncMessage && (
        <div style={{ marginTop: "8px" }}>
          {syncMessage}
        </div>
      )}

      {!isOnline && (
        <div style={{ marginTop: "8px" }}>
          Scan will be updated when connection returns.
        </div>
      )}
    </div>
  );
}

export default SyncStatus;