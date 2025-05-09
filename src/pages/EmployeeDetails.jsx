import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft } from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";
import apiService from "../services/api";
import { ThemeContext } from "../ThemeContext";
import defaultAvatar from "../assets/default-avatar.png";

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Check if token exists
        const token = localStorage.getItem("userToken");
        if (!token) {
          setError("Authentication required. Please log in to view employee data.");
          setLoading(false);
          return;
        }
        
        const response = await apiService.employees.getById(id);
        if (!response.data) {
          throw new Error("Employee not found");
        }
        setEmployee(response.data);
      } catch (error) {
        console.error("Error fetching employee details:", error);
        setError(`Failed to fetch employee details: ${error.response?.data?.message || error.message}`);
        toast.error(`Failed to fetch employee details: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeDetails();
  }, [id]);

  const handleGoBack = () => {
    navigate("/hr-staff");
  };

  const handleRetry = () => {
    // Refetch the employee data
    fetchEmployeeDetails();
  };

  const fetchEmployeeDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("Authentication required. Please log in to view employee data.");
        setLoading(false);
        return;
      }
      
      const response = await apiService.employees.getById(id);
      if (!response.data) {
        throw new Error("Employee not found");
      }
      setEmployee(response.data);
    } catch (error) {
      console.error("Error fetching employee details:", error);
      setError(`Failed to fetch employee details: ${error.response?.data?.message || error.message}`);
      toast.error(`Failed to fetch employee details: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to get profile picture URL
  const getProfilePictureUrl = (filename) => {
    if (!filename) return defaultAvatar;
    return `http://10.10.1.71:5000/uploads/profile-pictures/${filename}`;
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} p-4`}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={handleGoBack}
          className={`flex items-center px-4 py-2 mb-4 rounded-lg ${
            isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          <FaArrowLeft className="mr-2" /> Back to HR Staff
        </button>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-md p-8 flex flex-col justify-center items-center`}>
            <div className="text-red-500 text-5xl mb-4">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-center mb-2 font-semibold`}>
              Error Loading Employee Data
            </p>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center mb-6`}>
              {error}
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={handleGoBack}
                className={`px-4 py-2 rounded-lg ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <FaArrowLeft className="mr-2 inline" /> Go Back
              </button>
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Retry
              </button>
            </div>
          </div>
        ) : !employee ? (
          <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-md p-8`}>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>Employee not found or has been removed.</p>
            </div>
          </div>
        ) : (
          <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-md overflow-hidden`}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-6">Employee Details</h1>
              
              <div className="flex flex-col md:flex-row">
                {/* Profile and Details - Left column */}
                <div className="w-full md:w-2/3 pr-0 md:pr-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
                    {/* Profile Picture */}
                    <div className="w-32 h-32 mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
                      <img 
                        src={getProfilePictureUrl(employee.profile_picture)} 
                        alt={employee.name} 
                        className="w-full h-full object-cover rounded-full border-4 border-green-500"
                        onError={(e) => {
                          console.log("Image failed to load, using default avatar");
                          e.target.src = defaultAvatar;
                        }}
                      />
                    </div>
                    
                    {/* Name and Position */}
                    <div>
                      <h2 className="text-3xl font-bold">{employee.name}</h2>
                      <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}