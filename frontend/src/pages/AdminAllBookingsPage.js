// AdminAllBookingsPage.js
'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminAllBookingsPage() {
  const [allBookings, setAllBookings] = useState([]);

  // Filters (Group 1)
  const [therapyId, setTherapyId] = useState("");
  const [month, setMonth] = useState(""); // format "YYYY-MM"
  const [date, setDate] = useState("");   // format "YYYY-MM-DD"
  const [status, setStatus] = useState("");
  // Separate Email Filter
  const [email, setEmail] = useState("");

  // For dropdown of therapies
  const [therapies, setTherapies] = useState([]);

  useEffect(() => {
    fetchTherapies();
    fetchAllBookings({});
  }, []);

  const fetchTherapies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://miracle-minds.vercel.app/api/therapies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTherapies(res.data);
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

  const handleSearch = () => {
    const params = {};
    if (therapyId) params.therapyId = therapyId;
    if (month) params.month = month;
    if (date) params.date = date;
    if (status) params.status = status;
    if (email) params.email = email;
    fetchAllBookings(params);
  };

  // Update search whenever email changes
  useEffect(() => {
    handleSearch();
  }, [email]);

  const handleReset = () => {
    setTherapyId("");
    setMonth("");
    setDate("");
    setStatus("");
    setEmail("");
    fetchAllBookings({});
  };

  const distinctEmails = useMemo(() => {
    const emails = new Set();
    allBookings.forEach((booking) => {
      if (booking.email) emails.add(booking.email);
    });
    return Array.from(emails);
  }, [allBookings]);

  const groupedBookings = useMemo(() => {
    const groups = {
      Today: [],
      Yesterday: [],
      "Last Week": [],
      "Last Month": [],
      "Long Ago": [],
    };

    const today = dayjs().startOf('day');
    const yesterday = dayjs().subtract(1, 'day').startOf('day');
    const lastWeek = dayjs().subtract(7, 'day').startOf('day');
    const lastMonth = dayjs().subtract(1, 'month').startOf('day');

    allBookings.forEach((booking) => {
      const bDate = dayjs(booking.date, "YYYY-MM-DD");
      if (bDate.isSame(today, 'day')) {
        groups["Today"].push(booking);
      } else if (bDate.isSame(yesterday, 'day')) {
        groups["Yesterday"].push(booking);
      } else if (bDate.isAfter(lastWeek)) {
        groups["Last Week"].push(booking);
      } else if (bDate.isAfter(lastMonth)) {
        groups["Last Month"].push(booking);
      } else {
        groups["Long Ago"].push(booking);
      }
    });
    return groups;
  }, [allBookings]);

  return (
    <div className="p-6 bg-gray-900 text-gray-200">
      <h1 className="text-2xl font-bold mb-4">Admin - All Bookings</h1>

      {/* Filter Section Group 1 */}
      <div className="mb-4 flex flex-wrap gap-4 items-end">
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
        <div>
          <label className="block mb-1 text-sm">Month (YYYY-MM)</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm">Date (YYYY-MM-DD)</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded"
          />
        </div>
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
      </div>

      {/* Separate Email Filter */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex-1">
          <label className="block mb-1 text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            list="email-suggestions"
            className="bg-gray-700 text-white px-3 py-2 rounded w-full"
            placeholder="user@example.com"
          />
          <datalist id="email-suggestions">
            {distinctEmails.map((em, idx) => (
              <option key={idx} value={em} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Reset Button */}
      <div className="mb-4">
        <button
          onClick={handleReset}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
        >
          Reset Filters
        </button>
      </div>

      {/* Grouped Bookings */}
      {["Today", "Yesterday", "Last Week", "Last Month", "Long Ago"].map((group) => (
        <div key={group} className="mb-6">
          {groupedBookings[group].length > 0 && (
            <>
              <h2 className="text-xl font-bold mb-2">{group}</h2>
              <div className="overflow-auto">
                <table className="w-full text-left text-gray-300 mb-4">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">User</th>
                      <th className="px-4 py-2">Therapies</th>
                      <th className="px-4 py-2">Mode</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Timeslot</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedBookings[group].map((booking) => {
                      const userName = booking.userId ? booking.userId.name : "No User";
                      const therapyNames = booking.therapies.map((t) => t.name).join(", ");
                      return (
                        <tr key={booking._id} className="border-b border-gray-700">
                          <td className="px-4 py-2">{userName}</td>
                          <td className="px-4 py-2">{therapyNames}</td>
                          <td className="px-4 py-2">{booking.mode}</td>
                          <td className="px-4 py-2">{booking.email || "N/A"}</td>
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
            </>
          )}
        </div>
      ))}

      {allBookings.length === 0 && (
        <p className="text-center">No bookings found.</p>
      )}
    </div>
  );
}
