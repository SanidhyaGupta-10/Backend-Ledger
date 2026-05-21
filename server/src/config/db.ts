import mongoose from "mongoose";

/**
 * 🔗 Database Configuration
 * Load absolute URI for Mongoose connection.
 */
const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error("Please provide MONGODB_URI in the environment variables");
}

/**
 * ⚡ Initialize Mongoose Database Connection
 * Sets up global promise handling and lifecycle events.
 */
export function connectToDB() {
    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log("❇️  [Database] Connected successfully to Mongoose DB Server");
        })
        .catch(err => {
            console.error("❌ [Database] Connection Failure:", err.message);
            process.exit(1);
        });
}



