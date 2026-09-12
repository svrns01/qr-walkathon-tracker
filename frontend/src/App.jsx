import "./App.css";

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
            <button className="nav-button active">
              Dashboard
            </button>

            <button className="nav-button">
              Participants
            </button>

            <button className="nav-button">
              Checkpoints
            </button>
          </nav>
        </aside>

        <main className="main-content">
          <h2>Dashboard</h2>
          <p>Welcome to the Yatrika Tracking System.</p>
        </main>
      </div>
    </div>
  );
}

export default App;