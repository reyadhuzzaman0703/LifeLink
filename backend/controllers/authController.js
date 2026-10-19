
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, bloodGroup } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phone: normalizedPhone },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or phone number is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      bloodGroup: bloodGroup || null,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or phone number is already registered",
      });
    }

    console.error("Register error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// Login an existing user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account is inactive",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};


export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      bloodGroup: req.user.bloodGroup,
      role: req.user.role,
    },
  });
};


export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while changing password",
    });
  }
};



export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      bloodGroup,
      location,
      isAvailable,
    } = req.body;

    const allowedBloodGroups = [
      "A+", "A-", "B+", "B-",
      "AB+", "AB-", "O+", "O-",
    ];

    if (
      bloodGroup !== undefined &&
      bloodGroup !== null &&
      bloodGroup !== "" &&
      !allowedBloodGroups.includes(bloodGroup)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood group",
      });
    }

    const updates = {};

    // Update name
    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        name.trim().length < 2
      ) {
        return res.status(400).json({
          success: false,
          message: "Name must be at least 2 characters",
        });
      }

      updates.name = name.trim();
    }

    // Update phone
    if (phone !== undefined) {
      if (
        typeof phone !== "string" ||
        !phone.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid phone number is required",
        });
      }

      const normalizedPhone = phone.trim();

      const existingUser = await User.findOne({
        phone: normalizedPhone,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Phone number is already registered",
        });
      }

      updates.phone = normalizedPhone;
    }

    // Update blood group
    if (bloodGroup !== undefined) {
      updates.bloodGroup = bloodGroup || null;
    }

    // Update location
    if (location !== undefined) {
      if (typeof location !== "string") {
        return res.status(400).json({
          success: false,
          message: "Location must be a string",
        });
      }

      updates.location = location.trim();
    }

    // Update donor availability
    if (isAvailable !== undefined) {
      if (typeof isAvailable !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isAvailable must be true or false",
        });
      }

      updates.isAvailable = isAvailable;
    }

    // Prevent empty updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No profile fields provided for update",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        location: user.location,
        isAvailable: user.isAvailable,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

