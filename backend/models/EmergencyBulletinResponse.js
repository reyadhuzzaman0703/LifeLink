
import mongoose from "mongoose";

const emergencyBulletinResponseSchema = new mongoose.Schema(
  {
    bulletin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmergencyBulletin",
      required: true,
    },

    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },

    status: {
      type: String,
      enum: ["going_to_hospital", "arrived"],
      default: "going_to_hospital",
    },

    respondedAt: {
      type: Date,
      default: Date.now,
    },

    arrivedAt: {
      type: Date,
      default: null,
    },

    arrivalLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
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
          message: "Invalid arrival coordinates",
        },
      },
    },

    arrivalDistanceMeters: {
      type: Number,
      default: null,
      min: 0,
    },

    gpsAccuracyMeters: {
      type: Number,
      default: null,
      min: 0,
    },

    donationCountAwarded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

emergencyBulletinResponseSchema.index(
  {
    bulletin: 1,
    hospitalId: 1,
    donor: 1,
    bloodGroup: 1,
  },
  {
    unique: true,
  }
);

emergencyBulletinResponseSchema.index({
  bulletin: 1,
  hospitalId: 1,
  bloodGroup: 1,
  status: 1,
});

const EmergencyBulletinResponse = mongoose.model(
  "EmergencyBulletinResponse",
  emergencyBulletinResponseSchema
);

export default EmergencyBulletinResponse;
