import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import api from "../services/api";
import "leaflet/dist/leaflet.css";
import "./BloodRequest.css";

const initialCenter = [23.8103, 90.4125];

const hospitalIcon = L.divIcon({
  className: "hospital-marker",
  html: '<div class="hospital-marker-pin"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

function MapController({ position, onPositionChange }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, { duration: 1 });
    }
  }, [position, map]);

  useMapEvents({
    click(event) {
      onPositionChange([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

export default function BloodRequest() {
  const [form, setForm] = useState({
    bloodGroup: "",
    units: 1,
    reason: "",
    hospital: "",
    location: "",
    contactPerson: "",
    contactNumber: "",
    urgency: "normal",
    neededDate: "",
    neededTime: "",
  });

  const [hospitalQuery, setHospitalQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [position, setPosition] = useState(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    if (hospitalQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setSearching(true);

        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(
            hospitalQuery
          )}&limit=6&lang=en`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Hospital search failed");
        }

        const data = await response.json();

        setSuggestions(
          (data.features || []).filter((feature) => {
            const coordinates = feature.geometry?.coordinates;

            return (
              Array.isArray(coordinates) &&
              coordinates.length === 2 &&
              feature.properties
            );
          })
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setSearching(false);
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [hospitalQuery]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const chooseHospital = (feature) => {
    const properties = feature.properties;
    const [longitude, latitude] = feature.geometry.coordinates;

    const hospitalName =
      properties.name ||
      properties.street ||
      properties.city ||
      "Selected Hospital";

    const addressParts = [
      properties.street,
      properties.housenumber,
      properties.city,
      properties.state,
      properties.country,
    ].filter(Boolean);

    const address = [...new Set(addressParts)].join(", ");

    setHospitalQuery(hospitalName);
    setSuggestions([]);
    setPosition([latitude, longitude]);

    setForm((previous) => ({
      ...previous,
      hospital: hospitalName,
      location: address,
    }));

    setMessage("");
  };

  const updatePosition = (newPosition) => {
    setPosition(newPosition);
    setMessage("");
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessageType("error");
      setMessage("Your browser does not support location detection.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition([result.coords.latitude, result.coords.longitude]);

        setMessageType("success");
        setMessage(
          "Your location detected. Select the hospital location on the map."
        );
      },
      () => {
        setMessageType("error");
        setMessage("Location permission was not granted.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!position) {
      setMessageType("error");
      setMessage("Please select the hospital location on the map.");
      return;
    }

    if (!form.hospital.trim()) {
      setMessageType("error");
      setMessage("Please enter the hospital name.");
      return;
    }

    if (!form.neededDate || !form.neededTime) {
      setMessageType("error");
      setMessage("Please select the required date and time.");
      return;
    }

    const neededAtDate = new Date(`${form.neededDate}T${form.neededTime}`);

    if (
      Number.isNaN(neededAtDate.getTime()) ||
      neededAtDate <= new Date()
    ) {
      setMessageType("error");
      setMessage("Required date and time must be in the future.");
      return;
    }

    const payload = {
      bloodGroup: form.bloodGroup,
      units: Number(form.units),
      hospital: form.hospital.trim(),
      location: form.location.trim(),
      hospitalCoordinates: {
        latitude: position[0],
        longitude: position[1],
      },
      contactPerson: form.contactPerson.trim(),
      contactNumber: form.contactNumber.trim(),
      neededAt: neededAtDate.toISOString(),
      reason: form.reason.trim(),
      urgency: form.urgency,
    };

    try {
      setSubmitting(true);

      const response = await api.post("/blood-requests", payload);

      setMessageType("success");
      setMessage(
        response.data?.message || "Blood request created successfully."
      );

      setForm({
        bloodGroup: "",
        units: 1,
        reason: "",
        hospital: "",
        location: "",
        contactPerson: "",
        contactNumber: "",
        urgency: "normal",
        neededDate: "",
        neededTime: "",
      });

      setHospitalQuery("");
      setSuggestions([]);
      setPosition(null);
    } catch (error) {
      setMessageType("error");
      setMessage(
        error.response?.data?.message ||
          "Could not submit the blood request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="blood-request-page">
      <div className="blood-request-heading">
        <div>
          <span className="blood-request-eyebrow">LIFELINK</span>
          <h1>Request Blood</h1>
          <p>Find a hospital and submit your blood request.</p>
        </div>
      </div>

      <form className="blood-request-layout" onSubmit={handleSubmit}>
        {/* Left Static Panel */}
        <section className="request-panel hospital-panel">
          <div className="panel-heading">
            <span className="panel-number">01</span>
            <div>
              <h2>Hospital</h2>
              <p>Search and select the hospital</p>
            </div>
          </div>

          <label htmlFor="hospital-search">Hospital name</label>

          <div className="hospital-search-wrapper">
            <input
              id="hospital-search"
              type="text"
              value={hospitalQuery}
              onChange={(event) => {
                const value = event.target.value;

                setHospitalQuery(value);
                setSuggestions([]);
                setPosition(null);

                setForm((previous) => ({
                  ...previous,
                  hospital: value,
                  location: "",
                }));
              }}
              placeholder="Search hospital..."
              autoComplete="off"
              required
            />

            {searching && (
              <span className="search-status">Searching hospitals...</span>
            )}

            {suggestions.length > 0 && (
              <div className="hospital-suggestions">
                {suggestions.map((feature, index) => {
                  const properties = feature.properties;

                  return (
                    <button
                      type="button"
                      className="hospital-suggestion"
                      key={`${properties.osm_id || properties.name}-${index}`}
                      onClick={() => chooseHospital(feature)}
                    >
                      <strong>{properties.name || "Unnamed place"}</strong>

                      <span>
                        {[
                          properties.street,
                          properties.city,
                          properties.state,
                          properties.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <label htmlFor="hospital-address">Hospital address</label>

          <textarea
            id="hospital-address"
            name="location"
            value={form.location}
            onChange={updateField}
            placeholder="Hospital address"
            rows={3}
            required
          />

          <button
            type="button"
            className="location-button"
            onClick={getCurrentLocation}
          >
            Detect my location
          </button>

          <div className="hospital-selection">
            <span className="selection-indicator" />

            <div>
              <strong>
                {position ? "Location selected" : "Location not selected"}
              </strong>

              <p>
                {position
                  ? `${position[0].toFixed(6)}, ${position[1].toFixed(6)}`
                  : "Select a hospital or click on the map."}
              </p>
            </div>
          </div>
        </section>

        {/* Middle Dynamic Scroll Panel */}
        <section className="request-panel request-form-panel">
          <div className="panel-heading">
            <span className="panel-number">02</span>

            <div>
              <h2>Request details</h2>
              <p>Provide the required information</p>
            </div>
          </div>

          <label htmlFor="bloodGroup">Blood group</label>

          <select
            id="bloodGroup"
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={updateField}
            required
          >
            <option value="">Select blood group</option>

            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
              (group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              )
            )}
          </select>

          <label htmlFor="units">Required units</label>

          <input
            id="units"
            name="units"
            type="number"
            min="1"
            max="20"
            value={form.units}
            onChange={updateField}
            required
          />

          <label htmlFor="reason">Reason</label>

          <textarea
            id="reason"
            name="reason"
            value={form.reason}
            onChange={updateField}
            placeholder="Why is blood needed?"
            rows={2}
            maxLength={500}
            required
          />

          <label htmlFor="contactPerson">Contact person</label>

          <input
            id="contactPerson"
            name="contactPerson"
            value={form.contactPerson}
            onChange={updateField}
            placeholder="Contact person's name"
            required
          />

          <label htmlFor="contactNumber">Contact number</label>

          <input
            id="contactNumber"
            name="contactNumber"
            type="tel"
            value={form.contactNumber}
            onChange={updateField}
            placeholder="01XXXXXXXXX"
            required
          />

          <label htmlFor="urgency">Urgency</label>

          <select
            id="urgency"
            name="urgency"
            value={form.urgency}
            onChange={updateField}
          >
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
            <option value="emergency">Emergency</option>
          </select>

          <div className="date-time-fields">
            <div>
              <label htmlFor="neededDate">Required Date *</label>
              <div className="date-time-input-wrapper">
                <input
                  id="neededDate"
                  name="neededDate"
                  type="date"
                  value={form.neededDate || ""}
                  onChange={updateField}
                  required
                />
                <svg viewBox="0 0 24 24" className="date-time-icon" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 10h18" />
                </svg>
              </div>
            </div>

            <div>
              <label htmlFor="neededTime">Required Time *</label>
              <div className="date-time-input-wrapper">
                <input
                  id="neededTime"
                  name="neededTime"
                  type="time"
                  value={form.neededTime || ""}
                  onChange={updateField}
                  required
                />
                <svg viewBox="0 0 24 24" className="date-time-icon" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
            </div>
          </div>

          {message && (
            <div className={`request-message ${messageType}`} role="status">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="submit-request-button"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Blood Request"}
          </button>
        </section>

        {/* Right Static Panel */}
        <section className="request-panel request-map-panel">
          <div className="panel-heading">
            <span className="panel-number">03</span>

            <div>
              <h2>Hospital location</h2>
              <p>Click or drag the marker to adjust</p>
            </div>
          </div>

          <div className="request-map">
            <MapContainer center={initialCenter} zoom={11} scrollWheelZoom>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapController
                position={position}
                onPositionChange={updatePosition}
              />

              {position && (
                <Marker
                  position={position}
                  icon={hospitalIcon}
                  draggable
                  eventHandlers={{
                    dragend(event) {
                      const coordinates = event.target.getLatLng();

                      updatePosition([coordinates.lat, coordinates.lng]);
                    },
                  }}
                />
              )}
            </MapContainer>
          </div>

          <p className="map-instruction">
            Select a hospital from the search results for accurate coordinates.
            You can fine-tune the location by moving the marker.
          </p>
        </section>
      </form>
    </div>
  );
}