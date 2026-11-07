
import User from "../models/User.js";
import { getRouteMatrix } from "./openRouteService.js";

export const findMatchingDonors = async ({
  bloodGroup,
  requesterId,
  requesterCoordinates,
}) => {
  if (
    !requesterCoordinates ||
    typeof requesterCoordinates.latitude !== "number" ||
    typeof requesterCoordinates.longitude !== "number"
  ) {
    throw new Error("Requester location coordinates are required");
  }

  const eligibilityDate = new Date();
  eligibilityDate.setDate(eligibilityDate.getDate() - 90);

  const donors = await User.find({
    _id: { $ne: requesterId },
    role: "user",
    isActive: true,
    isAvailable: true,
    bloodGroup: bloodGroup,
    $or: [
      { lastDonationDate: null },
      { lastDonationDate: { $lte: eligibilityDate } },
    ],
    "coordinates.latitude": { $type: "number" },
    "coordinates.longitude": { $type: "number" },
  }).select("name bloodGroup location coordinates lastDonationDate");

  if (donors.length === 0) return [];

  const coordinates = [
    requesterCoordinates,
    ...donors.map((donor) => donor.coordinates),
  ];

  const routeData = await getRouteMatrix(coordinates);

  const matchedDonors = donors.map((donor, index) => {
    const distance = routeData.distances[index];
    const duration = routeData.durations[index];

    return {
      ...donor.toObject(),
      roadDistanceKm:
        distance !== null ? Number(distance.toFixed(2)) : null,
      estimatedTravelMinutes:
        duration !== null
          ? Number((duration / 60).toFixed(1))
          : null,
    };
  });

  matchedDonors.sort((a, b) => {
    if (a.roadDistanceKm === null) return 1;
    if (b.roadDistanceKm === null) return -1;
    return a.roadDistanceKm - b.roadDistanceKm;
  });

  return matchedDonors;
};
