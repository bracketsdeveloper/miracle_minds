'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

export default function TherapyBooking() {
  const [therapies, setTherapies] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [selectedTherapies, setSelectedTherapies] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [timeslots, setTimeslots] = useState([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchTherapiesAndProfiles = async () => {
      try {
        const token = localStorage.getItem("token");
        // fetch therapies
        const therapyRes = await axios.get("http://localhost:5000/api/therapies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTherapies(therapyRes.data);

        // fetch user + profiles
        const profileRes = await axios.get("http://localhost:5000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfiles(profileRes.data.profiles || []);

      } catch (error) {
        toast.error("Error fetching therapies or profiles!", {
          position: "top-center",
          autoClose: 3000,
        });
        console.error("Error fetching data:", error);
      }
    };

    fetchTherapiesAndProfiles();
  }, []);

  useEffect(() => {
    const fetchTimeslots = async () => {
      if (!selectedProfile || selectedTherapies.length === 0) return;
      try {
        const token = localStorage.getItem("token");
        const dateString = selectedDate.format("YYYY-MM-DD");

        // GET /api/bookings/timeslots?date=YYYY-MM-DD
        const response = await axios.get(
          `http://localhost:5000/api/bookings/timeslots?date=${dateString}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // If selected day is "today", filter out timeslots in the past
        let filteredSlots = response.data;
        const todayString = dayjs().format("YYYY-MM-DD");

        if (dateString === todayString) {
          // remove timeslots that have already passed
          const now = dayjs();
          filteredSlots = filteredSlots.filter((slot) => {
            const slotTime = dayjs(`${dateString} ${slot.from}`, "YYYY-MM-DD HH:mm");
            return slotTime.isAfter(now); // keep only future slots
          });
        }

        setTimeslots(filteredSlots);
      } catch (error) {
        toast.error("Error fetching timeslots!", {
          position: "top-center",
          autoClose: 3000,
        });
        console.error("Error fetching timeslots:", error);
      }
    };
    fetchTimeslots();
  }, [selectedDate, selectedProfile, selectedTherapies]);

  const handleTherapySelection = (therapyId) => {
    setSelectedTherapies([therapyId]);
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const addToCart = async () => {
    try {
      if (!selectedProfile || !selectedTherapies.length || !selectedTimeslot) {
        toast.error("Please select all required fields!", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }
      const token = localStorage.getItem("token");
      const payload = {
        profileId: selectedProfile,
        therapies: selectedTherapies,
        date: selectedDate.format("YYYY-MM-DD"),
        timeslot: selectedTimeslot,
      };
      const response = await axios.post("http://localhost:5000/api/cart", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(response.data.message || "Added to cart successfully!", {
        position: "top-center",
        autoClose: 3000,
      });
      // Reset
      setSelectedTherapies([]);
      setSelectedTimeslot("");
      setCurrentStep(1);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add to cart. Please try again.",
        { position: "top-center", autoClose: 3000 }
      );
      console.error("Error adding to cart:", error);
    }
  };

  // Move date backward by 1 day if not < today
  const handlePreviousDate = () => {
    const newDate = selectedDate.subtract(1, "day");
    if (newDate.isBefore(dayjs(), "day")) {
      toast.warning("Cannot go to a past date!");
      return;
    }
    setSelectedDate(newDate);
  };

  // Move date forward by 1 day
  const handleNextDate = () => {
    const newDate = selectedDate.add(1, "day");
    setSelectedDate(newDate);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="p-6 bg-gray-900 text-gray-200 rounded-md max-w-5xl mx-auto">
        <div className="flex justify-between mb-4">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep === 4}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {/* Step 1: Select Therapy */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-6">Select Your Therapy</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {therapies.map((therapy) => {
                const isSelected = selectedTherapies.includes(therapy._id);
                return (
                  <div
                    key={therapy._id}
                    onClick={() => handleTherapySelection(therapy._id)}
                    className={`
                      bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer 
                      flex flex-col justify-between 
                      transition-transform transform hover:scale-105
                      ${isSelected ? "border-2 border-blue-500" : "border border-gray-700"}
                    `}
                  >
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {therapy.name}
                      </h3>
                      <p className="text-sm text-gray-300 mb-4">
                        {/* If therapy has a 'description' field, display it; else remove this */}
                        {therapy.description || "No description provided."}
                      </p>
                    </div>
                    <div className="mt-auto">
                      <p className="text-md font-bold text-gray-100">
                        Price: ₹{therapy.cost}
                      </p>
                      {isSelected ? (
                        <p className="mt-2 text-blue-400 font-semibold">Selected</p>
                      ) : (
                        <p className="mt-2 text-gray-400">Tap to Select</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Select Profile */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Select Profile</h2>
            {profiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profiles.map((profile) => (
                  <div
                    key={profile._id}
                    onClick={() => setSelectedProfile(profile._id)}
                    className={`p-4 rounded-lg text-center cursor-pointer ${
                      selectedProfile === profile._id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {profile.name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-300 mb-4">
                  No profiles available. Please create one.
                </p>
                <Link
                  to={"/dashboard/edit-profile"}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Add Profile
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Select Date */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Select Date</h2>
            <DateCalendar
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              className="bg-gray-700 rounded-lg p-4 shadow-lg"
              disablePast
            />
          </div>
        )}

        {/* Step 4: Select Timeslot */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Select Timeslot</h2>

            {/* Next/Prev Date at the top + showing the date */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePreviousDate}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Previous Date
              </button>
              <p className="text-gray-200 font-semibold">
                {selectedDate.format("YYYY-MM-DD")}
              </p>
              <button
                onClick={handleNextDate}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Next Date
              </button>
            </div>

            {timeslots.length === 0 ? (
              <p className="text-gray-400">No timeslots available for this date.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {timeslots.map((slot, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedTimeslot(slot)}
                    className={`p-4 rounded-lg text-center cursor-pointer ${
                      selectedTimeslot.from === slot.from &&
                      selectedTimeslot.to === slot.to
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {slot.from} - {slot.to}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={addToCart}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Add to Cart
            </button>
          </div>
        )}
      </div>
    </LocalizationProvider>
  );
}
