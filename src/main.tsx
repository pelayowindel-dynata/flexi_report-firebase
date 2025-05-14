/*
 * src/main.tsx
 * Entry point for Vite + React
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./firebase"; // initialize Firebase
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
