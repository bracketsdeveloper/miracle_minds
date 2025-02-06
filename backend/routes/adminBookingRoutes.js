// routes/adminBookingRoutes.js (example)
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticate");
const { authorizeAdmin } = require("../middleware/authenticate");
const Booking = require("../models/Booking");
const User = require("../models/User");
const dayjs = require("dayjs");

// 1) Get all upcoming bookings
router.get("/admin/upcoming", authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Example of "upcoming": date >= current date
    const today = dayjs().format("YYYY-MM-DD"); // e.g. 2025-01-19
    // Find all bookings with date >= today
    // Populate userId and therapies
    const upcomingBookings = await Booking.find({
      date: { $gte: today },
    })
      .populate("userId", "name email") // So admin can see user name/email
      .populate("therapies", "name cost");

    res.status(200).json(upcomingBookings);
  } catch (error) {
    console.error("Error fetching upcoming bookings:", error);
    res.status(500).json({ message: "Server error fetching upcoming bookings" });
  }
});

// 2) Get all bookings (regardless of date)
// 2) Get all bookings (with optional filters)
router.get("/admin/all", authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Extract potential filter params
    const { therapyId, month, date, status } = req.query;

    const filter = {};

    // If user selected a specific therapy
    if (therapyId) {
      // "therapies" is an array of ObjectIds
      filter.therapies = therapyId;
    }

    // If user picked a month (YYYY-MM) => match booking.date that starts with "YYYY-MM"
    if (month) {
      filter.date = { $regex: `^${month}` };
    }

    // If user picked an exact date (YYYY-MM-DD)
    if (date) {
      filter.date = date;
    }

    // If user picked a status (PENDING, PAID, FAILED, CANCELED, etc.)
    if (status) {
      filter.status = status;
    }

    console.log("AdminAllBookings filter:", filter);

    // Query with the filter
    const allBookings = await Booking.find(filter)
      .populate("userId", "name email")
      .populate("therapies", "name cost")
      .sort({ date: -1 });

    res.status(200).json(allBookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ message: "Server error fetching all bookings" });
  }
});

// 3) Get single booking details
router.get("/admin/detail/:bookingId", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate("userId", "name email address role") // more user fields
      .populate("therapies", "name cost");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching booking detail:", error);
    res.status(500).json({ message: "Server error fetching booking detail" });
  }
});

module.exports = router;
