'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditProfile() {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    address: '',
    email: '',
    phone: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [newProfile, setNewProfile] = useState({ name: '', dateOfBirth: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('https://miracle-minds.vercel.app/api/user', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const userData = response.data;
        if (userData.dateOfBirth) {
          userData.dateOfBirth = new Date(userData.dateOfBirth)
            .toISOString()
            .split('T')[0];
        }
        setFormData({
          name: userData.name || '',
          dateOfBirth: userData.dateOfBirth || '',
          address: userData.address || '',
          email: userData.email || '',
          phone: userData.phone || '',
        });
        setProfiles(userData.profiles || []);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to fetch profile.');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e) => {
    setNewProfile({ ...newProfile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Invalid phone number. Must start with 6-9 and be 10 digits.');
      return;
    }
    try {
      await axios.put('https://miracle-minds.vercel.app/api/user/edit', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile.');
    }
  };

  const addProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'https://miracle-minds.vercel.app/api/user/add-profile',
        newProfile,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setProfiles([...profiles, response.data]);
      toast.success('Additional profile added successfully!');
      setNewProfile({ name: '', dateOfBirth: '' });
      setShowProfileForm(false);
    } catch (error) {
      console.error('Error adding additional profile:', error);
      toast.error('Failed to add additional profile.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-pink-600 to-white p-6 lg:p-12 overflow-y-auto">
      <div className="max-w-2xl mx-auto bg-white bg-opacity-90 rounded-lg shadow-2xl p-8">
        {!isEditing ? (
          <div>
            <h1 className="text-3xl font-extrabold text-purple-800 mb-6 text-center">
              User Details
            </h1>
            <div className="space-y-4 text-gray-800">
              <p>
                <strong>Name:</strong> {formData.name}
              </p>
              <p>
                <strong>Date of Birth:</strong>{' '}
                {formData.dateOfBirth || 'Not provided'}
              </p>
              <p>
                <strong>Address:</strong> {formData.address || 'Not provided'}
              </p>
              <p>
                <strong>Email:</strong> {formData.email}
              </p>
              <p>
                <strong>Phone:</strong> {formData.phone || 'Not provided'}
              </p>
            </div>

            <h2 className="text-2xl font-bold text-purple-800 mt-8">
              Child Profiles
            </h2>
            <ul className="space-y-3 mt-4">
              {profiles.map((profile, index) => (
                <li key={index} className="bg-purple-800 text-white p-4 rounded-md">
                  <p>
                    <strong>Name:</strong> {profile.name}
                  </p>
                  <p>
                    <strong>Date of Birth:</strong>{' '}
                    {profile.dateOfBirth || 'Not provided'}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={() => setShowProfileForm(true)}
                className="bg-purple-600 text-white rounded-lg px-5 py-2 font-semibold hover:bg-purple-700 transition"
              >
                Add Child Profile
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-pink-500 text-white rounded-lg px-5 py-2 font-semibold hover:bg-pink-600 transition"
              >
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-extrabold text-purple-800 mb-6 text-center">
              Edit Profile
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6 text-gray-800">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    htmlFor="dateOfBirth"
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  htmlFor="address"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    htmlFor="phone"
                  >
                    Phone
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 text-white rounded-lg px-5 py-2 font-medium hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-pink-500 text-white rounded-lg px-5 py-2 font-medium hover:bg-pink-600 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {showProfileForm && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-purple-900 p-6 rounded-lg shadow-lg w-full max-w-lg relative">
              <button
                onClick={() => setShowProfileForm(false)}
                className="absolute top-2 right-2 text-gray-300 hover:text-white focus:outline-none"
              >
                ✖
              </button>
              <h2 className="text-2xl font-bold text-purple-200 mb-4">
                Add Child Profile
              </h2>
              <form onSubmit={addProfile} className="space-y-4 text-gray-200">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    htmlFor="profileName"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="profileName"
                    name="name"
                    value={newProfile.name}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-400 rounded-lg p-2 bg-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    htmlFor="profileDateOfBirth"
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="profileDateOfBirth"
                    name="dateOfBirth"
                    value={newProfile.dateOfBirth}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-400 rounded-lg p-2 bg-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-pink-500 text-white rounded-lg px-5 py-2 font-medium hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    Add Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
