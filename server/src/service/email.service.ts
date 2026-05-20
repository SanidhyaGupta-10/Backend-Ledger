import nodemailer from "nodemailer";
import dotenv from "dotenv";
import template from "../utils/template.utils.js";
import { transactionTemplate } from "../utils/transaction.success.utils.js";
import { transactionFailureTemplate } from "../utils/transaction.failure.template.js";
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
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Function to send email
export const sendEmail = async (to: string, subject: string, text: string, html: string) => {
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
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

async function sendRegistrationEmail(
    userEmail: string,
    name: string,
) {
    const { subject, text, html } = template(name);

    await sendEmail(userEmail, subject, text, html);
    console.log(
        userEmail
    )
};

async function sendTransactionEmail(
    userEmail: string,
    name: string,
    amount: number,
    toAccount: string
) {
    // Calling the template with all arguments
    const { subject, text, html } = transactionTemplate(name, amount, toAccount);

    try {
        await sendEmail(userEmail, subject, text, html);
        console.log(`Email sent successfully to: ${userEmail}`);
    } catch (error) {
        console.error(`Failed to send email to ${userEmail}:`, error);
    }
};

async function sendFailureEmail(
    userEmail: string,
    name: string,
    amount: number,
    toAccount: string
) {
    const { subject, text, html } = transactionFailureTemplate(name, amount, toAccount);

    try {
        await sendEmail(userEmail, subject, text, html);
        console.log(`Failure notification sent to: ${userEmail}`);
    } catch (error) {
        console.error(`Email error:`, error);
    }
};


export {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendFailureEmail
};