import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function VolunteerCheckpoint() {
  const navigate = useNavigate();

  const [checkpoints, setCheckpoints] = useState([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCheckpoints = async () => {
      try {
        setLoading(true);
        setError("");

        const user = JSON.parse(
          localStorage.getItem("user")
        );

        const userId = user?.userId;

        if (!userId) {
          setError(
            "User information is missing. Please log in again."
          );
          return;
        }

        const response = await api.get(
          `/users/${userId}/checkpoints`
        );

        setCheckpoints(response.data || []);
      } catch (err) {
        console.error(
          "Failed to load assigned checkpoints:",
          err
        );

        setError(
          err.response?.data ||
            "Failed to load assigned checkpoints."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCheckpoints();
  }, []);

  const handleContinue = () => {
    if (!selectedCheckpoint) {
      setError("Please select a checkpoint.");
      return;
    }

    navigate(
      `/scanner?checkpointId=${selectedCheckpoint}`
    );
  };

  if (loading) {
    return (
      <div>
        <h2>Select Checkpoint</h2>
        <p>Loading your assigned checkpoints...</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Select Checkpoint</h2>

      <p>
        Select one of your assigned checkpoints before
        starting the scanner.
      </p>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {checkpoints.length === 0 ? (
        <div className="dashboard-card">
          <h3>No checkpoints assigned</h3>
          <p>
            You currently do not have permission to scan
            at any checkpoint. Please contact an
            administrator.
          </p>
        </div>
      ) : (
        <div
          className="dashboard-card"
          style={{
            maxWidth: "700px",
            marginTop: "20px",
          }}
        >
          <div className="card-header">
            <div>
              <h3>Your Checkpoints</h3>

              <p>
                You have access to{" "}
                <strong>
                  {checkpoints.length}
                </strong>{" "}
                checkpoint
                {checkpoints.length !== 1
                  ? "s"
                  : ""}
                .
              </p>
            </div>
          </div>

          <select
            className="dashboard-select"
            value={selectedCheckpoint}
            onChange={(event) => {
              setSelectedCheckpoint(
                event.target.value
              );
              setError("");
            }}
          >
            <option value="">
              Select checkpoint
            </option>

            {checkpoints.map((checkpoint) => (
              <option
                key={checkpoint.checkpointId}
                value={checkpoint.checkpointId}
              >
                Day {checkpoint.dayNumber} •{" "}
                {checkpoint.sequenceNumber} —{" "}
                {checkpoint.checkpointName}
              </option>
            ))}
          </select>

          <button
            className="primary-button"
            onClick={handleContinue}
            style={{
              marginTop: "18px",
            }}
          >
            Continue to Scanner
          </button>
        </div>
      )}
    </div>
  );
}

export default VolunteerCheckpoint;