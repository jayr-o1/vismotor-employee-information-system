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

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64">
        <Header />
        <ToastContainer position="top-right" />

        <main className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6 flex-1 mt-16 transition-colors duration-200`}>
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">Applicant Tracking</h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search applicants..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
                </div>
                <button 
                  onClick={() => setAddModalOpen(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <FaUserPlus className="mr-2" /> Add Applicant
                </button>
              </div>
            </div>

            {loading ? (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 flex justify-center items-center h-64`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <>
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interview</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {currentItems.map((applicant) => (
                        <tr key={applicant.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{applicant.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{applicant.name}</div>
                            <div className="text-sm text-gray-500">{applicant.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{applicant.position}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              applicant.status === "Pending" 
                                ? "bg-yellow-100 text-yellow-800" 
                                : applicant.status === "Reviewed" 
                                ? "bg-blue-100 text-blue-800" 
                                : applicant.status === "Interviewed" 
                                ? "bg-purple-100 text-purple-800"
                                : applicant.status === "Accepted" 
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {applicant.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {applicant.interview_scheduled ? "Scheduled" : "Not Scheduled"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onClick={() => handleViewApplicant(applicant)} className="text-blue-500 hover:text-blue-700 mr-2">
                              <FaEye />
                            </button>
                            <button 
                              onClick={() => handleOnboardClick(applicant)} 
                              disabled={applicant.status !== "Interviewed"}
                              className={`text-purple-500 mr-2 ${applicant.status !== "Interviewed" ? "opacity-50 cursor-not-allowed" : "hover:text-purple-700"}`}>
                              <FaCheck />
                            </button>
                            <button onClick={() => handleDeleteClick(applicant)} className="text-red-500 hover:text-red-700">
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-6">
                  <ReactPaginate
                    previousLabel="← Previous"
                    nextLabel="Next →"
                    pageCount={pageCount}
                    onPageChange={handlePageChange}
                    containerClassName="flex justify-center items-center mt-6 space-x-1"
                    pageLinkClassName="px-3 py-2 rounded border border-gray-300 hover:bg-gray-100"
                    previousLinkClassName="px-3 py-2 rounded border border-gray-300 hover:bg-gray-100"
                    nextLinkClassName="px-3 py-2 rounded border border-gray-300 hover:bg-gray-100"
                    activeLinkClassName="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                    disabledLinkClassName="opacity-50 cursor-not-allowed"
                    breakClassName="px-3 py-2 rounded border border-gray-300"
                  />
                </div>
              </>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {deleteModalOpen && currentApplicant && (
            <div className="fixed inset-0 flex items-center justify-center backdrop-filter backdrop-blur-md bg-gray-900/50 z-50">
              <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <h2 className="text-2xl font-semibold mb-4">Confirm Delete</h2>
                <p className="mb-6">Are you sure you want to delete {currentApplicant.name}'s application? This action cannot be undone.</p>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setDeleteModalOpen(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                    Cancel
                  </button>
                  <button onClick={handleDeleteApplicant} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Onboarding Modal */}
          {onboardModalOpen && currentApplicant && (
            <div className="fixed inset-0 flex items-center justify-center backdrop-filter backdrop-blur-md bg-gray-900/50 z-50">
              <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <h2 className="text-2xl font-semibold mb-4">Onboard {currentApplicant.name}</h2>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Position</label>
                    <input
                      type="text"
                      value={onboardData.position}
                      onChange={(e) => setOnboardData({...onboardData, position: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Department</label>
                    <input
                      type="text"
                      value={onboardData.department}
                      onChange={(e) => setOnboardData({...onboardData, department: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={onboardData.startDate}
                      onChange={(e) => setOnboardData({...onboardData, startDate: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Salary</label>
                    <input
                      type="text"
                      value={onboardData.salary}
                      onChange={(e) => setOnboardData({...onboardData, salary: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setOnboardModalOpen(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                    Cancel
                  </button>
                  <button onClick={handleOnboardApplicant} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Process Onboarding
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Add Applicant Modal */}
          {addModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center backdrop-filter backdrop-blur-md bg-gray-900/50 z-50">
              <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <h2 className="text-2xl font-semibold mb-6 text-center">Add New Applicant</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                  {/* Left Column */}
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm text-gray-500 mb-1">Name*</label>
                      <input
                        type="text"
                        name="name"
                        value={newApplicantData.name}
                        onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm text-gray-500 mb-1">Position Applied For*</label>
                      <input
                        type="text"
                        name="position"
                        value={newApplicantData.position}
                        onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Position"
                      />
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm text-gray-500 mb-1">Education</label>
                      <input
                        type="text"
                        name="education"
                        value={newApplicantData.education}
                        onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Education"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm text-gray-500 mb-1">Experience</label>
                      <input
                        type="text"
                        name="experience"
                        value={newApplicantData.experience}
                        onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Experience"
                      />
                    </div>
                  </div>
                  
                  {/* Email and Phone - Left Column */}
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm text-gray-500 mb-1">Email*</label>
                      <input
                        type="email"
                        name="email"
                        value={newApplicantData.email}
                        onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Email Address"
                      />
                    </div>
                  </div>
                  
                  {/* Phone - Right Column */}
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm text-gray-500 mb-1">Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={newApplicantData.phone}
                        onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>
                  
                  {/* Skills - Full Width */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-500 mb-1">Skills</label>
                    <textarea
                      name="skills"
                      value={newApplicantData.skills}
                      onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-40"
                      placeholder="Enter skills (one per line)
Example:
Coding Skills
Teaching Skills"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">Press Enter after each skill to add multiple skills</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 border-t pt-4">
                  <button 
                    onClick={() => setAddModalOpen(false)} 
                    className="px-5 py-2 border border-gray-300 rounded hover:bg-gray-100 transition duration-150"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddApplicant} 
                    className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition duration-150"
                  >
                    Add Applicant
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Applicants; 