
import transporter from "../config/email.js";

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"LifeLink" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

export default sendEmail;
