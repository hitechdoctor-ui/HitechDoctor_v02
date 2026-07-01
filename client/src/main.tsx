import { createRoot } from "react-dom/client";
import App from "./App";
import { setupChunkReloadHandlers } from "./lib/setup-chunk-reload";
import "./index.css";

setupChunkReloadHandlers();

createRoot(document.getElementById("root")!).render(<App />);
