import { syncPendingScans } from "../db/scanStore";

let syncing = false;

export async function runSync() {
  if (syncing) {
    return;
  }

  if (!navigator.onLine) {
    console.log("Device is offline. Sync skipped.");
    return;
  }

  syncing = true;

  try {
    console.log("Starting pending scan sync...");

    const result = await syncPendingScans();

    console.log("Sync completed:", result);

    // Store sync information for the UI
    localStorage.setItem(
      "lastSyncTime",
      new Date().toISOString()
    );

    localStorage.setItem(
      "lastRejectedCount",
      String(result?.rejected ?? 0)
    );

    // Tell the UI that synchronization completed
    window.dispatchEvent(
  new CustomEvent("scanSyncCompleted", {
    detail: result,
  })
);
    return result;

  } catch (error) {
    console.error("Scan sync failed:", error);
    throw error;

  } finally {
    syncing = false;
  }
}