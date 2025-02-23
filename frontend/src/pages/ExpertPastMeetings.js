"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ExpertPastMeetings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPastMeetings();
  }, []);

  /**
   * Fetch past meetings
   */
  const fetchPastMeetings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated!", { position: "top-center" });
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/expert/bookings/past",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(response.data);
    } catch (error) {
      toast.error("Failed to fetch past meetings!", { position: "top-center" });
      console.error("Error fetching past meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-gray-200 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">My Past Meetings</h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-400">No past meetings found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => {
            const clientName = booking.userId?.name || "Unknown";
            const dateStr = dayjs(booking.date).format("YYYY-MM-DD");
            const therapyName = booking.therapies[0]?.name || "N/A";

            return (
              <div
                key={booking._id}
                className="bg-gray-800 p-4 rounded-md shadow-lg flex flex-col"
              >
                <h2 className="text-lg font-semibold mb-2">{therapyName}</h2>
                <p className="text-sm text-gray-300 mb-1">
                  <span className="font-semibold">Date:</span> {dateStr}
                </p>
                <p className="text-sm text-gray-300 mb-1">
                  <span className="font-semibold">Timeslot:</span>{" "}
                  {booking.timeslot.from} - {booking.timeslot.to}
                </p>
                <p className="text-sm text-gray-300 mb-1">
                  <span className="font-semibold">Client:</span> {clientName}
                </p>
                <p className="text-sm text-gray-300 mb-1">
                  <span className="font-semibold">Mode:</span> {booking.mode}
                </p>

                {/* If you'd like to show if the session was completed, canceled, etc. */}
                {booking.status && (
                  <p className="text-sm text-gray-300 mb-1">
                    <span className="font-semibold">Status:</span> {booking.status}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
