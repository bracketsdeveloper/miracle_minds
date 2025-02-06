// Signup.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateAccount() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [assessment, setAssessmentDone] = useState(""); // New state for assessment
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!assessment) {
      toast.error("Please select if the assessment is already done.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    try {
      const response = await axios.post("https://miracle-minds.vercel.app/api/auth/signup", {
        name,
        email,
        assessment,
        password,
      });
      toast.success(response.data.message, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.error || "An error occurred", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 m-4 rounded-md">
  <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
    <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
      {/* Added overflow scroll */}
      <div className="p-6 space-y-4 md:space-y-6 sm:p-8 overflow-y-auto max-h-[90vh]">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
          Create an account
        </h1>
        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
          {/* Horizontal Field: Name */}
          <div className="flex items-center space-x-4">
            <label
              htmlFor="name"
              className="text-sm font-medium text-gray-900 dark:text-white"
            >
              Your Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="John Doe"
              required
            />
          </div>
          {/* Horizontal Field: Email */}
          <div className="flex items-center space-x-4">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-900 dark:text-white"
            >
              Your Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="name@company.com"
              required
            />
          </div>
          {/* Horizontal Field: Assessment */}
          <div className="flex items-center space-x-4">
            <label
              htmlFor="assessmentDone"
              className="text-sm font-medium text-gray-900 dark:text-white"
            >
              Assessment Done?
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="yes"
                  name="assessmentDone"
                  value="yes"
                  onChange={(e) => setAssessmentDone(e.target.value)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="yes"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Yes
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="no"
                  name="assessmentDone"
                  value="no"
                  onChange={(e) => setAssessmentDone(e.target.value)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="no"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  No
                </label>
              </div>
            </div>
          </div>
          {/* Vertical Fields: Password */}
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Confirm password
            </label>
            <input
              type="password"
              name="confirm-password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700"
          >
            Create an account
          </button>
          <p className="text-sm font-light text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to={"/login"}
              className="font-medium text-primary-600 hover:underline dark:text-primary-500"
            >
              Login here
            </Link>
          </p>
          <p className="text-sm font-light text-gray-500 dark:text-gray-400">
            <Link
              to={"/forgot-password"}
              className="font-medium text-primary-600 hover:underline dark:text-primary-500"
            >
              Forgot password?
            </Link>
          </p>
        </form>
      </div>
    </div>
  </div>
</section>

  );
}
