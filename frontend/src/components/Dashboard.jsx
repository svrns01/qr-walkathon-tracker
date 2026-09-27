import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

function Dashboard() {
  const [checkpoints, setCheckpoints] = useState([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState("");
  const [dashboard, setDashboard] = useState(null);

  const [participants, setParticipants] = useState([]);

  const [roleFilter, setRoleFilter] = useState("Yatrika");

  const [reachedSearch, setReachedSearch] = useState("");
  const [yetToReachSearch, setYetToReachSearch] = useState("");

  const [loadingCheckpoints, setLoadingCheckpoints] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // LOAD CHECKPOINTS
  // ==========================================

  useEffect(() => {
    const loadCheckpoints = async () => {
      try {
        const response = await api.get("/checkpoints");

        setCheckpoints(response.data);

        // Select first checkpoint automatically
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
  // LOAD PARTICIPANTS
  // ==========================================

  useEffect(() => {
    const loadParticipants = async () => {
      try {
        setLoadingParticipants(true);

        const response = await api.get("/participants", {
          params: {
            page: 0,
            size: 1000,
          },
        });

        setParticipants(
          response.data.content || []
        );
      } catch (err) {
        console.error(
          "Failed to load participants:",
          err
        );
      } finally {
        setLoadingParticipants(false);
      }
    };

    loadParticipants();
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
  // FIND PARTICIPANT BY ID
  // ==========================================

  const getParticipantById = (participantId) => {
    return participants.find(
      (participant) =>
        participant.id === participantId
    );
  };

  // ==========================================
  // ROLE-SPECIFIC ACTIVE PARTICIPANTS
  // ==========================================

  const roleActiveParticipants = useMemo(() => {
    return participants.filter(
      (participant) =>
        participant.role === roleFilter &&
        participant.status === "ACTIVE"
    );
  }, [participants, roleFilter]);

  const roleActiveIds = useMemo(() => {
    return new Set(
      roleActiveParticipants.map(
        (participant) => participant.id
      )
    );
  }, [roleActiveParticipants]);

  // ==========================================
  // ROLE-SPECIFIC REACHED PARTICIPANTS
  // ==========================================

  const roleReachedParticipants = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return (
      dashboard.reachedParticipants || []
    ).filter((participant) =>
      roleActiveIds.has(
        participant.participantId
      )
    );
  }, [dashboard, roleActiveIds]);

  // ==========================================
  // ROLE-SPECIFIC YET TO REACH PARTICIPANTS
  // ==========================================

  const roleYetToReachParticipants =
    useMemo(() => {
      if (!dashboard) {
        return [];
      }

      return (
        dashboard.yetToReachParticipants || []
      ).filter((participant) =>
        roleActiveIds.has(
          participant.participantId
        )
      );
    }, [dashboard, roleActiveIds]);

  // ==========================================
  // SEARCH REACHED
  // ==========================================

  const filteredReachedParticipants =
    useMemo(() => {
      const search =
        reachedSearch
          .trim()
          .toLowerCase();

      if (!search) {
        return roleReachedParticipants;
      }

      return roleReachedParticipants.filter(
        (participant) =>
          participant.participantName
            ?.toLowerCase()
            .includes(search) ||
          participant.participantCode
            ?.toLowerCase()
            .includes(search)
      );
    }, [
      roleReachedParticipants,
      reachedSearch,
    ]);

  // ==========================================
  // SEARCH YET TO REACH
  // ==========================================

  const filteredYetToReachParticipants =
    useMemo(() => {
      const search =
        yetToReachSearch
          .trim()
          .toLowerCase();

      if (!search) {
        return roleYetToReachParticipants;
      }

      return roleYetToReachParticipants.filter(
        (participant) =>
          participant.participantName
            ?.toLowerCase()
            .includes(search) ||
          participant.participantCode
            ?.toLowerCase()
            .includes(search)
      );
    }, [
      roleYetToReachParticipants,
      yetToReachSearch,
    ]);

  // ==========================================
  // ROLE-SPECIFIC COUNTS
  // ==========================================

  const roleActiveCount =
    roleActiveParticipants.length;

  const roleReachedCount =
    roleReachedParticipants.length;

  const roleYetToReachCount =
    roleYetToReachParticipants.length;

  const roleProgress =
    roleActiveCount > 0
      ? Math.round(
          (roleReachedCount /
            roleActiveCount) *
            100
        )
      : 0;

  // ==========================================
  // CHECKPOINT SELECTION
  // ==========================================

  const handleCheckpointChange = (event) => {
    setSelectedCheckpoint(
      event.target.value
    );

    // Clear searches when changing checkpoint
    setReachedSearch("");
    setYetToReachSearch("");
  };

  // ==========================================
  // ROLE SELECTION
  // ==========================================

  const handleRoleChange = (event) => {
    setRoleFilter(event.target.value);

    // Clear searches when changing role
    setReachedSearch("");
    setYetToReachSearch("");
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

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="dashboard-header">

        <div>

          <p className="dashboard-eyebrow">
            TIRFY 2026
          </p>

          <h2>
            Walkathon Operations
          </h2>

          <p className="dashboard-subtitle">
            Monitor participant progress at each
            checkpoint.
          </p>

        </div>

      </div>


      {/* ========================================
          DASHBOARD FILTERS
      ======================================== */}

      <div className="dashboard-card">

        <div className="card-header">

          <div>

            <h3>
              Dashboard Filters
            </h3>

            <p>
              Select the checkpoint and participant
              role to monitor.
            </p>

          </div>

        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 2fr) minmax(180px, 1fr)",
            gap: "14px",
          }}
        >

          {/* CHECKPOINT */}

          <div>

            <label
              style={{
                display: "block",
                marginBottom: "6px",
              }}
            >
              Checkpoint
            </label>

            <select
              value={selectedCheckpoint}
              onChange={
                handleCheckpointChange
              }
              className="dashboard-select"
              style={{
                width: "100%",
              }}
            >

              {checkpoints.map(
                (checkpoint) => (

                  <option
                    key={checkpoint.id}
                    value={checkpoint.id}
                  >
                    Day {checkpoint.dayNumber} •{" "}
                    {checkpoint.sequenceNumber} —{" "}
                    {checkpoint.name}
                  </option>

                )
              )}

            </select>

          </div>


          {/* ROLE */}

          <div>

            <label
              style={{
                display: "block",
                marginBottom: "6px",
              }}
            >
              Role
            </label>

            <select
              value={roleFilter}
              onChange={handleRoleChange}
              className="dashboard-select"
              style={{
                width: "100%",
              }}
            >

              <option value="Yatrika">
                Yatrika
              </option>

              <option value="Volunteer">
                Volunteer
              </option>

            </select>

          </div>

        </div>

      </div>


      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}


      {/* ========================================
          LOADING
      ======================================== */}

      {loadingDashboard && (
        <div className="dashboard-loading">
          Loading checkpoint data...
        </div>
      )}


      {/* ========================================
          DASHBOARD DATA
      ======================================== */}

      {!loadingDashboard && dashboard && (

        <>

          {/* ====================================
              SELECTED CHECKPOINT
          ==================================== */}

          <div className="selected-checkpoint">

            <p>
              CURRENT CHECKPOINT
            </p>

            <h3>
              {dashboard.checkpointName}
            </h3>

          </div>


          {/* ====================================
              STAT CARDS
          ==================================== */}

          <div className="stats-grid">

            {/* ACTIVE */}

            <div className="stat-card">

              <div className="stat-card-top">

                <span className="stat-label">
                  ACTIVE {roleFilter.toUpperCase()}
                </span>

                <span className="stat-icon">
                  A
                </span>

              </div>

              <h3>
                {roleActiveCount}
              </h3>

              <p>
                Active {roleFilter.toLowerCase()}
                participants
              </p>

            </div>


            {/* REACHED */}

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
                {roleReachedCount}
              </h3>

              <p>
                Reached this checkpoint
              </p>

            </div>


            {/* YET TO REACH */}

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
                {roleYetToReachCount}
              </h3>

              <p>
                Not reached yet
              </p>

            </div>


            {/* PROGRESS */}

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
                {roleProgress}%
              </h3>

              <p>
                Checkpoint completion
              </p>

            </div>

          </div>


          {/* ====================================
              PROGRESS BAR
          ==================================== */}

          <div className="dashboard-card">

            <div className="progress-section">

              <div className="progress-label">

                <span>
                  {roleFilter} checkpoint progress
                </span>

                <strong>
                  {roleProgress}%
                </strong>

              </div>


              <div className="progress-bar">

                <div
                  className="progress-fill"
                  style={{
                    width: `${roleProgress}%`,
                  }}
                />

              </div>

            </div>

          </div>


          {/* ====================================
              REACHED + YET TO REACH
          ==================================== */}

          <div className="dashboard-grid">

            {/* ==================================
                REACHED
            ================================== */}

            <div className="dashboard-card">

              <div className="card-header">

                <div>

                  <h3>
                    Reached
                  </h3>

                  <p>
                    {roleFilter} participants who
                    reached this checkpoint
                  </p>

                </div>

                <span className="checkpoint-count">
                  {roleReachedCount}
                </span>

              </div>


              {/* REACHED SEARCH */}

              <input
                type="text"
                placeholder="🔍 Search reached participants..."
                value={reachedSearch}
                onChange={(event) =>
                  setReachedSearch(
                    event.target.value
                  )
                }
                style={{
                  width: "100%",
                  minHeight: "42px",
                  padding: "0 12px",
                  marginBottom: "14px",
                  border:
                    "1px solid #334155",
                  borderRadius: "9px",
                  background: "#0f172a",
                  color: "#f8fafc",
                  boxSizing: "border-box",
                }}
              />


              {loadingParticipants ? (

                <p>
                  Loading participants...
                </p>

              ) : filteredReachedParticipants.length ===
                0 ? (

                <p>
                  {reachedSearch.trim()
                    ? "No matching participants found."
                    : `No ${roleFilter.toLowerCase()} participants have reached this checkpoint yet.`}
                </p>

              ) : (

                <div className="participant-list">

                  {filteredReachedParticipants.map(
                    (participant) => (

                      <div
                        className="participant-row"
                        key={
                          participant.participantId
                        }
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


            {/* ==================================
                YET TO REACH
            ================================== */}

            <div className="dashboard-card">

              <div className="card-header">

                <div>

                  <h3>
                    Yet to Reach
                  </h3>

                  <p>
                    Active {roleFilter.toLowerCase()}
                    participants still approaching
                  </p>

                </div>

                <span className="checkpoint-count">
                  {roleYetToReachCount}
                </span>

              </div>


              {/* YET TO REACH SEARCH */}

              <input
                type="text"
                placeholder="🔍 Search participants..."
                value={yetToReachSearch}
                onChange={(event) =>
                  setYetToReachSearch(
                    event.target.value
                  )
                }
                style={{
                  width: "100%",
                  minHeight: "42px",
                  padding: "0 12px",
                  marginBottom: "14px",
                  border:
                    "1px solid #334155",
                  borderRadius: "9px",
                  background: "#0f172a",
                  color: "#f8fafc",
                  boxSizing: "border-box",
                }}
              />


              {loadingParticipants ? (

                <p>
                  Loading participants...
                </p>

              ) : filteredYetToReachParticipants.length ===
                0 ? (

                <p>
                  {yetToReachSearch.trim()
                    ? "No matching participants found."
                    : `All active ${roleFilter.toLowerCase()} participants have reached this checkpoint.`}
                </p>

              ) : (

                <div className="participant-list">

                  {filteredYetToReachParticipants.map(
                    (participant) => (

                      <div
                        className="participant-row"
                        key={
                          participant.participantId
                        }
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


          {/* ====================================
              FASTEST LAPS
          ==================================== */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <h3>
                  Fastest Laps
                </h3>

                <p>
                  Time between the previous and
                  current checkpoint
                </p>

              </div>

              <span className="checkpoint-count">
                TOP {dashboard.fastestLaps.length}
              </span>

            </div>


            {dashboard.fastestLaps.length ===
            0 ? (

              <p>
                No valid lap times available yet.
              </p>

            ) : (

              <div className="participant-list">

                {dashboard.fastestLaps
                  .filter((lap) =>
                    roleActiveIds.has(
                      lap.participantId
                    )
                  )
                  .map(
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