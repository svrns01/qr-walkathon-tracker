import { useEffect, useState } from "react";
import api from "../api/api";

function Dashboard() {
  const [checkpoints, setCheckpoints] = useState([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState("");
  const [dashboard, setDashboard] = useState(null);

  const [loadingCheckpoints, setLoadingCheckpoints] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD CHECKPOINTS
  // ==========================================

  useEffect(() => {
    const loadCheckpoints = async () => {
      try {
        const response = await api.get("/checkpoints");

        setCheckpoints(response.data);

        // Select the first checkpoint automatically
        if (response.data.length > 0) {
          setSelectedCheckpoint(
            String(response.data[0].id)
          );
        }

        setError("");
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data ||
          "Failed to load checkpoints"
        );
      } finally {
        setLoadingCheckpoints(false);
      }
    };

    loadCheckpoints();
  }, []);


  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  useEffect(() => {
    if (!selectedCheckpoint) {
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoadingDashboard(true);
        setError("");

        const response = await api.get(
          `/dashboard/checkpoints/${selectedCheckpoint}`
        );

        setDashboard(response.data);

      } catch (err) {
        console.error(err);

        setDashboard(null);

        setError(
          err.response?.data ||
          "Failed to load dashboard"
        );
      } finally {
        setLoadingDashboard(false);
      }
    };

    loadDashboard();

  }, [selectedCheckpoint]);


  // ==========================================
  // CHECKPOINT SELECTION
  // ==========================================

  const handleCheckpointChange = (event) => {
    setSelectedCheckpoint(event.target.value);
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loadingCheckpoints) {
    return (
      <div className="dashboard">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="dashboard">

      {/* HEADER */}

      <div className="dashboard-header">

        <div>

          <p className="dashboard-eyebrow">
            TIRFY 2026
          </p>

          <h2>
            Walkathon Operations
          </h2>

          <p className="dashboard-subtitle">
            Monitor participant progress at each checkpoint.
          </p>

        </div>

      </div>


      {/* CHECKPOINT SELECTOR */}

      <div className="dashboard-card">

        <div className="card-header">

          <div>

            <h3>
              Select Checkpoint
            </h3>

            <p>
              Choose a checkpoint to view live participant status.
            </p>

          </div>

        </div>


        <select
          value={selectedCheckpoint}
          onChange={handleCheckpointChange}
          className="dashboard-select"
        >

          {checkpoints.map((checkpoint) => (

            <option
              key={checkpoint.id}
              value={checkpoint.id}
            >

              Day {checkpoint.dayNumber} •
              {checkpoint.sequenceNumber} —
              {checkpoint.name}

            </option>

          ))}

        </select>

      </div>


      {/* ERROR */}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}


      {/* LOADING */}

      {loadingDashboard && (
        <div className="dashboard-loading">
          Loading checkpoint data...
        </div>
      )}


      {/* DASHBOARD DATA */}

      {!loadingDashboard && dashboard && (

        <>

          {/* SELECTED CHECKPOINT */}

          <div className="selected-checkpoint">

            <p>
              CURRENT CHECKPOINT
            </p>

            <h3>
              {dashboard.checkpointName}
            </h3>

          </div>


          {/* STAT CARDS */}

          <div className="stats-grid">

            <div className="stat-card">

              <div className="stat-card-top">

                <span className="stat-label">
                  ACTIVE
                </span>

                <span className="stat-icon">
                  A
                </span>

              </div>

              <h3>
                {dashboard.totalActive}
              </h3>

              <p>
                Active participants
              </p>

            </div>


            <div className="stat-card">

              <div className="stat-card-top">

                <span className="stat-label">
                  REACHED
                </span>

                <span className="stat-icon">
                  ✓
                </span>

              </div>

              <h3>
                {dashboard.reached}
              </h3>

              <p>
                Reached this checkpoint
              </p>

            </div>


            <div className="stat-card">

              <div className="stat-card-top">

                <span className="stat-label">
                  YET TO REACH
                </span>

                <span className="stat-icon">
                  →
                </span>

              </div>

              <h3>
                {dashboard.yetToReach}
              </h3>

              <p>
                Not reached yet
              </p>

            </div>


            <div className="stat-card">

              <div className="stat-card-top">

                <span className="stat-label">
                  PROGRESS
                </span>

                <span className="stat-icon">
                  %
                </span>

              </div>

              <h3>
                {dashboard.totalActive > 0
                  ? Math.round(
                      (dashboard.reached /
                        dashboard.totalActive) *
                        100
                    )
                  : 0}
                %
              </h3>

              <p>
                Checkpoint completion
              </p>

            </div>

          </div>


          {/* PROGRESS BAR */}

          <div className="dashboard-card">

            <div className="progress-section">

              <div className="progress-label">

                <span>
                  Checkpoint progress
                </span>

                <strong>
                  {dashboard.totalActive > 0
                    ? Math.round(
                        (dashboard.reached /
                          dashboard.totalActive) *
                          100
                      )
                    : 0}
                  %
                </strong>

              </div>


              <div className="progress-bar">

                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      dashboard.totalActive > 0
                        ? (
                            dashboard.reached /
                            dashboard.totalActive
                          ) * 100
                        : 0
                    }%`
                  }}
                />

              </div>

            </div>

          </div>


          {/* PARTICIPANT TABLES */}

          <div className="dashboard-grid">

            {/* REACHED */}

            <div className="dashboard-card">

              <div className="card-header">

                <div>

                  <h3>
                    Reached
                  </h3>

                  <p>
                    Participants who reached this checkpoint
                  </p>

                </div>

                <span className="checkpoint-count">
                  {dashboard.reached}
                </span>

              </div>


              {dashboard.reachedParticipants.length === 0 ? (

                <p>
                  No participants have reached this checkpoint yet.
                </p>

              ) : (

                <div className="participant-list">

                  {dashboard.reachedParticipants.map(
                    (participant) => (

                      <div
                        className="participant-row"
                        key={participant.participantId}
                      >

                        <div>

                          <strong>
                            {participant.participantName}
                          </strong>

                          <span>
                            {participant.participantCode}
                          </span>

                        </div>

                        <div className="scan-time">

                          {new Date(
                            participant.scannedAt
                          ).toLocaleTimeString()}

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>


            {/* YET TO REACH */}

            <div className="dashboard-card">

              <div className="card-header">

                <div>

                  <h3>
                    Yet to Reach
                  </h3>

                  <p>
                    Active participants still approaching
                  </p>

                </div>

                <span className="checkpoint-count">
                  {dashboard.yetToReach}
                </span>

              </div>


              {dashboard.yetToReachParticipants.length === 0 ? (

                <p>
                  All active participants have reached this checkpoint.
                </p>

              ) : (

                <div className="participant-list">

                  {dashboard.yetToReachParticipants.map(
                    (participant) => (

                      <div
                        className="participant-row"
                        key={participant.participantId}
                      >

                        <div>

                          <strong>
                            {participant.participantName}
                          </strong>

                          <span>
                            {participant.participantCode}
                          </span>

                        </div>

                        <div>
                          ACTIVE
                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          </div>


          {/* FASTEST LAPS */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <h3>
                  Fastest Laps
                </h3>

                <p>
                  Time between the previous and current checkpoint
                </p>

              </div>

              <span className="checkpoint-count">
                TOP {dashboard.fastestLaps.length}
              </span>

            </div>


            {dashboard.fastestLaps.length === 0 ? (

              <p>
                No valid lap times available yet.
              </p>

            ) : (

              <div className="participant-list">

                {dashboard.fastestLaps.map(
                  (lap, index) => (

                    <div
                      className="participant-row"
                      key={lap.participantId}
                    >

                      <div>

                        <strong>
                          #{index + 1}{" "}
                          {lap.participantName}
                        </strong>

                        <span>
                          {lap.participantCode}
                        </span>

                      </div>


                      <strong>

                        {Math.floor(
                          lap.lapSeconds / 60
                        )}
                        m{" "}

                        {lap.lapSeconds % 60}
                        s

                      </strong>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </>

      )}

    </div>
  );
}

export default Dashboard;