import cron from "node-cron";
import BloodRequest from "../models/BloodRequest.js";

let isSchedulerStarted = false;

const expandBloodRequestRadius = async () => {
  const now = new Date();

  const requests = await BloodRequest.find({
    status: "active",
    searchStatus: "running",
    neededAt: { $gt: now },
    nextRadiusExpansionAt: { $lte: now },
    currentRadiusKm: { $lt: 20 },
  });

  for (const request of requests) {
    const newRadius = Math.min(
      request.currentRadiusKm + 5,
      request.maxRadiusKm
    );

    request.currentRadiusKm = newRadius;

    const interval =
      request.urgency === "emergency"
        ? 5 * 60 * 1000
        : 60 * 60 * 1000;

    request.nextRadiusExpansionAt =
      newRadius >= request.maxRadiusKm
        ? null
        : new Date(now.getTime() + interval);

    await request.save();

    console.log(
      `LifeLink: Request ${request._id} radius expanded to ${newRadius} km`
    );
  }
};

export const startBloodRequestScheduler = () => {
  if (isSchedulerStarted) return;

  isSchedulerStarted = true;

  cron.schedule("* * * * *", async () => {
    try {
      await expandBloodRequestRadius();

      console.log(
        "LifeLink scheduler running:",
        new Date().toISOString()
      );
    } catch (error) {
      console.error("Scheduler error:", error.message);
    }
  });

  console.log("LifeLink blood request scheduler started");
};