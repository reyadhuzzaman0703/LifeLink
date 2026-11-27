
import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardHeader from "../components/DashboardHeader";
import RouteMap from "../components/RouteMap";
import BloodRequest from "./BloodRequest";
import "./DashboardFeed.css";
import "../components/Dashboard.css";

function Dashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState("Overview");
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState("");

  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setRequestsLoading(true);
        setRequestsError("");

        const token = localStorage.getItem("lifelink_token");

        const response = await api.get("/blood-requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRequests(response.data.requests || []);
      } catch (error) {
        console.error("Blood requests loading error:", error);

        setRequestsError(
          error.response?.data?.message ||
            "Blood requests could not be loaded."
        );
      } finally {
        setRequestsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleSetMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Your browser does not support location detection."
      );
      return;
    }

    setLocationLoading(true);
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const token = localStorage.getItem("lifelink_token");

          const response = await api.patch(
            "/profile/location",
            {
              latitude,
              longitude,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setUserLocation({
            latitude,
            longitude,
          });

          setLocationMessage(
            response.data.message ||
              "Your location has been saved."
          );
        } catch (error) {
          console.error("Location saving error:", error);

          setLocationMessage(
            error.response?.data?.message ||
              "Location detected, but could not be saved."
          );
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage(
            "Please allow location access in your browser."
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationMessage(
            "Your location is currently unavailable."
          );
        } else if (error.code === error.TIMEOUT) {
          setLocationMessage(
            "Location detection timed out. Please try again."
          );
        } else {
          setLocationMessage(
            "Unable to detect your location."
          );
        }

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleViewRoute = async (request) => {
    try {
      setSelectedRequest(request);
      setRouteData(null);
      setRouteError("");
      setRouteLoading(true);

      const token = localStorage.getItem("lifelink_token");

      const response = await api.get(
        `/blood-requests/${request._id}/route`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRouteData(response.data);
    } catch (error) {
      console.error("Route loading error:", error);

      setRouteError(
        error.response?.data?.message ||
          "Hospital route could not be loaded."
      );
    } finally {
      setRouteLoading(false);
    }
  };

  const handleCloseRoute = () => {
    setSelectedRequest(null);
    setRouteData(null);
    setRouteError("");
    setRouteLoading(false);
  };

  const activeRequestCount = requests.length;

  const urgentRequestCount = requests.filter((request) => {
    const urgency = request.urgency?.toLowerCase();

    return urgency === "urgent" || urgency === "emergency";
  }).length;

  const hospitalCount = new Set(
    requests
      .map((request) => {
        if (typeof request.hospital === "string") {
          return request.hospital;
        }

        return (
          request.hospitalName ||
          request.hospital?.name
        );
      })
      .filter(Boolean)
  ).size;

  const getRequesterName = (request) => {
    return (
      request.requester?.name ||
      request.requesterName ||
      request.patientName ||
      request.patient ||
      "Blood request"
    );
  };

  const getHospitalName = (request) => {
    if (typeof request.hospital === "string") {
      return request.hospital;
    }

    return (
      request.hospitalName ||
      request.hospital?.name ||
      "Hospital not specified"
    );
  };

  const getRequestLocation = (request) => {
    if (typeof request.location === "string") {
      return request.location;
    }

    return (
      request.location?.address ||
      request.address ||
      request.area ||
      "Location not specified"
    );
  };

  const getUrgency = (request) => {
    const urgency = request.urgency || "Normal";

    return (
      urgency.charAt(0).toUpperCase() +
      urgency.slice(1).toLowerCase()
    );
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        user={user}
        onLogout={onLogout}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <main className="dashboard-main">
        <DashboardHeader
          user={user}
          activeSection={activeSection}
          onLogout={onLogout}
        />

        {activeSection === "Blood Request" ? (
          <BloodRequest
            user={user}
            onBack={() => setActiveSection("Overview")}
          />
        ) : (
          <div className="feed-page">
            <section className="feed-heading">
              <div>
                <span className="feed-eyebrow">
                  LIFELINK COMMUNITY
                </span>

                <h1>Blood Request Feed</h1>

                <p>
                  Find nearby blood requests and help someone in need.
                </p>
              </div>

              <button
                className="feed-create-button"
                onClick={() => setActiveSection("Blood Request")}
              >
                + Create Request
              </button>
            </section>

            <section className="feed-stats">
              <div className="feed-stat-card">
                <span>Active Requests</span>
                <strong>
                  {requestsLoading ? "..." : activeRequestCount}
                </strong>
              </div>

              <div className="feed-stat-card">
                <span>Urgent Requests</span>
                <strong className="stat-red">
                  {requestsLoading ? "..." : urgentRequestCount}
                </strong>
              </div>

              <div className="feed-stat-card">
                <span>Nearby Hospitals</span>
                <strong>
                  {requestsLoading ? "..." : hospitalCount}
                </strong>
              </div>
            </section>

            <div className="feed-content">
              <section className="request-feed">
                <div className="feed-section-heading">
                  <div>
                    <h2>Nearby Requests</h2>
                    <p>Blood requests around your location</p>
                  </div>

                  <button className="feed-filter-button">
                    Filter
                  </button>
                </div>

                <div className="request-list">
                  {requestsLoading && (
                    <p className="feed-status">
                      Loading blood requests...
                    </p>
                  )}

                  {!requestsLoading && requestsError && (
                    <p className="feed-status feed-error">
                      {requestsError}
                    </p>
                  )}

                  {!requestsLoading &&
                    !requestsError &&
                    requests.length === 0 && (
                      <p className="feed-status">
                        No active blood requests found.
                      </p>
                    )}

                  {!requestsLoading &&
                    !requestsError &&
                    requests.map((request) => {
                      const urgency = getUrgency(request);

                      return (
                        <article
                          className="request-card"
                          key={request._id || request.id}
                        >
                          <div className="request-card-top">
                            <div className="blood-group-badge">
                              {request.bloodGroup || "N/A"}
                            </div>

                            <span
                              className={`urgency-badge ${urgency.toLowerCase()}`}
                            >
                              {urgency}
                            </span>
                          </div>

                          <h3>{getRequesterName(request)}</h3>

                          <div className="request-details">
                            <p>
                              <span>Units needed</span>
                              <strong>
                                {request.units ??
                                  request.requiredUnits ??
                                  0} bags
                              </strong>
                            </p>

                            <p>
                              <span>Hospital</span>
                              <strong>
                                {getHospitalName(request)}
                              </strong>
                            </p>

                            <p>
                              <span>Location</span>
                              <strong>
                                {getRequestLocation(request)}
                              </strong>
                            </p>
                          </div>

                          <div className="request-card-bottom">
                            <div className="request-distance">
                              <span>📍</span>

                              {request.distance ||
                                "Distance unavailable"}

                              <span className="request-time">
                                ·{" "}
                                {request.createdAt
                                  ? new Date(
                                      request.createdAt
                                    ).toLocaleString()
                                  : "Recently"}
                              </span>
                            </div>

                            <button
                              className="request-details-button"
                              onClick={() => handleViewRoute(request)}
                            >
                              View Details
                            </button>
                          </div>
                        </article>
                      );
                    })}
                </div>
              </section>

              <aside className="feed-map-panel">
                <div className="map-panel-heading">
                  <div>
                    <h2>My Location</h2>
                    <p>Your current device location</p>
                  </div>

                  <span className="map-live-dot">GPS</span>
                </div>

                <div className="map-placeholder real-map-container">
                  <RouteMap userLocation={userLocation} />
                </div>

                <button
                  className="map-location-button"
                  onClick={handleSetMyLocation}
                  disabled={locationLoading}
                >
                  {locationLoading
                    ? "Detecting Location..."
                    : userLocation
                      ? "Update My Location"
                      : "Set My Location"}
                </button>

                {locationMessage && (
                  <p className="map-note">
                    {locationMessage}
                  </p>
                )}

                {!locationMessage && (
                  <p className="map-note">
                    Detect your device location to use nearby features.
                  </p>
                )}
              </aside>
            </div>

            {selectedRequest && (
              <div
                className="route-modal-overlay"
                onClick={handleCloseRoute}
              >
                <div
                  className="route-modal"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="route-modal-header">
                    <div>
                      <span className="feed-eyebrow">
                        LIFELINK DIRECTIONS
                      </span>

                      <h2>
                        {getHospitalName(selectedRequest)}
                      </h2>

                      <p>
                        {getRequestLocation(selectedRequest)}
                      </p>
                    </div>

                    <button
                      className="route-modal-close"
                      onClick={handleCloseRoute}
                      aria-label="Close route"
                    >
                      ×
                    </button>
                  </div>

                  {routeLoading && (
                    <div className="route-modal-status">
                      Calculating road route...
                    </div>
                  )}

                  {routeError && (
                    <div className="route-modal-status route-modal-error">
                      {routeError}
                    </div>
                  )}

                  {routeData?.route && (
                    <>
                      <div className="route-summary">
                        <div>
                          <span>Road Distance</span>
                          <strong>
                            {routeData.route.distanceKm} km
                          </strong>
                        </div>

                        <div>
                          <span>Estimated Time</span>
                          <strong>
                            {routeData.route.durationMinutes} min
                          </strong>
                        </div>
                      </div>

                      <div className="route-modal-map">
                        <RouteMap
                          userLocation={routeData.route.start}
                          destination={routeData.route.destination}
                          routeCoordinates={routeData.route.coordinates}
                        />
                      </div>

                      <p className="route-modal-note">
                        Estimated driving route. Actual travel time may vary.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
