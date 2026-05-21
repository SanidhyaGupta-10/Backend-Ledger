import mongoose from "mongoose";
import dotenv from "dotenv";
import userModel from "../models/user.model.js";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory path for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load dotenv
dotenv.config({ path: path.join(__dirname, "../../../.env") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not set in your .env file!");
    process.exit(1);
}

const emailArg = process.argv[2];

if (!emailArg) {
    console.log("Usage: npx tsx src/scripts/promote.ts <user-email>");
    process.exit(1);
}

async function promote() {
    try {
        console.log(`Connecting to database...`);
        await mongoose.connect(MONGODB_URI as string);
        console.log("Connected successfully!");

        const email = emailArg.trim().toLowerCase();
        console.log(`Finding user with email: ${email}...`);

        const user = await userModel.findOne({ email });

        if (!user) {
            console.error(`Error: User with email "${email}" not found in database.`);
            process.exit(1);
        }

        console.log(`Found User: ${user.name} (${user.email})`);
        console.log(`Current systemUser status: ${user.systemUser}`);

        if (user.systemUser) {
            console.log("User is already a system user.");
        } else {
            user.systemUser = true;
            await user.save();
            console.log("SUCCESS: User successfully promoted to System User status!");
        }
    } catch (error: any) {
        console.error("An error occurred during promotion:", error.message);
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed.");
    }
}

promote();
