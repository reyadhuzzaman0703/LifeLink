import React, { useState, useEffect } from 'react';

// Components
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Availability from './components/Availability';
import Location from './components/Location';
import Realtime from './components/Realtime';

// Pages
import HomeFeed from './pages/HomeFeed';
import CreateRequest from './pages/CreateRequest';
import UserDashboard from './pages/UserDashboard';
import Dashboard from './pages/Dashboard';
import Certificate from './pages/Certificate';

const NOW = Date.now();
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
          