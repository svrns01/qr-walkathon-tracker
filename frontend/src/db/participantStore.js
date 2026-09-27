import api from "../api/api";
import { db } from "./database";

export async function downloadParticipants() {
  const response = await api.get("/participants", {
    params: {
      page: 0,
      size: 1000,
    },
  });

  const participants = response.data.content || [];

  await db.participants.clear();
  await db.participants.bulkPut(participants);

  return participants.length;
}

export async function getLocalParticipants() {
  return await db.participants.toArray();
}

export async function getParticipantByQrToken(qrToken) {
  return await db.participants
    .where("qrToken")
    .equals(qrToken)
    .first();
}
