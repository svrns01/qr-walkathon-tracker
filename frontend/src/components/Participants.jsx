import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

function Participants() {
  const [participants, setParticipants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);

  // Search / filter / sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("ID");
  const [sortDirection, setSortDirection] = useState("ASC");

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);

  // Add / Edit form
  const [formData, setFormData] = useState({
    participantCode: "",
    name: "",
    age: "",
    gender: "",
    role: "Yatrika",
    qrToken: "",
  });

  // --------------------------------------------------
  // Load all participants
  // --------------------------------------------------

  const loadParticipants = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/participants", {
        params: {
          page: 0,
          size: 1000,
        },
      });

      setParticipants(response.data.content || []);
    } catch (err) {
      console.error("Failed to fetch participants:", err);
      setError("Failed to load participants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, []);

  // --------------------------------------------------
  // Add participant
  // --------------------------------------------------

  const openAddForm = () => {
    setEditingParticipant(null);

    setFormData({
      participantCode: "",
      name: "",
      age: "",
      gender: "",
      role: "Yatrika",
      qrToken: "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // --------------------------------------------------
  // Edit participant
  // --------------------------------------------------

  const openEditForm = (participant) => {
    setEditingParticipant(participant);

    setFormData({
      participantCode: participant.participantCode || "",
      name: participant.name || "",
      age: participant.age || "",
      gender: participant.gender || "",
      role: participant.role || "Yatrika",
      qrToken: participant.qrToken || "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingParticipant(null);
  };

  // --------------------------------------------------
  // Form change
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // Save participant
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setSuccess("");

      const requestData = {
        participantCode: formData.participantCode,
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        role: formData.role,
        qrToken: formData.qrToken,
      };

      if (editingParticipant) {
        await api.put(
          `/participants/${editingParticipant.id}`,
          requestData
        );

        setSuccess("Participant updated successfully.");
      } else {
        await api.post("/participants", requestData);

        setSuccess("Participant added successfully.");
      }

      closeForm();

      await loadParticipants();
    } catch (err) {
      console.error("Failed to save participant:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to save participant."
      );
    }
  };

  // --------------------------------------------------
  // Status change
  // --------------------------------------------------

  const handleStatusChange = async (participant, newStatus) => {
    let actionMessage = "";

    if (newStatus === "ACTIVE") {
      actionMessage = "start this participant";
    } else if (newStatus === "DROPPED_OUT") {
      actionMessage = "mark this participant as dropped out";
    }

    if (!window.confirm(`Are you sure you want to ${actionMessage}?`)) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.patch(
        `/participants/${participant.id}/status`,
        {
          status: newStatus,
        }
      );

      if (newStatus === "ACTIVE") {
        setSuccess("Participant is now ACTIVE.");
      } else if (newStatus === "DROPPED_OUT") {
        setSuccess("Participant marked as dropped out.");
      }

      await loadParticipants();
    } catch (err) {
      console.error(
        "Failed to update participant status:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to update participant status."
      );
    }
  };

  // --------------------------------------------------
  // Search + Filter + Sort
  // --------------------------------------------------

  const processedParticipants = useMemo(() => {
    let result = [...participants];

    // Search
    const search = searchTerm.trim().toLowerCase();

    if (search) {
      result = result.filter((participant) => {
        const code =
          participant.participantCode?.toLowerCase() || "";

        const name =
          participant.name?.toLowerCase() || "";

        const qrToken =
          participant.qrToken?.toLowerCase() || "";

        return (
          code.includes(search) ||
          name.includes(search) ||
          qrToken.includes(search)
        );
      });
    }

    // Role filter
    if (roleFilter !== "ALL") {
      result = result.filter(
        (participant) =>
          participant.role === roleFilter
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter(
        (participant) =>
          participant.status === statusFilter
      );
    }

    // Sorting
    result.sort((a, b) => {
      let valueA = "";
      let valueB = "";

      if (sortBy === "ID") {
        valueA = a.participantCode || "";
        valueB = b.participantCode || "";
      } else if (sortBy === "NAME") {
        valueA = a.name || "";
        valueB = b.name || "";
      } else if (sortBy === "ROLE") {
        valueA = a.role || "";
        valueB = b.role || "";
      } else if (sortBy === "STATUS") {
        valueA = a.status || "";
        valueB = b.status || "";
      }

      valueA = String(valueA).toLowerCase();
      valueB = String(valueB).toLowerCase();

      const comparison = valueA.localeCompare(valueB);

      return sortDirection === "ASC"
        ? comparison
        : -comparison;
    });

    return result;
  }, [
    participants,
    searchTerm,
    roleFilter,
    statusFilter,
    sortBy,
    sortDirection,
  ]);

  // --------------------------------------------------
  // Reset page when filters change
  // --------------------------------------------------

  useEffect(() => {
    setPage(0);
  }, [
    searchTerm,
    roleFilter,
    statusFilter,
    sortBy,
    sortDirection,
  ]);

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const totalElements = processedParticipants.length;

  const totalPages =
    Math.ceil(totalElements / pageSize);

  const paginatedParticipants =
    processedParticipants.slice(
      page * pageSize,
      (page + 1) * pageSize
    );

  const goToPage = (newPage) => {
    if (
      newPage < 0 ||
      newPage >= totalPages
    ) {
      return;
    }

    setPage(newPage);
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div>
        <h2>Participants</h2>
        <p>Loading participants...</p>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div>

      {/* Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "20px",
        }}
      >
        <div>
          <h2>Participants</h2>

          <p>
            Manage walkathon participants and
            their status.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddForm}
        >
          + Add Participant
        </button>
      </div>

      {/* Messages */}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginTop: "18px",
            marginBottom: "18px",
            padding: "14px 16px",
            background: "#10251b",
            border: "1px solid #1f3b2d",
            borderRadius: "10px",
            color: "#86efac",
          }}
        >
          {success}
        </div>
      )}

      {/* Add / Edit Form */}

      {showForm && (
        <div
          className="dashboard-card"
          style={{
            marginBottom: "20px",
          }}
        >
          <div className="card-header">
            <div>
              <h3>
                {editingParticipant
                  ? "Edit Participant"
                  : "Add Participant"}
              </h3>

              <p>
                {editingParticipant
                  ? "Update participant information."
                  : "Add a participant to the walkathon."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "16px",
              }}
            >

              {/* Participant Code */}

              <div>
                <label>Participant Code</label>

                <input
                  name="participantCode"
                  value={
                    formData.participantCode
                  }
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    marginTop: "6px",
                  }}
                />
              </div>

              {/* Name */}

              <div>
                <label>Name</label>

                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    marginTop: "6px",
                  }}
                />
              </div>

              {/* Age */}

              <div>
                <label>Age</label>

                <input
                  name="age"
                  type="number"
                  min="1"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    marginTop: "6px",
                  }}
                />
              </div>

              {/* Gender */}

              <div>
                <label>Gender</label>

                <input
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    marginTop: "6px",
                  }}
                />
              </div>

              {/* Role */}

              <div>
                <label>Role</label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    marginTop: "6px",
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

              {/* QR Token */}

              <div>
                <label>QR Token</label>

                <input
                  name="qrToken"
                  value={formData.qrToken}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    marginTop: "6px",
                  }}
                />
              </div>

            </div>

            {/* Buttons */}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                className="primary-button"
                type="submit"
              >
                {editingParticipant
                  ? "Update Participant"
                  : "Add Participant"}
              </button>

              <button
                type="button"
                onClick={closeForm}
                style={{
                  minHeight: "44px",
                  padding: "0 20px",
                  border: "1px solid #334155",
                  borderRadius: "9px",
                  background: "#172033",
                  color: "#cbd5e1",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Search / Filters */}

      <div
        className="dashboard-card"
        style={{
          marginBottom: "20px",
        }}
      >
        <div className="card-header">
          <div>
            <h3>Find Participants</h3>

            <p>
              Search, filter and sort participants.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(240px, 2fr) repeat(3, minmax(150px, 1fr))",
            gap: "12px",
          }}
        >

          {/* Search */}

          <input
            type="text"
            placeholder="🔍 Search name, ID or QR token..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            style={{
              width: "100%",
              minHeight: "44px",
              padding: "0 14px",
              border: "1px solid #334155",
              borderRadius: "9px",
              background: "#0f172a",
              color: "#f8fafc",
              boxSizing: "border-box",
            }}
          />

          {/* Role Filter */}

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
            style={{
              minHeight: "44px",
              padding: "0 12px",
              border: "1px solid #334155",
              borderRadius: "9px",
              background: "#0f172a",
              color: "#f8fafc",
            }}
          >
            <option value="ALL">
              All Roles
            </option>

            <option value="Yatrika">
              Yatrika
            </option>

            <option value="Volunteer">
              Volunteer
            </option>
          </select>

          {/* Status Filter */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            style={{
              minHeight: "44px",
              padding: "0 12px",
              border: "1px solid #334155",
              borderRadius: "9px",
              background: "#0f172a",
              color: "#f8fafc",
            }}
          >
            <option value="ALL">
              All Statuses
            </option>

            <option value="NOT_STARTED">
              Not Started
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="DROPPED_OUT">
              Dropped Out
            </option>

            <option value="COMPLETED">
              Completed
            </option>
          </select>

          {/* Sort */}

          <select
            value={`${sortBy}_${sortDirection}`}
            onChange={(event) => {
              const [field, direction] =
                event.target.value.split("_");

              setSortBy(field);
              setSortDirection(direction);
            }}
            style={{
              minHeight: "44px",
              padding: "0 12px",
              border: "1px solid #334155",
              borderRadius: "9px",
              background: "#0f172a",
              color: "#f8fafc",
            }}
          >
            <option value="ID_ASC">
              ID ↑
            </option>

            <option value="ID_DESC">
              ID ↓
            </option>

            <option value="NAME_ASC">
              Name A → Z
            </option>

            <option value="NAME_DESC">
              Name Z → A
            </option>

            <option value="ROLE_ASC">
              Role A → Z
            </option>

            <option value="ROLE_DESC">
              Role Z → A
            </option>

            <option value="STATUS_ASC">
              Status A → Z
            </option>

            <option value="STATUS_DESC">
              Status Z → A
            </option>
          </select>

        </div>

        {/* Result count */}

        <p
          style={{
            marginTop: "14px",
            marginBottom: 0,
            color: "#94a3b8",
          }}
        >
          Showing{" "}
          {totalElements === 0
            ? 0
            : page * pageSize + 1}
          -
          {Math.min(
            (page + 1) * pageSize,
            totalElements
          )}{" "}
          of {totalElements} matching participants
        </p>
      </div>

      {/* Participant Table */}

      <div className="dashboard-card">

        <div className="card-header">
          <div>
            <h3>Participant List</h3>

            <p>
              {totalElements} participants found
            </p>
          </div>
        </div>

        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table>

            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {paginatedParticipants.map(
                (participant) => (
                  <tr key={participant.id}>

                    <td>
                      {participant.participantCode}
                    </td>

                    <td>
                      {participant.name}
                    </td>

                    <td>
                      {participant.age}
                    </td>

                    <td>
                      {participant.gender}
                    </td>

                    <td>
                      {participant.role || "-"}
                    </td>

                    <td>
                      {participant.status}
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >

                        {/* Edit */}

                        <button
                          onClick={() =>
                            openEditForm(
                              participant
                            )
                          }
                          style={{
                            padding: "7px 12px",
                            border:
                              "1px solid #334155",
                            borderRadius: "7px",
                            background: "#172033",
                            color: "#cbd5e1",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>

                        {/* NOT_STARTED -> ACTIVE */}

                        {participant.status ===
                          "NOT_STARTED" && (
                          <button
                            onClick={() =>
                              handleStatusChange(
                                participant,
                                "ACTIVE"
                              )
                            }
                            style={{
                              padding: "7px 12px",
                              border:
                                "1px solid #1f3b2d",
                              borderRadius: "7px",
                              background: "#10251b",
                              color: "#86efac",
                              cursor: "pointer",
                            }}
                          >
                            Start
                          </button>
                        )}

                        {/* ACTIVE -> DROPPED_OUT */}

                        {participant.status ===
                          "ACTIVE" && (
                          <button
                            onClick={() =>
                              handleStatusChange(
                                participant,
                                "DROPPED_OUT"
                              )
                            }
                            style={{
                              padding: "7px 12px",
                              border:
                                "1px solid #7f1d1d",
                              borderRadius: "7px",
                              background: "#3f1d1d",
                              color: "#fecaca",
                              cursor: "pointer",
                            }}
                          >
                            Drop Out
                          </button>
                        )}

                        {/* DROPPED_OUT -> ACTIVE */}

                        {participant.status ===
                          "DROPPED_OUT" && (
                          <button
                            onClick={() =>
                              handleStatusChange(
                                participant,
                                "ACTIVE"
                              )
                            }
                            style={{
                              padding: "7px 12px",
                              border:
                                "1px solid #1f3b2d",
                              borderRadius: "7px",
                              background: "#10251b",
                              color: "#86efac",
                              cursor: "pointer",
                            }}
                          >
                            Reactivate
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                )
              )}

              {paginatedParticipants.length ===
                0 && (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    No participants found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>
        </div>

        {/* Pagination */}

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              marginTop: "24px",
              flexWrap: "wrap",
            }}
          >

            <button
              onClick={() =>
                goToPage(page - 1)
              }
              disabled={page === 0}
              style={{
                padding: "9px 14px",
                border: "1px solid #334155",
                borderRadius: "8px",
                background:
                  page === 0
                    ? "#0f172a"
                    : "#172033",
                color:
                  page === 0
                    ? "#475569"
                    : "#cbd5e1",
                cursor:
                  page === 0
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              ← Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index
            ).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() =>
                  goToPage(pageNumber)
                }
                style={{
                  minWidth: "38px",
                  padding: "9px 11px",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  background:
                    pageNumber === page
                      ? "#2563eb"
                      : "#172033",
                  color: "#f8fafc",
                  cursor: "pointer",
                }}
              >
                {pageNumber + 1}
              </button>
            ))}

            <button
              onClick={() =>
                goToPage(page + 1)
              }
              disabled={
                page >= totalPages - 1
              }
              style={{
                padding: "9px 14px",
                border: "1px solid #334155",
                borderRadius: "8px",
                background:
                  page >= totalPages - 1
                    ? "#0f172a"
                    : "#172033",
                color:
                  page >= totalPages - 1
                    ? "#475569"
                    : "#cbd5e1",
                cursor:
                  page >= totalPages - 1
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              Next →
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

export default Participants;