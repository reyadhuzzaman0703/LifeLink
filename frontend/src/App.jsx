
import { useEffect, useState } from "react";
import api from "./services/api";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import BloodRequest from "./pages/BloodRequest";
import "./App.css";


function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [verificationStatus, setVerificationStatus] =
    useState("checking");
  const [verificationMessage, setVerificationMessage] =
    useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verificationToken = params.get("token");

    if (window.location.pathname === "/verify-email") {
      if (!verificationToken) {
        setVerificationStatus("error");
        setVerificationMessage(
          "Verification token is missing."
        );
        setCheckingAuth(false);
        return;
      }

      api
        .post("/auth/verify-email", {
          token: verificationToken,
        })
        .then((response) => {
          setVerificationStatus("success");
          setVerificationMessage(response.data.message);
        })
        .catch((error) => {
          setVerificationStatus("error");
          setVerificationMessage(
            error.response?.data?.message ||
              "Email verification failed. Please try again."
          );
        })
        .finally(() => {
          setCheckingAuth(false);
          window.history.replaceState({}, "", "/");
        });

      return;
    }

    const token = localStorage.getItem("lifelink_token");

    if (!token) {
      setCheckingAuth(false);
      return;
    }

    api
      .get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        localStorage.removeItem("lifelink_token");
        localStorage.removeItem("lifelink_user");
      })
      .finally(() => {
        setCheckingAuth(false);
      });
  }, []);

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("lifelink_token");
    localStorage.removeItem("lifelink_user");
    setUser(null);
  };

  if (checkingAuth) {
    return (
      <main className="app-loading">
        <div className="loading-heart">♥</div>

        <p>
          {verificationStatus === "checking"
            ? "Preparing your LifeLink..."
            : "Verifying your email..."}
        </p>
      </main>
    );
  }

  if (verificationStatus !== "checking") {
    return (
      <main className="app-loading">
        <div className="loading-heart">
          {verificationStatus === "success" ? "♥" : "!"}
        </div>

        <h2>
          {verificationStatus === "success"
            ? "Email Verified!"
            : "Verification Failed"}
        </h2>

        <p>{verificationMessage}</p>

        <button
          onClick={() => {
            setVerificationStatus("checking");
            setVerificationMessage("");
          }}
        >
          Continue to LifeLink
        </button>
      </main>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
    />
  );
}

export default App;
