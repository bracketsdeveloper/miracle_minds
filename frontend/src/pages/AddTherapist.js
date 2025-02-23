'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import uploadImage from '../helpers/uploadImage';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function TherapistManager() {
  const [therapists, setTherapists] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [therapist, setTherapist] = useState({
    name: '',
    expertise: [],
    about: '',
    photo: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [therapies, setTherapies] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const therapistsRes = await axios.get('http://localhost:5000/api/therapists', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const therapiesRes = await axios.get('http://localhost:5000/api/therapies', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTherapists(therapistsRes.data);
        setTherapies(therapiesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data!', { position: 'top-center' });
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTherapist({ ...therapist, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTherapist((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addExpertise = (therapy) => {
    if (!therapist.expertise.includes(therapy.name)) {
      setTherapist({
        ...therapist,
        expertise: [...therapist.expertise, therapy.name],
      });
    }
  };

  const removeExpertise = (therapyName) => {
    setTherapist({
      ...therapist,
      expertise: therapist.expertise.filter((name) => name !== therapyName),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let photoUrl = therapist.photo;
      if (photoFile) {
        const uploadResponse = await uploadImage(photoFile);
        photoUrl = uploadResponse.secure_url;
      }

      const token = localStorage.getItem('token');
      const payload = { ...therapist, photo: photoUrl };

      if (isEditing) {
        await axios.put(`http://localhost:5000/api/therapists/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Therapist updated successfully!', { position: 'top-center' });
      } else {
        await axios.post('http://localhost:5000/api/therapists', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Therapist added successfully!', { position: 'top-center' });
      }

      setShowForm(false);
      setTherapist({ name: '', expertise: [], about: '', photo: '' });
      setPhotoFile(null);
      setIsEditing(false);
      setEditId(null);

      const therapistsRes = await axios.get('http://localhost:5000/api/therapists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTherapists(therapistsRes.data);
    } catch (error) {
      console.error('Error saving therapist:', error);
      toast.error('Failed to save therapist. Please try again.', { position: 'top-center' });
    }
  };

  const deleteTherapist = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/therapists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Therapist deleted successfully!', { position: 'top-center' });
      setTherapists(therapists.filter((t) => t._id !== id));
    } catch (error) {
      console.error('Error deleting therapist:', error);
      toast.error('Failed to delete therapist.', { position: 'top-center' });
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-gray-200 rounded-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Therapist Manager</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
        >
          Add Therapist
        </button>
      </div>

      {/* Therapist List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {therapists.map((therapist) => (
          <div
            key={therapist._id}
            className="bg-gray-800 rounded-md p-4 flex flex-col items-center text-center"
          >
            <img
              src={therapist.photo}
              alt={therapist.name}
              className="h-32 w-32 rounded-full object-cover mb-4"
            />
            <h2 className="text-lg font-bold mb-1">{therapist.name}</h2>
            <p className="text-sm text-gray-400 mb-2">
              {therapist.expertise.join(', ')}
            </p>
            <p className="text-sm mb-4">{therapist.about}</p>
            <div className="flex space-x-2">
              <button
                className="bg-pink-600 text-white px-3 py-1 rounded-md hover:bg-pink-700"
                onClick={() => {
                  setTherapist(therapist);
                  setIsEditing(true);
                  setEditId(therapist._id);
                  setShowForm(true);
                }}
              >
                Edit
              </button>
              <button
                className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                onClick={() => deleteTherapist(therapist._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Therapist Form */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-md w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'Edit Therapist' : 'Add Therapist'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={therapist.name}
                  onChange={handleChange}
                  className="bg-gray-800 text-gray-300 border border-gray-600 rounded-md px-3 py-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Expertise</label>
                <div className="bg-gray-800 p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-2">
                    {therapies.map((therapy) => (
                      <div
                        key={therapy._id}
                        className={`p-2 rounded-md cursor-pointer ${
                          therapist.expertise.includes(therapy.name)
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                        onClick={() => addExpertise(therapy)}
                      >
                        {therapy.name}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    {therapist.expertise.map((name, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center bg-gray-800 text-gray-300 px-3 py-1 rounded-md m-1"
                      >
                        {name}
                        <button
                          type="button"
                          className="ml-2 text-red-500 hover:text-red-700"
                          onClick={() => removeExpertise(name)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">About</label>
                <textarea
                  name="about"
                  value={therapist.about}
                  onChange={handleChange}
                  className="bg-gray-800 text-gray-300 border border-gray-600 rounded-md px-3 py-2 w-full"
                  placeholder="Short description about the therapist"
                  rows="4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="bg-gray-800 text-gray-300 border border-gray-600 rounded-md px-3 py-2 w-full"
                />
                {therapist.photo && (
                  <img
                    src={therapist.photo}
                    alt="Preview"
                    className="mt-4 h-24 w-24 rounded-full object-cover"
                  />
                )}
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
