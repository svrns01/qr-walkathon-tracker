import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

function Dashboard() {
  const [checkpoints, setCheckpoints] = useState([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState("");
  const [dashboard, setDashboard] = useState(null);

  const [loadingCheckpoints, setLoadingCheckpoints] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // REACHED FILTER / SEARCH / SORT
  // ==========================================

  const [reachedRoleFilter, setReachedRoleFilter] = useState("Yatrika");
  const [reachedSearch, setReachedSearch] = useState("");
  const [reachedSort, setReachedSort] = useState("NAME_ASC");

  // ==========================================
  // YET TO REACH FILTER / SEARCH / SORT
  // ==========================================

  const [yetToReachRoleFilter, setYetToReachRoleFilter] =
    useState("Yatrika");

  const [yetToReachSearch, setYetToReachSearch] = useState("");
  const [yetToReachSort, setYetToReachSort] =
    useState("NAME_ASC");

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
  // FILTER / SEARCH / SORT HELPERS
  // ==========================================

  const matchesRole = (participant, roleFilter) => {
    if (roleFilter === "All") {
      return true;
    }

    return (
      String(participant.role || "").toLowerCase() ===
      roleFilter.toLowerCase()
    );
  };

  const matchesSearch = (participant, searchTerm) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return true;
    }

    const name =
      String(participant.participantName || "").toLowerCase();

    const code =
      String(participant.participantCode || "").toLowerCase();

    return (
      name.includes(search) ||
      code.includes(search)
    );
  };

  const sortParticipants = (participants, sortOption) => {
    const sorted = [...participants];

    sorted.sort((a, b) => {
      switch (sortOption) {

        case "NAME_ASC":
          return String(a.participantName || "")
            .localeCompare(
              String(b.participantName || "")
            );

        case "NAME_DESC":
          return String(b.participantName || "")
            .localeCompare(
              String(a.participantName || "")
            );

        case "ID_ASC":
          return String(a.participantCode || "")
            .localeCompare(
              String(b.participantCode || ""),
              undefined,
              { numeric: true }
            );

        case "ID_DESC":
          return String(b.participantCode || "")
            .localeCompare(
              String(a.participantCode || ""),
              undefined,
              { numeric: true }
            );

        case "TIME_EARLIEST":
          if (!a.scannedAt) return 1;
          if (!b.scannedAt) return -1;

          return (
            new Date(a.scannedAt) -
            new Date(b.scannedAt)
          );

        case "TIME_LATEST":
          if (!a.scannedAt) return 1;
          if (!b.scannedAt) return -1;

          return (
            new Date(b.scannedAt) -
            new Date(a.scannedAt)
          );

        default:
          return 0;
      }
    });

    return sorted;
  };

  // ==========================================
  // PROCESSED REACHED PARTICIPANTS
  // ==========================================

  const processedReachedParticipants = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    const filtered =
      dashboard.reachedParticipants.filter(
        (participant) =>
          matchesRole(
            participant,
            reachedRoleFilter
          ) &&
          matchesSearch(
            participant,
            reachedSearch
          )
      );

    return sortParticipants(
      filtered,
      reachedSort
    );
  }, [
    dashboard,
    reachedRoleFilter,
    reachedSearch,
    reachedSort
  ]);

  // ==========================================
  // PROCESSED YET TO REACH PARTICIPANTS
  // ==========================================

  const processedYetToReachParticipants = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    const filtered =
      dashboard.yetToReachParticipants.filter(
        (participant) =>
          matchesRole(
            participant,
            yetToReachRoleFilter
          ) &&
          matchesSearch(
            participant,
            yetToReachSearch
          )
      );

    return sortParticipants(
      filtered,
      yetToReachSort
    );
  }, [
    dashboard,
    yetToReachRoleFilter,
    yetToReachSearch,
    yetToReachSort
  ]);

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


              {/* REACHED FILTERS */}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "16px",
                  flexWrap: "wrap"
                }}
              >

                <select
                  value={reachedRoleFilter}
                  onChange={(event) =>
                    setReachedRoleFilter(
                      event.target.value
                    )
                  }
                  className="dashboard-select"
                  style={{
                    flex: "1",
                    minWidth: "120px"
                  }}
                >
                  <option value="Yatrika">
                    Yatrika
                  </option>

                  <option value="Volunteer">
                    Volunteer
                  </option>

                  <option value="All">
                    All
                  </option>
                </select>


                <input
                  type="text"
                  value={reachedSearch}
                  onChange={(event) =>
                    setReachedSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search name / ID..."
                  style={{
                    flex: "2",
                    minWidth: "180px",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px"
                  }}
                />


                <select
                  value={reachedSort}
                  onChange={(event) =>
                    setReachedSort(
                      event.target.value
                    )
                  }
                  className="dashboard-select"
                  style={{
                    flex: "1",
                    minWidth: "160px"
                  }}
                >

                  <option value="NAME_ASC">
                    Name A → Z
                  </option>

                  <option value="NAME_DESC">
                    Name Z → A
                  </option>

                  <option value="ID_ASC">
                    ID Ascending
                  </option>

                  <option value="ID_DESC">
                    ID Descending
                  </option>

                  <option value="TIME_EARLIEST">
                    Scan Time Earliest
                  </option>

                  <option value="TIME_LATEST">
                    Scan Time Latest
                  </option>

                </select>

              </div>


              {processedReachedParticipants.length === 0 ? (

                <p>
                  No participants match the selected filters.
                </p>

              ) : (

                <div className="participant-list">

                  {processedReachedParticipants.map(
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
                          {new Date(participant.scannedAt.endsWith("Z")
                            ? participant.scannedAt
                            : `${participant.scannedAt}Z`
                          ).toLocaleTimeString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
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


              {/* YET TO REACH FILTERS */}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "16px",
                  flexWrap: "wrap"
                }}
              >

                <select
                  value={yetToReachRoleFilter}
                  onChange={(event) =>
                    setYetToReachRoleFilter(
                      event.target.value
                    )
                  }
                  className="dashboard-select"
                  style={{
                    flex: "1",
                    minWidth: "120px"
                  }}
                >
                  <option value="Yatrika">
                    Yatrika
                  </option>

                  <option value="Volunteer">
                    Volunteer
                  </option>

                  <option value="All">
                    All
                  </option>
                </select>


                <input
                  type="text"
                  value={yetToReachSearch}
                  onChange={(event) =>
                    setYetToReachSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search name / ID..."
                  style={{
                    flex: "2",
                    minWidth: "180px",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px"
                  }}
                />


                <select
                  value={yetToReachSort}
                  onChange={(event) =>
                    setYetToReachSort(
                      event.target.value
                    )
                  }
                  className="dashboard-select"
                  style={{
                    flex: "1",
                    minWidth: "160px"
                  }}
                >

                  <option value="NAME_ASC">
                    Name A → Z
                  </option>

                  <option value="NAME_DESC">
                    Name Z → A
                  </option>

                  <option value="ID_ASC">
                    ID Ascending
                  </option>

                  <option value="ID_DESC">
                    ID Descending
                  </option>

                  <option value="TIME_EARLIEST">
                    Scan Time Earliest
                  </option>

                  <option value="TIME_LATEST">
                    Scan Time Latest
                  </option>

                </select>

              </div>


              {processedYetToReachParticipants.length === 0 ? (

                <p>
                  No participants match the selected filters.
                </p>

              ) : (

                <div className="participant-list">

                  {processedYetToReachParticipants.map(
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