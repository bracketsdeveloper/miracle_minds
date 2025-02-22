// routes/bookingRoutes.js

const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// Models
const Booking = require("../models/Booking");
const Timeslot = require("../models/Timeslot");
const Therapist = require("../models/Therapist");
const Therapy = require("../models/Therapy");
const Cart = require("../models/Cart");

const { authenticate } = require("../middleware/authenticate");

/**
 * GET /api/bookings/timeslots?date=YYYY-MM-DD[&mode=ONLINE|OFFLINE&therapies=ID,ID...]
 * - If only ?date => returns universal timeslots
 * - If also ?mode & ?therapies => returns universal timeslots with { hasExpert }
 */
router.get("/timeslots", authenticate, async (req, res) => {
  try {
    const { date, mode, therapies } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // 1) find universal timeslot doc
    const doc = await Timeslot.findOne({ date });
    let universalSlots = doc ? doc.slots : [];

    // If no mode/therapies => raw slots
    if (!mode || !therapies) {
      return res.status(200).json(universalSlots);
    }

    // coverage logic
    const therapyIds = therapies.split(",");
    const therapyDocs = await Therapy.find({ _id: { $in: therapyIds } });
    const therapyNames = therapyDocs.map((td) => td.name);

    // load all therapists
    const allTherapists = await Therapist.find({}).lean();

    const result = [];

    for (const slot of universalSlots) {
      const slotFrom = dayjs(`${date} ${slot.from}`, "YYYY-MM-DD HH:mm");
      const slotTo = dayjs(`${date} ${slot.to}`, "YYYY-MM-DD HH:mm");
      if (!slotFrom.isValid() || !slotTo.isValid()) {
        result.push({ from: slot.from, to: slot.to, hasExpert: false });
        continue;
      }

      const anyExpert = allTherapists.some((expert) => {
        // must support mode
        if (!expert.supportedModes?.includes(mode.toUpperCase())) return false;
        // must have availability + expertise
        if (!expert.availability || !expert.expertise) return false;
        // find availability for date
        const avail = expert.availability.find((a) => a.date === date);
        if (!avail || !avail.slots?.length) return false;

        // coverage check
        const covers = avail.slots.some((s) => {
          const tFrom = dayjs(`${date} ${s.from}`, "YYYY-MM-DD HH:mm");
          const tTo = dayjs(`${date} ${s.to}`, "YYYY-MM-DD HH:mm");
          if (!tFrom.isValid() || !tTo.isValid()) return false;
          return tFrom.isSameOrBefore(slotFrom) && tTo.isSameOrAfter(slotTo);
        });
        if (!covers) return false;

        // therapy check
        const hasTherapy = therapyNames.some((tn) =>
          expert.expertise.includes(tn)
        );
        return hasTherapy;
      });

      result.push({
        from: slot.from,
        to: slot.to,
        hasExpert: anyExpert,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching timeslots:", error);
    return res.status(500).json({ message: "Server error fetching timeslots" });
  }
});

/**
 * POST /api/bookings/book
 * Assign available expert => store in Cart or direct Booking. We'll store in Cart for payment flow.
 */
router.post("/book", authenticate, async (req, res) => {
  try {
    const { therapies, date, timeslot, profileId, mode } = req.body;
    if (!therapies || !date || !timeslot || !profileId || !mode) {
      return res.status(400).json({
        message: "All fields (therapies, date, timeslot, profileId, mode) are required",
      });
    }

    // duplicates in cart?
    const existingCartItem = await Cart.findOne({
      userId: req.user._id,
      profileId,
      therapies,
      date,
      "timeslot.from": timeslot.from,
      "timeslot.to": timeslot.to,
    });
    if (existingCartItem) {
      return res.status(400).json({ message: "Item already exists in the cart" });
    }

    // fetch therapy docs => names
    const therapyDocs = await Therapy.find({ _id: { $in: therapies } });
    const therapyNames = therapyDocs.map((td) => td.name);

    // parse timeslot
    const reqFrom = dayjs(`${date} ${timeslot.from}`, "YYYY-MM-DD HH:mm");
    const reqTo = dayjs(`${date} ${timeslot.to}`, "YYYY-MM-DD HH:mm");
    if (!reqFrom.isValid() || !reqTo.isValid()) {
      return res
        .status(400)
        .json({ message: `Invalid timeslot: ${timeslot.from}-${timeslot.to}` });
    }

    // find all therapists
    const allTherapists = await Therapist.find({}).lean();

    // filter
    const matchingExperts = allTherapists.filter((expert) => {
      // mode
      if (!expert.supportedModes?.includes(mode.toUpperCase())) return false;
      // availability + expertise
      if (!expert.availability || !expert.expertise) return false;
      // coverage for date
      const availEntry = expert.availability.find((a) => a.date === date);
      if (!availEntry || !availEntry.slots?.length) return false;

      const covers = availEntry.slots.some((s) => {
        const slotFrom = dayjs(`${date} ${s.from}`, "YYYY-MM-DD HH:mm");
        const slotTo = dayjs(`${date} ${s.to}`, "YYYY-MM-DD HH:mm");
        if (!slotFrom.isValid() || !slotTo.isValid()) return false;
        return slotFrom.isSameOrBefore(reqFrom) && slotTo.isSameOrAfter(reqTo);
      });
      if (!covers) return false;

      const hasMatchingTherapy = therapyNames.some((tn) =>
        expert.expertise.includes(tn)
      );
      return hasMatchingTherapy;
    });

    if (matchingExperts.length === 0) {
      return res
        .status(400)
        .json({ message: "No experts available for the selected timeslot/mode" });
    }

    // pick one
    const randomIndex = Math.floor(Math.random() * matchingExperts.length);
    const chosenExpert = matchingExperts[randomIndex];

    // Create cart item
    const newCartItem = new Cart({
      userId: req.user._id,
      profileId,
      therapies,
      date,
      timeslot,
      mode: mode.toUpperCase(),
      // We store the "therapistId" referencing the "Therapist" collection
      therapistId: chosenExpert._id,
    });
    await newCartItem.save();

    return res.status(201).json({
      message: "Item added to cart successfully!",
      expert: chosenExpert,
    });
  } catch (error) {
    console.error("Error booking therapy:", error);
    return res.status(500).json({ message: "Server error while booking therapy" });
  }
});

/**
 * GET /api/bookings/upcoming
 * Return user's upcoming bookings => .populate("therapies").populate("therapistId","name")
 */
router.get("/upcoming", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split("T")[0];

    const upcomingBookings = await Booking.find({
      userId,
      date: { $gte: today },
    })
      .populate("therapies")
      .populate("therapistId", "name") // << populate
      .sort({ date: 1 });

    return res.status(200).json(upcomingBookings);
  } catch (error) {
    console.error("Error fetching upcoming bookings:", error);
    return res.status(500).json({
      message: "Server error fetching upcoming bookings",
    });
  }
});

/**
 * GET /api/bookings/all
 */
router.get("/all", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const allBookings = await Booking.find({ userId })
      .populate("therapies")
      .populate("therapistId", "name") // if you also want the name here
      .sort({ date: -1 });
    return res.status(200).json(allBookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    return res.status(500).json({ message: "Server error fetching all bookings" });
  }
});

/**
 * GET /api/bookings/:id
 */
router.get("/:id", authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("therapies")
      .populate("therapistId", "name");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
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
