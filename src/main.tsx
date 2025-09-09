import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/global.scss";

createRoot(document.getElementById("root") as Element).render(
  // <StrictMode>
  <App />
  // </StrictMode>
);
