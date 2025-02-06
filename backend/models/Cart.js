const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  profileId: {
    type: String, // Profile IDs are strings within the User model
    required: true,
  },
  therapies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapy", // Reference to the Therapy model
      required: true,
    },
  ],
  date: {
    type: String,
    required: true,
  },
  timeslot: {
    from: { type: String, required: true },
    to: { type: String, required: true },
  },
});

module.exports = mongoose.model("Cart", CartSchema);
