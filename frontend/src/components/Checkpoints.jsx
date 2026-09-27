import { useEffect, useState } from "react";
import api from "../api/api";

function Checkpoints() {

  const [checkpoints, setCheckpoints] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingCheckpointId, setEditingCheckpointId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emptyForm = {
    dayNumber: "",
    sequenceNumber: "",
    name: "",
    scheduledTime: "",
    location: "",
    isActive: true
  };

  const [form, setForm] = useState(emptyForm);


  // ==========================================
  // LOAD CHECKPOINTS
  // ==========================================

  const loadCheckpoints = async () => {

    try {

      setLoading(true);

      const response =
        await api.get("/checkpoints");

      setCheckpoints(response.data);

      setError("");

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data ||
        "Failed to load checkpoints"
      );

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {
    loadCheckpoints();
  }, []);


  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (event) => {

    const {
      name,
      value,
      type,
      checked
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value
    }));
  };


  // ==========================================
  // OPEN CREATE FORM
  // ==========================================

  const openCreateForm = () => {

    setEditingCheckpointId(null);

    setForm(emptyForm);

    setShowForm(true);

    setError("");
    setSuccess("");
  };


  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const openEditForm = (checkpoint) => {

    setEditingCheckpointId(checkpoint.id);

    setForm({
      dayNumber:
        checkpoint.dayNumber ?? "",

      sequenceNumber:
        checkpoint.sequenceNumber ?? "",

      name:
        checkpoint.name ?? "",

      scheduledTime:
        checkpoint.scheduledTime ?? "",

      location:
        checkpoint.location ?? "",

      isActive:
        checkpoint.isActive ?? true
    });

    setShowForm(true);

    setError("");
    setSuccess("");
  };


  // ==========================================
  // CLOSE FORM
  // ==========================================

  const closeForm = () => {

    setShowForm(false);

    setEditingCheckpointId(null);

    setForm(emptyForm);

    setError("");
  };


  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    try {

      setSaving(true);

      setError("");
      setSuccess("");


      const request = {
        dayNumber:
          Number(form.dayNumber),

        sequenceNumber:
          Number(form.sequenceNumber),

        name:
          form.name,

        scheduledTime:
          form.scheduledTime,

        location:
          form.location,

        isActive:
          form.isActive
      };


      // ======================================
      // EDIT
      // ======================================

      if (editingCheckpointId !== null) {

        await api.put(
          `/checkpoints/${editingCheckpointId}`,
          request
        );

        setSuccess(
          "Checkpoint updated successfully."
        );

      }


      // ======================================
      // CREATE
      // ======================================

      else {

        await api.post(
          "/checkpoints",
          request
        );

        setSuccess(
          "Checkpoint created successfully."
        );
      }


      setForm(emptyForm);

      setShowForm(false);

      setEditingCheckpointId(null);

      await loadCheckpoints();

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data ||
        "Failed to save checkpoint"
      );

    } finally {

      setSaving(false);
    }
  };


  // ==========================================
  // ENABLE / DISABLE
  // ==========================================

  const toggleCheckpointStatus =
    async (checkpoint) => {

      const action =
        checkpoint.isActive
          ? "disable"
          : "enable";

      const confirmed =
        window.confirm(
          `Are you sure you want to ${action} checkpoint "${checkpoint.name}"?`
        );

      if (!confirmed) {
        return;
      }


      try {

        setError("");
        setSuccess("");

        await api.patch(
  `/checkpoints/${checkpoint.id}/status?active=${!checkpoint.isActive}`
);

        setSuccess(
          `Checkpoint ${action}d successfully.`
        );

        await loadCheckpoints();

      } catch (err) {

        console.error(err);

        setError(
          err.response?.data ||
          `Failed to ${action} checkpoint`
        );
      }
    };


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
          gap: "20px"
        }}
      >

        <div>

          <p
            style={{
              margin: "0 0 6px",
              fontSize: "11px",
              fontWeight: "800",
              letterSpacing: "1.5px",
              color: "#3b82f6"
            }}
          >
            EVENT CONTROL
          </p>

          <h2 style={{ margin: 0 }}>
            Checkpoint Management
          </h2>

          <p>
            Create, edit and manage walkathon checkpoints.
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
            : "+ Add Checkpoint"}
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
            color: "#86efac"
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
            color: "#fecaca"
          }}
        >
          {error}
        </div>

      )}


      {/* ======================================
          CREATE / EDIT FORM
          ====================================== */}

      {showForm && (

        <div
          className="dashboard-card"
          style={{
            marginBottom: "25px"
          }}
        >

          <div className="card-header">

            <div>

              <h3>
                {editingCheckpointId !== null
                  ? "Edit Checkpoint"
                  : "Add New Checkpoint"}
              </h3>

              <p>
                {editingCheckpointId !== null
                  ? "Update checkpoint information."
                  : "Add a checkpoint to the walkathon route."}
              </p>

            </div>

          </div>


          <form onSubmit={handleSubmit}>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "16px"
              }}
            >

              {/* DAY */}

              <div>

                <label>
                  Day Number
                </label>

                <input
                  type="number"
                  name="dayNumber"
                  value={form.dayNumber}
                  onChange={handleChange}
                  min="1"
                  required
                  style={{
                    width: "100%",
                    marginTop: "7px"
                  }}
                />

              </div>


              {/* SEQUENCE */}

              <div>

                <label>
                  Sequence Number
                </label>

                <input
                  type="number"
                  name="sequenceNumber"
                  value={form.sequenceNumber}
                  onChange={handleChange}
                  min="1"
                  required
                  style={{
                    width: "100%",
                    marginTop: "7px"
                  }}
                />

              </div>


              {/* NAME */}

              <div>

                <label>
                  Checkpoint Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Checkpoint name"
                  required
                  style={{
                    width: "100%",
                    marginTop: "7px"
                  }}
                />

              </div>


              {/* LOCATION */}

              <div>

                <label>
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Location"
                  required
                  style={{
                    width: "100%",
                    marginTop: "7px"
                  }}
                />

              </div>


              {/* SCHEDULED TIME */}

              <div>

                <label>
                  Scheduled Time
                </label>

                <input
                  type="time"
                  name="scheduledTime"
                  value={form.scheduledTime}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    marginTop: "7px"
                  }}
                />

              </div>


              {/* STATUS */}

              <div>

                <label>
                  Status
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "12px",
                    color: "#cbd5e1",
                    cursor: "pointer"
                  }}
                >

                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                  />

                  Active checkpoint

                </label>

              </div>

            </div>


            {/* WARNING */}

            {editingCheckpointId !== null && (

              <div
                style={{
                  marginTop: "18px",
                  padding: "12px 14px",
                  background: "#172033",
                  border: "1px solid #334155",
                  borderRadius: "9px",
                  color: "#94a3b8",
                  fontSize: "12px",
                  lineHeight: "1.5"
                }}
              >
                Changing the day or sequence number can affect
                route ordering and lap calculations. Historical
                checkpoint records retain their checkpoint ID.
              </div>

            )}


            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px"
              }}
            >

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingCheckpointId !== null
                  ? "Save Changes"
                  : "Create Checkpoint"}
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
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      )}


      {/* ======================================
          CHECKPOINT LIST
          ====================================== */}

      <div className="dashboard-card">

        <div className="card-header">

          <div>

            <h3>
              Route Checkpoints
            </h3>

            <p>
              All configured checkpoints in the walkathon.
            </p>

          </div>

          <span className="checkpoint-count">
            {checkpoints.length} Checkpoints
          </span>

        </div>


        {loading ? (

          <div className="dashboard-loading">
            Loading checkpoints...
          </div>

        ) : checkpoints.length === 0 ? (

          <p>
            No checkpoints found.
          </p>

        ) : (

          <div
            style={{
              overflowX: "auto"
            }}
          >

            <table>

              <thead>

                <tr>

                  <th>
                    Day
                  </th>

                  <th>
                    Sequence
                  </th>

                  <th>
                    Checkpoint
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Scheduled
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {checkpoints.map(
                  (checkpoint) => (

                    <tr key={checkpoint.id}>

                      <td>
                        {checkpoint.dayNumber}
                      </td>

                      <td>
                        {checkpoint.sequenceNumber}
                      </td>

                      <td>
                        {checkpoint.name}
                      </td>

                      <td>
                        {checkpoint.location}
                      </td>

                      <td>
                        {checkpoint.scheduledTime || "-"}
                      </td>

                      <td>
                        {checkpoint.isActive
                          ? "ACTIVE"
                          : "INACTIVE"}
                      </td>

                      <td>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px"
                          }}
                        >

                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(checkpoint)
                            }
                            style={{
                              padding: "7px 12px",
                              border:
                                "1px solid #334155",
                              borderRadius: "7px",
                              background:
                                "#172033",
                              color: "#93c5fd",
                              cursor: "pointer"
                            }}
                          >
                            Edit
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              toggleCheckpointStatus(
                                checkpoint
                              )
                            }
                            style={{
                              padding: "7px 12px",
                              border:
                                "1px solid #334155",
                              borderRadius: "7px",
                              background:
                                "#172033",
                              color:
                                checkpoint.isActive
                                  ? "#fca5a5"
                                  : "#86efac",
                              cursor: "pointer"
                            }}
                          >
                            {checkpoint.isActive
                              ? "Disable"
                              : "Enable"}
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Checkpoints;