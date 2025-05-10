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
    role: "hr_staff", // Default role
  });
  const [userRole, setUserRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Check current user's role
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setUserRole(user.role);
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    };

    checkUserRole();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await apiService.users.getAll();
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users. Please try again.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

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
        role: userRole === "it_admin" ? "hr_admin" : "hr_staff"
      });
      
      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await apiService.users.delete(userId);
        toast.success("User deleted successfully!");
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user. Please try again.");
      }
    }
  };

  // Helper function to determine if the current user can manage a specific role
  const canManageRole = (role) => {
    if (userRole === "it_admin") {
      // IT Admin can manage HR Admin and HR Staff
      return role === "hr_admin" || role === "hr_staff";
    } else if (userRole === "hr_admin") {
      // HR Admin can only manage HR Staff
      return role === "hr_staff";
    }
    return false;
  };

  // Define available roles based on current user's role
  const getAvailableRoles = () => {
    if (userRole === "it_admin") {
      return [
        { value: "hr_admin", label: "HR Administrator" },
        { value: "hr_staff", label: "HR Staff" }
      ];
    } else if (userRole === "hr_admin") {
      return [
        { value: "hr_staff", label: "HR Staff" }
      ];
    }
    return [];
  };

  return (
    <div className="w-full">
      <ToastContainer position="top-right" autoClose={3000} theme={isDark ? "dark" : "light"} />  

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

        {/* User Management (Only for IT Admin and HR Admin) */}
        {(userRole === "it_admin" || userRole === "hr_admin") && (
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
                    {getAvailableRoles().map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
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

      {/* User Management Table */}
      {(userRole === "it_admin" || userRole === "hr_admin") && (
        <div className={`mt-8 rounded-xl shadow-md overflow-hidden transition-colors duration-200 ${
          isDark ? 'bg-[#1B2537] border border-slate-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-medium ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                <i className="fas fa-users mr-2"></i>
                User Management
              </h2>
              <button 
                onClick={fetchUsers}
                className={`px-3 py-1 rounded-lg text-sm ${
                  isDark 
                    ? 'bg-slate-700 text-white hover:bg-slate-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-sync-alt mr-1"></i> Refresh
              </button>
            </div>
            
            {isLoadingUsers ? (
              <div className="flex justify-center items-center py-6">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading users...</span>
              </div>
            ) : (
              users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className={`min-w-full ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <thead className={`${isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                      <tr>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Role</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(user => canManageRole(user.role)).map((user) => (
                        <tr 
                          key={user.id}
                          className={`${isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'} hover:${isDark ? 'bg-slate-800' : 'bg-gray-50'}`}
                        >
                          <td className="px-4 py-3">{user.name}</td>
                          <td className="px-4 py-3">{user.email}</td>
                          <td className="px-4 py-3">
                            {user.role === 'it_admin' && 'IT Administrator'}
                            {user.role === 'hr_admin' && 'HR Administrator'}
                            {user.role === 'hr_staff' && 'HR Staff'}
                          </td>
                          <td className="px-4 py-3">
                            {user.is_verified ? (
                              <span className="text-green-500">
                                <i className="fas fa-check-circle mr-1"></i> Verified
                              </span>
                            ) : (
                              <span className="text-yellow-500">
                                <i className="fas fa-exclamation-circle mr-1"></i> Unverified
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete User"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={`py-10 text-center rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-gray-100/50'}`}>
                  <div className={`text-5xl mb-3 ${isDark ? 'text-slate-600' : 'text-gray-300'}`}>
                    <i className="fas fa-users"></i>
                  </div>
                  <p className={`text-xl mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No users found</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Use the form on the left to create a new user
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
