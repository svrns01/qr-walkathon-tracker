import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Login() {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const loginData = response.data;
      localStorage.setItem(
      "token",
    loginData.token
    );
    localStorage.setItem(
      "user",
      JSON.stringify({
      userId: loginData.userId,
      name: loginData.name,
      email: loginData.email,
      role: loginData.role,
      assignedCheckpointIds:
      loginData.assignedCheckpointIds
      })
    );
    navigate("/");
    setError("");

   } catch (err) {
      console.error(err);
      setError(
        err.response?.data || "Login failed"
      );
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>

        <div>
          <label>Email</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>Password</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />
        </div>

        <br />

        <button type="submit">
          Login
        </button>

      </form>

      {error && (
        <p>{error}</p>
      )}
    </div>
  );
}

export default Login; 