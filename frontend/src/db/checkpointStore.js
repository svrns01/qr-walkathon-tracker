import api from "../api/api";
import { db } from "./database";

export async function downloadAssignedCheckpoints() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId;

  if (!userId) {
    throw new Error("User information is missing. Please log in again.");
  }

  const response = await api.get(`/users/${userId}/checkpoints`);

  const checkpoints = response.data || [];

  await db.checkpoints.clear();
  await db.checkpoints.bulkPut(checkpoints);

  return checkpoints.length;
}

export async function getLocalCheckpoints() {
  return await db.checkpoints.toArray();
}