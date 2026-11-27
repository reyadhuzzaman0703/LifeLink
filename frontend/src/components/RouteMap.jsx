
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

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function MapBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);

      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 16,
      });
    }
  }, [map, points]);

  return null;
}

function RouteMap({
  userLocation,
  destination = null,
  routeCoordinates = [],
}) {
  if (!userLocation) {
    return (
      <div className="route-map-message">
        Set your location to see yourself on the map.
      </div>
    );
  }

  const start = [
    userLocation.latitude,
    userLocation.longitude,
  ];

  const end = destination
    ? [destination.latitude, destination.longitude]
    : null;

  const routePositions = routeCoordinates.map(
    ([longitude, latitude]) => [latitude, longitude]
  );

  const mapPoints = destination
    ? routePositions.length > 0
      ? routePositions
      : [start, end]
    : [start];

  return (
    <MapContainer
      center={start}
      zoom={16}
      scrollWheelZoom
      style={{
        width: "100%",
        height: "100%",
        minHeight: "350px",
        borderRadius: "16px",
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

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

      <MapBounds points={mapPoints} />
    </MapContainer>
  );
}

export default RouteMap;
