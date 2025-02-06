'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function UpcomingMeetingsPage() {
  const [upcoming, setUpcoming] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [profileMap, setProfileMap] = useState({}); // Mapping of profileId to profileName
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Reschedule form
  const [newDate, setNewDate] = useState("");
  const [timeslots, setTimeslots] = useState([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState(null);

  useEffect(() => {
    // Fetch both bookings and profiles in parallel
    fetchUpcoming();
    fetchProfiles();
  }, []);

  /**
   * Fetch Upcoming Bookings
   */
  const fetchUpcoming = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("User not authenticated!", {
          position: 'top-center',
          autoClose: 3000,
        });
        return;
      }
      const response = await axios.get('http://localhost:5000/api/bookings/upcoming', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpcoming(response.data);
    } catch (error) {
      toast.error("Failed to fetch upcoming bookings!", {
        position: "top-center",
        autoClose: 3000,
      });
      console.error('Error fetching upcoming bookings:', error);
    }
  };

  /**
   * Fetch User Profiles
   */
  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data;
      const fetchedProfiles = userData.profiles || [];
      setProfiles(fetchedProfiles);

      // Create a mapping from profileId to profileName
      const map = {};
      fetchedProfiles.forEach(profile => {
        map[profile._id] = profile.name;
      });
      setProfileMap(map);
    } catch (error) {
      toast.error("Failed to fetch profiles!", {
        position: "top-center",
        autoClose: 3000,
      });
      console.error('Error fetching profiles:', error);
    }
  };

  /**
   * Check if user can cancel/reschedule (4+ hours rule)
   */
  const canCancelOrReschedule = (booking) => {
    const dateTimeString = `${booking.date} ${booking.timeslot.from}`;
    const bookingDateTime = dayjs(dateTimeString, "YYYY-MM-DD hh:mm A");
    const diffHours = bookingDateTime.diff(dayjs(), 'hour');
    return diffHours >= 4;
  };

  /**
   * Check if user can join the meeting (<= 30 min rule)
   */
  const canJoinMeeting = (booking) => {
    const dateTimeString = `${booking.date} ${booking.timeslot.from}`;
    const bookingDateTime = dayjs(dateTimeString, "YYYY-MM-DD hh:mm A");
    const diffMinutes = bookingDateTime.diff(dayjs(), 'minute');
    return diffMinutes <= 30 && diffMinutes >= 0;
  };

  /**
   * Handle showing the Cancel/Reschedule popup
   */
  const handleShowPopup = (booking) => {
    setSelectedBooking(booking);
    setShowPopup(true);
    setIsRescheduling(false);
    setNewDate("");
    setTimeslots([]);
    setSelectedTimeslot(null);
  };

  /**
   * Handle Cancel Meeting
   */
  const handleCancelMeeting = async () => {
    if (!selectedBooking) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("User not authenticated!", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }

      // Example: refund/cancel endpoint
      await axios.post(
        `http://localhost:5000/api/bookings/refund/${selectedBooking._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Cancellation/Refund requested successfully!", {
        position: "top-center",
        autoClose: 3000,
      });

      fetchUpcoming();
    } catch (error) {
      toast.error("Failed to cancel the meeting.", {
        position: "top-center",
        autoClose: 3000,
      });
      console.error("Error cancelling meeting:", error);
    } finally {
      closePopup();
    }
  };

  /**
   * Handle Reschedule Flow
   */
  const handleReschedule = () => {
    setIsRescheduling(true);
    setNewDate("");
    setTimeslots([]);
    setSelectedTimeslot(null);
  };

  /**
   * Handle Date Change for Rescheduling
   */
  const handleDateChange = async (e) => {
    const dateValue = e.target.value;
    setNewDate(dateValue);

    if (!dateValue) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://localhost:5000/api/bookings/timeslots?date=${dateValue}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTimeslots(res.data);
    } catch (error) {
      toast.error("Error fetching timeslots for the selected date.", {
        position: "top-center",
        autoClose: 3000,
      });
      console.error("Error fetching timeslots:", error);
      setTimeslots([]);
    }
  };

  /**
   * Handle Confirm Reschedule
   */
  const handleConfirmReschedule = async () => {
    if (!selectedBooking || !newDate || !selectedTimeslot) {
      toast.error("Please select a new date and timeslot.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("User not authenticated!", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }

      // Example: update booking
      await axios.post(
        `http://localhost:5000/api/bookings/reschedule`,
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
      toast.error("Failed to reschedule the meeting.", {
        position: "top-center",
        autoClose: 3000,
      });
      console.error("Error rescheduling:", error);
    } finally {
      closePopup();
    }
  };

  /**
   * Close the Popup
   */
  const closePopup = () => {
    setShowPopup(false);
    setSelectedBooking(null);
    setIsRescheduling(false);
  };

  return (
    <div className="p-6 bg-gray-900 text-gray-200 rounded-md max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Upcoming Meetings</h1>

      {upcoming.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcoming.map((booking) => {
            const therapyName = booking.therapies[0]?.name || "N/A";
            const profileName = profileMap[booking.profileId] || "N/A";

            const isCancelled = booking.isCanceled || booking.status === "CANCELED"; // if you track in DB
            const refundStatus = booking.refundStatus; // "NONE", "INITIATED", "COMPLETED", etc.

            // If meeting is not yet canceled, can we join?
            const joinEnabled = canJoinMeeting(booking);

            return (
              <div key={booking._id} className="bg-gray-800 p-6 rounded-md shadow-lg flex flex-col">
                <h2 className="text-xl font-semibold mb-2">{therapyName}</h2>
                <h3 className="text-md text-gray-400 mb-1">
                  <span className="font-semibold">Child:</span> {profileName}
                </h3>
                <p className="text-sm text-gray-300 mb-1">
                  <span className="font-semibold">Date:</span> {dayjs(booking.date).format("MMMM D, YYYY")}
                </p>
                <p className="text-sm text-gray-300 mb-1">
                  <span className="font-semibold">Timeslot:</span> {booking.timeslot.from} - {booking.timeslot.to}
                </p>

                {/* Status Messages */}
                {isCancelled && (
                  <p className="text-red-500 text-sm mt-2">Cancellation initiated</p>
                )}
                {refundStatus === "INITIATED" && (
                  <p className="text-yellow-400 text-sm">Cancellation Requested</p>
                )}
                {refundStatus === "COMPLETED" && (
                  <p className="text-green-500 text-sm">Refunded</p>
                )}

                {/* Actions */}
                <div className="mt-auto">
                  {/* Join Meeting Button */}
                  {joinEnabled && !isCancelled && (
                    <Link
                      to={`/meeting/${booking._id}`}
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition mt-2"
                    >
                      Join Meeting
                    </Link>
                  )}

                  {/* Cancel/Reschedule Button */}
                  {!isCancelled &&
                    canCancelOrReschedule(booking) &&
                    refundStatus !== "INITIATED" && (
                      <button
                        onClick={() => handleShowPopup(booking)}
                        className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition mt-2 w-full"
                      >
                        Cancel / Reschedule
                      </button>
                  )}

                  {/* If refund is already requested, show text instead */}
                  {!isCancelled &&
                    canCancelOrReschedule(booking) &&
                    refundStatus === "INITIATED" && (
                      <p className="mt-2 text-yellow-300 text-center">
                        Requested cancellation
                      </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-400">No upcoming meetings.</p>
      )}

      {/* Cancel/Reschedule Popup */}
      {showPopup && selectedBooking && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closePopup}
          />

          <div className="relative bg-gray-800 p-6 rounded-md w-full max-w-md z-50">
            {!isRescheduling ? (
              <>
                <h2 className="text-xl font-bold mb-4">Cancel / Reschedule</h2>
                <p className="text-sm mb-4">
                  Would you like to cancel or reschedule this meeting?
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancelMeeting}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReschedule}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                  >
                    Reschedule
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">Reschedule Meeting</h2>
                <p className="text-sm mb-4">
                  Select a new date and timeslot:
                </p>

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
                      {timeslots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedTimeslot(slot)}
                          className={`px-2 py-1 rounded-md ${
                            selectedTimeslot && selectedTimeslot.from === slot.from
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-white hover:bg-gray-600"
                          }`}
                        >
                          {slot.from} - {slot.to}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : newDate ? (
                  <p className="text-gray-400 mb-4">No timeslots available on this date.</p>
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
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
                  >
                    Confirm
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
