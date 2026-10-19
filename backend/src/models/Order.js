import mongoose from "mongoose";

// Store a snapshot of each purchased item so later product edits don't alter old orders.
const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
    }],
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"], default: "Placed" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
