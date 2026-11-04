
const ORS_BASE_URL = "https://api.openrouteservice.org/v2";

// Get road distance and travel duration between locations
export const getRouteMatrix = async (coordinates) => {
  const apiKey = process.env.ORS_API_KEY;

  if (!apiKey) {
    throw new Error("ORS_API_KEY is missing from environment variables");
  }

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error("At least two coordinates are required");
  }

  // ORS expects coordinates in [longitude, latitude] order
  const locations = coordinates.map(({ latitude, longitude }) => {
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
        destinations: locations.map((_, index) => index).slice(1),
      }),
    }
  );

  const data = await response.json();

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
