import mongoose from "mongoose";

// A product is a sellable item shown on the storefront.
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 1000 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    category: { type: String, default: "General", trim: true },
    stock: { type: Number, default: 20, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
