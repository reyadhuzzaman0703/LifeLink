
import cron from "node-cron";
import EmergencyBulletin from "../models/EmergencyBulletin.js";
import { sendEmergencyBulletinNotifications } from "./emergencyBulletinNotificationService.js";

let isSchedulerStarted = false;
let isSchedulerRunning = false;

const ONE_HOUR = 60 * 60 * 1000;

const processEmergencyBulletins = async () => {
  const now = new Date();

  const bulletins = await EmergencyBulletin.find({
    status: "active",
    notificationRoundsSent: {
      $gte: 1,
      $lt: 4,
    },
    nextNotificationAt: {
      $lte: now,
    },
  });

  for (const bulletin of bulletins) {
    try {
      const result = await sendEmergencyBulletinNotifications(bulletin);

      const nextRound = bulletin.notificationRoundsSent + 1;

      const update = {
        $set: {
          notificationRoundsSent: nextRound,
          lastNotificationAt: now,
          nextNotificationAt:
            nextRound < 4
              ? new Date(now.getTime() + ONE_HOUR)
              : null,
        },
      };

      const updatedBulletin = await EmergencyBulletin.findOneAndUpdate(
        {
          _id: bulletin._id,
          status: "active",
          notificationRoundsSent: bulletin.notificationRoundsSent,
          nextNotificationAt: { $lte: now },
        },
        update,
        { new: true }
      );

      if (!updatedBulletin) {
        console.log(
          `Emergency Bulletin ${bulletin._id}: another process updated the notification round`
        );
        continue;
      }

      console.log(
        `Emergency Bulletin ${bulletin._id}: round ${nextRound}/4 completed`,
        {
          totalDonors: result.totalDonors,
          successfulNotifications: result.successfulNotifications,
          failedNotifications: result.failedNotifications,
        }
      );
    } catch (error) {
      console.error(
        `Emergency Bulletin scheduler failed for ${bulletin._id}:`,
        error.message
      );
    }
  }
};

export const startEmergencyBulletinScheduler = () => {
  if (isSchedulerStarted) return;

  isSchedulerStarted = true;

  cron.schedule("* * * * *", async () => {
    if (isSchedulerRunning) return;

    isSchedulerRunning = true;

    try {
      await processEmergencyBulletins();
    } catch (error) {
      console.error(
        "Emergency Bulletin scheduler error:",
        error.message
      );
    } finally {
      isSchedulerRunning = false;
    }
  });

  console.log("LifeLink Emergency Bulletin scheduler started");
};
