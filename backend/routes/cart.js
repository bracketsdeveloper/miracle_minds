// routes/cart.js
const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const User = require("../models/User");
const Therapist = require("../models/Therapist");
const { authenticate } = require("../middleware/authenticate");

// Add to Cart (not typically used if /book is doing it, but kept for reference)
router.post("/", authenticate, async (req, res) => {
  const { profileId, therapies, date, timeslot, therapist, mode } = req.body;
  const userId = req.user._id;

  try {
    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if profile is valid
    const isValidProfile = user.profiles.some(
      (p) => p._id.toString() === profileId
    );
    if (!isValidProfile) {
      return res.status(400).json({ message: "Invalid profile ID" });
    }

    // Check duplicates
    const existingItem = await Cart.findOne({
      userId,
      profileId,
      therapies,
      date,
      "timeslot.from": timeslot.from,
      "timeslot.to": timeslot.to,
    });
    if (existingItem) {
      return res.status(400).json({ message: "Item already exists in the cart" });
    }

    // Create cart item
    const cartItem = new Cart({
      userId,
      profileId,
      therapies,
      date,
      timeslot,
      therapist, // userId from the therapist doc
      mode: mode || "ONLINE",
    });
    await cartItem.save();
    res.status(201).json({ message: "Item added to cart successfully!" });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res
      .status(500)
      .json({ message: "Failed to add item to cart", error: error.message });
  }
});

// Get Cart Items
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    // basic cart items
    const cartItems = await Cart.find({ userId })
      .populate("therapies", "name cost")
      .lean();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // enhance with profile + therapist name
    const enhancedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        const profile = user.profiles.find(
          (pr) => pr._id.toString() === item.profileId
        );

        let therapistDetail = null;
        if (item.therapist) {
          therapistDetail = await Therapist.findOne({
            userId: item.therapist,
          }).select("name");
        }

        return {
          ...item,
          profile: profile
            ? { name: profile.name, dateOfBirth: profile.dateOfBirth }
            : null,
          therapist: therapistDetail || null,
        };
      })
    );

    res.status(200).json(enhancedCartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch cart items.", error: error.message });
  }
});

// Delete single cart item
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const deletedItem = await Cart.findOneAndDelete({ _id: id, userId });
    if (!deletedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.status(200).json({ message: "Cart item deleted successfully!" });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res
      .status(500)
      .json({ message: "Failed to delete cart item.", error: error.message });
  }
});

// Clear entire cart
router.delete("/", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    await Cart.deleteMany({ userId });
    res.status(200).json({ message: "Cart cleared successfully!" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res
      .status(500)
      .json({ message: "Failed to clear cart.", error: error.message });
  }
});

module.exports = router;
