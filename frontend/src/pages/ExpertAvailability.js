// ExpertAvailability.js (Frontend – Manual Timeslot Input Version)
"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function ExpertAvailability() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [newSlot, setNewSlot] = useState({ from: "", to: "" });
  const [userSlots, setUserSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // For recurring and copy features
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [recurringDays, setRecurringDays] = useState([]);
  const [copyDates, setCopyDates] = useState([]);

  // Fetch expert's availability for the selected date
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const dateStr = selectedDate.format("YYYY-MM-DD");
        const res = await axios.get(`http://localhost:5000/api/expert/availability?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserSlots(res.data || []);
      } catch (error) {
        console.error("Error fetching availability:", error);
        toast.error("Failed to fetch availability.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, [selectedDate]);

  // Add a new timeslot manually
  const addSlot = () => {
    if (!newSlot.from || !newSlot.to) {
      toast.error("Please enter both 'from' and 'to' times.");
      return;
    }
    if (newSlot.from >= newSlot.to) {
      toast.error("'From' time must be earlier than 'To' time.");
      return;
    }
    setUserSlots([...userSlots, { ...newSlot }]);
    setNewSlot({ from: "", to: "" });
  };

  // Remove a timeslot
  const removeSlot = (index) => {
    setUserSlots(userSlots.filter((_, i) => i !== index));
  };

  // Save availability for the selected date
  const handleSaveAvailability = async () => {
    try {
      const token = localStorage.getItem("token");
      const dateStr = selectedDate.format("YYYY-MM-DD");
      await axios.post(
        "http://localhost:5000/api/expert/availability",
        { date: dateStr, slots: userSlots },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Availability saved successfully!");
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("Failed to save availability.");
    }
  };

  // Apply recurring availability
  const handleApplyRecurring = async () => {
    if (recurringDays.length === 0) {
      toast.error("Select at least one weekday for recurring availability.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const sourceDate = selectedDate.format("YYYY-MM-DD");
      await axios.post(
        "http://localhost:5000/api/expert/availability/recurring",
        { sourceDate, recurringDays },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Recurring availability applied successfully!");
      setRecurringDays([]);
    } catch (error) {
      console.error("Error applying recurring availability:", error);
      toast.error("Failed to apply recurring availability.");
    }
  };

  // Copy availability to multiple dates
  const handleCopyAvailability = async () => {
    if (copyDates.length === 0) {
      toast.error("Select at least one target date for copying.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const sourceDate = selectedDate.format("YYYY-MM-DD");
      const targetDates = copyDates.map((d) => d.format("YYYY-MM-DD"));
      await axios.post(
        "http://localhost:5000/api/expert/availability/copy",
        { sourceDate, targetDates },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Availability copied successfully!");
      setCopyDates([]);
    } catch (error) {
      console.error("Error copying availability:", error);
      toast.error("Failed to copy availability.");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="p-6 bg-gray-900 text-gray-200 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Set Your Availability</h1>

        {/* Date selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Date</label>
          <DatePicker
            value={selectedDate}
            onChange={(newVal) => newVal && setSelectedDate(newVal)}
            renderInput={({ inputRef, inputProps, disabled }) => (
              <input
                ref={inputRef}
                {...inputProps}
                disabled={disabled}
                className="bg-gray-700 text-gray-300 border border-gray-600 rounded-md px-3 py-2 w-full"
              />
            )}
          />
        </div>

        {/* Manual timeslot input */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Add Timeslot</h2>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm">From</label>
              <input
                type="time"
                value={newSlot.from}
                onChange={(e) => setNewSlot({ ...newSlot, from: e.target.value })}
                className="bg-gray-700 text-gray-300 border border-gray-600 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm">To</label>
              <input
                type="time"
                value={newSlot.to}
                onChange={(e) => setNewSlot({ ...newSlot, to: e.target.value })}
                className="bg-gray-700 text-gray-300 border border-gray-600 rounded px-3 py-2"
              />
            </div>
            <button onClick={addSlot} className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded">
              Add
            </button>
          </div>
        </div>

        {/* Display current timeslots for the selected date */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">
            Your Timeslots for {selectedDate.format("DD-MM-YYYY")}
          </h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : userSlots.length === 0 ? (
            <p className="text-gray-400">No timeslots added yet.</p>
          ) : (
            <ul className="space-y-2">
              {userSlots.map((slot, index) => (
                <li key={index} className="bg-gray-800 p-2 rounded flex justify-between items-center">
                  <span>
                    {slot.from} - {slot.to}
                  </span>
                  <button onClick={() => removeSlot(index)} className="text-red-500 hover:text-red-700">
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button onClick={handleSaveAvailability} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
            Save Availability for {selectedDate.format("DD-MM-YYYY")}
          </button>
        </div>

        {/* Recurring Availability */}
        <div className="mb-6 bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Apply Recurring Availability</h2>
          <p className="text-sm text-gray-400 mb-2">
            This will apply your current timeslots for {selectedDate.format("DD-MM-YYYY")} to the selected weekdays for the next year.
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {weekdays.map((day) => (
              <button
                key={day}
                onClick={() =>
                  setRecurringDays((prev) =>
                    prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                  )
                }
                className={`px-3 py-1 rounded ${
                  recurringDays.includes(day)
                    ? "bg-pink-600 text-white"
                    : "bg-gray-600 text-gray-200 hover:bg-gray-500"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          {recurringDays.length > 0 && (
            <p className="mb-2 text-sm">Selected: {recurringDays.join(", ")}</p>
          )}
          <button onClick={handleApplyRecurring} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
            Apply Recurring
          </button>
        </div>

        {/* Copy Availability */}
        <div className="mb-6 bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Copy Availability to Multiple Dates</h2>
          <DatePicker
            value={null}
            onChange={(newDate) => newDate && setCopyDates([...copyDates, newDate])}
            renderInput={({ inputRef, inputProps, disabled }) => (
              <input
                ref={inputRef}
                {...inputProps}
                disabled={disabled}
                className="bg-gray-700 text-gray-300 border border-gray-600 rounded-md px-3 py-2 w-full mb-2"
                placeholder="Select target date"
              />
            )}
          />
          <div className="flex flex-wrap gap-2">
            {copyDates.map((dt, i) => (
              <span key={i} className="bg-gray-700 px-2 py-1 rounded text-sm">
                {dt.format("DD-MM-YYYY")}
              </span>
            ))}
          </div>
          <button onClick={handleCopyAvailability} className="mt-3 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded">
            Copy Availability
          </button>
        </div>
      </div>
    </LocalizationProvider>
  );
}
