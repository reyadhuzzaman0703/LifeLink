
import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardHeader from "../components/DashboardHeader";
import RouteMap from "../components/RouteMap";
import BloodRequest from "./BloodRequest";
import "./DashboardFeed.css";
import "../components/Dashboard.css";

function Dashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState("");

  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");

  const [isMapExpanded, setIsMapExpanded] = useState(false);

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

  const sectionTitles = {
    "donor-notifications": "Donor Notifications",
    "blood-requests": "Blood Requests",
    donations: "Donation History",
    "request-history": "Request History",
    emergency: "Emergency Bulletin",
    profile: "My Profile",
    admin: "Admin Panel",
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        user={user}
        onLogout={onLogout}
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />

      <main className="dashboard-main">
        <DashboardHeader
          user={user}
          activeSection={activeSection}
          onLogout={onLogout}
        />

        {activeSection === "blood-request" ? (
          <BloodRequest
            user={user}
            onBack={() => setActiveSection("overview")}
          />
        ) : activeSection === "donor-notifications" ? (
          <div className="feed-page">
            <section className="feed-heading">
              <div>
                <span className="feed-eyebrow">
                  LIFELINK COMMUNITY
                </span>
                <h1>Donor Notifications</h1>
                <p>
                  Blood donation requests sent to you.
                </p>
              </div>
            </section>

            <div className="feed-status">
              Donor notification integration is coming next.
            </div>
          </div>
        ) : activeSection === "overview" ? (
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
                onClick={() => setActiveSection("blood-request")}
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

              <aside
                className={`feed-map-panel ${
                  isMapExpanded ? "map-expanded" : ""
                }`}
              >
                <div className="map-panel-heading">
                  <div>
                    <h2>My Location</h2>
                    <p>Your current device location</p>
                  </div>

                  <div className="map-panel-actions">
                    <span className="map-live-dot">GPS</span>

                    <button
                      type="button"
                      className="map-expand-button"
                      onClick={() =>
                        setIsMapExpanded((previous) => !previous)
                      }
                      title={
                        isMapExpanded
                          ? "Restore map"
                          : "Expand map"
                      }
                      aria-label={
                        isMapExpanded
                          ? "Restore map"
                          : "Expand map"
                      }
                    >
                      {isMapExpanded ? (
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M8 3v5H3" />
                          <path d="M3 8l7-7" />
                          <path d="M16 21v-5h5" />
                          <path d="M21 16l-7 7" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M15 3h6v6" />
                          <path d="M21 3l-7 7" />
                          <path d="M9 21H3v-6" />
                          <path d="M3 21l7-7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="map-placeholder real-map-container">
                  <RouteMap userLocation={userLocation} />

                  <button
                    type="button"
                    className="map-location-button"
                    onClick={handleSetMyLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading
                      ? "Detecting..."
                      : userLocation
                        ? "Update Location"
                        : "Detect My Location"}
                  </button>
                </div>

                {locationMessage ? (
                  <p className="map-note">{locationMessage}</p>
                ) : (
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
        ) : (
          <div className="feed-page">
            <section className="feed-heading">
              <div>
                <span className="feed-eyebrow">
                  LIFELINK
                </span>
                <h1>{sectionTitles[activeSection] || "Dashboard"}</h1>
                <p>
                  This section will be available soon.
                </p>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
