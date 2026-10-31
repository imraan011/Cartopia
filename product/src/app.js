import cookieParser from "cookie-parser";
import express from "express";
import productsRouter from "./routes/products.routes.js";

export const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/products", productsRouter);
