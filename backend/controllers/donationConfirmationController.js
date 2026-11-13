
import mongoose from "mongoose";
import DonationConfirmation from "../models/DonationConfirmation.js";
import DonorNotification from "../models/DonorNotification.js";
import Chat from "../models/Chat.js";
import BloodRequest from "../models/BloodRequest.js";

export const submitDonationConfirmation = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { chatId } = req.params;
    const { response } = req.body;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID",
      });
    }

    if (!["yes", "no"].includes(response)) {
      return res.status(400).json({
        success: false,
        message: "Response must be yes or no",
      });
    }

    let result;

    await session.withTransaction(async () => {
      const chat = await Chat.findOne({
        _id: chatId,
        participants: req.user._id,
      }).session(session);

      if (!chat) {
        throw Object.assign(new Error("Chat not found"), {
          statusCode: 404,
        });
      }

      if (chat.status !== "active") {
        throw Object.assign(new Error("This chat is no longer active"), {
          statusCode: 400,
        });
      }

      const confirmation = await DonationConfirmation.findOne({
        chat: chat._id,
      }).session(session);

      if (!confirmation) {
        throw Object.assign(
          new Error("Donation confirmation not found"),
          { statusCode: 404 }
        );
      }

      if (confirmation.status !== "pending") {
        throw Object.assign(
          new Error(`Confirmation is already ${confirmation.status}`),
          { statusCode: 400 }
        );
      }

      const isDonor =
        confirmation.donor.toString() === req.user._id.toString();

      const isRequester =
        confirmation.requester.toString() === req.user._id.toString();

      if (!isDonor && !isRequester) {
        throw Object.assign(
          new Error("You are not authorized to confirm this donation"),
          { statusCode: 403 }
        );
      }

      if (isDonor) {
        if (confirmation.donorConfirmation !== "pending") {
          throw Object.assign(
            new Error("You have already submitted your confirmation"),
            { statusCode: 400 }
          );
        }

        confirmation.donorConfirmation = response;
        confirmation.donorConfirmedAt = new Date();
      }

      if (isRequester) {
        if (confirmation.requesterConfirmation !== "pending") {
          throw Object.assign(
            new Error("You have already submitted your confirmation"),
            { statusCode: 400 }
          );
        }

        confirmation.requesterConfirmation = response;
        confirmation.requesterConfirmedAt = new Date();
      }

      if (response === "no") {
        confirmation.status = "declined";
        await confirmation.save({ session });

        await DonorNotification.findByIdAndUpdate(
          confirmation.donorNotification,
          {
            $set: {
              status: "declined",
              donorConfirmation: confirmation.donorConfirmation,
              donorConfirmedAt: confirmation.donorConfirmedAt,
              requesterConfirmation: confirmation.requesterConfirmation,
              requesterConfirmedAt: confirmation.requesterConfirmedAt,
            },
          },
          { session }
        );

        chat.status = "ended";
        chat.endedAt = new Date();
        await chat.save({ session });

        result = {
          message: "Donation confirmation declined",
          confirmation,
        };

        return;
      }

      if (
        confirmation.donorConfirmation === "yes" &&
        confirmation.requesterConfirmation === "yes"
      ) {
        const updatedRequest = await BloodRequest.findOneAndUpdate(
          {
            _id: confirmation.bloodRequest,
            status: "active",
            $expr: {
              $lt: ["$confirmedUnits", "$units"],
            },
          },
          {
            $inc: {
              confirmedUnits: 1,
            },
          },
          {
            new: true,
            session,
          }
        );

        if (!updatedRequest) {
          throw Object.assign(
            new Error("No remaining units are available for confirmation"),
            { statusCode: 409 }
          );
        }

        confirmation.status = "confirmed";
        confirmation.confirmedAt = new Date();

        await confirmation.save({ session });

        await DonorNotification.findByIdAndUpdate(
          confirmation.donorNotification,
          {
            $set: {
              status: "confirmed",
              donorConfirmation: "yes",
              requesterConfirmation: "yes",
              donorConfirmedAt: confirmation.donorConfirmedAt,
              requesterConfirmedAt: confirmation.requesterConfirmedAt,
              confirmedAt: confirmation.confirmedAt,
            },
          },
          { session }
        );

        chat.status = "ended";
        chat.endedAt = new Date();
        await chat.save({ session });

        let searchStopped = false;

        if (updatedRequest.confirmedUnits >= updatedRequest.units) {
          updatedRequest.status = "fulfilled";
          updatedRequest.searchStatus = "completed";
          updatedRequest.searchStopReason = "units_fulfilled";
          updatedRequest.nextRadiusExpansionAt = null;
          updatedRequest.nextDonorNotificationAt = null;

          await updatedRequest.save({ session });

          searchStopped = true;
        }

        result = {
          message: "Donation successfully confirmed",
          confirmation,
          confirmedUnits: updatedRequest.confirmedUnits,
          remainingUnits: Math.max(
            0,
            updatedRequest.units - updatedRequest.confirmedUnits
          ),
          searchStopped,
        };

        return;
      }

      await confirmation.save({ session });

      await DonorNotification.findByIdAndUpdate(
        confirmation.donorNotification,
        {
          $set: {
            status: "awaiting_confirmation",
            donorConfirmation: confirmation.donorConfirmation,
            donorConfirmedAt: confirmation.donorConfirmedAt,
            requesterConfirmation: confirmation.requesterConfirmation,
            requesterConfirmedAt: confirmation.requesterConfirmedAt,
          },
        },
        { session }
      );

      result = {
        message:
          "Your confirmation has been recorded. Waiting for the other participant.",
        confirmation,
      };
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Donation confirmation error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Server error while submitting donation confirmation",
    });
  } finally {
    await session.endSession();
  }
};
