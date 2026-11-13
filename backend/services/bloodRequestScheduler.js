import cron from "node-cron";
import BloodRequest from "../models/BloodRequest.js";
import { notifyNextDonor } from "./donorNotificationService.js";

let isSchedulerStarted = false;
let isSchedulerRunning = false;

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

const processDonorNotifications = async () => {
  const now = new Date();

  const requests = await BloodRequest.find({
    status: "active",
    searchStatus: "running",
    neededAt: { $gt: now },
    $expr: { $lt: ["$confirmedUnits", "$units"] },
    nextDonorNotificationAt: { $lte: now },
  });

  for (const request of requests) {
    try {
      const result = await notifyNextDonor(request._id);

      console.log(
        `LifeLink: Request ${request._id} notification result:`,
        result.message
      );
    } catch (error) {
      console.error(
        `LifeLink: Donor notification failed for ${request._id}:`,
        error.message
      );
    }
  }
};

export const startBloodRequestScheduler = () => {
  if (isSchedulerStarted) return;

  isSchedulerStarted = true;

  cron.schedule("* * * * *", async () => {
    if (isSchedulerRunning) return;

    isSchedulerRunning = true;

    try {
      await expandBloodRequestRadius();
      await processDonorNotifications();

      console.log(
        "LifeLink scheduler running:",
        new Date().toISOString()
      );
    } catch (error) {
      console.error("Scheduler error:", error.message);
    } finally {
      isSchedulerRunning = false;
    }
  });

  console.log("LifeLink blood request scheduler started");
};
