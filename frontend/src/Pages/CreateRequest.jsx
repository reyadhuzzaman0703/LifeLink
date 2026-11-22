
import React, { useState } from "react";

const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-",
  "O+", "O-", "AB+", "AB-"
];

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function CreateRequest({ onAddRequest, currentUser }) {
  const isAdmin = currentUser?.role === "admin";

  const [formData, setFormData] = useState({
    bloodGroup: "O+",
    hospital: "",
    location:
      currentUser?.location ||
      currentUser?.cityCountry ||
      "",
    units: 1,
    neededAt: "",
    reason: "",
    urgency: "normal"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.hospital.trim() ||
      !formData.location.trim() ||
      !formData.neededAt ||
      !formData.reason.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (Number(formData.units) < 1 || Number(formData.units) > 20) {
      setError("Units must be between 1 and 20.");
      return;
    }

    if (new Date(formData.neededAt) <= new Date()) {
      setError("Needed date and time must be in the future.");
      return;
    }

    const token = localStorage.getItem("lifelink_token");

    if (!token) {
      setError("Please login first.");
      return;
    }

    const requestData = {
      bloodGroup: formData.bloodGroup,
      units: Number(formData.units),
      hospital: formData.hospital.trim(),
      location: formData.location.trim(),
      neededAt: new Date(formData.neededAt).toISOString(),
      reason: formData.reason.trim(),
      urgency: formData.urgency
    };

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/blood-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(requestData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create blood request."
        );
      }

      setSuccess(
        data.message || "Blood request created successfully!"
      );

      if (onAddRequest) {
        onAddRequest(data.request);
      }

      setFormData({
        bloodGroup: "O+",
        hospital: "",
        location:
          currentUser?.location ||
          currentUser?.cityCountry ||
          "",
        units: 1,
        neededAt: "",
        reason: "",
        urgency: "normal"
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cr-card">
      <style>{`
        .cr-card {
          background: #131C2A;
          border: 1px solid #1E293B;
          border-radius: 16px;
          padding: 24px 28px;
          max-width: 620px;
          margin: 0 auto;
          color: #F1F5F9;
          box-shadow: 0 12px 32px rgba(0,0,0,0.45);
          font-family: -apple-system, BlinkMacSystemFont,
            'Segoe UI', Roboto, sans-serif;
          box-sizing: border-box;
        }

        .cr-header {
          border-bottom: 1px solid #1E293B;
          padding-bottom: 14px;
          margin-bottom: 18px;
        }

        .cr-title {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
          color: #FFFFFF;
        }

        .cr-sub {
          margin: 4px 0 0;
          font-size: 12.5px;
          color: #94A3B8;
        }

        .cr-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .cr-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        @media (max-width: 600px) {
          .cr-grid-2 {
            grid-template-columns: 1fr;
          }
        }

        .cr-label {
          display: block;
          font-size: 12.5px;
          font-weight: 700;
          color: #CBD5E1;
          margin-bottom: 6px;
        }

        .cr-input {
          width: 100%;
          background: #0B111A;
          border: 1px solid #263348;
          border-radius: 10px;
          padding: 10px 13px;
          color: #F8FAFC;
          font-size: 13.5px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .cr-input:focus {
          border-color: #F43F5E;
          box-shadow: 0 0 0 3px rgba(244,63,94,0.15);
        }

        .cr-input::placeholder {
          color: #64748B;
        }

        .cr-bg-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .cr-bg-btn {
          background: #0B111A;
          color: #CBD5E1;
          border: 1px solid #263348;
          border-radius: 9px;
          padding: 8px 0;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .cr-bg-btn:hover {
          border-color: #F43F5E;
          color: #FFFFFF;
        }

        .cr-bg-btn.selected {
          background: linear-gradient(135deg,#F43F5E,#BE123C);
          color: #FFFFFF;
          border-color: #F43F5E;
          box-shadow: 0 0 12px rgba(244,63,94,0.45);
        }

        .cr-urgency-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        @media (max-width: 540px) {
          .cr-urgency-grid {
            grid-template-columns: 1fr;
          }
        }

        .cr-urgency-card {
          background: #0B111A;
          border: 1px solid #263348;
          border-radius: 12px;
          padding: 12px;
          text-align: left;
          cursor: pointer;
          transition: all 0.18s ease;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .cr-urgency-card:hover {
          background: #101826;
        }

        .cr-urgency-card.active-emergency {
          background: rgba(225,29,72,0.14);
          border-color: #F43F5E;
          box-shadow: 0 0 14px rgba(244,63,94,0.22);
        }

        .cr-urgency-card.active-normal {
          background: rgba(245,158,11,0.13);
          border-color: #F59E0B;
          box-shadow: 0 0 14px rgba(245,158,11,0.2);
        }

        .cr-u-title {
          font-size: 13px;
          font-weight: 700;
          color: #FFFFFF;
        }

        .cr-u-desc {
          font-size: 11px;
          color: #94A3B8;
        }

        .cr-submit-btn {
          background: linear-gradient(135deg,#F43F5E,#BE123C);
          color: #FFFFFF;
          border: none;
          padding: 12px 18px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 14.5px;
          cursor: pointer;
          margin-top: 6px;
          box-shadow: 0 4px 18px rgba(225,29,72,0.45);
          transition: transform 0.15s ease;
        }

        .cr-submit-btn:hover {
          transform: translateY(-1px);
        }

        .cr-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cr-message {
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13px;
        }

        .cr-error {
          background: rgba(239,68,68,0.12);
          color: #FCA5A5;
        }

        .cr-success {
          background: rgba(34,197,94,0.12);
          color: #86EFAC;
        }
      `}</style>

      <div className="cr-header">
        <h2 className="cr-title">
          🩸 Post New Blood Request
        </h2>

        <p className="cr-sub">
          Fill in the details to broadcast your blood request.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="cr-form">

        {error && (
          <div className="cr-message cr-error">
            {error}
          </div>
        )}

        {success && (
          <div className="cr-message cr-success">
            {success}
          </div>
        )}

        <div>
          <label className="cr-label">
            Blood Group *
          </label>

          <div className="cr-bg-grid">
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    bloodGroup: bg
                  })
                }
                className={`cr-bg-btn ${
                  formData.bloodGroup === bg ? "selected" : ""
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        <div className="cr-grid-2">
          <div>
            <label className="cr-label">
              Required Units *
            </label>

            <input
              type="number"
              name="units"
              min="1"
              max="20"
              required
              value={formData.units}
              onChange={handleChange}
              className="cr-input"
            />
          </div>

          <div>
            <label className="cr-label">
              Needed Date & Time *
            </label>

            <input
              type="datetime-local"
              name="neededAt"
              required
              value={formData.neededAt}
              onChange={handleChange}
              min={
                new Date(
                  Date.now() -
                  new Date().getTimezoneOffset() * 60000
                ).toISOString().slice(0, 16)
              }
              className="cr-input"
            />
          </div>
        </div>

        <div>
          <label className="cr-label">
            Hospital Name & Ward *
          </label>

          <input
            type="text"
            name="hospital"
            required
            placeholder="e.g. Dhaka Medical College Hospital, Ward-4"
            value={formData.hospital}
            onChange={handleChange}
            className="cr-input"
          />
        </div>

        <div>
          <label className="cr-label">
            City / Location *
          </label>

          <input
            type="text"
            name="location"
            required
            placeholder="e.g. Dhaka, Bangladesh"
            value={formData.location}
            onChange={handleChange}
            className="cr-input"
          />
        </div>

        <div>
          <label className="cr-label">
            Reason / Patient Details *
          </label>

          <textarea
            name="reason"
            required
            rows="3"
            placeholder="Explain why blood is needed..."
            value={formData.reason}
            onChange={handleChange}
            className="cr-input"
          />
        </div>

        <div>
          <label className="cr-label">
            When is Blood Needed? *
          </label>

          <div className="cr-urgency-grid">

            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  urgency: "normal"
                })
              }
              className={`cr-urgency-card ${
                formData.urgency === "normal"
                  ? "active-normal"
                  : ""
              }`}
            >
              <span
                className="cr-u-title"
                style={{ color: "#FCD34D" }}
              >
                📅 Normal Request
              </span>

              <span className="cr-u-desc">
                For planned blood requirements
              </span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    urgency: "emergency"
                  })
                }
                className={`cr-urgency-card ${
                  formData.urgency === "emergency"
                    ? "active-emergency"
                    : ""
                }`}
              >
                <span
                  className="cr-u-title"
                  style={{ color: "#FDA4AF" }}
                >
                  🚨 Emergency Request
                </span>

                <span className="cr-u-desc">
                  Immediate critical requirement
                </span>
              </button>
            )}

          </div>
        </div>

        <button
          type="submit"
          className="cr-submit-btn"
          disabled={loading}
        >
          {loading
            ? "Publishing..."
            : "🩸 Publish Blood Request"}
        </button>

      </form>
    </div>
  );
}
