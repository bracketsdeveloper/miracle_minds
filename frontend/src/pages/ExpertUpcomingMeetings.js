"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ExpertUpcomingMeetings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingBookings();
  }, []);

  const fetchUpcomingBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated!", { position: "top-center" });
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "https://miracle-minds.vercel.app/api/expert/bookings/upcoming",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(response.data);
    } catch (error) {
      toast.error("Failed to fetch your upcoming meetings!", {
        position: "top-center",
      });
      console.error("Error fetching expert upcoming bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-gray-200 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">My Upcoming Meetings</h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-400">No upcoming meetings found.</p>
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

                {/* If you want to add a "Start Meeting" button for ONLINE calls, etc. */}
                {booking.mode === "ONLINE" && (
                  <button
                    className="mt-auto bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md"
                    onClick={() => {
                      // e.g. navigate to your meeting page
                    }}
                  >
                    Start Online Session
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
