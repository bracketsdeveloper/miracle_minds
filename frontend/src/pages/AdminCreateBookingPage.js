'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";

export default function AdminCreateBookingPage() {
  const [therapies, setTherapies] = useState([]);
  const [therapists, setTherapists] = useState([]);
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

  useEffect(() => {
    fetchTherapies();
    fetchTherapists();
  }, []);

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
      setTherapists(res.data);
    } catch (error) {
      console.error("Error fetching therapists:", error);
      toast.error("Failed to fetch therapists.");
    }
  };

  const fetchTimeslots = async (pickedDate, therapistId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://miracle-minds.vercel.app/api/bookings/timeslots?date=${pickedDate}&therapistId=${therapistId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTimeslots(res.data);
      setSelectedTimeslot(null);
    } catch (error) {
      console.error("Error fetching timeslots:", error);
      toast.error("Failed to fetch timeslots.");
    }
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
      !phone
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
      <form onSubmit={handleCreateBooking} className="space-y-4 max-w-xl">
        {/* Child Name, DOB, Email, Phone fields remain the same */}

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

        <div>
          <label className="block mb-1 font-semibold text-sm">
            Select Therapist <span className="text-red-400">*</span>
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

        {timeslots.length > 0 ? (
          <div>
            <h3 className="text-md font-semibold mb-2">Available Timeslots</h3>
            <div className="grid grid-cols-2 gap-2">
              {timeslots.map((slot, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedTimeslot(slot)}
                  className={`px-2 py-1 rounded-md ${
                    selectedTimeslot && selectedTimeslot.from === slot.from
                      ? "bg-pink-600 text-white"
                      : slot.hasExpert
                      ? "bg-purple-600 text-white hover:bg-purple-700"
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