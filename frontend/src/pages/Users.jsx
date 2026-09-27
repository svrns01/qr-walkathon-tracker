import { useEffect, useState } from "react";
import api from "../api/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [showCheckpointAccess, setShowCheckpointAccess] = useState(false);
  const [accessUser, setAccessUser] = useState(null);
  const [selectedCheckpointIds, setSelectedCheckpointIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingCheckpoints, setLoadingCheckpoints] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingAccess, setSavingAccess] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emptyForm = {
    name: "",
    email: "",
    password: "",
    role: "VOLUNTEER",
    isActive: true,
  };

  const [form, setForm] = useState(emptyForm);

  // ==========================================
  // LOAD USERS
  // ==========================================

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users");

      setUsers(response.data);
      setError("");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ==========================================
  // OPEN CREATE FORM
  // ==========================================

  const openCreateForm = () => {
    setEditingUserId(null);
    setForm(emptyForm);

    setShowForm(true);
    setShowCheckpointAccess(false);

    setError("");
    setSuccess("");
  };

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const openEditForm = (user) => {
    setEditingUserId(user.id);

    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "VOLUNTEER",
      isActive: user.isActive,
    });

    setShowForm(true);
    setShowCheckpointAccess(false);

    setError("");
    setSuccess("");
  };

  // ==========================================
  // CLOSE FORM
  // ==========================================

  const closeForm = () => {
    setShowForm(false);
    setEditingUserId(null);
    setForm(emptyForm);
    setError("");
  };

  // ==========================================
  // LOAD ALL CHECKPOINTS
  // ==========================================

  const loadCheckpoints = async () => {
    try {
      setLoadingCheckpoints(true);

      const response = await api.get("/checkpoints");

      setCheckpoints(response.data || []);
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

  // ==========================================
  // OPEN CHECKPOINT ACCESS
  // ==========================================

  const openCheckpointAccess = async (user) => {
    try {
      setError("");
      setSuccess("");

      setAccessUser(user);
      setShowCheckpointAccess(true);
      setShowForm(false);

      await loadCheckpoints();

      const response = await api.get(
        `/users/${user.id}/checkpoints`
      );

      const assignedIds =
        (response.data || []).map(
          (checkpoint) => checkpoint.checkpointId
        );

      setSelectedCheckpointIds(assignedIds);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data ||
          "Failed to load checkpoint access"
      );
    }
  };

  // ==========================================
  // CLOSE CHECKPOINT ACCESS
  // ==========================================

  const closeCheckpointAccess = () => {
    setShowCheckpointAccess(false);
    setAccessUser(null);
    setSelectedCheckpointIds([]);
    setError("");
  };

  // ==========================================
  // CHECKPOINT SELECTION
  // ==========================================

  const toggleCheckpoint = (checkpointId) => {
    setSelectedCheckpointIds((previous) => {
      if (previous.includes(checkpointId)) {
        return previous.filter(
          (id) => id !== checkpointId
        );
      }

      return [
        ...previous,
        checkpointId,
      ];
    });
  };

  // ==========================================
  // SELECT ALL
  // ==========================================

  const selectAllCheckpoints = () => {
    setSelectedCheckpointIds(
      checkpoints.map(
        (checkpoint) => checkpoint.id
      )
    );
  };

  // ==========================================
  // CLEAR ALL
  // ==========================================

  const clearAllCheckpoints = () => {
    setSelectedCheckpointIds([]);
  };

  // ==========================================
  // SAVE CHECKPOINT ACCESS
  // ==========================================

  const saveCheckpointAccess = async () => {
    if (!accessUser) {
      return;
    }

    try {
      setSavingAccess(true);
      setError("");
      setSuccess("");

      await api.put(
        `/users/${accessUser.id}/checkpoints`,
        {
          checkpointIds:
            selectedCheckpointIds,
        }
      );

      setSuccess(
        `Checkpoint access updated for ${accessUser.name}.`
      );

      closeCheckpointAccess();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data ||
          "Failed to update checkpoint access"
      );
    } finally {
      setSavingAccess(false);
    }
  };

  // ==========================================
  // SUBMIT USER
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // ======================================
      // EDIT USER
      // ======================================

      if (editingUserId !== null) {
        const request = {
          name: form.name,
          email: form.email,
          role: form.role,
          isActive: form.isActive,
        };

        if (form.password.trim() !== "") {
          request.password = form.password;
        }

        await api.put(
          `/users/${editingUserId}`,
          request
        );

        setSuccess(
          "User updated successfully."
        );
      }

      // ======================================
      // CREATE USER
      // ======================================

      else {
        await api.post(
          "/users",
          {
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
          }
        );

        setSuccess(
          "User created successfully."
        );
      }

      setForm(emptyForm);
      setShowForm(false);
      setEditingUserId(null);

      await loadUsers();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data ||
          "Failed to save user"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // GROUP CHECKPOINTS BY DAY
  // ==========================================

  const checkpointsByDay =
    checkpoints.reduce(
      (groups, checkpoint) => {
        const day = checkpoint.dayNumber;

        if (!groups[day]) {
          groups[day] = [];
        }

        groups[day].push(checkpoint);

        return groups;
      },
      {}
    );

  // ==========================================
  // UI
  // ==========================================

  return (
    <div>

      {/* ======================================
          HEADER
          ====================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
          gap: "20px",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 6px",
              fontSize: "11px",
              fontWeight: "800",
              letterSpacing: "1.5px",
              color: "#3b82f6",
            }}
          >
            ROOT CONTROL
          </p>

          <h2 style={{ margin: 0 }}>
            User Management
          </h2>

          <p>
            Create and manage system users.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={
            showForm
              ? closeForm
              : openCreateForm
          }
        >
          {showForm
            ? "Cancel"
            : "+ Add User"}
        </button>
      </div>

      {/* ======================================
          SUCCESS
          ====================================== */}

      {success && (
        <div
          style={{
            marginBottom: "20px",
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

      {/* ======================================
          ERROR
          ====================================== */}

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 16px",
            background: "#3f1d1d",
            border: "1px solid #7f1d1d",
            borderRadius: "10px",
            color: "#fecaca",
          }}
        >
          {error}
        </div>
      )}

      {/* ======================================
          CREATE / EDIT USER FORM
          ====================================== */}

      {showForm && (
        <div
          className="dashboard-card"
          style={{
            marginBottom: "25px",
          }}
        >
          <div className="card-header">
            <div>
              <h3>
                {editingUserId !== null
                  ? "Edit User"
                  : "Create New User"}
              </h3>

              <p>
                {editingUserId !== null
                  ? "Update the selected user's details."
                  : "Add an administrator, volunteer or viewer."}
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

              {/* NAME */}

              <div>
                <label>Name</label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                  style={{
                    width: "100%",
                    marginTop: "7px",
                  }}
                />
              </div>

              {/* EMAIL */}

              <div>
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  required
                  style={{
                    width: "100%",
                    marginTop: "7px",
                  }}
                />
              </div>

              {/* PASSWORD */}

              <div>
                <label>Password</label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={
                    editingUserId !== null
                      ? "Leave blank to keep current password"
                      : "Password"
                  }
                  required={
                    editingUserId === null
                  }
                  minLength={6}
                  style={{
                    width: "100%",
                    marginTop: "7px",
                  }}
                />
              </div>

              {/* ROLE */}

              <div>
                <label>Role</label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    marginTop: "7px",
                  }}
                >
                  <option value="ADMIN">
                    ADMIN
                  </option>

                  <option value="VOLUNTEER">
                    VOLUNTEER
                  </option>

                  <option value="VIEWER">
                    VIEWER
                  </option>
                </select>
              </div>

              {/* ACTIVE STATUS */}

              {editingUserId !== null && (
                <div>
                  <label>
                    Account Status
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginTop: "12px",
                      color: "#cbd5e1",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                    />

                    Active account
                  </label>
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingUserId !== null
                  ? "Save Changes"
                  : "Create User"}
              </button>

              <button
                type="button"
                onClick={closeForm}
                style={{
                  padding: "0 18px",
                  minHeight: "44px",
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

      {/* ======================================
          CHECKPOINT ACCESS PANEL
          ====================================== */}

      {showCheckpointAccess && accessUser && (
        <div
          className="dashboard-card"
          style={{
            marginBottom: "25px",
          }}
        >

          <div
            className="card-header"
            style={{
              alignItems: "flex-start",
            }}
          >
            <div>
              <h3>
                Checkpoint Access
              </h3>

              <p>
                Select the checkpoints that{" "}
                <strong>
                  {accessUser.name}
                </strong>{" "}
                is allowed to scan.
              </p>
            </div>

            <span className="checkpoint-count">
              {selectedCheckpointIds.length} Selected
            </span>
          </div>

          {/* SELECT / CLEAR */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <button
              type="button"
              onClick={selectAllCheckpoints}
              style={{
                padding: "8px 14px",
                border: "1px solid #334155",
                borderRadius: "8px",
                background: "#172033",
                color: "#93c5fd",
                cursor: "pointer",
              }}
            >
              Select All
            </button>

            <button
              type="button"
              onClick={clearAllCheckpoints}
              style={{
                padding: "8px 14px",
                border: "1px solid #334155",
                borderRadius: "8px",
                background: "#172033",
                color: "#cbd5e1",
                cursor: "pointer",
              }}
            >
              Clear All
            </button>
          </div>

          {loadingCheckpoints ? (
            <div className="dashboard-loading">
              Loading checkpoints...
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "18px",
              }}
            >

              {Object.entries(
                checkpointsByDay
              ).map(
                ([day, dayCheckpoints]) => (
                  <div
                    key={day}
                    style={{
                      background: "#0d1525",
                      border: "1px solid #1f2937",
                      borderRadius: "12px",
                      padding: "16px",
                    }}
                  >

                    <h4
                      style={{
                        margin:
                          "0 0 14px",
                        color: "#f8fafc",
                        fontSize: "14px",
                      }}
                    >
                      Day {day}
                    </h4>

                    <div
                      style={{
                        display: "flex",
                        flexDirection:
                          "column",
                        gap: "10px",
                      }}
                    >

                      {dayCheckpoints.map(
                        (checkpoint) => (
                          <label
                            key={
                              checkpoint.id
                            }
                            style={{
                              display: "flex",
                              alignItems:
                                "flex-start",
                              gap: "10px",
                              padding:
                                "10px",
                              border:
                                "1px solid #1f2937",
                              borderRadius:
                                "8px",
                              background:
                                selectedCheckpointIds.includes(
                                  checkpoint.id
                                )
                                  ? "#172033"
                                  : "#111827",
                              cursor:
                                "pointer",
                            }}
                          >

                            <input
                              type="checkbox"
                              checked={selectedCheckpointIds.includes(
                                checkpoint.id
                              )}
                              onChange={() =>
                                toggleCheckpoint(
                                  checkpoint.id
                                )
                              }
                              style={{
                                marginTop:
                                  "3px",
                              }}
                            />

                            <div>
                              <strong
                                style={{
                                  display:
                                    "block",
                                  color:
                                    "#f8fafc",
                                  fontSize:
                                    "13px",
                                }}
                              >
                                {checkpoint.sequenceNumber}.{" "}
                                {
                                  checkpoint.name
                                }
                              </strong>

                              {checkpoint.location && (
                                <span
                                  style={{
                                    display:
                                      "block",
                                    marginTop:
                                      "4px",
                                    color:
                                      "#64748b",
                                    fontSize:
                                      "11px",
                                  }}
                                >
                                  {
                                    checkpoint.location
                                  }
                                </span>
                              )}
                            </div>

                          </label>
                        )
                      )}

                    </div>
                  </div>
                )
              )}

            </div>
          )}

          {/* SAVE / CANCEL */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "22px",
            }}
          >
            <button
              type="button"
              className="primary-button"
              onClick={
                saveCheckpointAccess
              }
              disabled={
                savingAccess ||
                loadingCheckpoints
              }
            >
              {savingAccess
                ? "Saving..."
                : "Save Checkpoint Access"}
            </button>

            <button
              type="button"
              onClick={
                closeCheckpointAccess
              }
              style={{
                padding: "0 18px",
                minHeight: "44px",
                border:
                  "1px solid #334155",
                borderRadius: "9px",
                background: "#172033",
                color: "#cbd5e1",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>

        </div>
      )}

      {/* ======================================
          USER LIST
          ====================================== */}

      <div className="dashboard-card">

        <div className="card-header">

          <div>
            <h3>
              System Users
            </h3>

            <p>
              Users currently registered in BEATS.
            </p>
          </div>

          <span className="checkpoint-count">
            {users.length} Users
          </span>

        </div>

        {loading ? (
          <div className="dashboard-loading">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <p>
            No users found.
          </p>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table>

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {users.map((user) => (
                  <tr key={user.id}>

                    <td>
                      {user.name}
                    </td>

                    <td>
                      {user.email}
                    </td>

                    <td>
                      {user.role}
                    </td>

                    <td>
                      {user.isActive
                        ? "ACTIVE"
                        : "INACTIVE"}
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap:
                            "wrap",
                        }}
                      >

                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              user
                            )
                          }
                          style={{
                            padding:
                              "7px 12px",
                            border:
                              "1px solid #334155",
                            borderRadius:
                              "7px",
                            background:
                              "#172033",
                            color:
                              "#93c5fd",
                            cursor:
                              "pointer",
                          }}
                        >
                          Edit
                        </button>

                        {/* CHECKPOINT ACCESS */}

                        {user.role ===
                          "VOLUNTEER" && (
                          <button
                            type="button"
                            onClick={() =>
                              openCheckpointAccess(
                                user
                              )
                            }
                            style={{
                              padding:
                                "7px 12px",
                              border:
                                "1px solid #334155",
                              borderRadius:
                                "7px",
                              background:
                                "#172033",
                              color:
                                "#86efac",
                              cursor:
                                "pointer",
                            }}
                          >
                            Checkpoints
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>
          </div>
        )}

      </div>

    </div>
  );
}

export default Users;