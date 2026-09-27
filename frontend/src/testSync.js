import { syncPendingScans } from "./db/scanStore";

syncPendingScans()
  .then((result) => {
    console.log("SYNC RESULT:", result);
  })
  .catch((error) => {
    console.error("SYNC FAILED:", error);
  });