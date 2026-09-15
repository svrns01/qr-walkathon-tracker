import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";

import Scanner from "./components/Scanner";
import Dashboard from "./components/Dashboard";
import Participants from "./components/Participants";
import Checkpoints from "./components/Checkpoints";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LogoutButton from "./components/LogoutButton";
import Users from "./pages/Users";
import VolunteerCheckpoint from "./pages/VolunteerCheckpoint";
function App() {
  const user = JSON.parse(
  localStorage.getItem("user")
);

const role = user?.role;
  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>BEATS</h1>
          <p>TIRFY 2026 • 6-DAY WALKATHON</p>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <nav>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-button ${isActive ? "active" : ""}`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/participants"
              className={({ isActive }) =>
                `nav-button ${isActive ? "active" : ""}`
              }
            >
              Participants
            </NavLink>

            <NavLink
              to="/checkpoints"
              className={({ isActive }) =>
                `nav-button ${isActive ? "active" : ""}`
              }
            >
              Checkpoints
            </NavLink>
            {role === "ROOT" && (<NavLink to="/users">Users</NavLink>)}
            <LogoutButton />
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/scanner" element={<ProtectedRoute
      allowedRoles={["ROOT", "ADMIN", "VOLUNTEER"]}
    ><Scanner /></ProtectedRoute>} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/participants" element={<ProtectedRoute><Participants /></ProtectedRoute>} />
            <Route path="/checkpoints" element={<ProtectedRoute><Checkpoints /></ProtectedRoute>} />
            <Route path="/users" element={ <ProtectedRoute allowedRoles={["ROOT"]}> <Users /> </ProtectedRoute>}/>
            <Route path="/select-checkpoint" element={<ProtectedRoute allowedRoles={["ROOT", "ADMIN", "VOLUNTEER"]}> <VolunteerCheckpoint /> </ProtectedRoute>}/>
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;