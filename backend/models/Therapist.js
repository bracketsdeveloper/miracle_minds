const mongoose = require("mongoose");

const therapistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  expertise: {
    type: [String], // Array of therapy names
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
  photo: {
    type: String, // URL of the uploaded photo
    required: true,
  },
});

module.exports = mongoose.model("Therapist", therapistSchema);
