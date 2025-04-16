import React, { useState, useEffect, useContext } from "react";
import Header from "../components/Layouts/Header";
import Sidebar from "../components/Layouts/Sidebar";
import { FaEdit, FaTrash, FaEye, FaCheck, FaUserPlus } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import apiService from "../services/api";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../ThemeContext";

const Applicants = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  // State for applicants data
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();
  
  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  
  // Current applicant being viewed/edited
  const [currentApplicant, setCurrentApplicant] = useState(null);
  
  // Form data for various actions
  const [onboardData, setOnboardData] = useState({
    position: "",
    department: "",
    startDate: "",
    salary: ""
  });
  const [newApplicantData, setNewApplicantData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    education: "",
    experience: "",
    skills: ""
  });

  // Pagination settings
  const itemsPerPage = 10;

  // Add ThemeContext
  const { isDarkMode } = useContext(ThemeContext);

  // Fetch data on component mount
  useEffect(() => {
    fetchApplicants();
  }, []);

  // API fetch
  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const response = await apiService.applicants.getAll();
      setApplicants(response.data);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      toast.error("Failed to fetch applicants. Please check your connection or contact support.");
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  // Filter applicants based on search term
  const filteredApplicants = applicants.filter(applicant =>
    applicant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate page count for pagination
  const pageCount = Math.ceil(filteredApplicants.length / itemsPerPage);

  // Get current page items
  const currentItems = filteredApplicants.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Handle page change
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Navigate to applicant details page
  const handleViewApplicant = (applicant) => {
    navigate(`/applicants/${applicant.id}`);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (applicant) => {
    setCurrentApplicant(applicant);
    setDeleteModalOpen(true);
  };

  // Open onboard modal
  const handleOnboardClick = (applicant) => {
    setCurrentApplicant(applicant);
    setOnboardData({
      position: applicant.position,
      department: "",
      startDate: "",
      salary: ""
    });
    setOnboardModalOpen(true);
  };

  // Delete applicant
  const handleDeleteApplicant = async () => {
    try {
      await apiService.applicants.delete(currentApplicant.id);
      
      // Remove the applicant from the local state
      setApplicants(apps => apps.filter(app => app.id !== currentApplicant.id));
      
      setDeleteModalOpen(false);
      toast.success("Applicant deleted successfully");
    } catch (error) {
      console.error("Error deleting applicant:", error);
      toast.error(error.message || "Failed to delete applicant. Please try again.");
    }
  };

  // Onboard applicant
  const handleOnboardApplicant = async () => {
    // Validate form
    if (!onboardData.department || !onboardData.startDate || !onboardData.salary) {
      toast.error("Please fill all onboarding details");
      return;
    }
    
    try {
      // Make sure we have the position populated
      const position = onboardData.position || currentApplicant.position;
      
      // Make sure salary is a number
      const salary = parseFloat(onboardData.salary);
      if (isNaN(salary)) {
        toast.error("Salary must be a valid number");
        return;
      }
      
      // Create employee record
      await apiService.employees.create({
        applicant_id: currentApplicant.id,
        name: currentApplicant.name,
        email: currentApplicant.email,
        phone: currentApplicant.phone || '',
        position: position,
        department: onboardData.department,
        hire_date: onboardData.startDate,
        salary: salary
      });
      
      // Update applicant status
      await apiService.applicants.updateStatus(currentApplicant.id, "Accepted");
      
      // Update the applicant status in the local state
      setApplicants(apps => 
        apps.map(app => 
          app.id === currentApplicant.id ? { ...app, status: "Accepted" } : app
        )
      );
      
      setOnboardModalOpen(false);
      toast.success("Applicant onboarded successfully");
    } catch (error) {
      console.error("Error onboarding applicant:", error);
      
      // More detailed error handling
      let errorMessage = "Failed to onboard applicant. Please try again.";
      
      if (error.response) {
        // Server responded with an error
        errorMessage = error.response.data?.message || errorMessage;
        console.log("Server error data:", error.response.data);
        console.log("Server error status:", error.response.status);
      } else if (error.request) {
        // Request was made but no response
        errorMessage = "No response from server. Please check your connection.";
        console.log("No response received:", error.request);
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage);
    }
  };

  // Add new applicant
  const handleAddApplicant = async () => {
    // Validate form
    if (!newApplicantData.name || !newApplicantData.email || !newApplicantData.position) {
      toast.error("Name, email and position are required");
      return;
    }
    
    try {
      const response = await apiService.applicants.create({
        ...newApplicantData,
        status: "Pending",
        applied_date: new Date().toISOString().split('T')[0]
      });
      
      // Add the new applicant to the local state
      setApplicants([
        {
          ...newApplicantData,
          id: response.data.id,
          status: "Pending",
          applied_date: new Date().toISOString().split('T')[0]
        },
        ...applicants
      ]);
      
      // Reset form
      setNewApplicantData({
        name: "",
        email: "",
        phone: "",
        position: "",
        education: "",
        experience: "",
        skills: ""
      });
      
      setAddModalOpen(false);
      toast.success("Applicant added successfully");
    } catch (error) {
      console.error("Error adding applicant:", error);
      toast.error(error.message || "Failed to add applicant. Please try again.");
    }
  };

  // Function to determine status style based on status
  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return isDark 
          ? "bg-yellow-900/30 text-yellow-400" 
          : "bg-yellow-100 text-yellow-800";
      case 'reviewed':
        return isDark 
          ? "bg-blue-900/30 text-blue-400" 
          : "bg-blue-100 text-blue-800";
      case 'interviewed':
        return isDark 
          ? "bg-purple-900/30 text-purple-400" 
          : "bg-purple-100 text-purple-800";
      case 'rejected':
        return isDark 
          ? "bg-red-900/30 text-red-400" 
          : "bg-red-100 text-red-800";
      case 'accepted':
        return isDark 
          ? "bg-green-900/30 text-green-400" 
          : "bg-green-100 text-green-800";
      default:
        return isDark 
          ? "bg-gray-900/30 text-gray-400" 
          : "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#1B2537] text-white' : 'bg-gray-50 text-gray-800'}`}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto p-4 pt-2">
        {/* Header with search and add button */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Applicants</h1>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search applicants..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={`pl-10 pr-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
              <div className="absolute left-3 top-2.5">
                <i className={`fas fa-search ${isDark ? 'text-gray-400' : 'text-gray-500'}`}></i>
              </div>
            </div>
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaUserPlus className="mr-2" />
              Add Applicant
            </button>
          </div>
        </div>

        {/* Main content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {/* Applicants Table */}
            <div className={`${isDark ? 'bg-[#232f46] border border-slate-700' : 'bg-white border border-gray-200'} rounded-xl shadow-md overflow-hidden mb-4`}>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className={isDark ? 'bg-slate-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-slate-300' : 'text-gray-500'
                      }`}>Name</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-slate-300' : 'text-gray-500'
                      }`}>Position</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-slate-300' : 'text-gray-500'
                      }`}>Status</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-slate-300' : 'text-gray-500'
                      }`}>Applied Date</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-slate-300' : 'text-gray-500'
                      }`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDark ? 'divide-slate-700' : 'divide-gray-200'
                  }`}>
                    {filteredApplicants.map((applicant) => (
                      <tr key={applicant.id} className={`${
                        isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'
                      } transition-colors duration-150`}>
                        <td className={`px-6 py-4 whitespace-nowrap ${
                          isDark ? 'text-slate-50' : 'text-slate-900'
                        }`}>{applicant.name}</td>
                        <td className={`px-6 py-4 whitespace-nowrap ${
                          isDark ? 'text-slate-300' : 'text-gray-500'
                        }`}>{applicant.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            applicant.status === 'New' 
                              ? isDark 
                                ? 'bg-blue-900/30 text-blue-400' 
                                : 'bg-blue-100 text-blue-800'
                              : applicant.status === 'Reviewed'
                                ? isDark 
                                  ? 'bg-yellow-900/30 text-yellow-400' 
                                  : 'bg-yellow-100 text-yellow-800'
                                : isDark 
                                  ? 'bg-green-900/30 text-green-400' 
                                  : 'bg-green-100 text-green-800'
                          }`}>
                            {applicant.status}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${
                          isDark ? 'text-slate-300' : 'text-gray-500'
                        }`}>
                          {new Date(applicant.applied_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewApplicant(applicant)}
                              className={`p-2 rounded-lg ${
                                isDark 
                                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                              } transition-colors duration-200`}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              onClick={() => handleOnboardClick(applicant)}
                              className={`p-2 rounded-lg ${
                                isDark 
                                  ? 'bg-blue-700 hover:bg-blue-600 text-blue-300' 
                                  : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                              } transition-colors duration-200`}
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(applicant)}
                              className={`p-2 rounded-lg ${
                                isDark 
                                  ? 'bg-red-700 hover:bg-red-600 text-red-300' 
                                  : 'bg-red-100 hover:bg-red-200 text-red-600'
                              } transition-colors duration-200`}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-center my-4">
              <ReactPaginate
                previousLabel={<i className="fas fa-chevron-left"></i>}
                nextLabel={<i className="fas fa-chevron-right"></i>}
                breakLabel={"..."}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageChange}
                containerClassName={`flex items-center space-x-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                pageClassName={`px-3 py-1.5 rounded-md ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
                previousClassName={`px-3 py-1.5 rounded-md ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
                nextClassName={`px-3 py-1.5 rounded-md ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
                activeClassName={`${isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}
                disabledClassName={"text-gray-400 cursor-not-allowed"}
              />
            </div>
          </>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModalOpen && currentApplicant && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800/90 border border-slate-700' : 'bg-white/90 border border-gray-200'} p-6 rounded-xl shadow-lg max-w-md w-full backdrop-blur-md`}>
            <h2 className="text-2xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete {currentApplicant.name}'s application? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setDeleteModalOpen(false)} className={`px-4 py-2 rounded-lg ${
                isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}>
                Cancel
              </button>
              <button onClick={handleDeleteApplicant} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Modal */}
      {onboardModalOpen && currentApplicant && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800/90 border border-slate-700' : 'bg-white/90 border border-gray-200'} p-6 rounded-xl shadow-lg max-w-md w-full backdrop-blur-md`}>
            <h2 className="text-2xl font-semibold mb-4">Onboard {currentApplicant.name}</h2>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Position</label>
                <input
                  type="text"
                  value={onboardData.position}
                  onChange={(e) => setOnboardData({...onboardData, position: e.target.value})}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark 
                      ? 'bg-slate-700/80 border-slate-600 text-white' 
                      : 'bg-white/80 border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Department</label>
                <input
                  type="text"
                  value={onboardData.department}
                  onChange={(e) => setOnboardData({...onboardData, department: e.target.value})}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark 
                      ? 'bg-slate-700/80 border-slate-600 text-white' 
                      : 'bg-white/80 border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Start Date</label>
                <input
                  type="date"
                  value={onboardData.startDate}
                  onChange={(e) => setOnboardData({...onboardData, startDate: e.target.value})}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark 
                      ? 'bg-slate-700/80 border-slate-600 text-white' 
                      : 'bg-white/80 border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Salary</label>
                <input
                  type="text"
                  value={onboardData.salary}
                  onChange={(e) => setOnboardData({...onboardData, salary: e.target.value})}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark 
                      ? 'bg-slate-700/80 border-slate-600 text-white' 
                      : 'bg-white/80 border-gray-300 text-gray-800'
                  }`}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setOnboardModalOpen(false)} className={`px-4 py-2 rounded-lg ${
                isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}>
                Cancel
              </button>
              <button onClick={handleOnboardApplicant} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Process Onboarding
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Applicant Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800/90 border border-slate-700' : 'bg-white/90 border border-gray-200'} p-6 rounded-xl shadow-lg max-w-md w-full backdrop-blur-md`}>
            <h2 className="text-2xl font-semibold mb-6 text-center">Add New Applicant</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
              {/* Left Column */}
              <div>
                <div className="mb-4">
                  <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={newApplicantData.name}
                    onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      isDark 
                        ? 'bg-slate-700/80 border-slate-600 text-white' 
                        : 'bg-white/80 border-gray-300 text-gray-800'
                    }`}
                    placeholder="Full Name"
                  />
                </div>
                <div className="mb-4">
                  <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Position Applied For*</label>
                  <input
                    type="text"
                    name="position"
                    value={newApplicantData.position}
                    onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      isDark 
                        ? 'bg-slate-700/80 border-slate-600 text-white' 
                        : 'bg-white/80 border-gray-300 text-gray-800'
                    }`}
                    placeholder="Position"
                  />
                </div>
              </div>
              
              {/* Right Column */}
              <div>
                <div className="mb-4">
                  <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Education</label>
                  <input
                    type="text"
                    name="education"
                    value={newApplicantData.education}
                    onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      isDark 
                        ? 'bg-slate-700/80 border-slate-600 text-white' 
                        : 'bg-white/80 border-gray-300 text-gray-800'
                    }`}
                    placeholder="Education"
                  />
                </div>
                <div className="mb-4">
                  <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Experience</label>
                  <input
                    type="text"
                    name="experience"
                    value={newApplicantData.experience}
                    onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      isDark 
                        ? 'bg-slate-700/80 border-slate-600 text-white' 
                        : 'bg-white/80 border-gray-300 text-gray-800'
                    }`}
                    placeholder="Experience"
                  />
                </div>
              </div>
              
              {/* Email and Phone - Left Column */}
              <div>
                <div className="mb-4">
                  <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Email*</label>
                  <input
                    type="email"
                    name="email"
                    value={newApplicantData.email}
                    onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      isDark 
                        ? 'bg-slate-700/80 border-slate-600 text-white' 
                        : 'bg-white/80 border-gray-300 text-gray-800'
                    }`}
                    placeholder="Email Address"
                  />
                </div>
              </div>
              
              {/* Phone - Right Column */}
              <div>
                <div className="mb-4">
                  <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={newApplicantData.phone}
                    onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      isDark 
                        ? 'bg-slate-700/80 border-slate-600 text-white' 
                        : 'bg-white/80 border-gray-300 text-gray-800'
                    }`}
                    placeholder="Phone Number"
                  />
                </div>
              </div>
              
              {/* Skills - Full Width */}
              <div className="md:col-span-2">
                <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Skills</label>
                <textarea
                  name="skills"
                  value={newApplicantData.skills}
                  onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-40 ${
                    isDark 
                      ? 'bg-slate-700/80 border-slate-600 text-white' 
                      : 'bg-white/80 border-gray-300 text-gray-800'
                  }`}
                  placeholder="Enter skills (one per line)
Example:
Coding Skills
Teaching Skills"
                ></textarea>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Press Enter after each skill to add multiple skills</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 border-t pt-4">
              <button 
                onClick={() => setAddModalOpen(false)} 
                className={`px-5 py-2 rounded-lg ${
                  isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300'
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddApplicant} 
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition duration-150"
              >
                Add Applicant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applicants; 