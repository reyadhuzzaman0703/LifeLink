
import mongoose from "mongoose";
import User from "../models/User.js";

// Get all users with search, filters and pagination
export const getAllUsers = async (req, res) => {
  try {
    const {
      search = "",
      bloodGroup,
      isActive,
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.min(
      100,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    const filter = {
      role: "user",
    };

    if (search.trim()) {
      const safeSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
        { phone: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }

    if (isActive === "true") {
      filter.isActive = true;
    } else if (isActive === "false") {
      filter.isActive = false;
    }

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select(
          "name email phone bloodGroup location isAvailable lastDonationDate donationCount role isActive createdAt"
        )
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage),

      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users,
      pagination: {
        totalUsers,
        currentPage,
        totalPages: Math.ceil(totalUsers / perPage),
        limit: perPage,
      },
    });
  } catch (error) {
    console.error("Admin get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
    });
  }
};

// Block or unblock a user
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const user = await User.findOne({
      _id: id,
      role: "user",
    }).select(
      "name email phone bloodGroup isActive"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User unblocked successfully"
        : "User blocked successfully",
      user,
    });
  } catch (error) {
    console.error("Admin update user status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};
