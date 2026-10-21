
require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10kb" }));

// Allow only your configured website origins.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header can include local health checks.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed"));
  }
}));

// Basic protection against excessive requests.
app.use("/api/", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false
}));

// SMTP connection. Credentials stay on the server.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_APP_PASSWORD
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/send-appointment-email", async (req, res) => {
  try {
    const {
      ref, name, mobile, email,
      service, date, time, notes
    } = req.body || {};

    // Validate required fields on the server too.
    if (
      !ref || !name || !mobile ||
      !service || !date || !time
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required appointment fields."
      });
    }

    if (
      typeof ref !== "string" ||
      typeof name !== "string" ||
      typeof mobile !== "string" ||
      typeof service !== "string" ||
      typeof date !== "string" ||
      typeof time !== "string" ||
      (email != null && typeof email !== "string") ||
      (notes != null && typeof notes !== "string")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid field format."
      });
    }

    // Do not let the visitor choose the email recipient.
    await transporter.sendMail({
      from: `"Dental Appointment Website" <${process.env.SMTP_USER}>`,
      to: process.env.CLINIC_EMAIL,
      replyTo: process.env.CLINIC_EMAIL,
      subject: `New Appointment Request - ${ref}`,
      text: [
        "New dental appointment request",
        "",
        `Reference: ${ref}`,
        `Patient: ${name}`,
        `Mobile: ${mobile}`,
        `Email: ${email || "Not provided"}`,
        `Treatment: ${service}`,
        `Date: ${date}`,
        `Time: ${time}`,
        `Notes: ${notes || "None"}`
      ].join("\n")
    });

    return res.status(200).json({
      success: true,
      message: "Appointment notification accepted by the mail server.",
      reference: ref
    });

  } catch (error) {
    console.error("Appointment email error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Email notification failed."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Dental appointment API running on port ${PORT}`);
});

