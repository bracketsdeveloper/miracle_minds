// models/Booking.js

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  profileId: {
    type: String, // Ensure this matches the type used in Cart
    required: true,
  },
  therapies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapy",
      required: true,
    },
  ],
  date: { type: String, required: true },
  timeslot: {
    from: { type: String, required: true },
    to: { type: String, required: true },
  },
  paymentId: { type: String },
  orderId: { type: String },
  signature: { type: String },
  amountPaid: { type: Number, default: 0 },

  // Add "CANCELED" (and optional "REFUNDED") to the enum
  status: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED", "CANCELED", "REFUNDED"],
    default: "PENDING",
  },

  // Optional extra fields
  isCanceled: { type: Boolean, default: false },
  refundId: { type: String, default: "" },
  refundStatus: {
    type: String,
    enum: ["NONE", "INITIATED", "COMPLETED"],
    default: "NONE",
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
