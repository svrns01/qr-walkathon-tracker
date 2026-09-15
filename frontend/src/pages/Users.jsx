import { useEffect, useState } from "react";
import api from "../api/api";


function Users() {

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {

    const loadUsers = async () => {

      try {
        const response = await api.get("/users");

        setUsers(response.data);
        setError("");

      } catch (err) {
        console.error(err);
        setError(
          err.response?.data || "Failed to load users"
        );
      }
    };

    loadUsers();

  }, []);

  return (
    <div>
      <h2>Users</h2>

      {error && <p>{error}</p>}

      {users.map((user) => (
        <div key={user.id}>
          <p>
            {user.name} — {user.email} — {user.role}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Users;