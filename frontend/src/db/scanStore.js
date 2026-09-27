import api from "../api/api";
import { db } from "./database";

export async function addPendingScan({
  qrToken,
  participantId,
  checkpointId,
  scannedAt,
  deviceId,
}) {
  const scanUuid = crypto.randomUUID();

  const scan = {
    scanUuid,
    qrToken,
    participantId,
    checkpointId,
    scannedAt,
    deviceId,
  };

  await db.pendingScans.add(scan);

  return scan;
}

export async function getPendingScans() {
  return await db.pendingScans.toArray();
}

export async function getPendingScanCount() {
  return await db.pendingScans.count();
}

export async function removePendingScan(localId) {
  await db.pendingScans.delete(localId);
}


/* NEW */
export async function syncPendingScans() {
  const pendingScans = await db.pendingScans.toArray();

  if (pendingScans.length === 0) {
    return {
      total: 0,
      accepted: 0,
      rejected: 0,
    };
  }

  const response = await api.post(
    "/scans/sync",
    pendingScans.map((scan) => ({
      scanUuid: scan.scanUuid,
      qrToken: scan.qrToken,
      participantId: scan.participantId,
      checkpointId: scan.checkpointId,
      scannedAt: scan.scannedAt,
      deviceId: scan.deviceId,
    }))
  );

  const results = response.data.results || [];

  for (const result of results) {
    if (result.accepted) {
      const scan = pendingScans.find(
        (item) => item.scanUuid === result.scanUuid
      );

      if (scan) {
        await db.pendingScans.delete(scan.localId);
      }
    }
  }

  return response.data;
}