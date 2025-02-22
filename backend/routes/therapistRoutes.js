const express = require("express");
const Therapist = require("../models/Therapist");
const { authenticate, authorizeAdmin } = require("../middleware/authenticate");

const router = express.Router();

// Get all therapists
router.get("/therapists", authenticate, async (req, res) => {
  try {
    const therapists = await Therapist.find();
    res.status(200).json(therapists);
  } catch (error) {
    console.error("Error fetching therapists:", error);
    res.status(500).json({ message: "Server error while fetching therapists" });
  }
});

// Add a new therapist
router.post("/therapists", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { name, expertise, about, photo } = req.body;

    if (!name || !about || !photo || !Array.isArray(expertise)) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    const newTherapist = new Therapist({
      name,
      expertise,
      about,
      photo,
    });

    await newTherapist.save();
    res.status(201).json({ message: "Therapist added successfully", therapist: newTherapist });
  } catch (error) {
    console.error("Error adding therapist:", error);
    res.status(500).json({ message: "Server error while adding therapist" });
  }
});

// Update an existing therapist
router.put("/therapists/:id", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, expertise, about, photo } = req.body;

    if (!name || !about || !photo || !Array.isArray(expertise)) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    const updatedTherapist = await Therapist.findByIdAndUpdate(
      id,
      { name, expertise, about, photo },
      { new: true }
    );

    if (!updatedTherapist) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    res.status(200).json({ message: "Therapist updated successfully", therapist: updatedTherapist });
  } catch (error) {
    console.error("Error updating therapist:", error);
    res.status(500).json({ message: "Server error while updating therapist" });
  }
});

// Delete a therapist
router.delete("/therapists/:id", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTherapist = await Therapist.findByIdAndDelete(id);

    if (!deletedTherapist) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    res.status(200).json({ message: "Therapist deleted successfully" });
  } catch (error) {
    console.error("Error deleting therapist:", error);
    res.status(500).json({ message: "Server error while deleting therapist" });
  }
});

router.get("/therapists/:id", authenticate, async (req, res) => {
  try {
    const therapistId = req.params.id;

    // If you only want certain fields, you can use .select('name about photo expertise')
    const therapist = await Therapist.findById(therapistId);
    if (!therapist) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    // Return the entire doc or only certain fields
    return res.status(200).json(therapist);
  } catch (error) {
    console.error("Error fetching therapist:", error);
    return res
      .status(500)
      .json({ message: "Server error fetching therapist profile", error: error.message });
  }
});

module.exports = router;
