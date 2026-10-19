// Load environment variables from .env before reading process.env.
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Allow the local React app and the deployed frontend to call this API.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins, credentials: false }));
// Parse incoming JSON request bodies.
app.use(express.json());

// Simple route used by the browser and deployment platform to check server health.
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "ShopLite API is running" });
});

// Keep API routes separated by responsibility.
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Return a consistent response for routes that do not exist.
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

// Central error handler avoids exposing stack traces to clients.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// Connect to MongoDB first, then start accepting requests.
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`ShopLite API listening on ${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
