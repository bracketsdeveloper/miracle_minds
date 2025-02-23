// AdminBookingDetailPage.js
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AdminBookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchBookingDetail();
  }, [bookingId]);

  const fetchBookingDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`https://miracle-minds.vercel.app/api/bookings/admin/detail/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooking(response.data);
    } catch (error) {
      console.error("Error fetching booking detail:", error);
      toast.error("Error fetching booking detail.");
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleUploadReports = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("Please select at least one file to upload.");
      return;
    }
    const token = localStorage.getItem("token");
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("reports", selectedFiles[i]);
    }
    try {
      const response = await axios.post(
        `https://miracle-minds.vercel.app/api/admin/reports/${bookingId}/upload-reports`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Reports uploaded successfully!");
      fetchBookingDetail();
    } catch (error) {
      console.error("Error uploading reports:", error);
      toast.error("Failed to upload reports.");
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

  return (
    <div className="p-6 bg-gray-900 text-gray-200">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
      >
        Back
      </button>
      <h1 className="text-2xl font-bold mb-6">Booking Detail</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">User Info</h2>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Booking Info</h2>
        <p>Booking ID: {booking._id}</p>
        <p>Date: {booking.date}</p>
        <p>Timeslot: {booking.timeslot.from} - {booking.timeslot.to}</p>
        <p>Therapies: {therapyNames}</p>
        <p>Amount Paid: ₹{booking.amountPaid}</p>
        <p>Status: {booking.status}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Upload Reports</h2>
        <div className="border-2 border-dashed border-gray-500 p-4 flex flex-col items-center justify-center">
          <label className="cursor-pointer">
            <div className="w-16 h-16 flex items-center justify-center bg-gray-700 text-white rounded">
              +
            </div>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <p className="mt-2 text-sm">Upload PDF, images, etc.</p>
          {selectedFiles && selectedFiles.length > 0 && (
            <div className="mt-2">
              {Array.from(selectedFiles).map((file, idx) => (
                <p key={idx} className="text-sm">{file.name}</p>
              ))}
            </div>
          )}
          <button
            onClick={handleUploadReports}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Upload Reports
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Uploaded Reports</h2>
        {booking.reports && booking.reports.length > 0 ? (
          <ul className="list-disc ml-6">
            {booking.reports.map((report, idx) => (
              <li key={idx}>
                <a href={report.url} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">
                  {report.url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No reports uploaded.</p>
        )}
      </div>
    </div>
  );
}
