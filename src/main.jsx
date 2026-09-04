import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ArcadeProvider } from "./lib/store.jsx";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ArcadeProvider>
      <App />
    </ArcadeProvider>
  </StrictMode>
);
