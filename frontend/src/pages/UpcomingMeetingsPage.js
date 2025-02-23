"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UpcomingMeetingsPage() {
  const [upcoming, setUpcoming] = useState([]);

  // Reschedule / Popup for date change
  const [showPopup, setShowPopup] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [timeslots, setTimeslots] = useState([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState(null);

  // Expert Profile Popup
  const [showExpertPopup, setShowExpertPopup] = useState(false);
  const [expertProfile, setExpertProfile] = useState(null);

  useEffect(() => {
    fetchUpcoming();
  }, []);

  /**
   * Fetch upcoming bookings
   */
  const fetchUpcoming = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("User not authenticated!", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }
      const res = await axios.get("http://localhost:5000/api/bookings/upcoming", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpcoming(res.data);
    } catch (error) {
      toast.error("Failed to fetch upcoming bookings!", {
        position: "top-center",
        autoClose: 3000,
      });
      console.error("Error fetching upcoming bookings:", error);
    }
  };

  /**
   * Example: canReschedule => 4+ hours logic
   */
  const canReschedule = (booking) => {
    const dtStr = `${booking.date} ${booking.timeslot.from}`;
    const bookingTime = dayjs(dtStr, "YYYY-MM-DD HH:mm");
    const diffHours = bookingTime.diff(dayjs(), "hour");
    return diffHours >= 4;
  };

  /**
   * canJoinMeeting => e.g. if mode=ONLINE + within 10 min
   */
  const canJoinMeeting = (booking) => {
    if (booking.mode?.toUpperCase() !== "ONLINE") return false;
    const dtStr = `${booking.date} ${booking.timeslot.from}`;
    const bookingTime = dayjs(dtStr, "YYYY-MM-DD HH:mm");
    const diffMinutes = bookingTime.diff(dayjs(), "minute");
    return diffMinutes <= 10 && diffMinutes >= 0;
  };

  /**
   * Show Reschedule Popup
   */
  const handleShowPopup = (booking) => {
    setSelectedBooking(booking);
    setShowPopup(true);
    setIsRescheduling(true);
    setNewDate("");
    setTimeslots([]);
    setSelectedTimeslot(null);
  };

  /**
   * On new date => fetch timeslots
   */
  const handleDateChange = async (e) => {
    const dateVal = e.target.value;
    setNewDate(dateVal);
    if (!dateVal) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/bookings/timeslots?date=${dateVal}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTimeslots(response.data);
    } catch (error) {
      toast.error("Failed to fetch timeslots for that date!", {
        position: "top-center",
        autoClose: 3000,
      });
      console.error("Error fetching timeslots:", error);
      setTimeslots([]);
    }
  };

  /**
   * Confirm Reschedule
   */
  const handleConfirmReschedule = async () => {
    if (!selectedBooking || !newDate || !selectedTimeslot) {
      toast.error("Please select date & timeslot!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/bookings/reschedule",
        {
          bookingId: selectedBooking._id,
          date: newDate,
          timeslot: selectedTimeslot,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Meeting rescheduled successfully!", {
        position: "top-center",
        autoClose: 3000,
      });
      fetchUpcoming();
    } catch (error) {
      toast.error("Failed to reschedule!", {
        position: "top-center",
        autoClose: 3000,
      });
      console.error("Reschedule error:", error);
    } finally {
      closePopup();
    }
  };

  /**
   * Close the Reschedule Popup
   */
  const closePopup = () => {
    setShowPopup(false);
    setSelectedBooking(null);
    setIsRescheduling(false);
  };

  /**
   * Show Expert Profile Popup
   */
  const handleShowExpert = async (therapistObj) => {
    // We assume booking.therapistId is an object: { _id, name }
    if (!therapistObj?._id) {
      toast.warning("No expert info!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      // Suppose there's a route GET /api/therapists/:id
      const res = await axios.get(
        `http://localhost:5000/api/therapists/${therapistObj._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExpertProfile(res.data);
      setShowExpertPopup(true);
    } catch (error) {
      toast.error("Failed to fetch expert profile!", {
        position: "top-center",
        autoClose: 3000,
      });
      console.error("ExpertProfile fetch error:", error);
    }
  };

  /**
   * Close Expert Popup
   */
  const closeExpertPopup = () => {
    setExpertProfile(null);
    setShowExpertPopup(false);
  };

  return (
    <div className="p-6 bg-gray-900 text-gray-200 rounded-md max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Upcoming Meetings</h1>

      {upcoming.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcoming.map((booking) => {
            // from .populate("therapistId","name"), we get booking.therapistId = { _id, name }
            const expertName = booking.therapistId?.name || "No Expert";
            const expertData = booking.therapistId; // e.g. { _id, name }
            const therapyName = booking.therapies[0]?.name || "N/A";

            const isCancelled =
              booking.isCanceled || booking.status === "CANCELED";
            const joinEnabled = canJoinMeeting(booking);
            const reschEnabled = canReschedule(booking);

            return (
              <div
                key={booking._id}
                className="bg-gray-800 p-6 rounded-md shadow-lg flex flex-col"
              >
                <h2 className="text-xl font-semibold mb-2">{therapyName}</h2>

                <p className="text-sm text-gray-300 mb-1">
                  <span className="font-semibold">Date:</span>{" "}
                  {dayjs(booking.date).format("YYYY-MM-DD")}
                </p>
                <p className="text-sm text-gray-300 mb-1">
                  <span className="font-semibold">Timeslot:</span>{" "}
                  {booking.timeslot.from} - {booking.timeslot.to}
                </p>
                <p className="text-sm text-gray-300 mb-1">
                  <span className="font-semibold">Mode:</span> {booking.mode}
                </p>

                {/* Expert Name => open popup */}
                <p className="text-sm text-gray-300 mb-1">
                  <span className="font-semibold">Expert:</span>{" "}
                  <button
                    className="inline-flex items-center text-pink-400 ml-1 hover:underline"
                    onClick={() => handleShowExpert(expertData)}
                  >
                    {expertName}
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.25 9v.75M11.25 13.5h.008v.008h-.008V13.5zM12 2.25C6.615 2.25 2.25 6.615 2.25 12S6.615 21.75 12 21.75 21.75 17.385 21.75 12 17.385 2.25 12 2.25z"
                      />
                    </svg>
                  </button>
                </p>

                {/* If canceled, display message */}
                {isCancelled && (
                  <p className="text-red-500 text-sm mt-2">Canceled</p>
                )}

                {/* Action Buttons */}
                <div className="mt-auto">
                  {/* Join Meeting => if mode=ONLINE + canJoin */}
                  {!isCancelled && joinEnabled && (
                    <Link
                      to={`/meeting/${booking._id}`}
                      className="mt-2 inline-block bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition"
                    >
                      Join Meeting
                    </Link>
                  )}

                  {/* Reschedule => if canReschedule */}
                  {!isCancelled && reschEnabled && (
                    <button
                      onClick={() => handleShowPopup(booking)}
                      className="mt-2 w-full bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
                    >
                      Reschedule
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-400">No upcoming meetings.</p>
      )}

      {/* Reschedule Popup */}
      {showPopup && selectedBooking && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closePopup}
          />
          <div className="relative bg-gray-800 p-6 rounded-md w-full max-w-md z-50">
            <h2 className="text-xl font-bold mb-4">Reschedule Meeting</h2>
            <p className="text-sm mb-4">Select a new date & timeslot:</p>

            {/* Date Input */}
            <input
              type="date"
              value={newDate}
              onChange={handleDateChange}
              className="bg-gray-700 text-white px-3 py-2 rounded-md w-full mb-4"
            />

            {/* Timeslot Selection */}
            {timeslots.length > 0 ? (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Available Timeslots</h3>
                <div className="grid grid-cols-2 gap-2">
                  {timeslots.map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTimeslot(slot)}
                      className={`px-2 py-1 rounded-md ${
                        selectedTimeslot && selectedTimeslot.from === slot.from
                          ? "bg-pink-600 text-white"
                          : "bg-gray-700 text-white hover:bg-gray-600"
                      }`}
                    >
                      {slot.from} - {slot.to}
                    </button>
                  ))}
                </div>
              </div>
            ) : newDate ? (
              <p className="text-gray-400">No timeslots on that date.</p>
            ) : null}

            <div className="flex justify-end gap-2">
              <button
                onClick={closePopup}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
              >
                Close
              </button>
              <button
                onClick={handleConfirmReschedule}
                disabled={!selectedTimeslot}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expert Popup */}
      {showExpertPopup && expertProfile && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeExpertPopup}
          />
          <div className="relative bg-gray-800 p-6 rounded-md w-full max-w-md z-50 flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Expert Profile</h2>

            {/* Profile Picture at top middle */}
            {expertProfile.photo && (
              <img
                src={expertProfile.photo}
                alt={expertProfile.name}
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
            )}

            <p className="text-lg font-semibold mb-2">{expertProfile.name}</p>
            <p className="text-sm text-gray-300 mb-2">
              <span className="font-semibold">Expertise:</span>{" "}
              {expertProfile.expertise?.join(", ") || "N/A"}
            </p>
            <p className="text-sm text-gray-300 mb-4">
              {expertProfile.about || "No description."}
            </p>

            <button
              onClick={closeExpertPopup}
              className="mt-auto bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
