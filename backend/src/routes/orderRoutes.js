import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Every order route requires a logged-in user.
router.use(requireAuth);

// POST /api/orders — validate cart items against database prices and stock.
router.post("/", async (req, res, next) => {
  try {
    const cartItems = req.body.items;
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const items = [];
    let total = 0;

    for (const cartItem of cartItems) {
      if (!mongoose.isValidObjectId(cartItem.productId)) {
        return res.status(400).json({ message: "Invalid product id" });
      }
      const quantity = Number(cartItem.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return res.status(400).json({ message: "Quantity must be between 1 and 99" });
      }
      const product = await Product.findById(cartItem.productId);
      if (!product) return res.status(404).json({ message: "A product no longer exists" });
      if (product.stock < quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }

      product.stock -= quantity;
      await product.save();
      items.push({ product: product._id, name: product.name, price: product.price, quantity });
      total += product.price * quantity;
    }

    const order = await Order.create({ user: req.user._id, items, total });
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) { next(error); }
});

// GET /api/orders/my — show only the current user's orders.
router.get("/my", async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) { next(error); }
});

export default router;
