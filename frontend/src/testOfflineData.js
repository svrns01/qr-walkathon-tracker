import { downloadParticipants } from "./db/participantStore";
import { downloadAssignedCheckpoints } from "./db/checkpointStore";

async function downloadOfflineData() {
  try {
    const participants = await downloadParticipants();
    console.log("Participants downloaded:", participants);

    const checkpoints = await downloadAssignedCheckpoints();
    console.log("Checkpoints downloaded:", checkpoints);
  } catch (error) {
    console.error("Offline data download failed:", error);
  }
}

downloadOfflineData();