
import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  CircleMarker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import "leaflet/dist/leaflet.css";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const defaultCenter = [23.8103, 90.4125];

function MapController({ userLocation, destination }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.flyTo(
        [userLocation.latitude, userLocation.longitude],
        16,
        {
          duration: 1.2,
        }
      );
    }
  }, [map, userLocation]);

  useEffect(() => {
    if (destination && userLocation) {
      map.fitBounds(
        [
          [
            userLocation.latitude,
            userLocation.longitude,
          ],
          [
            destination.latitude,
            destination.longitude,
          ],
        ],
        {
          padding: [40, 40],
          maxZoom: 16,
        }
      );
    }
  }, [map, userLocation, destination]);

  return null;
}

function RouteMap({
  userLocation,
  destination = null,
  routeCoordinates = [],
}) {
  const start = userLocation
    ? [
        userLocation.latitude,
        userLocation.longitude,
      ]
    : defaultCenter;

  const end = destination
    ? [
        destination.latitude,
        destination.longitude,
      ]
    : null;

  const routePositions = routeCoordinates.map(
    ([longitude, latitude]) => [
      latitude,
      longitude,
    ]
  );

  return (
    <MapContainer
      center={start}
      zoom={userLocation ? 16 : 12}
      scrollWheelZoom
      className="lifelink-leaflet-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        userLocation={userLocation}
        destination={destination}
      />

      {userLocation && (
        <CircleMarker
          center={start}
          radius={10}
          pathOptions={{
            color: "#ffffff",
            fillColor: "#2563eb",
            fillOpacity: 1,
            weight: 4,
          }}
        >
          <Popup>
            <strong>You are here</strong>
            <br />
            Your current device location
          </Popup>
        </CircleMarker>
      )}

      {destination && (
        <Marker position={end}>
          <Popup>Hospital / Request Location</Popup>
        </Marker>
      )}

      {routePositions.length > 0 && (
        <Polyline
          positions={routePositions}
          pathOptions={{
            color: "#2563eb",
            weight: 6,
            opacity: 0.85,
          }}
        />
      )}
    </MapContainer>
  );
}

export default RouteMap;
