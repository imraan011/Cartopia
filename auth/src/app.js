import cookieParser from "cookie-parser";
import express from "express";
import authRouter from "./routes/auth.routes.js";

export const app = express();

app.use(express.json());
app.use(cookieParser());

// sab auth routes /auth prefix ke saath mount karo
app.use("/api/auth", authRouter);
