const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const User = require("../models/User"); // Import User model
const { authenticate } = require("../middleware/authenticate");

// Add to Cart
router.post("/", authenticate, async (req, res) => {
  const { profileId, therapies, date, timeslot } = req.body;
  const userId = req.user._id;

  try {
    // Validate profileId against the user's profiles
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidProfile = user.profiles.some(
      (profile) => profile._id.toString() === profileId
    );
    if (!isValidProfile) {
      return res.status(400).json({ message: "Invalid profile ID" });
    }

    // Check for duplicates
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

    // Add the item to the cart
    const cartItem = new Cart({
      userId,
      profileId,
      therapies,
      date,
      timeslot,
    });
    await cartItem.save();

    res.status(201).json({ message: "Item added to cart successfully!" });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Failed to add item to cart", error: error.message });
  }
});

// Get Cart Items
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    const cartItems = await Cart.find({ userId })
      .populate("therapies", "name cost") // Populate Therapy fields
      .lean(); // Return plain JS objects for easier manipulation

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Map profiles to cart items
    const enhancedCartItems = cartItems.map((item) => {
      const profile = user.profiles.find(
        (profile) => profile._id.toString() === item.profileId
      );
      return {
        ...item,
        profile: profile ? { name: profile.name, dateOfBirth: profile.dateOfBirth } : null,
      };
    });

    res.status(200).json(enhancedCartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Failed to fetch cart items.", error: error.message });
  }
});

// Delete an Item from Cart
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
    res.status(500).json({ message: "Failed to delete cart item.", error: error.message });
  }
});

// Clear Entire Cart
router.delete("/", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    await Cart.deleteMany({ userId });

    res.status(200).json({ message: "Cart cleared successfully!" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Failed to clear cart.", error: error.message });
  }
});

module.exports = router;
