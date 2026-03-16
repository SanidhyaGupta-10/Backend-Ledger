import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error("Please provide MONGODB_URI in the environment variables");
}
export function connectToDB() {
    mongoose.connect(MONGODB_URI)
        .then(() => {
        console.log("server is connected to DB");
    })
        .catch(err => {
        console.log("Error connecting to DB");
        process.exit(1);
    });
}
