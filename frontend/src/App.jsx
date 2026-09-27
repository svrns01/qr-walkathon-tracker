import {
  NavLink,
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import { useEffect, useState } from "react";
import "./App.css";

import Scanner from "./components/Scanner";
import Dashboard from "./components/Dashboard";
import Participants from "./components/Participants";
import Checkpoints from "./components/Checkpoints";

import Login from "./pages/Login";
import Users from "./pages/Users";
import VolunteerCheckpoint from "./pages/VolunteerCheckpoint";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LogoutButton from "./components/LogoutButton";
import { useAutoSync } from "./hooks/useAutoSync";


function App() {

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );

  useEffect(() => {

    const handleAuthChange = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };

    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };

  }, []);

  useAutoSync();

  const role = user?.role;


  return (
    <div className="app">

      <Routes>

        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* ROOT DASHBOARD */}

        <Route
          path="/root"
          element={
            <ProtectedRoute allowedRoles={["ROOT"]}>
              <RoleLayout role="ROOT">
                <Dashboard />
              </RoleLayout>
            </ProtectedRoute>
          }
        />


        {/* ADMIN DASHBOARD */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <RoleLayout role="ADMIN">
                <Dashboard />
              </RoleLayout>
            </ProtectedRoute>
          }
        />


        {/* OLD VOLUNTEER ROUTE
            Redirect directly to checkpoint selection */}

        <Route
          path="/volunteer"
          element={
            <ProtectedRoute allowedRoles={["VOLUNTEER"]}>
              <Navigate
                to="/select-checkpoint"
                replace
              />
            </ProtectedRoute>
          }
        />


        {/* PARTICIPANTS */}

        <Route
          path="/participants"
          element={
            <ProtectedRoute
              allowedRoles={["ROOT", "ADMIN"]}
            >
              <RoleLayout role={role}>
                <Participants />
              </RoleLayout>
            </ProtectedRoute>
          }
        />


        {/* CHECKPOINTS */}

        <Route
          path="/checkpoints"
          element={
            <ProtectedRoute
              allowedRoles={["ROOT", "ADMIN"]}
            >
              <RoleLayout role={role}>
                <Checkpoints />
              </RoleLayout>
            </ProtectedRoute>
          }
        />


        {/* USERS */}

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["ROOT"]}>
              <RoleLayout role="ROOT">
                <Users />
              </RoleLayout>
            </ProtectedRoute>
          }
        />


        {/* CHECKPOINT SELECTION */}

        <Route
          path="/select-checkpoint"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ROOT",
                "ADMIN",
                "VOLUNTEER"
              ]}
            >
              <RoleLayout role={role}>
                <VolunteerCheckpoint />
              </RoleLayout>
            </ProtectedRoute>
          }
        />


        {/* QR SCANNER */}

        <Route
          path="/scanner"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ROOT",
                "ADMIN",
                "VOLUNTEER"
              ]}
            >
              <RoleLayout role={role}>
                <Scanner />
              </RoleLayout>
            </ProtectedRoute>
          }
        />


        {/* DEFAULT ROUTE */}

        <Route
          path="/"
          element={
            user ? (
              <Navigate
                to={
                  role === "ROOT"
                    ? "/root"
                    : role === "ADMIN"
                    ? "/admin"
                    : role === "VOLUNTEER"
                    ? "/select-checkpoint"
                    : "/login"
                }
                replace
              />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />


        {/* UNKNOWN URL */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </div>
  );
}


/* =========================================================
   ROLE LAYOUT
   ========================================================= */

function RoleLayout({ role, children }) {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const navClass = ({ isActive }) =>
    `nav-button ${isActive ? "active" : ""}`;


  return (
    <>

      {/* HEADER */}

      <header className="header">

        <div>

          <h1>BEATS</h1>

          <p>
            TirFY-142 2026 • 6-DAY FOOT PILGRIMAGE
          </p>

        </div>


        {user && (

          <div className="user-info">

            <strong>
              {user.name}
            </strong>

            <span>
              {role}
            </span>

          </div>

        )}

      </header>


      {/* APPLICATION LAYOUT */}

      <div className="layout">


        {/* SIDEBAR */}

        <aside className="sidebar">


          {/* SIDEBAR TITLE */}

          <div className="sidebar-title">

            {role === "ROOT" &&
              "ROOT CONTROL"}

            {role === "ADMIN" &&
              "ADMIN CONTROL"}

            {role === "VOLUNTEER" &&
              "FIELD OPERATIONS"}

          </div>


          {/* NAVIGATION */}

          <nav>


            {/* ================================
                ROOT + ADMIN DASHBOARD
                ================================ */}

            {role !== "VOLUNTEER" && (

              <NavLink
                to={`/${role.toLowerCase()}`}
                className={navClass}
              >
                Dashboard
              </NavLink>

            )}


            {/* ================================
                ROOT NAVIGATION
                ================================ */}

            {role === "ROOT" && (
              <>

                <NavLink
                  to="/users"
                  className={navClass}
                >
                  User Management
                </NavLink>


                <NavLink
                  to="/participants"
                  className={navClass}
                >
                  Participants
                </NavLink>


                <NavLink
                  to="/checkpoints"
                  className={navClass}
                >
                  Checkpoints
                </NavLink>


                <NavLink
                  to="/select-checkpoint"
                  className={navClass}
                >
                  Scanner
                </NavLink>

              </>
            )}


            {/* ================================
                ADMIN NAVIGATION
                ================================ */}

            {role === "ADMIN" && (
              <>

                <NavLink
                  to="/participants"
                  className={navClass}
                >
                  Participants
                </NavLink>


                <NavLink
                  to="/checkpoints"
                  className={navClass}
                >
                  Checkpoints
                </NavLink>


                <NavLink
                  to="/select-checkpoint"
                  className={navClass}
                >
                  Scanner
                </NavLink>

              </>
            )}


            {/* ================================
                VOLUNTEER NAVIGATION

                ONLY SCANNER
                ================================ */}

            {role === "VOLUNTEER" && (

              <NavLink
                to="/select-checkpoint"
                className={navClass}
              >
                Scanner
              </NavLink>

            )}

          </nav>


          {/* SIDEBAR BOTTOM */}

          <div className="sidebar-bottom">

            {user && (

              <div className="sidebar-user">

                <strong>
                  {user.name}
                </strong>

                <span>
                  {role}
                </span>

              </div>

            )}

            <LogoutButton />

          </div>


        </aside>


        {/* MAIN CONTENT */}

        <main className="main-content">

          {children}

        </main>


      </div>

    </>
  );
}


export default App;