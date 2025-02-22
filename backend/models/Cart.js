// models/Cart.js
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  profileId: {
    type: String, // Because it's inside the User's "profiles"
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
  therapist: {
    type: String, // storing therapist.userId or therapist doc's userId as string
  },
  // NEW: store the chosen mode
  mode: {
    type: String,
    enum: ["ONLINE", "OFFLINE"],
    default: "ONLINE",
  },
});

module.exports = mongoose.model("Cart", cartSchema);
