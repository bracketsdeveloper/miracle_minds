'use client';

import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const pages = [
  { name: 'Home', path: '/dashboard/home' },
  { name: 'Profile', path: '/dashboard/edit-profile' },
  { name: 'Consultation', path: '/dashboard/book-therapy' },
  { name: 'Upcoming Meeting', path: '/dashboard/upcoming-meetings' },
  { name: 'My Orders', path: '/dashboard/all-orders' },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row m-4 rounded-md bg-gray-900 text-gray-200 h-screen">
      {/* Mobile Hamburger Button */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-gray-800">
        <h2 className="text-lg font-semibold">Dashboard</h2>
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
        <h2 className="text-lg font-semibold mb-6 hidden lg:block">Dashboard</h2>
        <ul className="space-y-4">
          {pages.map((page) => (
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
      <div className="lg:w-4/5 w-full p-6 overflow-y-auto">
        <div className="h-full overflow-y-auto bg-gray-900 rounded-lg p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
