// routes/paymentRoutes.js

const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { authenticate } = require("../middleware/authenticate");
const Cart = require("../models/Cart");
const Booking = require("../models/Booking");

const router = express.Router();

// Create a Razorpay instance with your credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * 1) Create Razorpay Order
 *    - Calculates total from user's cart
 *    - Creates an order on Razorpay's backend
 */
router.post("/create-order", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch cart items for user
    const cartItems = await Cart.find({ userId }).populate("therapies");
    if (!cartItems.length) {
      return res.status(400).json({ success: false, message: "Cart is empty!" });
    }

    // Calculate total cost
    let totalAmount = 0;
    cartItems.forEach((item) => {
      totalAmount += item.therapies[0]?.cost || 0;
    });

    // Razorpay needs amount in paise, so multiply by 100
    const amountInPaise = totalAmount * 100;

    // Create order on Razorpay
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      cartItems, // We'll use these on the client side to keep track
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: "Error creating order" });
  }
});

/**
 * 2) Verify Payment & Create Bookings
 *    - Verifies Razorpay signature
 *    - Creates a booking for each cart item with profileId
 *    - Clears the cart
 */
router.post("/verify", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // 1) Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // 2) Payment is valid => fetch cart
    const cartItems = await Cart.find({ userId }).populate("therapies");
    if (!cartItems.length) {
      return res
        .status(400)
        .json({ success: false, message: "Cart is empty or already cleared." });
    }

    // 3) Create Bookings
    for (const item of cartItems) {
      const cost = item.therapies[0]?.cost || 0;

      // Ensure profileId is present
      if (!item.profileId) {
        return res.status(400).json({ success: false, message: "Profile ID missing in cart item." });
      }

      // Create a booking for each item
      await Booking.create({
        userId,
        profileId: item.profileId, // Store profileId
        therapies: item.therapies.map((t) => t._id),
        date: item.date,
        timeslot: {
          from: item.timeslot.from,
          to: item.timeslot.to,
        },
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
        amountPaid: cost,
        status: "PAID",
      });
    }

    // 4) Clear cart
    await Cart.deleteMany({ userId });

    return res.status(200).json({
      success: true,
      message: "Payment verified and bookings created successfully!",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
});

module.exports = router;
