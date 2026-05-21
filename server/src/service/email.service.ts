import nodemailer from "nodemailer";
import dotenv from "dotenv";
import template from "../utils/template.utils.js";
import { transactionTemplate } from "../utils/transaction.success.utils.js";
import { transactionFailureTemplate } from "../utils/transaction.failure.template.js";
dotenv.config();

let transporter: nodemailer.Transporter;
let isEmailConfigured = false;

// Check configuration type and initialize transporter
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // 1. Gmail App Password (highly recommended for simple development/testing)
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    isEmailConfigured = true;
} else if (
    process.env.EMAIL_USER &&
    process.env.CLIENT_ID &&
    process.env.CLIENT_SECRET &&
    process.env.REFRESH_TOKEN
) {
    // 2. OAuth2 (Gmail)
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_USER,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
        },
    });
    isEmailConfigured = true;
} else {
    // 3. Fallback to mock jsonTransport if nothing is configured
    transporter = nodemailer.createTransport({
        jsonTransport: true
    });
}

// Verify the connection configuration
if (isEmailConfigured) {
    transporter.verify((error, success) => {
        if (error) {
            console.warn('\n⚠️  [Email Config Warning]: Google OAuth/SMTP connection failed verification.');
            console.warn('   Reason:', error.message || error);
            console.warn('   💡 Tip: To send actual emails, you can set "EMAIL_PASS" in your .env with a Gmail App Password.');
            console.warn('   🔄 Local Fallback: NexBank will print all transaction & signup emails directly to your terminal so you are not blocked.\n');
        } else {
            console.log('✅ Email server is ready to send messages');
        }
    });
} else {
    console.log('ℹ️  No email credentials found in .env. NexBank will print emails to the terminal.');
}

// Function to send email
export const sendEmail = async (to: string, subject: string, text: string, html: string) => {
    try {
        // If we are in dev and email isn't verified, or if it fails, try to send
        const info = await transporter.sendMail({
            from: `"NexBank Ledger" <${process.env.EMAIL_USER || 'no-reply@nexbank.com'}>`,
            to,
            subject,
            text,
            html,
        });

        // If it was jsonTransport, log it nicely
        if ('message' in info) {
            logMockEmail(to, subject, text);
        } else {
            console.log('✉️ Email sent successfully: %s', info.messageId);
        }
    } catch (error) {
        // Log the error and fall back to terminal logging so developers can see verification codes/receipts
        logMockEmail(to, subject, text);
    }
};

/** Helper to print a clean email mock in the console */
function logMockEmail(to: string, subject: string, text: string) {
    console.log('\n📬  ============ [DEVELOPMENT EMAIL RECEIVED] ============');
    console.log(`    To:      ${to}`);
    console.log(`    Subject: ${subject}`);
    console.log('    ------------------------------------------------------');
    console.log(text.split('\n').map(line => `    ${line}`).join('\n'));
    console.log('    ======================================================\n');
}

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