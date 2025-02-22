// Login.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1) Make the login request
      const response = await axios.post("https://miracle-minds.vercel.app/api/auth/login", {
        email,
        password,
      });

      // 2) Show success toast (optional, using server's message if provided)
      toast.success(response.data.message || "Login successful!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // 3) Destructure fields from server's response
      const {
        token,
        role,
        permissions,
        isSuperAdmin,
      } = response.data;

      // 4) Store them in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role || "GENERAL");
      // If server doesn't return these fields, remove or handle accordingly
      localStorage.setItem(
        "permissions",
        JSON.stringify(permissions || [])
      );
      localStorage.setItem(
        "isSuperAdmin",
        isSuperAdmin ? "true" : "false"
      );

      // 5) Redirect based on role
      if (role === "ADMIN") {
        navigate("/admin-dashboard");
      } else if (role === "EXPERT") {
        navigate("/expert-dashboard");
      } else {
        // e.g. "GENERAL" or anything else
        navigate("/dashboard/home");
      }

      // 6) Optional: Reload the page (if your app needs a full refresh)
      window.location.reload();
    } catch (error) {
      // 7) Show error toast
      toast.error(
        error.response?.data?.error ||
          "An error occurred. Please try again.",
        {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      console.error("Login error:", error);
    }
  };

  return (
    <section className="bg-gradient-to-tr 
          from-[#ff80b5] to-[#9089fc] m-4 rounded-md">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        >
          Miracle Minds
        </a>
        <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900
                             rounded-lg focus:ring-primary-600 focus:border-primary-600
                             block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600
                             dark:placeholder-gray-400 dark:text-white"
                  placeholder="name@company.com"
                  required
                />
              </div>
              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900
                             rounded-lg focus:ring-primary-600 focus:border-primary-600
                             block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600
                             dark:placeholder-gray-400 dark:text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full text-white bg-pink-600 hover:bg-pink-700
                           focus:ring-4 focus:outline-none focus:ring-pink-300
                           font-medium rounded-lg text-sm px-5 py-2.5 text-center
                           dark:bg-pink-300 dark:hover:bg-pink-700"
              >
                Login
              </button>
              {/* Link to Sign Up */}
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don’t have an account yet?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-pink-400 hover:underline dark:text-pink-500"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
