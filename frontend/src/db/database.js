import Dexie from "dexie";

export const db = new Dexie("beatsWalkathonDB");

db.version(2).stores({
  participants: "id, participantCode, qrToken, status",
  checkpoints: "checkpointId, dayNumber, sequenceNumber",
  pendingScans: "++localId, scanUuid, participantId, checkpointId, scannedAt",
});