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
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  
  // Current applicant being viewed/edited
  const [currentApplicant, setCurrentApplicant] = useState(null);
  
  // Form data for various actions
  const [feedbackData, setFeedbackData] = useState("");
  const [interviewData, setInterviewData] = useState({
    date: "",
    time: "",
    location: "",
    interviewer: ""
  });
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

  // Fetch data on component mount
  useEffect(() => {
    fetchApplicants();
  }, []);

  // API fetch with fallback to sample data
  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const response = await apiService.applicants.getAll();
      setApplicants(response.data);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      
      // Fallback to sample data when API is not available
      console.log("Using sample applicant data instead");
      const sampleApplicants = Array.from({ length: 10 }, (_, index) => ({
        id: index + 1,
        name: `Applicant ${index + 1}`,
        position: `Position ${index + 1}`,
        email: `applicant${index + 1}@example.com`,
        phone: `(555) ${100 + index}-${1000 + index}`,
        status: ['Pending', 'Reviewed', 'Interviewed', 'Rejected', 'Accepted'][Math.floor(Math.random() * 5)],
        applied_date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        interview_scheduled: Math.random() > 0.5,
        education: "Bachelor's Degree",
        experience: "Previous work experience",
        skills: "Relevant skills for the position"
      }));
      
      setApplicants(sampleApplicants);
      toast.info("Connected to sample data mode");
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

  // Open feedback modal
  const handleFeedbackClick = (applicant) => {
    setCurrentApplicant(applicant);
    setFeedbackData("");
    setFeedbackModalOpen(true);
  };

  // Open schedule interview modal
  const handleScheduleClick = (applicant) => {
    setCurrentApplicant(applicant);
    setInterviewData({
      date: "",
      time: "",
      location: "",
      interviewer: ""
    });
    setScheduleModalOpen(true);
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

  // Submit feedback
  const handleSubmitFeedback = async () => {
    if (!feedbackData.trim()) {
      toast.error("Please enter feedback");
      return;
    }
    
    try {
      await apiService.applicants.addFeedback(currentApplicant.id, {
        feedback_text: feedbackData,
        created_by: "HR User" // In a real app, this would be the current user's name
      });
      
      // Update the applicant status in the local state
      setApplicants(apps => 
        apps.map(app => 
          app.id === currentApplicant.id ? { ...app, status: "Reviewed" } : app
        )
      );
      
      setFeedbackModalOpen(false);
      toast.success("Feedback submitted successfully");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error(error.message || "Failed to submit feedback. Please try again.");
    }
  };

  // Schedule interview
  const handleScheduleInterview = async () => {
    // Validate form
    if (!interviewData.date || !interviewData.time || !interviewData.location || !interviewData.interviewer) {
      toast.error("Please fill all interview details");
      return;
    }
    
    try {
      await apiService.interviews.schedule({
        applicant_id: currentApplicant.id,
        interview_date: interviewData.date,
        interview_time: interviewData.time,
        location: interviewData.location,
        interviewer: interviewData.interviewer
      });
      
      // Update the applicant status in the local state
      setApplicants(apps => 
        apps.map(app => 
          app.id === currentApplicant.id ? { ...app, status: "Scheduled", interview_scheduled: true } : app
        )
      );
      
      setScheduleModalOpen(false);
      toast.success("Interview scheduled successfully");
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast.error(error.message || "Failed to schedule interview. Please try again.");
    }
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
      // Create employee record
      await apiService.employees.create({
        applicant_id: currentApplicant.id,
        name: currentApplicant.name,
        email: currentApplicant.email,
        phone: currentApplicant.phone,
        position: onboardData.position,
        department: onboardData.department,
        hire_date: onboardData.startDate,
        salary: onboardData.salary
      });
      
      // Update applicant status
      await apiService.applicants.updateStatus(currentApplicant.id, "Onboarded");
      
      // Update the applicant status in the local state
      setApplicants(apps => 
        apps.map(app => 
          app.id === currentApplicant.id ? { ...app, status: "Onboarded" } : app
        )
      );
      
      setOnboardModalOpen(false);
      toast.success("Applicant onboarded successfully");
    } catch (error) {
      console.error("Error onboarding applicant:", error);
      toast.error(error.message || "Failed to onboard applicant. Please try again.");
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
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar />
      <div className="flex flex-col flex-1 lg:ml-64">
        <Header />
        <ToastContainer position="top-right" />

        <main className={`flex-1 p-4 sm:p-6 pt-16 md:pt-20 overflow-y-auto transition-colors duration-200 ${
          isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
        }`}>
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Job Applicants
              </h1>
              
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search applicants..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className={`w-full md:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
                </div>
                
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaUserPlus /> Add Applicant
                </button>
              </div>
            </div>

            {loading ? (
              <div className={`rounded-lg shadow p-6 flex justify-center items-center h-64 ${
                isDark ? 'bg-slate-800' : 'bg-white'
              }`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <>
                <div className={`rounded-lg shadow overflow-hidden ${
                  isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
                }`}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className={isDark ? 'bg-slate-700' : 'bg-gray-50'}>
                        <tr>
                          <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDark ? 'text-gray-300' : 'text-gray-500'
                          }`}>Applicant</th>
                          <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDark ? 'text-gray-300' : 'text-gray-500'
                          }`}>Position</th>
                          <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDark ? 'text-gray-300' : 'text-gray-500'
                          }`}>Status</th>
                          <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDark ? 'text-gray-300' : 'text-gray-500'
                          }`}>Applied Date</th>
                          <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDark ? 'text-gray-300' : 'text-gray-500'
                          }`}>Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${
                        isDark ? 'bg-slate-800 divide-slate-700' : 'bg-white divide-gray-200'
                      }`}>
                        {currentItems.map((applicant) => (
                          <tr key={applicant.id} className={isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className={`text-sm font-medium ${
                                    isDark ? 'text-white' : 'text-gray-900'
                                  }`}>{applicant.name}</div>
                                  <div className={`text-sm ${
                                    isDark ? 'text-gray-400' : 'text-gray-500'
                                  }`}>{applicant.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {applicant.position}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                getStatusStyle(applicant.status)
                              }`}>
                                {applicant.status}
                              </span>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                              isDark ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              {new Date(applicant.applied_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewApplicant(applicant)}
                                  className={`p-1.5 rounded-full ${
                                    isDark ? 'text-blue-400 hover:bg-slate-700' : 'text-blue-600 hover:bg-gray-100'
                                  }`}
                                  title="View Details"
                                >
                                  <FaEye className="w-4 h-4" />
                                </button>
                                
                                {applicant.status === 'Pending' && (
                                  <button
                                    onClick={() => handleFeedbackClick(applicant)}
                                    className={`p-1.5 rounded-full ${
                                      isDark ? 'text-yellow-400 hover:bg-slate-700' : 'text-yellow-600 hover:bg-gray-100'
                                    }`}
                                    title="Add Feedback"
                                  >
                                    <FaEdit className="w-4 h-4" />
                                  </button>
                                )}
                                
                                {(applicant.status === 'Reviewed' || applicant.status === 'Interviewed') && !applicant.interview_scheduled && (
                                  <button
                                    onClick={() => handleScheduleClick(applicant)}
                                    className={`p-1.5 rounded-full ${
                                      isDark ? 'text-purple-400 hover:bg-slate-700' : 'text-purple-600 hover:bg-gray-100'
                                    }`}
                                    title="Schedule Interview"
                                  >
                                    <i className="fas fa-calendar-alt w-4 h-4"></i>
                                  </button>
                                )}
                                
                                {applicant.status === 'Interviewed' && (
                                  <button
                                    onClick={() => handleOnboardClick(applicant)}
                                    className={`p-1.5 rounded-full ${
                                      isDark ? 'text-green-400 hover:bg-slate-700' : 'text-green-600 hover:bg-gray-100'
                                    }`}
                                    title="Approve & Onboard"
                                  >
                                    <FaCheck className="w-4 h-4" />
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => handleDeleteClick(applicant)}
                                  className={`p-1.5 rounded-full ${
                                    isDark ? 'text-red-400 hover:bg-slate-700' : 'text-red-600 hover:bg-gray-100'
                                  }`}
                                  title="Delete"
                                >
                                  <FaTrash className="w-4 h-4" />
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
                <div className="flex justify-center mt-6">
                  <ReactPaginate
                    previousLabel={"← Previous"}
                    nextLabel={"Next →"}
                    pageCount={pageCount}
                    onPageChange={handlePageChange}
                    forcePage={currentPage}
                    containerClassName={`flex space-x-2 overflow-x-auto ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}
                    pageClassName={`border rounded-md ${
                      isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                    }`}
                    previousClassName={`border rounded-md px-4 py-2 ${
                      isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                    }`}
                    nextClassName={`border rounded-md px-4 py-2 ${
                      isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                    }`}
                    pageLinkClassName="px-4 py-2 block"
                    previousLinkClassName=""
                    nextLinkClassName=""
                    activeClassName={isDark ? 'bg-gray-700 text-white' : 'bg-green-600 text-white'}
                    disabledClassName="opacity-50 cursor-not-allowed"
                  />
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modal code for: 
         - Feedback Modal
         - Schedule Interview Modal
         - Onboarding Modal
         - Delete Confirmation Modal
         - Add Applicant Modal 
         Will be styled in a similar way as the Employees page modals
      */}
      
      {/* Add Feedback Modal */}
      {feedbackModalOpen && currentApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg shadow-lg p-6 max-w-md w-full ${
            isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <h2 className="text-xl font-semibold mb-4">Add Feedback</h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Providing feedback for <span className="font-medium">{currentApplicant.name}</span>
            </p>
            
            <div className="mb-4">
              <textarea
                rows="4"
                placeholder="Enter your feedback about this applicant..."
                value={feedbackData}
                onChange={(e) => setFeedbackData(e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                }`}
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setFeedbackModalOpen(false)}
                className={`px-4 py-2 rounded ${
                  isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Schedule Interview Modal */}
      {scheduleModalOpen && currentApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg shadow-lg p-6 max-w-md w-full ${
            isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <h2 className="text-xl font-semibold mb-4">Schedule Interview</h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Scheduling an interview for <span className="font-medium">{currentApplicant.name}</span>
            </p>
            
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className={`block text-sm text-gray-500 mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-800'
                }`}>Date</label>
                <input
                  type="date"
                  value={interviewData.date}
                  onChange={(e) => setInterviewData({...interviewData, date: e.target.value})}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm text-gray-500 mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-800'
                }`}>Time</label>
                <input
                  type="time"
                  value={interviewData.time}
                  onChange={(e) => setInterviewData({...interviewData, time: e.target.value})}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm text-gray-500 mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-800'
                }`}>Location</label>
                <input
                  type="text"
                  value={interviewData.location}
                  onChange={(e) => setInterviewData({...interviewData, location: e.target.value})}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Office location or video call link"
                />
              </div>
              <div>
                <label className={`block text-sm text-gray-500 mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-800'
                }`}>Interviewer</label>
                <input
                  type="text"
                  value={interviewData.interviewer}
                  onChange={(e) => setInterviewData({...interviewData, interviewer: e.target.value})}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Name of the interviewer"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setScheduleModalOpen(false)}
                className={`px-4 py-2 rounded ${
                  isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleInterview}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Onboarding Modal */}
      {onboardModalOpen && currentApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg shadow-lg p-6 max-w-md w-full ${
            isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <h2 className="text-xl font-semibold mb-4">Onboard Applicant</h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Onboarding <span className="font-medium">{currentApplicant.name}</span>
            </p>
            
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className={`block text-sm text-gray-500 mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-800'
                }`}>Position</label>
                <input
                  type="text"
                  value={onboardData.position}
                  onChange={(e) => setOnboardData({...onboardData, position: e.target.value})}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm text-gray-500 mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-800'
                }`}>Department</label>
                <input
                  type="text"
                  value={onboardData.department}
                  onChange={(e) => setOnboardData({...onboardData, department: e.target.value})}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm text-gray-500 mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-800'
                }`}>Start Date</label>
                <input
                  type="date"
                  value={onboardData.startDate}
                  onChange={(e) => setOnboardData({...onboardData, startDate: e.target.value})}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm text-gray-500 mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-800'
                }`}>Salary</label>
                <input
                  type="text"
                  value={onboardData.salary}
                  onChange={(e) => setOnboardData({...onboardData, salary: e.target.value})}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setOnboardModalOpen(false)}
                className={`px-4 py-2 rounded ${
                  isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleOnboardApplicant}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Process Onboarding
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && currentApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg shadow-lg p-6 max-w-md w-full ${
            isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete <span className="font-medium">{currentApplicant.name}'s application</span>? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className={`px-4 py-2 rounded ${
                  isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteApplicant}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Applicant Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg shadow-lg p-6 max-w-md w-full ${
            isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <h2 className="text-xl font-semibold mb-6 text-center">Add New Applicant</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
              {/* Left Column */}
              <div>
                <div className="mb-4">
                  <label className={`block text-sm text-gray-500 mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-800'
                  }`}>Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={newApplicantData.name}
                    onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder="Full Name"
                  />
                </div>
                <div className="mb-4">
                  <label className={`block text-sm text-gray-500 mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-800'
                  }`}>Position Applied For*</label>
                  <input
                    type="text"
                    name="position"
                    value={newApplicantData.position}
                    onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder="Position"
                  />
                </div>
              </div>
              
              {/* Right Column */}
              <div>
                <div className="mb-4">
                  <label className={`block text-sm text-gray-500 mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-800'
                  }`}>Education</label>
                  <input
                    type="text"
                    name="education"
                    value={newApplicantData.education}
                    onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder="Education"
                  />
                </div>
                <div className="mb-4">
                  <label className={`block text-sm text-gray-500 mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-800'
                  }`}>Experience</label>
                  <input
                    type="text"
                    name="experience"
                    value={newApplicantData.experience}
                    onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder="Experience"
                  />
                </div>
              </div>
              
              {/* Email and Phone - Left Column */}
              <div>
                <div className="mb-4">
                  <label className={`block text-sm text-gray-500 mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-800'
                  }`}>Email*</label>
                  <input
                    type="email"
                    name="email"
                    value={newApplicantData.email}
                    onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder="Email Address"
                  />
                </div>
              </div>
              
              {/* Phone - Right Column */}
              <div>
                <div className="mb-4">
                  <label className={`block text-sm text-gray-500 mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-800'
                  }`}>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={newApplicantData.phone}
                    onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder="Phone Number"
                  />
                </div>
              </div>
              
              {/* Skills - Full Width */}
              <div className="md:col-span-2">
                <label className={`block text-sm text-gray-500 mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-800'
                }`}>Skills</label>
                <textarea
                  name="skills"
                  value={newApplicantData.skills}
                  onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                  } h-40`}
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
                className={`px-5 py-2 rounded ${
                  isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddApplicant}
                className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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