import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function VolunteerCheckpoint() {
  const navigate = useNavigate();

  const [checkpoints, setCheckpoints] = useState([]);
  const [selectedCheckpoint, setSelectedCheckpoint] =
    useState("");
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
        const role = user?.role;

        if (!userId || !role) {
          setError(
            "User information is missing. Please log in again."
          );
          return;
        }

        let checkpointList = [];

        // ==========================================
        // ROOT / ADMIN
        // ==========================================
        //
        // ROOT and ADMIN have access to ALL checkpoints.
        //
        // We fetch the current checkpoint list directly
        // so newly created checkpoints automatically appear.
        //
        if (
          role === "ROOT" ||
          role === "ADMIN"
        ) {
          const response = await api.get(
            "/checkpoints"
          );

          checkpointList =
            response.data || [];
        }

        // ==========================================
        // VOLUNTEER
        // ==========================================
        //
        // Volunteers only receive checkpoints explicitly
        // assigned to them through user_checkpoint_access.
        //
        else if (role === "VOLUNTEER") {
          const response = await api.get(
            `/users/${userId}/checkpoints`
          );

          checkpointList =
            response.data || [];
        }

        // ==========================================
        // OTHER ROLES
        // ==========================================

        else {
          setError(
            "You do not have permission to access the scanner."
          );
          return;
        }

        setCheckpoints(checkpointList);

      } catch (err) {
        console.error(
          "Failed to load checkpoints:",
          err
        );

        setError(
          err.response?.data ||
            "Failed to load checkpoints."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCheckpoints();
  }, []);

  // ==========================================
  // CONTINUE TO SCANNER
  // ==========================================

  const handleContinue = () => {
    if (!selectedCheckpoint) {
      setError(
        "Please select a checkpoint."
      );
      return;
    }

    navigate(
      `/scanner?checkpointId=${selectedCheckpoint}`
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div>
        <h2>Select Checkpoint</h2>

        <p>
          Loading your checkpoints...
        </p>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const isAdminOrRoot =
    user?.role === "ROOT" ||
    user?.role === "ADMIN";

  return (
    <div>
      <h2>Select Checkpoint</h2>

      <p>
        {isAdminOrRoot
          ? "Select any checkpoint before starting the scanner."
          : "Select one of your assigned checkpoints before starting the scanner."}
      </p>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {checkpoints.length === 0 ? (
        <div className="dashboard-card">

          <h3>
            {isAdminOrRoot
              ? "No checkpoints available"
              : "No checkpoints assigned"}
          </h3>

          <p>
            {isAdminOrRoot
              ? "There are currently no active checkpoints available."
              : "You currently do not have permission to scan at any checkpoint. Please contact an administrator."}
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

              <h3>
                {isAdminOrRoot
                  ? "All Checkpoints"
                  : "Your Checkpoints"}
              </h3>

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

            {checkpoints.map(
              (checkpoint) => {

                /*
                 * ROOT / ADMIN / GET /checkpoints
                 * returns the checkpoint ID as `id`.
                 *
                 * VOLUNTEER /users/{id}/checkpoints
                 * returns it as `checkpointId`.
                 *
                 * Support both response formats.
                 */

                const checkpointId =
                  checkpoint.id ??
                  checkpoint.checkpointId;

                const checkpointName =
                  checkpoint.name ??
                  checkpoint.checkpointName;

                return (
                  <option
                    key={checkpointId}
                    value={checkpointId}
                  >
                    Day{" "}
                    {checkpoint.dayNumber}{" "}
                    •{" "}
                    {checkpoint.sequenceNumber}{" "}
                    —{" "}
                    {checkpointName}
                  </option>
                );
              }
            )}

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