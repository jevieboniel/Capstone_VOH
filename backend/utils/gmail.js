    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Google App Password (NOT your gmail login password)
    },
    });

    async function sendEmail({ to, subject, html }) {
    return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    });
    }

    module.exports = { sendEmail };
