
import User from "../models/User.js";

const BULLETIN_RADIUS_METERS = 20000;

export const findEmergencyBulletinDonors = async ({
  bloodGroup,
  hospitalLocationPoint,
  excludeDonorIds = [],
}) => {
  if (
    !bloodGroup ||
    !hospitalLocationPoint ||
    hospitalLocationPoint.type !== "Point" ||
    !Array.isArray(hospitalLocationPoint.coordinates) ||
    hospitalLocationPoint.coordinates.length !== 2
  ) {
    throw new Error("Valid blood group and hospital location are required");
  }

  const [longitude, latitude] = hospitalLocationPoint.coordinates;

  if (
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude) ||
    longitude < -180 ||
    longitude > 180 ||
    latitude < -90 ||
    latitude > 90
  ) {
    throw new Error("Invalid hospital coordinates");
  }

  const eligibilityDate = new Date();
  eligibilityDate.setDate(eligibilityDate.getDate() - 90);

  const donors = await User.find({
    role: "user",
    isActive: true,
    isAvailable: true,
    bloodGroup,
    _id: {
      $nin: excludeDonorIds,
    },
    $or: [
      { lastDonationDate: null },
      { lastDonationDate: { $lte: eligibilityDate } },
    ],
    locationPoint: {
      $near: {
        $geometry: hospitalLocationPoint,
        $maxDistance: BULLETIN_RADIUS_METERS,
      },
    },
  }).select("_id name bloodGroup location locationPoint");

  return donors;
};
