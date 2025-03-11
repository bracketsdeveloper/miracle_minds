"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AdminBookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // For the therapist details modal
  const [showTherapistModal, setShowTherapistModal] = useState(false);
  const [therapistProfile, setTherapistProfile] = useState(null);

  useEffect(() => {
    fetchBookingDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const fetchBookingDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://miracle-minds.vercel.app/api/bookings/admin/detail/${bookingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBooking(response.data);
    } catch (error) {
      console.error("Error fetching booking detail:", error);
      toast.error("Error fetching booking detail.");
    }
  };

  // Fetch therapist details if user clicks the therapist name
  const handleTherapistClick = async () => {
    if (!booking || !booking.therapistId) return;
    // If the backend populates 'booking.therapistId' as an object with _id,
    // handle that scenario:
    const therapistId =
      typeof booking.therapistId === "object"
        ? booking.therapistId._id
        : booking.therapistId;

    if (!therapistId) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://miracle-minds.vercel.app/api/therapists/${therapistId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTherapistProfile(res.data); // store the doc from DB
      setShowTherapistModal(true);   // show popup
    } catch (error) {
      console.error("Error fetching therapist details:", error);
      toast.error("Failed to fetch therapist details.");
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
      await axios.post(
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
      fetchBookingDetail(); // Refresh the booking detail
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

  // from booking doc
  const user = booking.userId || {};
  const therapyNames = booking.therapies.map((t) => t.name).join(", ");

  return (
    <div className="p-6 bg-gray-900 text-gray-200 relative">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
      >
        Back
      </button>
      <h1 className="text-2xl font-bold mb-6">Booking Detail</h1>

      {/* User Info */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">User Info</h2>
        <p>Name: {user.name}</p>
        <p>Email: {booking.email || user.email}</p>
        <p>Phone: {booking.phone}</p>
      </div>

      {/* Booking Info */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Booking Info</h2>
        <p>Booking ID: {booking._id}</p>
        <p>Date: {booking.date}</p>
        <p>
          Timeslot: {booking.timeslot.from} - {booking.timeslot.to}
        </p>
        <p>Therapies: {therapyNames}</p>
        <p>Amount Paid: ₹{booking.amountPaid}</p>
        <p>Status: {booking.status}</p>
        {/* Child details / Additional fields */}
        <p>Child Name: {booking.profileId}</p>
        <p>Child DOB: {booking.childDOB}</p>

        {/* Therapist name is clickable => opens popup */}
        <p>
          Therapist:{" "}
          <button
            onClick={handleTherapistClick}
            className="text-pink-400 hover:underline"
          >
            {booking.therapistName || "N/A"}
          </button>
        </p>
        <p>Mode: {booking.mode}</p>
      </div>

      {/* Upload Reports */}
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
                <p key={idx} className="text-sm">
                  {file.name}
                </p>
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

      {/* Uploaded Reports */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Uploaded Reports</h2>
        {booking.reports && booking.reports.length > 0 ? (
          <ul className="list-disc ml-6">
            {booking.reports.map((report, idx) => (
              <li key={idx}>
                <a
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:underline"
                >
                  {report.url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No reports uploaded.</p>
        )}
      </div>

      {/* Therapist Modal (if showTherapistModal = true) */}
      {showTherapistModal && therapistProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-md w-full max-w-md mx-4 relative">
            <button
              onClick={() => setShowTherapistModal(false)}
              className="absolute top-2 right-2 bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
            >
              X
            </button>

            {/* Show therapist info */}
            <div className="flex flex-col items-center text-center">
              {/* Photo */}
              {therapistProfile.photo ? (
                <img
                  src={therapistProfile.photo}
                  alt={therapistProfile.name}
                  className="h-32 w-32 object-cover rounded-full mb-4"
                />
              ) : (
                <div className="h-32 w-32 bg-gray-700 flex items-center justify-center rounded-full mb-4">
                  No Image
                </div>
              )}
              <h2 className="text-xl font-bold mb-2">{therapistProfile.name}</h2>
              {therapistProfile.expertise && therapistProfile.expertise.length > 0 && (
                <p className="text-sm text-gray-300 mb-2">
                  Expertise: {therapistProfile.expertise.join(", ")}
                </p>
              )}
              <p className="text-sm text-gray-300 mb-2">
                {therapistProfile.about || "No description"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
