
import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },

    units: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },

    // Number of units mutually confirmed by donor and requester
    confirmedUnits: {
      type: Number,
      default: 0,
      min: 0,
    },

    hospital: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    neededAt: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    urgency: {
      type: String,
      enum: ["normal", "urgent", "emergency"],
      default: "normal",
    },

    status: {
      type: String,
      enum: ["active", "fulfilled", "cancelled", "expired"],
      default: "active",
    },

    // Automatic donor search settings
    currentRadiusKm: {
      type: Number,
      default: 5,
      min: 5,
      max: 20,
    },

    maxRadiusKm: {
      type: Number,
      default: 20,
      min: 5,
      max: 20,
    },

    // Background scheduler timestamps
    searchStartedAt: {
      type: Date,
      default: null,
    },

    nextRadiusExpansionAt: {
      type: Date,
      default: null,
    },

    nextDonorNotificationAt: {
      type: Date,
      default: null,
    },

    // Controls automatic search lifecycle
    searchStatus: {
      type: String,
      enum: ["running", "completed", "stopped"],
      default: "running",
    },

    searchStopReason: {
      type: String,
      enum: [
        "units_fulfilled",
        "request_cancelled",
        "request_expired",
        "manually_stopped",
        null,
      ],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate remaining units automatically
bloodRequestSchema.virtual("remainingUnits").get(function () {
  return Math.max(0, this.units - this.confirmedUnits);
});

// Include virtual fields in JSON responses
bloodRequestSchema.set("toJSON", { virtuals: true });
bloodRequestSchema.set("toObject", { virtuals: true });

bloodRequestSchema.index({
  status: 1,
  searchStatus: 1,
  nextRadiusExpansionAt: 1,
});

bloodRequestSchema.index({
  status: 1,
  searchStatus: 1,
  nextDonorNotificationAt: 1,
});

const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);

export default BloodRequest;
