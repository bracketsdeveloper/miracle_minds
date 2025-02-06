'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function AdminBookingDetailPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    fetchBookingDetail();
  }, [bookingId]);

  const fetchBookingDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/bookings/admin/detail/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooking(response.data);
    } catch (error) {
      console.error("Error fetching booking detail:", error);
    }
  };

  if (!booking) {
    return (
      <div className="p-6 bg-gray-900 text-gray-200">
        <h1 className="text-2xl font-bold mb-4">Booking Detail</h1>
        <p>Loading...</p>
      </div>
    );
  }

  const user = booking.userId || {};
  const therapyNames = booking.therapies.map((t) => t.name).join(", ");
  const therapyCosts = booking.therapies.map((t) => t.cost).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 bg-gray-900 text-gray-200">
      <h1 className="text-2xl font-bold mb-6">Booking Detail</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">User Info</h2>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
        {/* If you store more user info (address, phone, etc.), display here */}
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Booking Info</h2>
        <p>Booking ID: {booking._id}</p>
        <p>Date: {booking.date}</p>
        <p>Timeslot: {booking.timeslot.from} - {booking.timeslot.to}</p>
        <p>Therapies: {therapyNames}</p>
        <p>Amount Paid: ₹{booking.amountPaid}</p>
        <p>Status: {booking.status}</p>
        {/* If you track isCanceled, refundStatus, etc., show that too */}
      </div>

      {/* Additional admin actions, e.g. "Cancel" or "Refund" if needed */}
    </div>
  );
}
