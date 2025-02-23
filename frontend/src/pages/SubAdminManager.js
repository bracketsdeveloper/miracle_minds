"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SubAdminManager() {
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For creating new sub-admin
  const [newAdminData, setNewAdminData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    permissions: [],
  });

  // For editing permissions
  const [editingPermissionsId, setEditingPermissionsId] = useState(null);
  const [tempPermissions, setTempPermissions] = useState([]);

  // Sample pages or features that can be toggled
  const allPermissions = [
    "create-booking",
    "manage-users",
    "manage-therapy",
    "add-expert",
    "timeslot-manager",
    "upcoming-meetings",
    "all-bookings",
    "sub-admins"
  ];

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const fetchSubAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://miracle-minds.vercel.app/api/admin/sub-admins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubAdmins(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching sub-admins:", err);
      setError("Failed to load sub-admins");
    } finally {
      setLoading(false);
    }
  };

  // Creating new sub-admin
  const handleCreateSubAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://miracle-minds.vercel.app/api/admin/sub-admins",
        newAdminData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewAdminData({
        name: "",
        email: "",
        phone: "",
        password: "",
        permissions: [],
      });
      fetchSubAdmins();
    } catch (err) {
      console.error("Error creating sub-admin:", err);
      setError("Failed to create sub-admin");
    }
  };

  // Toggle a permission in the newAdminData
  const toggleNewAdminPermission = (perm) => {
    setNewAdminData((prev) => {
      const hasPerm = prev.permissions.includes(perm);
      if (hasPerm) {
        return {
          ...prev,
          permissions: prev.permissions.filter((p) => p !== perm),
        };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, perm],
        };
      }
    });
  };

  // Start editing a sub-admin's permissions
  const handleEditPermissions = (admin) => {
    setEditingPermissionsId(admin._id);
    setTempPermissions(admin.permissions || []);
  };

  // Toggle a permission in the sub-admin we are editing
  const toggleTempPermission = (perm) => {
    setTempPermissions((prev) => {
      const hasPerm = prev.includes(perm);
      if (hasPerm) {
        return prev.filter((p) => p !== perm);
      } else {
        return [...prev, perm];
      }
    });
  };

  // Save updated permissions
  const handleSavePermissions = async (adminId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://miracle-minds.vercel.app/api/admin/sub-admins/${adminId}`,
        { permissions: tempPermissions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingPermissionsId(null);
      fetchSubAdmins(); // refresh
    } catch (err) {
      console.error("Error updating permissions:", err);
      setError("Failed to update permissions");
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingPermissionsId(null);
    setTempPermissions([]);
  };

  // Delete sub-admin
  const handleDeleteSubAdmin = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this sub-admin?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://miracle-minds.vercel.app/api/admin/sub-admins/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubAdmins();
    } catch (err) {
      console.error("Error deleting sub-admin:", err);
      setError("Failed to delete sub-admin");
    }
  };

  if (loading) return <p>Loading sub-admins...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="p-6 bg-gray-900 text-gray-200 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Sub-Admin Manager</h1>

      {/* Create Sub-Admin Form */}
      <div className="mb-8 bg-gray-800 p-4 rounded">
        <h2 className="text-lg font-semibold mb-3">Create New Sub-Admin</h2>
        <form onSubmit={handleCreateSubAdmin} className="space-y-3">
          <div>
            <label className="block text-sm">Name</label>
            <input
              type="text"
              required
              value={newAdminData.name}
              onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
              className="bg-gray-700 border border-gray-600 text-gray-200 rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm">Email</label>
            <input
              type="email"
              required
              value={newAdminData.email}
              onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
              className="bg-gray-700 border border-gray-600 text-gray-200 rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm">Phone</label>
            <input
              type="text"
              required
              value={newAdminData.phone}
              onChange={(e) => setNewAdminData({ ...newAdminData, phone: e.target.value })}
              className="bg-gray-700 border border-gray-600 text-gray-200 rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm">Password</label>
            <input
              type="password"
              required
              value={newAdminData.password}
              onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
              className="bg-gray-700 border border-gray-600 text-gray-200 rounded px-3 py-2 w-full"
            />
          </div>

          {/* Permission Toggles */}
          <div>
            <label className="block text-sm font-semibold mb-1">Permissions</label>
            <div className="grid grid-cols-2 gap-2 bg-gray-700 p-3 rounded">
              {allPermissions.map((perm) => (
                <div
                  key={perm}
                  onClick={() => toggleNewAdminPermission(perm)}
                  className={`cursor-pointer p-2 rounded ${
                    newAdminData.permissions.includes(perm)
                      ? "bg-pink-600 text-white"
                      : "bg-gray-600 text-gray-200"
                  }`}
                >
                  {perm}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 text-white font-semibold"
          >
            Create Sub-Admin
          </button>
        </form>
      </div>

      {/* List Existing Sub-Admins */}
      <div className="bg-gray-800 p-4 rounded">
        <h2 className="text-lg font-semibold mb-3">Existing Sub-Admins</h2>
        {subAdmins.length === 0 ? (
          <p className="text-gray-400">No sub-admins found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Permissions</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subAdmins.map((admin) => (
                  <tr key={admin._id} className="border-b border-gray-600">
                    <td className="px-4 py-2">{admin.name}</td>
                    <td className="px-4 py-2">{admin.email}</td>
                    <td className="px-4 py-2">
                      {editingPermissionsId === admin._id ? (
                        <div className="grid grid-cols-2 gap-2">
                          {allPermissions.map((perm) => (
                            <div
                              key={perm}
                              onClick={() => toggleTempPermission(perm)}
                              className={`cursor-pointer p-1 rounded text-sm ${
                                tempPermissions.includes(perm)
                                  ? "bg-pink-600 text-white"
                                  : "bg-gray-600 text-gray-200"
                              }`}
                            >
                              {perm}
                            </div>
                          ))}
                        </div>
                      ) : (
                        admin.permissions?.join(", ") || "None"
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editingPermissionsId === admin._id ? (
                        <>
                          <button
                            onClick={() => handleSavePermissions(admin._id)}
                            className="bg-pink-600 px-3 py-1 rounded text-white hover:bg-pink-700 mr-2"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-600 px-3 py-1 rounded text-white hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditPermissions(admin)}
                            className="bg-purple-600 px-3 py-1 rounded text-white hover:bg-purple-700 mr-2"
                          >
                            Edit Permissions
                          </button>
                          <button
                            onClick={() => handleDeleteSubAdmin(admin._id)}
                            className="bg-red-600 px-3 py-1 rounded text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
