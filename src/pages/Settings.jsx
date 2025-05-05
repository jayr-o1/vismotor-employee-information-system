import React, { useState, useContext, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeContext } from "../ThemeContext";
import apiService from "../services/api";

const Settings = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff", // Default role
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if the current user is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setIsAdmin(user.role === "admin");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdminStatus();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleUserFormChange = (e) => {
    setUserForm({
      ...userForm,
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple validation
    if (!userForm.name || !userForm.email || !userForm.password || !userForm.role) {
      toast.error("All fields are required!");
      setIsLoading(false);
      return;
    }

    try {
      // Create user through API
      await apiService.auth.createUser(userForm);
      toast.success("User created successfully!");
      
      // Reset form
      setUserForm({
        name: "",
        email: "",
        password: "",
        role: "staff"
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setIsLoading(false);
    }
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Password Form */}
        <div className={`rounded-xl shadow-md overflow-hidden transition-colors duration-200 ${
          isDark ? 'bg-[#1B2537] border border-slate-700' : 'bg-white border border-gray-200'
        }`}>
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

        {/* User Management (Admin Only) */}
        {isAdmin && (
          <div className={`rounded-xl shadow-md overflow-hidden transition-colors duration-200 ${
            isDark ? 'bg-[#1B2537] border border-slate-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="p-6">
              <h2 className={`text-xl font-medium mb-4 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                <i className="fas fa-user-plus mr-2"></i>
                Create User
              </h2>
              <form onSubmit={handleCreateUser}>
                <div className="mb-4">
                  <label 
                    htmlFor="name" 
                    className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={userForm.name}
                    onChange={handleUserFormChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label 
                    htmlFor="email" 
                    className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userForm.email}
                    onChange={handleUserFormChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label 
                    htmlFor="password" 
                    className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={userForm.password}
                    onChange={handleUserFormChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label 
                    htmlFor="role" 
                    className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={userForm.role}
                    onChange={handleUserFormChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                    required
                  >
                    <option value="staff">Staff</option>
                    <option value="hr">HR Staff</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`bg-green-600 text-white px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Creating User...
                    </>
                  ) : (
                    'Create User'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
