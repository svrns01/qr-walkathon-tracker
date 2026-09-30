//VITE_API_BASE_URL=https://be-7fb222026b0a47f6b24875010c775bad.ecs.ap-south-1.on.aws/api
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import "./testOfflineData";

import "./index.css";
import App from "./App.jsx";
import("./db/scanStore.js").then(async ({ getPendingScans }) => {
  const scans = await getPendingScans();
  console.table(scans);
});

registerSW({
  immediate: true,
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);