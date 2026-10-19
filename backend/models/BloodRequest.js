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
  },
  {
    timestamps: true,
  }
);

const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);

export default BloodRequest;