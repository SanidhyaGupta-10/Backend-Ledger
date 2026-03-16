import nodemailer from "nodemailer";
import dotenv from "dotenv";
import template from "../utils/template.utils.js";
dotenv.config();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});
// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    }
    else {
        console.log('Email server is ready to send messages');
    }
});
// Function to send email
export const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Backend-Ledger" <${process.env.EMAIL_USER}>`, // sender address
            to,
            subject, // Subject line
            text, // plain text body
            html, // html body
        });
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    catch (error) {
        console.error('Error sending email:', error);
    }
};
async function sendRegistrationEmail(userEmail, name) {
    const { subject, text, html } = template(name);
    await sendEmail(userEmail, subject, text, html);
    console.log(userEmail);
}
export { sendRegistrationEmail };
