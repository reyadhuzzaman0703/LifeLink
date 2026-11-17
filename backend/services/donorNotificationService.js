
import BloodRequest from "../models/BloodRequest.js";
import DonorNotification from "../models/DonorNotification.js";
import User from "../models/User.js";
import { findMatchingDonors } from "./donorMatchingService.js";

export const notifyNextDonor = async (bloodRequestId) => {
  const now = new Date();

  const bloodRequest = await BloodRequest.findOne({
    _id: bloodRequestId,
    status: "active",
    searchStatus: "running",
    neededAt: { $gt: now },
  });

  if (!bloodRequest) {
    return {
      success: false,
      message: "Active blood request not found",
    };
  }

  if (bloodRequest.confirmedUnits >= bloodRequest.units) {
    return {
      success: false,
      message: "Required blood units already fulfilled",
    };
  }

  const requester = await User.findById(bloodRequest.requester)
    .select("locationPoint");

  if (
    !requester?.locationPoint ||
    requester.locationPoint.type !== "Point" ||
    !Array.isArray(requester.locationPoint.coordinates) ||
    requester.locationPoint.coordinates.length !== 2
  ) {
    return {
      success: false,
      message: "Requester location point is missing",
    };
  }

  const matchingDonors = await findMatchingDonors({
    bloodGroup: bloodRequest.bloodGroup,
    requesterId: bloodRequest.requester,
    requesterLocationPoint: requester.locationPoint,
  });

  const notifiedRecords = await DonorNotification.find({
    bloodRequest: bloodRequest._id,
  }).select("donor");

  const notifiedDonorIds = new Set(
    notifiedRecords.map((record) => record.donor.toString())
  );

  const nextDonor = matchingDonors.find(
    (donor) =>
      donor.roadDistanceKm !== null &&
      donor.roadDistanceKm <= bloodRequest.currentRadiusKm &&
      !notifiedDonorIds.has(donor._id.toString())
  );

  if (!nextDonor) {
    const retryInterval =
      bloodRequest.urgency === "emergency"
        ? 5 * 60 * 1000
        : 60 * 60 * 1000;
  
    bloodRequest.nextDonorNotificationAt = new Date(
      now.getTime() + retryInterval
    );
  
    await bloodRequest.save();
  
    return {
      success: false,
      message: "No new eligible donor found. Retry scheduled.",
    };
  }

  const notification = await DonorNotification.create({
    bloodRequest: bloodRequest._id,
    donor: nextDonor._id,
    requester: bloodRequest.requester,
    status: "notified",
  });

  const notificationInterval =
    bloodRequest.urgency === "emergency"
      ? 5 * 60 * 1000
      : 4 * 60 * 60 * 1000;

  bloodRequest.nextDonorNotificationAt = new Date(
    now.getTime() + notificationInterval
  );

  await bloodRequest.save();

  return {
    success: true,
    message: "Donor notification record created successfully",
    notification,
    donor: {
      id: nextDonor._id,
      name: nextDonor.name,
      bloodGroup: nextDonor.bloodGroup,
      roadDistanceKm: nextDonor.roadDistanceKm,
      estimatedTravelMinutes: nextDonor.estimatedTravelMinutes,
    },
  };
};
