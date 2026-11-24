
import { findEmergencyBulletinDonors } from "./emergencyBulletinMatchingService.js";
import { sendPushNotification } from "./pushNotificationService.js";

export const sendEmergencyBulletinNotifications = async (bulletin) => {
  if (!bulletin || !bulletin._id || !bulletin.hospitals?.length) {
    throw new Error("Valid emergency bulletin is required");
  }

  const donorNotifications = new Map();

  for (const hospital of bulletin.hospitals) {
    for (const requirement of hospital.bloodRequirements) {
      const donors = await findEmergencyBulletinDonors({
        bloodGroup: requirement.bloodGroup,
        hospitalLocationPoint: hospital.locationPoint,
      });

      for (const donor of donors) {
        const donorId = donor._id.toString();

        if (!donorNotifications.has(donorId)) {
          donorNotifications.set(donorId, {
            donorId: donor._id,
            hospitals: [],
          });
        }

        const donorData = donorNotifications.get(donorId);

        donorData.hospitals.push({
          hospitalId: hospital._id.toString(),
          hospitalName: hospital.name,
          bloodGroup: requirement.bloodGroup,
          requiredUnits: requirement.requiredUnits,
        });
      }
    }
  }

  const results = [];

  for (const [donorId, donorData] of donorNotifications) {
    try {
      const hospitalNames = [
        ...new Set(donorData.hospitals.map((item) => item.hospitalName)),
      ];

      const result = await sendPushNotification(donorData.donorId, {
        title: `Emergency: ${bulletin.title}`,
        body: `Blood urgently needed at ${hospitalNames.join(", ")}. Open LifeLink for details.`,
        data: {
          type: "emergency_bulletin",
          bulletinId: bulletin._id.toString(),
          matches: JSON.stringify(donorData.hospitals),
        },
      });

      results.push({
        donorId,
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      results.push({
        donorId,
        success: false,
        message: error.message,
      });

      console.error(
        `Emergency Bulletin push failed for donor ${donorId}:`,
        error.message
      );
    }
  }

  return {
    totalDonors: donorNotifications.size,
    successfulNotifications: results.filter((item) => item.success).length,
    failedNotifications: results.filter((item) => !item.success).length,
    results,
  };
};
