import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";

import Dashboard from "./components/Dashboard";
import Participants from "./components/Participants";
import Checkpoints from "./components/Checkpoints";

function App() {
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
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/participants" element={<Participants />} />
            <Route path="/checkpoints" element={<Checkpoints />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;