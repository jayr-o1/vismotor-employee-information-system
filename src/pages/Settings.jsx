import React, { useState, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeContext } from "../ThemeContext";

const Settings = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
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
    toast.success("Password updated successfully!");
    
    // Reset form
    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  return (
    <div className="w-full">
      <ToastContainer position="top-right" autoClose={3000} />  

      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Settings
        </h1>
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center transition-colors ${
            isDark 
              ? 'bg-slate-700 text-white hover:bg-slate-600' 
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
          }`}
        >
          {isDark ? (
            <>
              <i className="fas fa-sun mr-2 text-yellow-400"></i>
              Light Mode
            </>
          ) : (
            <>
              <i className="fas fa-moon mr-2 text-indigo-500"></i>
              Dark Mode
            </>
          )}
        </button>
      </div>

      <div className={`rounded-xl shadow-md overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-[#1B2537] border border-slate-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Change Password Form */}
        <div className="p-6">
          <h2 className={`text-xl font-medium mb-4 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>Change Password</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label 
                htmlFor="currentPassword" 
                className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
            </div>
            
            <div className="mb-4">
              <label 
                htmlFor="newPassword" 
                className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
            </div>
            
            <div className="mb-6">
              <label 
                htmlFor="confirmPassword" 
                className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
            </div>
            
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
