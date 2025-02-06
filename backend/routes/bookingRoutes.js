// routes/bookingRoutes.js

const express = require("express");
const router = express.Router();

const dayjs = require("dayjs");
const Booking = require("../models/Booking");
const Timeslot = require("../models/Timeslot");
const { authenticate } = require("../middleware/authenticate");

/**
 * (Optional) GET /api/bookings/timeslot-summary
 * Return an object of { "YYYY-MM-DD": numberOfAvailableSlots } if you want
 * coloring in the frontend. If not needed, you can remove this route.
 */
// router.get("/timeslot-summary", authenticate, async (req, res) => {
//   try {
//     const timeslotDocs = await Timeslot.find();
//     const dateMap = {};

//     // Build date -> totalSlots
//     for (const doc of timeslotDocs) {
//       if (!dateMap[doc.date]) {
//         dateMap[doc.date] = doc.slots.length;
//       } else {
//         dateMap[doc.date] += doc.slots.length;
//       }
//     }

//     // Subtract bookings
//     const allBookings = await Booking.find().select("date timeslot");
//     for (const b of allBookings) {
//       const d = b.date; 
//       if (dateMap[d] !== undefined && dateMap[d] > 0) {
//         dateMap[d]--;
//       }
//     }
//     // no negative
//     for (const d of Object.keys(dateMap)) {
//       if (dateMap[d] < 0) dateMap[d] = 0;
//     }
//     return res.status(200).json(dateMap);
//   } catch (error) {
//     console.error("Error in timeslot-summary:", error);
//     return res.status(500).json({ message: "Server error in timeslot-summary" });
//   }
// });

/**
 * GET /api/bookings/timeslots?date=YYYY-MM-DD
 * Return available timeslots for that day
 */
router.get("/timeslots", authenticate, async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ message: "Date is required" });
  }

  try {
    // 1) find doc for that date
    const doc = await Timeslot.findOne({ date });
    // 2) find existing bookings for that date
    const bookings = await Booking.find({ date }).select("timeslot");
    const booked = bookings.map((b) => b.timeslot); // array of { from, to }

    let available = [];
    if (doc) {
      available = doc.slots.filter((slot) => {
        return !booked.some(
          (book) => book.from === slot.from && book.to === slot.to
        );
      });
    }
    return res.status(200).json(available);
  } catch (error) {
    console.error("Error fetching timeslots:", error);
    return res.status(500).json({ message: "Server error fetching timeslots" });
  }
});

/**
 * POST /api/bookings/book
 * Book a therapy session
 */
router.post("/book", authenticate, async (req, res) => {
  const { therapies, date, timeslot } = req.body;
  if (!therapies || !date || !timeslot) {
    return res
      .status(400)
      .json({ message: "All fields (therapies, date, timeslot) are required" });
  }

  try {
    // Ensure not already booked
    const existing = await Booking.findOne({
      date,
      "timeslot.from": timeslot.from,
      "timeslot.to": timeslot.to,
    });
    if (existing) {
      return res.status(400).json({ message: "Timeslot is already booked" });
    }

    const newBooking = new Booking({
      userId: req.user._id,
      therapies,
      date,
      timeslot,
    });
    await newBooking.save();
    return res.status(201).json({ message: "Therapy booked successfully" });
  } catch (error) {
    console.error("Error booking therapy:", error);
    return res.status(500).json({ message: "Server error while booking therapy" });
  }
});

/**
 * GET /api/bookings/upcoming
 * Return user's upcoming bookings (date >= today).
 */
router.get("/upcoming", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const upcomingBookings = await Booking.find({
      userId,
      date: { $gte: today },
    })
      .populate("therapies")
      .sort({ date: 1 });
    return res.status(200).json(upcomingBookings);
  } catch (error) {
    console.error("Error fetching upcoming bookings:", error);
    return res
      .status(500)
      .json({ message: "Server error fetching upcoming bookings" });
  }
});

/**
 * GET /api/bookings/all
 * Return user's all bookings (past + future).
 */
router.get("/all", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const allBookings = await Booking.find({ userId })
      .populate("therapies")
      .sort({ date: -1 });
    return res.status(200).json(allBookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    return res.status(500).json({ message: "Server error fetching all bookings" });
  }
});

/**
 * GET /api/bookings/:id
 * Single booking detail
 */
router.get("/:id", authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("therapies");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    // Ensure user owns it
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    return res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return res.status(500).json({ message: "Server error fetching booking" });
  }
});

module.exports = router;
