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

async function listUsers() {
    try {
        console.log(`Connecting to database...`);
        await mongoose.connect(MONGODB_URI as string);
        console.log("Connected successfully!");

        const users = await userModel.find();
        console.log("\nRegistered Users in NexBank System:");
        console.log("====================================");
        if (users.length === 0) {
            console.log("No users found in database.");
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. Name: ${user.name} | Email: ${user.email} | System User: ${user.systemUser}`);
            });
        }
        console.log("====================================\n");

    } catch (error: any) {
        console.error("An error occurred:", error.message);
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed.");
    }
}

listUsers();
