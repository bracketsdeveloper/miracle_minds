const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  assessment: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
  },
  address: {
    type: String,
  },
  role: {
    type: String,
    enum: ["ADMIN", "GENERAL"],
    default: "GENERAL",
  },
  profiles: [profileSchema],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
