"use client";

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
  // Step 1: Therapy
  const [therapies, setTherapies] = useState([]);
  const [selectedTherapies, setSelectedTherapies] = useState([]);

  // Step 2: Mode
  const [mode, setMode] = useState(null); // "ONLINE" or "OFFLINE" or null

  // Step 3: Profile
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState("");

  // Step 4: Date
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // Step 5: Timeslot (with coverage info)
  const [timeslots, setTimeslots] = useState([]); 
  const [selectedTimeslot, setSelectedTimeslot] = useState(null);

  // Current step (1..5)
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch therapies and user profiles once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        // 1) Therapies
        const therapyRes = await axios.get("http://localhost:5000/api/therapies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTherapies(therapyRes.data);

        // 2) User => profiles
        const userRes = await axios.get("http://localhost:5000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userProfiles = userRes.data?.profiles || [];
        setProfiles(userProfiles);

        // If there's exactly 1 profile, auto-select it
        if (userProfiles.length === 1) {
          setSelectedProfile(userProfiles[0]._id);
        }
      } catch (error) {
        toast.error("Error fetching therapies or profiles!", {
          position: "top-center",
          autoClose: 3000,
        });
        console.error("Error:", error);
      }
    };
    fetchData();
  }, []);

  /**
   * Whenever these dependencies change:
   *  - selectedProfile, selectedTherapies, selectedDate, mode
   * we fetch timeslots from:
   *    GET /api/bookings/timeslots?date=YYYY-MM-DD[&mode=ONLINE|OFFLINE&therapies=ID,ID...]
   * If mode & therapies are present, we get `hasExpert` in the response.
   */
  useEffect(() => {
    const fetchTimeslots = async () => {
      // We only call if we have a date + some therapy selected + a mode + a profile
      if (!selectedProfile || selectedTherapies.length === 0 || !mode) {
        setTimeslots([]); 
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const dateStr = selectedDate.format("YYYY-MM-DD");
        const therapyIds = selectedTherapies.join(","); // "id1,id2"

        // build query
        let url = `http://localhost:5000/api/bookings/timeslots?date=${dateStr}&mode=${mode}&therapies=${therapyIds}`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // If the route returns e.g. [ { from, to, hasExpert }, ... ]
        let avail = res.data || [];

        // Filter out past times if "today"
        const todayStr = dayjs().format("YYYY-MM-DD");
        if (dateStr === todayStr) {
          const now = dayjs();
          avail = avail.filter((slot) => {
            // parse each slot from?
            const slotTime = dayjs(`${dateStr} ${slot.from}`, "YYYY-MM-DD HH:mm");
            return slotTime.isAfter(now);
          });
        }

        setTimeslots(avail);
      } catch (error) {
        console.error("Error fetching timeslots coverage:", error);
        toast.error("Error fetching timeslots!", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    };
    fetchTimeslots();
  }, [selectedProfile, selectedTherapies, selectedDate, mode]);

  // Step nav
  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };
  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // step 1: single therapy selection
  const handleTherapySelection = (therapyId) => {
    setSelectedTherapies([therapyId]);
  };

  // step 2: mode
  const handleModeSelection = (chosenMode) => {
    setMode(chosenMode);
  };

  // step 4: date nav
  const handlePreviousDate = () => {
    const newDate = selectedDate.subtract(1, "day");
    if (newDate.isBefore(dayjs(), "day")) {
      toast.warning("Cannot go to a past date!");
      return;
    }
    setSelectedDate(newDate);
  };
  const handleNextDate = () => {
    setSelectedDate(selectedDate.add(1, "day"));
  };

  // final step: add to cart => /book
  const addToCart = async () => {
    if (!selectedProfile || selectedTherapies.length === 0 || !selectedTimeslot || !mode) {
      toast.error("Please select all required fields!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const payload = {
        therapies: selectedTherapies,
        date: selectedDate.format("YYYY-MM-DD"),
        timeslot: selectedTimeslot, 
        profileId: selectedProfile,
        mode,
      };
      const response = await axios.post("http://localhost:5000/api/bookings/book", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(response.data.message || "Added to cart successfully!", {
        position: "top-center",
        autoClose: 3000,
      });

      // reset
      setSelectedTherapies([]);
      setMode(null);
      setSelectedTimeslot(null);
      setCurrentStep(1);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add to cart. Please try again.",
        { position: "top-center", autoClose: 3000 }
      );
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="p-6 bg-gray-900 text-gray-200 rounded-md max-w-5xl mx-auto">
        {/* Step Navigation */}
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
            disabled={currentStep === 5}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {/* Step 1: Select Therapy */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Select Therapy</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {therapies.map((therapy) => {
                const isSelected = selectedTherapies.includes(therapy._id);
                return (
                  <div
                    key={therapy._id}
                    onClick={() => handleTherapySelection(therapy._id)}
                    className={`bg-gray-800 p-4 rounded-lg cursor-pointer transition hover:scale-105 ${
                      isSelected ? "border-2 border-pink-500" : "border border-gray-600"
                    }`}
                  >
                    <h3 className="text-lg font-semibold mb-2">{therapy.name}</h3>
                    <p className="text-sm text-gray-300">
                      {therapy.description || "No description provided."}
                    </p>
                    <p className="mt-2 font-bold">₹{therapy.cost}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Choose Mode */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Choose Mode of Session</h2>
            <div className="grid grid-cols-2 gap-6">
              <div
                onClick={() => handleModeSelection("ONLINE")}
                className={`p-6 rounded-lg cursor-pointer text-center transition hover:scale-105 ${
                  mode === "ONLINE" ? "bg-pink-600" : "bg-gray-800"
                }`}
              >
                <h3 className="text-lg font-semibold mb-2">Online</h3>
                <p className="text-sm text-gray-300">Conduct via video call.</p>
              </div>
              <div
                onClick={() => handleModeSelection("OFFLINE")}
                className={`p-6 rounded-lg cursor-pointer text-center transition hover:scale-105 ${
                  mode === "OFFLINE" ? "bg-pink-600" : "bg-gray-800"
                }`}
              >
                <h3 className="text-lg font-semibold mb-2">Offline</h3>
                <p className="text-sm text-gray-300">In-person at our center.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Select Profile */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Select Profile</h2>
            {profiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profiles.map((profile) => (
                  <div
                    key={profile._id}
                    onClick={() => setSelectedProfile(profile._id)}
                    className={`p-4 rounded-lg text-center cursor-pointer ${
                      selectedProfile === profile._id
                        ? "bg-pink-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {profile.name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-300 mb-4">No profiles available. Please create one.</p>
                <Link
                  to="/dashboard/edit-profile"
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                  Add Profile
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Select Date */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Select Date</h2>
            <DateCalendar
              value={selectedDate}
              onChange={(newVal) => setSelectedDate(newVal)}
              className="bg-gray-700 rounded-lg p-4 shadow-lg"
              disablePast
            />
          </div>
        )}

        {/* Step 5: Select Timeslot */}
        {currentStep === 5 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Select Timeslot</h2>
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
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
              >
                Next Date
              </button>
            </div>

            {timeslots.length === 0 ? (
              <p className="text-gray-400">No timeslots available for this date.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {timeslots.map((slot, idx) => {
                  // If slot.hasExpert is false => mark red
                  const isSelected =
                    selectedTimeslot &&
                    selectedTimeslot.from === slot.from &&
                    selectedTimeslot.to === slot.to;

                  let tileClasses = "";
                  if (slot.hasExpert === false) {
                    // Red tile + no click
                    tileClasses = "bg-red-600 text-white cursor-not-allowed";
                  } else {
                    // tile is available => normal
                    tileClasses = isSelected
                      ? "bg-pink-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 cursor-pointer";
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (slot.hasExpert) {
                          setSelectedTimeslot(slot);
                        }
                      }}
                      className={`p-4 rounded-lg text-center transition ${tileClasses}`}
                    >
                      <p>{slot.from} - {slot.to}</p>
                      {slot.hasExpert === false && (
                        <p className="mt-2 font-bold">No Expert Available</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={addToCart}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              Add to Cart
            </button>
          </div>
        )}
      </div>
    </LocalizationProvider>
  );
}
