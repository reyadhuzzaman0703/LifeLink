const ORS_BASE_URL = "https://api.heigit.org/openrouteservice/v2";
const readORSResponse = async (response) => {
  const responseText = await response.text();

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      `ORS returned non-JSON response. HTTP ${response.status}. Response: ${responseText.slice(0, 300)}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.error?.message ||
        data.message ||
        `ORS request failed with HTTP ${response.status}`
    );
  }

  return data;
};

const validateCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error("At least two coordinates are required");
  }

  return coordinates.map(({ latitude, longitude }) => {
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error("Invalid coordinates provided");
    }

    return [longitude, latitude];
  });
};

export const getRouteMatrix = async (coordinates) => {
  const apiKey = process.env.ORS_API_KEY;

  if (!apiKey) {
    throw new Error("ORS_API_KEY is missing from environment variables");
  }

  const locations = validateCoordinates(coordinates);

  const response = await fetch(
    `${ORS_BASE_URL}/matrix/driving-car`,
    {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locations,
        metrics: ["distance", "duration"],
        units: "km",
        sources: [0],
        destinations: locations
          .map((_, index) => index)
          .slice(1),
      }),
    }
  );

  const data = await readORSResponse(response);

  if (!response.ok) {
    console.error("ORS API error:", data);

    throw new Error(
      data.error?.message || "OpenRouteService request failed"
    );
  }

  return {
    distances: data.distances[0],
    durations: data.durations[0],
  };
};

export const getRoadRoute = async (
  start,
  destination
) => {
  const apiKey = process.env.ORS_API_KEY;

  if (!apiKey) {
    throw new Error("ORS_API_KEY is missing from environment variables");
  }

  const coordinates = validateCoordinates([
    start,
    destination,
  ]);

  const response = await fetch(
    `${ORS_BASE_URL}/directions/driving-car/geojson`,
    {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates,
      }),
    }
  );

  const data = await readORSResponse(response);

  if (!response.ok) {
    console.error("ORS route API error:", data);

    throw new Error(
      data.error?.message || "ORS road route could not be calculated"
    );
  }

  const feature = data.features?.[0];

  if (!feature?.geometry?.coordinates) {
    throw new Error("ORS did not return route geometry");
  }

  return {
    coordinates: feature.geometry.coordinates,
    distanceKm: Number(
      (feature.properties.summary.distance / 1000).toFixed(2)
    ),
    durationMinutes: Math.round(
      feature.properties.summary.duration / 60
    ),
  };
};

export const getHospitalCoordinates = async (
  hospital,
  location
) => {
  const apiKey = process.env.ORS_API_KEY;

  if (!apiKey) {
    throw new Error("ORS_API_KEY is missing from environment variables");
  }

  const searchText = `${hospital}, ${location}, Bangladesh`;

  const params = new URLSearchParams({
    api_key: apiKey,
    text: searchText,
    "boundary.country": "BD",
    size: "1",
  });

  const response = await fetch(
    `https://api.heigit.org/pelias/v1/search?${params.toString()}`
  );

  const data = await readORSResponse(response);

  if (!response.ok) {
    console.error("ORS geocoding error:", data);

    throw new Error(
      data.error?.message || "Hospital location could not be found"
    );
  }

  const feature = data.features?.[0];

  if (!feature?.geometry?.coordinates) {
    throw new Error(
      "Hospital coordinates not found. Please check hospital name and location."
    );
  }

  const [longitude, latitude] = feature.geometry.coordinates;

  return {
    latitude,
    longitude,
    label: feature.properties?.label || searchText,
  };
};