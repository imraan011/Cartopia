import mongoose from "mongoose";

export async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB Product Database");
        console.log();
    } catch (err) {
        console.error(err);
    }
}
