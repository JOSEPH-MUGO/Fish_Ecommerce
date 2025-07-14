// server/routes/contact.js
const express = require("express");
const nodemailer = require("nodemailer");
const { validateContact } = require("../middleware/validation");

const router = express.Router();

// Email configuration
let transporter;
try {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
} catch (error) {
  console.error("Error creating SMTP transporter:", error);
}

router.post("/", validateContact, async (req, res) => {
  try {
    const { name, email, message, phone } = req.body;


    // email format
    const mailOptions = {
      from: `"FreshFish Contact" <${
        process.env.SMTP_FROM || process.env.SMTP_USER
      }>`,
      to: process.env.NOTIFICATION_EMAIL,
      subject: `New Contact Form Submission from customer ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p>Received at: ${new Date().toLocaleString()}</p>
      `,
      text: `New contact form submission:\n\nName: ${name}\nEmail: ${email}\n${
        phone ? `Phone: ${phone}\n` : ""
      }Message:\n${message}\n\nReceived at: ${new Date().toLocaleString()}`,
    };

    // 2. Send email
    if (!transporter) {
      throw new Error("SMTP transporter not initialized");
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    // 3. Send response
    res.json({
      message: `Thank you for your message! We will get back to you soon ${name}.`,
      success: true,
    });
  } catch (error) {
    console.error("Contact form error:", error);

    // More detailed error response for debugging
    res.status(500).json({
      message: "Error sending message. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
