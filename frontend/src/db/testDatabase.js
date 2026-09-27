import { db } from "./database";

export async function testDatabase() {
  await db.participants.put({
    id: 999999,
    participantCode: "TEST-001",
    qrToken: "TEST-TOKEN",
    status: "ACTIVE",
  });

  const participant = await db.participants.get(999999);

  console.log("IndexedDB test participant:", participant);

  await db.participants.delete(999999);
}