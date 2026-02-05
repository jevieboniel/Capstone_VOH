    require("dotenv").config();
    const nodemailer = require("nodemailer");

    async function sendTestEmail() {
    try {
        const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // App Password
        },
        });

        const info = await transporter.sendMail({
        from: `"VOH Alerts" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // send to yourself
        subject: "Test Email from VOH",
        text: "If you received this, Gmail App Password works! 🎉",
        });

        console.log("✅ Email sent successfully!");
        console.log("Message ID:", info.messageId);
    } catch (error) {
        console.error("❌ Email failed:", error);
    }
    }

    sendTestEmail();
