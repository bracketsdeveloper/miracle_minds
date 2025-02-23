'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function AdminUpcomingBookingsPage() {
  const [upcomingBookings, setUpcomingBookings] = useState([]);

  useEffect(() => {
    fetchUpcomingBookings();
  }, []);

  const fetchUpcomingBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://miracle-minds.vercel.app/api/bookings/admin/upcoming", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpcomingBookings(response.data);
    } catch (error) {
      console.error("Error fetching upcoming bookings:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-gray-200">
      <h1 className="text-2xl font-bold mb-4">Admin - Upcoming Bookings</h1>

      {upcomingBookings.length > 0 ? (
        <div className="overflow-auto">
          <table className="w-full text-left text-gray-300">
            <thead>
              <tr>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Therapies</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Timeslot</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {upcomingBookings.map((booking) => {
                const userName = booking.userId ? booking.userId.name : "No User";
                const therapyNames = booking.therapies.map((t) => t.name).join(", ");

                return (
                  <tr key={booking._id} className="border-b border-gray-700">
                    <td className="px-4 py-2">{userName}</td>
                    <td className="px-4 py-2">{therapyNames}</td>
                    <td className="px-4 py-2">{booking.date}</td>
                    <td className="px-4 py-2">
                      {booking.timeslot.from} - {booking.timeslot.to}
                    </td>
                    <td className="px-4 py-2">{booking.status}</td>
                    <td className="px-4 py-2">
                      <Link
                        to={`/admin-dashboard/bookings/detail/${booking._id}`}
                        className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No upcoming bookings found.</p>
      )}
    </div>
  );
}
