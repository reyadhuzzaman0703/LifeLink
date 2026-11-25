
import User from "../models/User.js";
import BloodRequest from "../models/BloodRequest.js";
import EmergencyBulletin from "../models/EmergencyBulletin.js";

export const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      totalDonors,
      availableDonors,
      totalBloodRequests,
      activeBloodRequests,
      fulfilledBloodRequests,
      cancelledBloodRequests,
      expiredBloodRequests,
      donationStats,
      requestStats,
      activeEmergencyBulletins,
      totalEmergencyBulletins,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),

      User.countDocuments({
        role: "user",
        isActive: true,
      }),

      User.countDocuments({
        role: "user",
        isActive: false,
      }),

      User.countDocuments({
        role: "user",
        bloodGroup: { $ne: null },
      }),

      User.countDocuments({
        role: "user",
        bloodGroup: { $ne: null },
        isActive: true,
        isAvailable: true,
      }),

      BloodRequest.countDocuments(),

      BloodRequest.countDocuments({ status: "active" }),

      BloodRequest.countDocuments({ status: "fulfilled" }),

      BloodRequest.countDocuments({ status: "cancelled" }),

      BloodRequest.countDocuments({ status: "expired" }),

      User.aggregate([
        {
          $match: { role: "user" },
        },
        {
          $group: {
            _id: null,
            totalDonations: { $sum: "$donationCount" },
          },
        },
      ]),

      BloodRequest.aggregate([
        {
          $group: {
            _id: null,
            totalRequestedUnits: { $sum: "$units" },
            totalConfirmedUnits: { $sum: "$confirmedUnits" },
          },
        },
      ]),

      EmergencyBulletin.countDocuments({ status: "active" }),

      EmergencyBulletin.countDocuments(),
    ]);

    const totalDonations =
      donationStats.length > 0
        ? donationStats[0].totalDonations
        : 0;

    const totalRequestedUnits =
      requestStats.length > 0
        ? requestStats[0].totalRequestedUnits
        : 0;

    const totalConfirmedUnits =
      requestStats.length > 0
        ? requestStats[0].totalConfirmedUnits
        : 0;

    return res.status(200).json({
      success: true,
      message: "Admin dashboard statistics retrieved successfully",

      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          blocked: blockedUsers,
        },

        donors: {
          total: totalDonors,
          available: availableDonors,
        },

        bloodRequests: {
          total: totalBloodRequests,
          active: activeBloodRequests,
          fulfilled: fulfilledBloodRequests,
          cancelled: cancelledBloodRequests,
          expired: expiredBloodRequests,
        },

        donations: {
          total: totalDonations,
        },

        bloodUnits: {
          requested: totalRequestedUnits,
          confirmed: totalConfirmedUnits,
          remaining: Math.max(
            0,
            totalRequestedUnits - totalConfirmedUnits
          ),
        },

        emergencyBulletins: {
          total: totalEmergencyBulletins,
          active: activeEmergencyBulletins,
        },
      },
    });
  } catch (error) {
    console.error("Admin dashboard statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve admin dashboard statistics",
    });
  }
};
