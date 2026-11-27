
import { useEffect, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import "./HospitalLocationPicker.css";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const defaultPosition = [23.8103, 90.4125];

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function MapCenterUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(
        [position.latitude, position.longitude],
        16
      );
    }
  }, [position, map]);

  return null;
}

function HospitalLocationPicker({
  initialPosition = null,
  onChange,
}) {
  const [selectedPosition, setSelectedPosition] =
    useState(initialPosition);

  useEffect(() => {
    setSelectedPosition(initialPosition);
  }, [initialPosition]);

  const handleSelect = (position) => {
    setSelectedPosition(position);
    onChange?.(position);
  };

  const markerPosition = selectedPosition
    ? [
        selectedPosition.latitude,
        selectedPosition.longitude,
      ]
    : null;

  return (
    <div className="hospital-location-picker">
      <div className="hospital-location-picker-heading">
        <div>
          <h3>Select Hospital Location</h3>
          <p>
            Click on the hospital location or drag the
            marker to adjust it.
          </p>
        </div>

        {selectedPosition && (
          <span className="location-selected-badge">
            Location Selected
          </span>
        )}
      </div>

      <div className="hospital-location-map">
        <MapContainer
          center={markerPosition || defaultPosition}
          zoom={markerPosition ? 16 : 12}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onSelect={handleSelect} />

          <MapCenterUpdater position={selectedPosition} />

          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable
              eventHandlers={{
                dragend(event) {
                  const marker = event.target;
                  const position = marker.getLatLng();

                  handleSelect({
                    latitude: position.lat,
                    longitude: position.lng,
                  });
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {selectedPosition ? (
        <div className="hospital-location-coordinates">
          <div>
            <span>Latitude</span>
            <strong>
              {selectedPosition.latitude.toFixed(6)}
            </strong>
          </div>

          <div>
            <span>Longitude</span>
            <strong>
              {selectedPosition.longitude.toFixed(6)}
            </strong>
          </div>
        </div>
      ) : (
        <p className="hospital-location-hint">
          Select the exact hospital position on the map.
        </p>
      )}
    </div>
  );
}

export default HospitalLocationPicker;
