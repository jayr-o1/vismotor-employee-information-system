import React, { useState, useEffect } from "react";
import Header from "../components/Layouts/Header";
import Sidebar from "../components/Layouts/Sidebar";
import { FaEdit, FaTrash, FaEye, FaCheck, FaUserPlus } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import apiService from "../services/api";

const Applicants = () => {
  // Log environment variables (DEVELOPMENT ONLY - remove in production)
  console.log("Vite env vars:", import.meta.env);
  console.log("Process env vars:", process.env);

  // State for applicants data
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
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
      console.log("Using sample data instead");
      const sampleApplicants = Array.from({ length: 10 }, (_, index) => ({
        id: index + 1,
        name: `Applicant ${index + 1}`,
        position: ['Web Developer', 'UI/UX Designer', 'Project Manager', 'QA Engineer', 'DevOps Engineer'][Math.floor(Math.random() * 5)],
        email: `applicant${index + 1}@example.com`,
        phone: `(555) ${100 + index}-${1000 + index}`,
        status: ['Pending', 'Reviewed', 'Interviewed', 'Rejected', 'Accepted'][Math.floor(Math.random() * 5)],
        applied_date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        interview_scheduled: Math.random() > 0.5,
        education: "Bachelor's in Computer Science",
        experience: "5 years of software development",
        skills: "JavaScript\nReact\nNode.js\nTypeScript"
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

  // Open view applicant modal
  const handleViewApplicant = (applicant) => {
    setCurrentApplicant(applicant);
    setViewModalOpen(true);
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

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64">
        <Header />
        <ToastContainer position="top-right" />

        <main className="bg-gray-100 p-6 flex-1 mt-16">
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
              <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interview</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
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
                              onClick={() => handleFeedbackClick(applicant)} 
                              className="text-blue-500 hover:text-blue-700 mr-2">
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => handleScheduleClick(applicant)} 
                              className="text-green-500 hover:text-green-700 mr-2">
                              <FaCheck />
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

          {/* View Applicant Modal */}
          {viewModalOpen && currentApplicant && (
            <div className="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-sm bg-gray-900">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-semibold mb-4">Applicant Details</h2>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{currentApplicant.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Position Applied For</p>
                    <p className="font-medium">{currentApplicant.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{currentApplicant.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{currentApplicant.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Application Date</p>
                    <p className="font-medium">{currentApplicant.applied_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">{currentApplicant.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Skills</p>
                    <div className="font-medium whitespace-pre-line">{currentApplicant.skills}</div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => setViewModalOpen(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Modal */}
          {feedbackModalOpen && currentApplicant && (
            <div className="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-sm bg-gray-900">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-semibold mb-4">Add Feedback for {currentApplicant.name}</h2>
                <div className="mb-4">
                  <label className="block text-sm text-gray-500 mb-1">Feedback</label>
                  <textarea
                    value={feedbackData}
                    onChange={(e) => setFeedbackData(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-40"
                    placeholder="Enter your feedback on this applicant..."
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setFeedbackModalOpen(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                    Cancel
                  </button>
                  <button onClick={handleSubmitFeedback} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Submit Feedback
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Interview Modal */}
          {scheduleModalOpen && currentApplicant && (
            <div className="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-sm bg-gray-900">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-semibold mb-4">Schedule Interview for {currentApplicant.name}</h2>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Date</label>
                    <input
                      type="date"
                      value={interviewData.date}
                      onChange={(e) => setInterviewData({...interviewData, date: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Time</label>
                    <input
                      type="time"
                      value={interviewData.time}
                      onChange={(e) => setInterviewData({...interviewData, time: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Location</label>
                    <input
                      type="text"
                      value={interviewData.location}
                      onChange={(e) => setInterviewData({...interviewData, location: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Office location or video call link"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Interviewer</label>
                    <input
                      type="text"
                      value={interviewData.interviewer}
                      onChange={(e) => setInterviewData({...interviewData, interviewer: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Name of the interviewer"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setScheduleModalOpen(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                    Cancel
                  </button>
                  <button onClick={handleScheduleInterview} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteModalOpen && currentApplicant && (
            <div className="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-sm bg-gray-900">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
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
            <div className="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-sm bg-gray-900">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
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
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
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
                    <div className="mb-4">
                      <label className="block text-sm text-gray-500 mb-1">Skills</label>
                      <textarea
                        name="skills"
                        value={newApplicantData.skills}
                        onChange={(e) => setNewApplicantData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
                        placeholder="Enter skills (one per line)
Example:
Coding Skills
Teaching Skills"
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1">Press Enter after each skill to add multiple skills</p>
                    </div>
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