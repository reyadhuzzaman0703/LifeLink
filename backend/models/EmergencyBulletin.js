
import mongoose from "mongoose";

const hospitalLocationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (value) {
          return (
            value.length === 2 &&
            Number.isFinite(value[0]) &&
            Number.isFinite(value[1]) &&
            value[0] >= -180 &&
            value[0] <= 180 &&
            value[1] >= -90 &&
            value[1] <= 90
          );
        },
        message: "Invalid hospital coordinates",
      },
    },
  },
  { _id: false }
);

const bloodRequirementSchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    requiredUnits: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: false }
);

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    locationPoint: {
      type: hospitalLocationSchema,
      required: true,
    },
    bloodRequirements: {
      type: [bloodRequirementSchema],
      required: true,
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: "At least one blood requirement is required",
      },
    },
  },
  { timestamps: true }
);

const emergencyBulletinSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
    injuredCount: {
      type: Number,
      required: true,
      min: 0,
    },
    hospitals: {
      type: [hospitalSchema],
      required: true,
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: "At least one hospital is required",
      },
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    notificationRoundsSent: {
      type: Number,
      default: 0,
      min: 0,
      max: 4,
    },
    nextNotificationAt: {
      type: Date,
      default: Date.now,
    },
    lastNotificationAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const EmergencyBulletin = mongoose.model(
  "EmergencyBulletin",
  emergencyBulletinSchema
);

export default EmergencyBulletin;
