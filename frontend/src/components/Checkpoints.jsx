import { useEffect, useState } from "react";
import api from "../api/api";

function Checkpoints() {
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/checkpoints")
      .then((response) => {
        setCheckpoints(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch checkpoints:", error);
        setError("Failed to load checkpoints. Please try again.");
        setLoading(false);
});
  }, []);

  if (loading) {
    return <p>Loading checkpoints...</p>;
  }
  if (error) {    
    return <p>{error}</p>;
    }

  return (
    <div>
      <h2>Checkpoints</h2>

      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Sequence</th>
            <th>Name</th>
            <th>Scheduled Time</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {checkpoints.map((checkpoint) => (
            <tr key={checkpoint.id}>
              <td>{checkpoint.dayNumber}</td>
              <td>{checkpoint.sequenceNumber}</td>
              <td>{checkpoint.name}</td>
              <td>{checkpoint.scheduledTime}</td>
              <td>{checkpoint.location}</td>
              <td>
                {checkpoint.isActive ? "ACTIVE" : "INACTIVE"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Checkpoints; 