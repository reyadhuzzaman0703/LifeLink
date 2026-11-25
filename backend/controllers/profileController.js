import DonationConfirmation from "../models/DonationConfirmation.js";
import BloodRequest from "../models/BloodRequest.js";

export const getDonationHistory = async (req, res) => {
  try {
    const donations = await DonationConfirmation.find({
      donor: req.user._id,
      status: "confirmed",
    })
      .populate("requester", "name bloodGroup")
      .populate(
        "bloodRequest",
        "bloodGroup hospital location units"
      )
      .sort({ confirmedAt: -1 });

    return res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.error("Get donation history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching donation history",
    });
  }
};

export const getRequestHistory = async (req, res) => {
  try {
    const requests = await BloodRequest.find({
      requester: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get request history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching request history",
    });
  }
};
