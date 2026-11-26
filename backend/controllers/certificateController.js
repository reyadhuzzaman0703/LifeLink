import PDFDocument from "pdfkit";
import User from "../models/User.js";

const C = {
  paper: "#FDFBF7",
  gold: "#B68D40",
  lightGold: "#D4AF37",
  burgundy: "#991B1B",
  burgundyDark: "#881313",
  ink: "#111827",
  body: "#374151",
  muted: "#6B6356",
  slate: "#64748B",
  paleRed: "#FEF2F2",
  paleGold: "#F7F0DF",
};

// Bangladesh timezone অনুযায়ী certificate issue date
const issueDate = () =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date());

// Text center করার helper
const centered = (doc, value, y, opts = {}) => {
  const {
    font = "Helvetica",
    size = 12,
    color = C.ink,
    x = 57,
    width = 480,
    ...extra
  } = opts;

  doc
    .font(font)
    .fontSize(size)
    .fillColor(color)
    .text(String(value), x, y, {
      width,
      align: "center",
      lineBreak: false,
      ...extra,
    });
};

// Certificate-এর burgundy corner design
const corner = (doc, x, y, hx, vy) => {
  doc
    .save()
    .strokeColor(C.burgundy)
    .lineWidth(2.2)
    .moveTo(x, y + vy * 24)
    .lineTo(x, y)
    .lineTo(x + hx * 24, y)
    .stroke()
    .restore();
};

// Gold LifeLink seal
const drawSeal = (doc, cx, cy) => {
  doc.save();

  doc.circle(cx, cy, 45).fill(C.lightGold);
  doc.circle(cx, cy, 39).fill(C.gold);

  doc
    .circle(cx, cy, 35)
    .lineWidth(1.2)
    .dash(2, { space: 2 })
    .stroke("#78350F");

  doc.undash();

  // Vector blood drop
  doc
    .moveTo(cx, cy - 18)
    .bezierCurveTo(
      cx - 5,
      cy - 8,
      cx - 12,
      cy - 1,
      cx - 12,
      cy + 7
    )
    .bezierCurveTo(
      cx - 12,
      cy + 17,
      cx - 5,
      cy + 22,
      cx,
      cy + 22
    )
    .bezierCurveTo(
      cx + 7,
      cy + 22,
      cx + 12,
      cy + 16,
      cx + 12,
      cy + 7
    )
    .bezierCurveTo(
      cx + 12,
      cy - 1,
      cx + 5,
      cy - 9,
      cx,
      cy - 18
    )
    .closePath()
    .fill(C.burgundy);

  doc
    .font("Helvetica-Bold")
    .fontSize(6.8)
    .fillColor("#451A03")
    .text("LIFELINK", cx - 28, cy + 25, {
      width: 56,
      align: "center",
    });

  doc.restore();
};

// Download donation certificate
export const downloadCertificate = async (req, res) => {
  try {
    // Donor information database থেকে নেওয়া হচ্ছে
    const donor = await User.findById(req.user._id).select(
      "name donationCount bloodGroup location"
    );

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor profile not found",
      });
    }

    const donationCount = Number(donor.donationCount || 0);

    // Minimum 1 confirmed donation required
    if (donationCount < 1) {
      return res.status(403).json({
        success: false,
        message:
          "Complete at least one confirmed blood donation to download your certificate",
      });
    }

    // Dynamic donor information
    const donorName = donor.name?.trim() || "LifeLink Donor";
    const bloodGroup = donor.bloodGroup || "Not specified";
    const location = donor.location?.trim() || "Not provided";

    // PDF document configuration
    const doc = new PDFDocument({
      size: "A4",
      layout: "portrait",
      margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      compress: true,
      info: {
        Title: "LifeLink Certificate of Appreciation",
        Author: "LifeLink",
        Subject: "Voluntary Blood Donation Recognition",
      },
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="LifeLink-Donation-Certificate.pdf"'
    );

    res.setHeader("Cache-Control", "private, no-store");

    doc.on("error", (error) => {
      console.error("Certificate PDF stream error:", error);

      if (!res.headersSent) {
        res.status(500).end();
      } else {
        res.destroy(error);
      }
    });

    doc.pipe(res);

    const W = doc.page.width;
    const H = doc.page.height;
    const cx = W / 2;

    // Ivory paper background
    doc.rect(0, 0, W, H).fill(C.paper);

    // Double gold frame
    doc
      .rect(34, 34, W - 68, H - 68)
      .lineWidth(3.2)
      .stroke(C.gold);

    doc
      .rect(43, 43, W - 86, H - 86)
      .lineWidth(1.1)
      .stroke(C.lightGold);

    doc
      .rect(58, 58, W - 116, H - 116)
      .lineWidth(0.6)
      .stroke("#E7D8B7");

    // Burgundy corner accents
    corner(doc, 68, 68, 1, 1);
    corner(doc, W - 68, 68, -1, 1);
    corner(doc, 68, H - 68, 1, -1);
    corner(doc, W - 68, H - 68, -1, -1);

    // Top award badge
    doc
      .roundedRect(cx - 124, 82, 248, 28, 14)
      .fillAndStroke(C.paleRed, "#FECACA");

    centered(doc, "LIFELINK HUMANITARIAN AWARD", 91, {
      font: "Helvetica-Bold",
      size: 9.2,
      color: C.burgundy,
      x: cx - 115,
      width: 230,
      characterSpacing: 1.3,
    });

    // Main title
    centered(doc, "CERTIFICATE OF APPRECIATION", 151, {
      font: "Helvetica-Bold",
      size: 23,
      color: "#8C6D38",
      characterSpacing: 0.8,
    });

    centered(doc, "IN HONOUR OF SELFLESS GENEROSITY", 184, {
      size: 9.4,
      color: C.muted,
      characterSpacing: 1.7,
    });

    // Title divider
    doc
      .moveTo(cx - 62, 220)
      .lineTo(cx + 62, 220)
      .lineWidth(2)
      .stroke(C.gold);

    // Recipient section
    centered(
      doc,
      "This Certificate is Proudly Awarded To",
      260,
      {
        font: "Times-Italic",
        size: 15,
        color: "#57534E",
      }
    );

    // Long donor name হলে font size automatically ছোট হবে
    let nameSize = 31;

    while (
      nameSize > 18 &&
      doc
        .font("Times-Bold")
        .fontSize(nameSize)
        .widthOfString(donorName) > 455
    ) {
      nameSize -= 1;
    }

    centered(doc, donorName, 291, {
      font: "Times-Bold",
      size: nameSize,
      width: 470,
      x: 62,
    });

    doc
      .moveTo(135, 337)
      .lineTo(W - 135, 337)
      .lineWidth(0.8)
      .stroke(C.gold);

    // Dynamic donation count and blood group
    doc
      .roundedRect(cx - 174, 360, 348, 38, 6)
      .fill(C.burgundyDark);

    centered(
      doc,
      `TOTAL BLOOD DONATED: ${donationCount} ${
        donationCount === 1 ? "TIME" : "TIMES"
      }   |   BLOOD GROUP: ${bloodGroup}`,
      373,
      {
        font: "Helvetica-Bold",
        size: 9.3,
        color: "#FFFFFF",
        x: cx - 165,
        width: 330,
      }
    );

    // Appreciation paragraph 1
    const px = (W - 445) / 2;

    doc
      .font("Helvetica")
      .fontSize(11.2)
      .fillColor(C.body)
      .text(
        "In recognition of your remarkable generosity, compassion, and unwavering dedication to the gift of life.",
        px,
        444,
        {
          width: 445,
          align: "center",
          lineGap: 4,
        }
      );

    // Appreciation paragraph 2
    doc
      .font("Helvetica")
      .fontSize(11.2)
      .fillColor(C.body)
      .text(
        "Through your selfless contributions, you have offered more than blood - you have offered hope, strengthened the bonds of humanity, and given others the precious opportunity to live another day.",
        px,
        493,
        {
          width: 445,
          align: "center",
          lineGap: 4,
        }
      );

    // Appreciation paragraph 3
    doc
      .font("Helvetica")
      .fontSize(11.2)
      .fillColor(C.body)
      .text(
        "May your kindness continue to inspire, your generosity leave a lasting legacy, and your humanity shine through every life you touch.",
        px,
        560,
        {
          width: 445,
          align: "center",
          lineGap: 4,
        }
      );

    // Closing line
    centered(
      doc,
      "Thank you for being a reason someone may have another tomorrow.",
      626,
      {
        font: "Times-Italic",
        size: 12.2,
        color: C.burgundy,
      }
    );

    // Footer separator
    doc
      .moveTo(82, 674)
      .lineTo(W - 82, 674)
      .dash(2, { space: 3 })
      .lineWidth(0.8)
      .stroke("#D8C49B");

    doc.undash();

    // Left footer: dynamic location and date
    doc
      .roundedRect(75, 690, 158, 82, 5)
      .fill(C.paleGold);

    doc.rect(75, 690, 3, 82).fill(C.gold);

    doc
      .font("Helvetica")
      .fontSize(8.2)
      .fillColor(C.muted)
      .text("Donor Location", 87, 701, {
        width: 135,
      });

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(C.ink)
      .text(location, 87, 714, {
        width: 135,
        height: 22,
        ellipsis: true,
      });

    doc
      .font("Helvetica")
      .fontSize(8.2)
      .fillColor(C.muted)
      .text("Date of Issue", 87, 741, {
        width: 135,
      });

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(C.ink)
      .text(issueDate(), 87, 754, {
        width: 135,
      });

    // Center decorative seal
    drawSeal(doc, cx, 731);

    // Right footer: signature
    const sx = W - 235;

    doc
      .font("Times-Italic")
      .fontSize(18)
      .fillColor("#010103")
      .text("Reyadh", sx, 696, {
        width: 160,
        align: "center",
        lineBreak: false,
      });

    doc
      .moveTo(sx + 5, 725)
      .lineTo(sx + 155, 725)
      .lineWidth(0.7)
      .stroke(C.slate);

    doc
      .font("Helvetica-Bold")
      .fontSize(9.4)
      .fillColor(C.ink)
      .text("Md. Reyadhuzzaman", sx, 740, {
        width: 160,
        align: "center",
      });

    doc
      .font("Helvetica")
      .fontSize(8.2)
      .fillColor(C.slate)
      .text("CEO and Founder of", sx - 4, 755, {
        width: 168,
        align: "center",
      });

    doc
      .font("Helvetica")
      .fontSize(8.2)
      .fillColor(C.slate)
      .text("LifeLink", sx, 768, {
        width: 160,
        align: "center",
      });

    // Bottom tagline
    centered(
      doc,
      "Every Drop Carries a Story. Every Donor Makes a Difference.",
      786,
      {
        font: "Helvetica-Bold",
        size: 9.2,
        color: C.ink,
        characterSpacing: 0.15,
      }
    );

    // Finish PDF generation
    doc.end();
  } catch (error) {
    console.error("Download certificate error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate donation certificate",
    });
  }
};