import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireAdmin);

// Validate product fields before saving.
function validateProduct(body) {
  const price = Number(body.price);
  const stock = Number(body.stock ?? 20);
  if (!body.name?.trim()) return "Product name is required";
  if (!Number.isFinite(price) || price < 0) return "Price must be a non-negative number";
  if (!Number.isInteger(stock) || stock < 0) return "Stock must be a non-negative integer";
  return null;
}

// POST /api/admin/products — admin creates a product.
router.post("/products", async (req, res, next) => {
  try {
    const issue = validateProduct(req.body);
    if (issue) return res.status(400).json({ message: issue });
    const product = await Product.create({
      name: req.body.name.trim(), description: req.body.description || "",
      price: Number(req.body.price), image: req.body.image || "",
      category: req.body.category || "General", stock: Number(req.body.stock ?? 20),
    });
    res.status(201).json({ product });
  } catch (error) { next(error); }
});

// PUT /api/admin/products/:id — admin updates an existing product.
router.put("/products/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid product id" });
    const issue = validateProduct(req.body);
    if (issue) return res.status(400).json({ message: issue });
    const product = await Product.findByIdAndUpdate(req.params.id, {
      name: req.body.name.trim(), description: req.body.description || "",
      price: Number(req.body.price), image: req.body.image || "",
      category: req.body.category || "General", stock: Number(req.body.stock ?? 20),
    }, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (error) { next(error); }
});

// DELETE /api/admin/products/:id — admin removes a product.
router.delete("/products/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid product id" });
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) { next(error); }
});

export default router;
