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

    return result;
  } catch (error) {
    console.error("Scan sync failed:", error);
    throw error;
  } finally {
    syncing = false;
  }
}