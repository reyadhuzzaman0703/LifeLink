
import { useEffect, useState } from "react";
import api from "./services/api";
import "./App.css";

function App() {
  const [status, setStatus] = useState("Checking backend...");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/health")
      .then((response) => {
        setStatus(response.data.message);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Backend connection failed"
        );
      });
  }, []);

  return (
    <main className="app">
      <section className="status-card">
        <div className="brand">
          <span className="brand-icon">♥</span>
          <h1>LifeLink</h1>
        </div>

        <p className="tagline">
          Every Drop Matters. Every Life Counts.
        </p>

        <div className="divider" />

        <h2>Backend Connection Test</h2>

        {error ? (
          <p className="status error">
            <span className="status-dot" />
            {error}
          </p>
        ) : (
          <p className="status success">
            <span className="status-dot" />
            {status}
          </p>
        )}
      </section>
    </main>
  );
}

export default App;
