
import { useEffect, useState } from "react";
import api from "../services/api";
import "./DonorNotifications.css";

function DonorNotifications({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [startingChatId, setStartingChatId] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);

  const token = localStorage.getItem("lifelink_token");
  const currentUserId = user?._id || user?.id;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/donor-notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(response.data.notifications || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load donor notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleViewDetails = async (id) => {
    try {
      setDetailsLoading(true);
      setSelectedNotification(null);
      setError("");

      const response = await api.get(
        `/donor-notifications/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedNotification(response.data.notification);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load notification details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleStartChat = async (notificationId) => {
    try {
      setStartingChatId(notificationId);
      setError("");
      setSuccess("");

      const response = await api.post(
        `/chats/notification/${notificationId}/start`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const chat = response.data.chat;
      const chatId = chat?._id || chat?.id;

      setActiveChatId(chatId || null);
      setSuccess(
        response.data.message || "Chat started successfully."
      );

      await fetchNotifications();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not start chat. Please try again."
      );
    } finally {
      setStartingChatId(null);
    }
  };

  const formatStatus = (status) => {
    const labels = {
      notified: "New Notification",
      chat_started: "Chat Started",
      awaiting_confirmation: "Awaiting Confirmation",
      confirmed: "Confirmed",
      declined: "Declined",
      expired: "Expired",
    };

    return labels[status] || status;
  };

  const getHospitalName = (hospital) => {
    if (typeof hospital === "string") return hospital;
    return hospital?.name || "Hospital not specified";
  };

  const isDonor = (notification) => {
    const donorId =
      notification.donor?._id || notification.donor;

    return donorId?.toString() === currentUserId?.toString();
  };

  return (
    <div className="donor-notifications-page">
      <section className="donor-notifications-heading">
        <div>
          <span className="feed-eyebrow">LIFELINK COMMUNITY</span>
          <h1>Donor Notifications</h1>
          <p>Blood donation requests sent to you.</p>
        </div>

        <button
          className="donor-notification-refresh"
          onClick={fetchNotifications}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </section>

      {error && (
        <div className="feed-status feed-error">
          {error}
        </div>
      )}

      {success && (
        <div className="feed-status">
          {success}
          {activeChatId && (
            <p>Chat ID: {activeChatId}</p>
          )}
        </div>
      )}

      {loading && (
        <div className="feed-status">
          Loading notifications...
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="donor-notification-empty">
          <h3>No notifications yet</h3>
          <p>
            When someone sends a blood request matching your profile,
            you will receive a notification here.
          </p>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="donor-notification-list">
          {notifications.map((notification) => {
            const request = notification.bloodRequest || {};
            const donor = isDonor(notification);
            const person = donor
              ? notification.requester
              : notification.donor;

            return (
              <article
                className="donor-notification-card"
                key={notification._id}
              >
                <div className="donor-notification-card-top">
                  <span className="blood-group-badge">
                    {request.bloodGroup || "N/A"}
                  </span>

                  <span
                    className={`donor-notification-status ${notification.status}`}
                  >
                    {formatStatus(notification.status)}
                  </span>
                </div>

                <h3>
                  {donor
                    ? "Blood donation request"
                    : "Your blood request update"}
                </h3>

                <div className="donor-notification-info">
                  <p>
                    <span>{donor ? "Requester" : "Donor"}</span>
                    <strong>{person?.name || "User"}</strong>
                  </p>

                  <p>
                    <span>Units needed</span>
                    <strong>{request.units ?? 0} bags</strong>
                  </p>

                  <p>
                    <span>Hospital</span>
                    <strong>{getHospitalName(request.hospital)}</strong>
                  </p>

                  <p>
                    <span>Urgency</span>
                    <strong>{request.urgency || "Normal"}</strong>
                  </p>
                </div>

                <div className="donor-notification-card-bottom">
                  <span>
                    {notification.notifiedAt
                      ? new Date(notification.notifiedAt).toLocaleString()
                      : "Recently"}
                  </span>

                  <div>
                    <button
                      className="request-details-button"
                      onClick={() =>
                        handleViewDetails(notification._id)
                      }
                    >
                      View Details
                    </button>

                    {donor && notification.status === "notified" && (
                      <button
                        className="request-details-button"
                        onClick={() =>
                          handleStartChat(notification._id)
                        }
                        disabled={startingChatId === notification._id}
                      >
                        {startingChatId === notification._id
                          ? "Starting..."
                          : "Start Chat"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {detailsLoading && (
        <div className="donor-notification-modal-overlay">
          <div className="donor-notification-modal">
            Loading notification details...
          </div>
        </div>
      )}

      {selectedNotification && (
        <div
          className="donor-notification-modal-overlay"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="donor-notification-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="donor-notification-modal-close"
              onClick={() => setSelectedNotification(null)}
            >
              ×
            </button>

            <span className="feed-eyebrow">NOTIFICATION DETAILS</span>
            <h2>
              {selectedNotification.bloodRequest?.bloodGroup || "Blood"}{" "}
              Blood Request
            </h2>

            <p>
              Status:{" "}
              {formatStatus(selectedNotification.status)}
            </p>

            <p>
              Donor confirmation:{" "}
              {selectedNotification.donorConfirmation}
            </p>

            <p>
              Requester confirmation:{" "}
              {selectedNotification.requesterConfirmation}
            </p>

            {selectedNotification.confirmationDeadline && (
              <p>
                Confirmation deadline:{" "}
                {new Date(
                  selectedNotification.confirmationDeadline
                ).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DonorNotifications;