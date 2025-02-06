'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function AdminAllBookingsPage() {
  const [allBookings, setAllBookings] = useState([]);

  // Filters
  const [therapyId, setTherapyId] = useState("");
  const [month, setMonth] = useState(""); // format "YYYY-MM"
  const [date, setDate] = useState("");   // format "YYYY-MM-DD"
  const [status, setStatus] = useState("");

  // For dropdown of therapies
  const [therapies, setTherapies] = useState([]);

  useEffect(() => {
    // Initially, fetch all bookings without any filter
    fetchAllBookings({});
    // Also load the therapy list
    fetchTherapies();
  }, []);

  const fetchTherapies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://miracle-minds.vercel.app/api/therapies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTherapies(res.data); // array of all therapy docs
    } catch (error) {
      console.error("Error fetching therapies:", error);
    }
  };

  const fetchAllBookings = async (params) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://miracle-minds.vercel.app/api/bookings/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
        params, 
      });
      setAllBookings(res.data);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
    }
  };

  // On "Search" button
  const handleSearch = () => {
    // Build query params from the current states
    const params = {};
    if (therapyId) params.therapyId = therapyId;
    if (month) params.month = month;
    if (date) params.date = date;
    if (status) params.status = status;

    fetchAllBookings(params);
  };

  // (Optional) Reset all filters
  const handleReset = () => {
    setTherapyId("");
    setMonth("");
    setDate("");
    setStatus("");
    // Re-fetch with empty params
    fetchAllBookings({});
  };

  return (
    <div className="p-6 bg-gray-900 text-gray-200">
      <h1 className="text-2xl font-bold mb-4">Admin - All Bookings</h1>

      {/* Filter Section */}
      <div className="mb-4 flex flex-wrap gap-4 items-end">
        {/* Therapy Filter */}
        <div>
          <label className="block mb-1 text-sm">Therapy</label>
          <select
            value={therapyId}
            onChange={(e) => setTherapyId(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded"
          >
            <option value="">All</option>
            {therapies.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        <div>
          <label className="block mb-1 text-sm">Month (YYYY-MM)</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded"
          />
        </div>

        {/* Date Filter */}
        <div>
          <label className="block mb-1 text-sm">Date (YYYY-MM-DD)</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block mb-1 text-sm">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded"
          >
            <option value="">All</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="FAILED">FAILED</option>
            <option value="CANCELED">CANCELED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Search
        </button>

        {/* (Optional) Reset Button */}
        <button
          onClick={handleReset}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded ml-2"
        >
          Reset
        </button>
      </div>

      {/* Bookings Table */}
      {allBookings.length > 0 ? (
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
              {allBookings.map((booking) => {
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
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
        <p>No bookings found.</p>
      )}
    </div>
  );
}
