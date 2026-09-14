import { useEffect, useState } from "react";
import api from "../api/api";

function Participants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/participants")
    .then((response) => {
        setParticipants(response.data.content);
        setLoading(false);
      })
    .catch((error) => {
        console.error("Failed to fetch participants:", error);
        setError("Failed to load participants. Please try again.");
        setLoading(false);
    });
  }, []);

  if (error) {
  return <p>{error}</p>;
    }

  if (loading) {
    return <p>Loading participants...</p>;
  }

  return (
    <div>
      <h2>Participants</h2>

      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {participants.map((participant) => (
            <tr key={participant.id}>
              <td>{participant.participantCode}</td>
              <td>{participant.name}</td>
              <td>{participant.age}</td>
              <td>{participant.gender}</td>
              <td>{participant.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Participants;