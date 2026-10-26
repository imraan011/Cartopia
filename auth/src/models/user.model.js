import { Mongoose } from "mongoose";
const addressSchema = new Mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true },
});

const userSchema = new Mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    fullname: {
        firstname: { type: String, required: true },
        lastname: { type: String, required: true },
    },
    roles: { type: String, enum: ["USER", "SELLER"], default: "USER" },
    addresses: [addressSchema],
});

export const userModel = Mongoose.model("User", userSchema);
