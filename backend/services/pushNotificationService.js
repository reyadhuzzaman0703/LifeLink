import User from "../models/User.js";
import { firebaseMessaging } from "../config/firebaseAdmin.js";

const BATCH_SIZE = 500;

export const sendPushNotification = async (
  userId,
  { title, body, data = {} }
) => {
  try {
    if (!userId || !title || !body) {
      throw new Error("User ID, title and body are required");
    }

    const user = await User.findById(userId).select("+fcmTokens");

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const tokens = user.fcmTokens || [];

    if (tokens.length === 0) {
      return {
        success: false,
        message: "No registered FCM tokens found",
      };
    }

    const notificationData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, String(value)])
    );

    let successCount = 0;
    let failureCount = 0;
    const invalidTokens = [];

    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      const tokenBatch = tokens.slice(i, i + BATCH_SIZE);

      const response = await firebaseMessaging.sendEachForMulticast({
        tokens: tokenBatch,
        notification: {
          title,
          body,
        },
        data: notificationData,
      });

      successCount += response.successCount;
      failureCount += response.failureCount;

      response.responses.forEach((result, index) => {
        if (
          !result.success &&
          [
            "messaging/invalid-registration-token",
            "messaging/registration-token-not-registered",
          ].includes(result.error?.code)
        ) {
          invalidTokens.push(tokenBatch[index]);
        }
      });
    }

    if (invalidTokens.length > 0) {
      await User.updateOne(
        { _id: userId },
        {
          $pull: {
            fcmTokens: {
              $in: invalidTokens,
            },
          },
        }
      );
    }

    return {
      success: successCount > 0,
      successCount,
      failureCount,
      invalidTokenCount: invalidTokens.length,
      message: "Push notification sending completed",
    };
  } catch (error) {
    console.error("Push notification error:", error.message);
    throw error;
  }
};