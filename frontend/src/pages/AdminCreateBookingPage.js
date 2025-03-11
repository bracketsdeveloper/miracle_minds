"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminCreateBookingPage() {
  // Booking form states
  const [childName, setChildName] = useState("");
  const [childDOB, setChildDOB] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedTherapyId, setSelectedTherapyId] = useState("");
  const [selectedTherapistId, setSelectedTherapistId] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [timeslots, setTimeslots] = useState([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState(null);
  const [mode, setMode] = useState("ONLINE");

  // Data lists
  const [therapies, setTherapies] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [childSuggestions, setChildSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch therapies, therapists, and previous manual bookings (child suggestions)
  useEffect(() => {
    fetchTherapies();
    fetchTherapists();
    fetchChildSuggestions();
  }, []);

  // Fetch available timeslots when date or therapist changes
  useEffect(() => {
    if (selectedTherapistId && date) {
      fetchTimeslots(date, selectedTherapistId);
    }
  }, [date, selectedTherapistId]);

  const fetchTherapies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://miracle-minds.vercel.app/api/therapies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTherapies(res.data);
    } catch (error) {
      console.error("Error fetching therapies:", error);
      toast.error("Failed to fetch therapies.");
    }
  };

  const fetchTherapists = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://miracle-minds.vercel.app/api/therapists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // For manual booking, we assume admin selects the therapist (offline or online based on mode)
      setTherapists(res.data);
    } catch (error) {
      console.error("Error fetching therapists:", error);
      toast.error("Failed to fetch therapists.");
    }
  };

  // Fetch previous manual bookings for suggestions
  const fetchChildSuggestions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://miracle-minds.vercel.app/api/bookings/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter bookings that have child details (manual bookings: email exists)
      const suggestions = res.data
        .filter((b) => b.email && b.profileId && isNaN(b.profileId))
        .map((b) => ({
          childName: b.profileId,
          childDOB: b.childDOB || "",
          email: b.email,
          phone: b.phone,
        }));
      // Remove duplicates by childName
      const unique = Array.from(
        new Map(suggestions.map((item) => [item.childName, item])).values()
      );
      setChildSuggestions(unique);
    } catch (error) {
      console.error("Error fetching child suggestions:", error);
    }
  };

  // Fetch timeslots for a given date and therapistId
  const fetchTimeslots = async (pickedDate, therapistId) => {
    try {
      const token = localStorage.getItem("token");
      // Query timeslots with therapistId, mode, and therapyId (if needed)
      const res = await axios.get(
        `https://miracle-minds.vercel.app/api/bookings/timeslots?date=${pickedDate}&therapistId=${therapistId}&mode=${mode}&therapies=${selectedTherapyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Filter out past timeslots if date is today
      let avail = res.data;
      const todayStr = dayjs().format("YYYY-MM-DD");
      if (pickedDate === todayStr) {
        const now = dayjs();
        avail = avail.filter((slot) => {
          const slotTime = dayjs(`${pickedDate} ${slot.from}`, "YYYY-MM-DD HH:mm");
          return slotTime.isAfter(now);
        });
      }
      setTimeslots(avail);
      setSelectedTimeslot(null);
    } catch (error) {
      console.error("Error fetching timeslots:", error);
      toast.error("Failed to fetch timeslots.");
    }
  };

  // Handle suggestion filtering as admin types child name
  const handleChildNameChange = (e) => {
    const value = e.target.value;
    setChildName(value);
    if (value.length > 0) {
      const filtered = childSuggestions.filter((sugg) =>
        sugg.childName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // When suggestion is clicked, populate fields
  const handleSuggestionClick = (sugg) => {
    setChildName(sugg.childName);
    setChildDOB(sugg.childDOB);
    setEmail(sugg.email);
    setPhone(sugg.phone);
    setShowSuggestions(false);
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (
      !childName ||
      !childDOB ||
      !selectedTherapyId ||
      !selectedTherapistId ||
      !date ||
      !selectedTimeslot ||
      !email ||
      !phone ||
      !mode
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    const payload = {
      childName,
      childDOB,
      email,
      phone,
      therapies: [selectedTherapyId],
      therapistId: selectedTherapistId,
      date,
      timeslot: selectedTimeslot,
      mode,
    };
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("https://miracle-minds.vercel.app/api/bookings/manual-booking", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data.message || "Booking created successfully!");
      // Reset form fields
      setChildName("");
      setChildDOB("");
      setEmail("");
      setPhone("");
      setSelectedTherapyId("");
      setSelectedTherapistId("");
      setDate(dayjs().format("YYYY-MM-DD"));
      setTimeslots([]);
      setSelectedTimeslot(null);
      setMode("ONLINE");
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error(error.response?.data?.message || "Failed to create booking.");
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-gray-200 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin - Create Booking</h1>
      <form onSubmit={handleCreateBooking} className="space-y-4 max-w-xl relative">
        {/* Child Name with Suggestions */}
        <div className="relative">
          <label className="block mb-1 font-semibold text-sm">
            Child Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            className="w-full bg-gray-700 p-2 rounded"
            value={childName}
            onChange={handleChildNameChange}
            autoComplete="off"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded mt-1 max-h-40 overflow-y-auto">
              {filteredSuggestions.map((sugg, idx) => (
                <li
                  key={idx}
                  className="px-3 py-2 hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleSuggestionClick(sugg)}
                >
                  {sugg.childName}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Child DOB */}
        <div>
          <label className="block mb-1 font-semibold text-sm">
            Child DOB <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            className="w-full bg-gray-700 p-2 rounded"
            value={childDOB}
            onChange={(e) => setChildDOB(e.target.value)}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 font-semibold text-sm">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            className="w-full bg-gray-700 p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block mb-1 font-semibold text-sm">
            Phone Number <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            className="w-full bg-gray-700 p-2 rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Therapy Selection */}
        <div>
          <label className="block mb-1 font-semibold text-sm">
            Select Therapy <span className="text-red-400">*</span>
          </label>
          <select
            value={selectedTherapyId}
            onChange={(e) => setSelectedTherapyId(e.target.value)}
            className="w-full bg-gray-700 p-2 rounded"
          >
            <option value="">-- Choose Therapy --</option>
            {therapies.map((therapy) => (
              <option key={therapy._id} value={therapy._id}>
                {therapy.name} (₹{therapy.cost})
              </option>
            ))}
          </select>
        </div>

        {/* Therapist Selection */}
        <div>
          <label className="block mb-1 font-semibold text-sm">
            Select Therapist (Offline Only) <span className="text-red-400">*</span>
          </label>
          <select
            value={selectedTherapistId}
            onChange={(e) => setSelectedTherapistId(e.target.value)}
            className="w-full bg-gray-700 p-2 rounded"
          >
            <option value="">-- Choose Therapist --</option>
            {therapists.map((therapist) => (
              <option key={therapist._id} value={therapist._id}>
                {therapist.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block mb-1 font-semibold text-sm">
            Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            className="w-full bg-gray-700 p-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Mode */}
        <div>
          <label className="block mb-1 font-semibold text-sm">
            Mode <span className="text-red-400">*</span>
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full bg-gray-700 p-2 rounded"
          >
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>

        {/* Timeslot Selection */}
        {timeslots.length > 0 ? (
          <div>
            <h3 className="text-md font-semibold mb-2">Available Timeslots</h3>
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => {
                  const newDate = dayjs(date).subtract(1, "day").format("YYYY-MM-DD");
                  if (dayjs(newDate).isBefore(dayjs(), "day")) {
                    toast.warning("Cannot go to a past date!");
                    return;
                  }
                  setDate(newDate);
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Previous Date
              </button>
              <p className="text-gray-200 font-semibold">{date}</p>
              <button
                type="button"
                onClick={() => {
                  const newDate = dayjs(date).add(1, "day").format("YYYY-MM-DD");
                  setDate(newDate);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Next Date
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {timeslots.map((slot, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedTimeslot(slot)}
                  className={`px-2 py-1 rounded-md ${
                    selectedTimeslot &&
                    selectedTimeslot.from === slot.from &&
                    selectedTimeslot.to === slot.to
                      ? "bg-pink-600 text-white"
                      : slot.hasExpert
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-red-600 text-white cursor-not-allowed"
                  }`}
                  disabled={!slot.hasExpert}
                >
                  {slot.from} - {slot.to}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-400">No timeslots available for this date.</p>
        )}

        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded font-semibold hover:bg-purple-700"
        >
          Create Booking
        </button>
      </form>
    </div>
  );
}
