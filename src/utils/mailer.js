    require("dotenv").config();
    const nodemailer = require("nodemailer");

    const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
    const EMAIL_PASS = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

    if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn("⚠️ EMAIL_USER / EMAIL_PASS missing in .env");
    }

    const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    async function sendEmail({ to, subject, text, html }) {
    if (!to) throw new Error("Missing recipient email (to)");

    return transporter.sendMail({
        from: `"VOH Alerts" <${EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
    });
    }

    module.exports = { sendEmail, transporter };
