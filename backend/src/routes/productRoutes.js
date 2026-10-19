import { Router } from "express";
import Product from "../models/Product.js";

const router = Router();

// GET /api/products?search=... — list products and optionally filter by name/category.
router.get("/", async (req, res, next) => {
  try {
    const search = req.query.search?.trim();
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: "i" } }, { category: { $regex: search, $options: "i" } }] }
      : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) { next(error); }
});

// GET /api/products/:id — return one product.
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (error) { next(error); }
});

export default router;
