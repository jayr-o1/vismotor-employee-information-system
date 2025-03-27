import React, { useState } from "react";
import Header from "../components/Layouts/Header";
import Sidebar from "../components/Layouts/Sidebar";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from "react-toastify";

const Settings = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("All fields are required!");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    // Here you would normally make an API call to change the password
    // For demo purposes, we'll just show a success message
    toast.success("Password updated successfully!");
    
    // Reset form
    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64">
        <Header />
        <ToastContainer position="top-right" autoClose={3000} />

        <main className="bg-gray-100 p-6 flex-1 mt-16">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Settings</h1>
            
            {/* Change Password Form */}
            <div className="mb-8">
              <h2 className="text-xl font-medium text-gray-700 mb-4">Change Password</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block text-gray-600 mb-2">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-gray-600 mb-2">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-gray-600 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
