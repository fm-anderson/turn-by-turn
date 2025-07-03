import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ReactGA from "react-ga4";
import "./index.css";
import App from "./App.tsx";

ReactGA.initialize(import.meta.env.VITE_GA_ID);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
