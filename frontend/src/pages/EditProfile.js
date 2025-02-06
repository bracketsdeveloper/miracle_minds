'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditProfile() {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    address: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [showProfileForm, setShowProfileForm] = useState(false); // To toggle the profile form
  const [newProfile, setNewProfile] = useState({ name: '', dateOfBirth: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const userData = response.data;

        if (userData.dateOfBirth) {
          userData.dateOfBirth = new Date(userData.dateOfBirth).toISOString().split('T')[0];
        }

        setFormData(userData);
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
    try {
      await axios.put('http://localhost:5000/api/user/edit', formData, {
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
        'http://localhost:5000/api/user/add-profile',
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
      setShowProfileForm(false); // Close the form
    } catch (error) {
      console.error('Error adding additional profile:', error);
      toast.error('Failed to add additional profile.');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen text-gray-200 p-4 lg:p-8 overflow-y-auto">
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-6 lg:p-8">
        {!isEditing ? (
          <div>
            <h1 className="text-xl font-bold text-gray-100 mb-6 text-center">User Details</h1>
            <div className="space-y-4">
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Date of Birth:</strong> {formData.dateOfBirth || 'Not provided'}</p>
              <p><strong>Address:</strong> {formData.address || 'Not provided'}</p>
              <p><strong>Email:</strong> {formData.email}</p>
            </div>

            <h2 className="text-lg font-bold text-gray-100 mt-6">Add Child Profiles</h2>
            <ul className="space-y-2">
              {profiles.map((profile, index) => (
                <li key={index} className="bg-gray-700 p-3 rounded-md">
                  <p><strong>Name:</strong> {profile.name}</p>
                  <p><strong>Date of Birth:</strong> {profile.dateOfBirth || 'Not provided'}</p>
                </li>
              ))}
            </ul>
              {/* Add Profile Button and Form */}
      <div className="w-full max-w-2xl mt-8 ">
        <button
          onClick={() => setShowProfileForm(true)}
          className="bg-green-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Add Child Profile
        </button>

        {showProfileForm && (
          <div
            className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
          >
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg relative">
              {/* Close Button */}
              <button
                onClick={() => setShowProfileForm(false)}
                className="absolute top-2 right-2 text-gray-300 hover:text-white focus:outline-none"
              >
                ✖
              </button>
              <h2 className="text-lg font-bold text-gray-100 mb-4">Add Profile</h2>
              <form onSubmit={addProfile} className="space-y-4">
                <div>
                  <label className="block text-gray-400 font-medium text-sm mb-2" htmlFor="profileName">
                    Name
                  </label>
                  <input
                    type="text"
                    id="profileName"
                    name="name"
                    value={newProfile.name}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-600 rounded-lg p-2 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium text-sm mb-2" htmlFor="profileDateOfBirth">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="profileDateOfBirth"
                    name="dateOfBirth"
                    value={newProfile.dateOfBirth}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-600 rounded-lg p-2 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Add Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-xl font-bold text-gray-100 mb-6 text-center">Edit Profile</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 font-medium text-sm mb-2" htmlFor="name">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-600 rounded-lg p-2 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium text-sm mb-2" htmlFor="dateOfBirth">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full border border-gray-600 rounded-lg p-2 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-medium text-sm mb-2" htmlFor="address">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border border-gray-600 rounded-lg p-2 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      
    </div>
  );
}
