
import User from "../models/User.js";
import { getRouteMatrix } from "./openRouteService.js";

export const findMatchingDonors = async ({
  bloodGroup,
  requesterId,
  requesterLocationPoint,
}) => {
  if (
    !requesterLocationPoint ||
    requesterLocationPoint.type !== "Point" ||
    !Array.isArray(requesterLocationPoint.coordinates) ||
    requesterLocationPoint.coordinates.length !== 2
  ) {
    throw new Error("Requester location point is required");
  }

  const [requesterLongitude, requesterLatitude] =
    requesterLocationPoint.coordinates;

  if (
    !Number.isFinite(requesterLongitude) ||
    !Number.isFinite(requesterLatitude)
  ) {
    throw new Error("Invalid requester location coordinates");
  }

  const eligibilityDate = new Date();
  eligibilityDate.setDate(eligibilityDate.getDate() - 90);

  const donors = await User.find({
    _id: { $ne: requesterId },
    role: "user",
    isActive: true,
    isAvailable: true,
    bloodGroup,
    $or: [
      { lastDonationDate: null },
      { lastDonationDate: { $lte: eligibilityDate } },
    ],
    locationPoint: {
      $near: {
        $geometry: requesterLocationPoint,
        $maxDistance: 30000,
      },
    },
  }).select("name bloodGroup location locationPoint lastDonationDate");

  if (donors.length === 0) return [];

  const coordinates = [
    {
      latitude: requesterLatitude,
      longitude: requesterLongitude,
    },
    ...donors.map((donor) => ({
      longitude: donor.locationPoint.coordinates[0],
      latitude: donor.locationPoint.coordinates[1],
    })),
  ];

  const routeData = await getRouteMatrix(coordinates);

  const matchedDonors = donors.map((donor, index) => {
    const distance = routeData.distances[index];
    const duration = routeData.durations[index];

    return {
      _id: donor._id,
      name: donor.name,
      bloodGroup: donor.bloodGroup,
      location: donor.location,
      lastDonationDate: donor.lastDonationDate,
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
