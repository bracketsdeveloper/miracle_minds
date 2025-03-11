// routes/paymentRoutes.js

const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { authenticate } = require("../middleware/authenticate");
const Cart = require("../models/Cart");
const Booking = require("../models/Booking");
const Therapist = require("../models/Therapist");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1) Create an order
router.post("/create-order", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const cartItems = await Cart.find({ userId }).populate("therapies");
    if (!cartItems.length) {
      return res
        .status(400)
        .json({ success: false, message: "Cart is empty!" });
    }

    let totalAmount = 0;
    cartItems.forEach((item) => {
      totalAmount += item.therapies[0]?.cost || 0;
    });

    const amountInPaise = totalAmount * 100;
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
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res
      .status(500)
      .json({ success: false, message: "Error creating order" });
  }
});

// 2) Verify Payment & create final Bookings
router.post("/verify", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    const cartItems = await Cart.find({ userId }).populate("therapies");
    if (!cartItems.length) {
      return res
        .status(400)
        .json({ success: false, message: "Cart is empty or cleared." });
    }

    // create Bookings from each cart item
    for (const item of cartItems) {
      let finalTherapistId = null;
      let finalTherapistName = "";
      if (item.therapistId) {
        const therapistDoc = await Therapist.findById(item.therapistId);
        if (therapistDoc) {
          finalTherapistId = therapistDoc._id;
          finalTherapistName = therapistDoc.name;
        }
      }

      const cost = item.therapies[0]?.cost || 0;

      await Booking.create({
        userId,
        profileId: item.profileId,
        therapies: item.therapies.map((t) => t._id),
        date: item.date,
        timeslot: {
          from: item.timeslot.from,
          to: item.timeslot.to,
        },
        mode: item.mode || "ONLINE",
        therapistId: finalTherapistId,
        therapistName: finalTherapistName,

        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
        amountPaid: cost,
        status: "PAID",
      });
    }

    // clear cart
    await Cart.deleteMany({ userId });

    return res.status(200).json({
      success: true,
      message: "Payment verified and bookings created successfully!",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res
      .status(500)
      .json({ success: false, message: "Error verifying payment" });
  }
});

module.exports = router;
