'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [updatedRole, setUpdatedRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://miracle-minds.vercel.app/api/admin/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUsers(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err.response || err.message);
        setError(
          err.response?.data?.message || "Failed to load users. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId) => {
    try {
      await axios.put(
        `https://miracle-minds.vercel.app/api/admin/users/${userId}/role`,
        { role: updatedRole },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, role: updatedRole } : user
        )
      );
      setEditingRole(null);
    } catch (err) {
      console.error("Error updating role:", err.response || err.message);
      alert("Failed to update role. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-gray-200">Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-900 text-gray-200 rounded-md">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-200 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-200 uppercase">Date of Birth</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-200 uppercase">Address</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-200 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-200 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-200 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-gray-700">
                <td className="px-6 py-4 text-sm text-gray-300">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{
                  user.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString("en-GB")
                    : "N/A"
                }</td>
                <td className="px-6 py-4 text-sm text-gray-300">{user.address || "N/A"}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {editingRole === user._id ? (
                    <select
                      value={updatedRole}
                      onChange={(e) => setUpdatedRole(e.target.value)}
                      className="bg-gray-700 border border-gray-600 text-gray-300 rounded-lg px-2 py-1"
                    >
                      <option value="GENERAL">GENERAL</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {editingRole === user._id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRoleChange(user._id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingRole(null)}
                        className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingRole(user._id);
                        setUpdatedRole(user.role);
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
