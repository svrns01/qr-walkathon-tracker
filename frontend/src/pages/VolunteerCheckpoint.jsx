import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function VolunteerCheckpoint() {
  const navigate = useNavigate();

  const [checkpoints, setCheckpoints] = useState([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCheckpoints = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        const checkpointIds = user?.assignedCheckpointIds || [];

        const response = await api.get("/checkpoints");

        const allowedCheckpoints = response.data.filter(
          (checkpoint) =>
            checkpointIds.includes(checkpoint.id)
        );

        setCheckpoints(allowedCheckpoints);
      } catch (err) {
        console.error(err);
        setError("Failed to load checkpoints.");
      }
    };

    loadCheckpoints();
  }, []);

  const handleContinue = () => {
    if (!selectedCheckpoint) {
      setError("Please select a checkpoint.");
      return;
    }

    navigate(`/scanner?checkpointId=${selectedCheckpoint}`);
  };

  return (
    <div>
      <h2>Select Checkpoint</h2>

      {error && <p>{error}</p>}

      {checkpoints.length === 0 ? (
        <p>No checkpoints assigned.</p>
      ) : (
        <>
          <select
            value={selectedCheckpoint}
            onChange={(event) => {
              setSelectedCheckpoint(event.target.value);
              setError("");
            }}
          >
            <option value="">
              Select checkpoint
            </option>

            {checkpoints.map((checkpoint) => (
              <option
                key={checkpoint.id}
                value={checkpoint.id}
              >
                Day {checkpoint.dayNumber} —{" "}
                {checkpoint.name}
              </option>
            ))}
          </select>

          <br />
          <br />

          <button onClick={handleContinue}>
            Continue to Scanner
          </button>
        </>
      )}
    </div>
  );
}

export default VolunteerCheckpoint;