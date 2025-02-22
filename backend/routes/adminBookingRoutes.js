// routes/adminBookingRoutes.js (example)
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticate");
const { authorizeAdmin } = require("../middleware/authenticate");
const Booking = require("../models/Booking");
const User = require("../models/User");
const dayjs = require("dayjs");
const Therapy = require("../models/Therapy");

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
    const { therapyId, month, date, status, email } = req.query;
    const filter = {};

    if (therapyId) {
      // Filter if therapyId is provided; assumes a single therapy per booking
      filter.therapies = therapyId;
    }
    if (month) {
      // Filter by month (YYYY-MM) using regex on date field
      filter.date = { $regex: `^${month}` };
    }
    if (date) {
      filter.date = date;
    }
    if (status) {
      filter.status = status;
    }
    if (email) {
      // Exact match for email; change to regex if partial match is desired
      filter.email = email;
    }

    const bookings = await Booking.find(filter)
      .populate("userId", "name email")
      .populate("therapies", "name cost")
      .sort({ date: -1 });

    res.status(200).json(bookings);
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

router.post("/manual-booking", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { childName, childDOB, therapies, date, timeslot, email, phone } = req.body;
    if (!childName || !childDOB || !therapies || !date || !timeslot || !email || !phone) {
      return res.status(400).json({ message: "All fields (childName, childDOB, therapies, date, timeslot, email, phone) are required" });
    }

    // Check if timeslot is already booked (optional)
    const existingBooking = await Booking.findOne({
      date,
      "timeslot.from": timeslot.from,
      "timeslot.to": timeslot.to,
    });
    if (existingBooking) {
      return res.status(400).json({ message: "Timeslot is already booked" });
    }

    // Fetch the cost of the therapy (assuming single therapy)
    const therapy = await Therapy.findById(therapies[0]);
    const cost = therapy ? therapy.cost : 0;

    const newBooking = new Booking({
      userId: req.user._id,
      profileId: childName,
      therapies,
      date,
      timeslot,
      status: "PAID",
      email,
      phone,
      amountPaid: cost
    });
    await newBooking.save();
    res.status(201).json({ message: "Booking created successfully" });
  } catch (error) {
    console.error("Error creating manual booking:", error);
    res.status(500).json({ message: "Server error creating booking" });
  }
});

router.get("/timeslots", authenticate, async (req, res) => {
  try {
    const { date, therapistId } = req.query;
    if (!date || !therapistId) {
      return res.status(400).json({ message: "Date and therapistId are required" });
    }

    // Fetch universal timeslots
    const doc = await Timeslot.findOne({ date });
    let universalSlots = doc ? doc.slots : [];

    // Fetch therapist's availability
    const therapist = await Therapist.findById(therapistId);
    if (!therapist || !therapist.availability) {
      return res.status(200).json(universalSlots.map(slot => ({ ...slot, hasExpert: false })));
    }

    const therapistAvailability = therapist.availability.find((a) => a.date === date);
    if (!therapistAvailability || !therapistAvailability.slots?.length) {
      return res.status(200).json(universalSlots.map(slot => ({ ...slot, hasExpert: false })));
    }

    // Check which universal slots are covered by the therapist's availability
    const result = universalSlots.map((slot) => {
      const slotFrom = dayjs(`${date} ${slot.from}`, "YYYY-MM-DD HH:mm");
      const slotTo = dayjs(`${date} ${slot.to}`, "YYYY-MM-DD HH:mm");

      const hasExpert = therapistAvailability.slots.some((s) => {
        const tFrom = dayjs(`${date} ${s.from}`, "YYYY-MM-DD HH:mm");
        const tTo = dayjs(`${date} ${s.to}`, "YYYY-MM-DD HH:mm");
        return tFrom.isSameOrBefore(slotFrom) && tTo.isSameOrAfter(slotTo);
      });

      return { ...slot, hasExpert };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching timeslots:", error);
    return res.status(500).json({ message: "Server error fetching timeslots" });
  }
});

// GET /api/admin/manual-timeslots?date=YYYY-MM-DD
router.get("/manual-timeslots", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }
    const timeslotDoc = await Timeslot.findOne({ date });
    if (!timeslotDoc) {
      return res.json([]);
    }
    res.json(timeslotDoc.slots);
  } catch (error) {
    console.error("Error fetching manual timeslots:", error);
    res.status(500).json({ message: "Server error fetching timeslots" });
  }
});


module.exports = router;
