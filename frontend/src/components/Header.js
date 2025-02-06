'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // <<< IMPORTANT
import axios from 'axios';

const navigation = [
  
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);

  // USE CONTEXT
  const { cartItems, fetchCartItems } = useCart();

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    setIsLoggedIn(!!token);
    setUserRole(role);

    // If there's a token, we can fetchCartItems if needed
    if (token) {
      fetchCartItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUserRole('');
    navigate('/login');
  };

  return (
    <header className="inset-x-0 top-4 z-50 m-4 rounded-md sticky bg-gray-900 text-gray-200">
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <Link to={'/'} className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <img
              alt="Your Company Logo"
              src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
              className="h-8 w-auto"
            />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm/6 font-semibold text-gray-200 hover:text-white"
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-6 items-center">
          {isLoggedIn && (
            <div className="relative">
              <button
                onClick={() => setCartDropdownOpen(!cartDropdownOpen)}
                className="relative text-gray-200 hover:text-white"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                    {cartItems.length}
                  </span>
                )}
              </button>
              {cartDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-md shadow-lg">
                  <h3 className="px-4 py-2 text-sm font-semibold text-gray-200">
                    Cart Items
                  </h3>
                  {cartItems.length > 0 ? (
                    <ul className="divide-y divide-gray-700">
                      {cartItems.map((item) => (
                        <li key={item._id} className="px-4 py-2 text-sm text-gray-200">
                          <div>{item.therapies[0]?.name || 'Therapy'}</div>
                          <div className="text-xs text-gray-400">
                            {item.date} | {item.timeslot.from} - {item.timeslot.to}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-4 py-2 text-sm text-gray-400">
                      No items in cart.
                    </p>
                  )}
                  <Link
                    to={'/dashboard/cart'}
                    className="block px-4 py-2 text-center text-sm font-semibold text-gray-200 hover:bg-gray-700 hover:text-white"
                  >
                    View Cart
                  </Link>
                </div>
              )}
            </div>
          )}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-sm/6 font-semibold text-gray-200 hover:text-white focus:outline-none"
              >
                <UserCircleIcon className="h-6 w-6 text-gray-200" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg">
                  {userRole === 'ADMIN' ? (
                    <Link
                      to={'/admin-dashboard'}
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white"
                    >
                      Admin Dashboard
                    </Link>
                  ) : (
                    <Link
                      to={'/dashboard'}
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white"
                    >
                      Dashboard
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to={'/login'}
              className="text-sm/6 font-semibold text-gray-200 hover:text-white"
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile menu code omitted for brevity */}
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        {/* ... */}
      </Dialog>
    </header>
  );
}
