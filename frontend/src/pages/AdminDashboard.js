'use client';

import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const adminPages = [
  { name: 'Manage Users', path: '/admin-dashboard/users' },
  { name: 'Manage Therapies', path: '/admin-dashboard/therapy-manager' },
  { name: 'Add and Manage Expert', path: '/admin-dashboard/add-expert' },
  { name: 'Timeslot Manager', path: '/admin-dashboard/timeslots' },
  
  { name: 'Upcoming Meetings', path: '/admin-dashboard/upcoming' },
  { name: 'Support Requests', path: '/admin-dashboard/all-bookings' },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check user role from localStorage or a secure API endpoint
    const role = localStorage.getItem('role');
    if (role !== 'ADMIN') {
      // Redirect to an unauthorized page or login
      navigate('/unauthorized');
    }
  }, [navigate]);

  return (
    <div className="flex flex-col lg:flex-row m-4 rounded-md bg-gray-900 text-gray-200 h-screen">
      {/* Mobile Hamburger Button */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-gray-800">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-200 p-2 rounded-md hover:bg-gray-700 focus:outline-none"
        >
          {sidebarOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`lg:w-1/5 w-full bg-gray-800 p-4 lg:block ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        <h2 className="text-lg font-semibold mb-6 hidden lg:block">Admin Panel</h2>
        <ul className="space-y-4">
          {adminPages.map((page) => (
            <li key={page.name}>
              <Link
                to={page.path}
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700 hover:text-white"
              >
                {page.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="lg:w-4/5 w-full p-6 overflow-auto h-full">
        <Outlet />
      </div>
    </div>
  );
}
