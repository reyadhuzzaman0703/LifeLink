
import crypto from "crypto";
import sendEmail from "./sendEmail.js";

const createEmailVerification = async (user) => {
  // Generate a secure random token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Store only the hashed token
  user.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // Token expires after 30 minutes
  user.emailVerificationExpires = Date.now() + 30 * 60 * 1000;

  await user.save();

  const verificationLink =
    `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #f5f5f5;">
      <div style="background: #ffffff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #dc2626;">Welcome to LifeLink ❤️</h2>

        <p>Hello ${user.name},</p>

        <p>
          Thank you for joining LifeLink.
          Please verify your email address to activate your account.
        </p>

        <a
          href="${verificationLink}"
          style="display: inline-block; padding: 14px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 8px;"
        >
          Verify Email
        </a>

        <p style="margin-top: 25px; color: #666;">
          This link will expire in 30 minutes.
        </p>

        <p style="color: #999; font-size: 13px;">
          If you did not create a LifeLink account, you can ignore this email.
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: "Verify Your LifeLink Account",
    html,
  });
};

export default createEmailVerification;
