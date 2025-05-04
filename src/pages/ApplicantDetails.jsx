import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaStickyNote, FaUserPlus, FaTimesCircle, FaPaperclip, FaStar, FaCalendarAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import apiService from "../services/api";
import { ThemeContext } from "../ThemeContext";
import Swal from 'sweetalert2';
import 'animate.css';

const ApplicantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    text: "",
    rating: 0,
    category: "Technical",
    strengths: "",
    areas_for_improvement: "",
    recommendation: "Hire"
  });
  const [interviewData, setInterviewData] = useState({
    date: "",
    time: "",
    location: "",
    interviewer: ""
  });
  const [notes, setNotes] = useState([]);
  const [onboardData, setOnboardData] = useState({
    position: "",
    department: "",
    startDate: "",
    salary: "",
    equipment: [],
    documents: [],
    trainingSchedule: [],
    mentor: ""
  });

  useEffect(() => {
    fetchApplicantDetails();
  }, [id]);

  // Handle the Escape key press for onboard modal
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && onboardModalOpen) {
        handleOnboardModalClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onboardModalOpen]); // Only depend on modal open state

  const fetchApplicantDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching applicant details for ID:", id);
      
      // First, try to get the applicant data
      const applicantResponse = await apiService.applicants.getById(id);
      console.log("Applicant response:", applicantResponse);
      
      if (!applicantResponse.data) {
        throw new Error("Applicant not found");
      }
      
      setApplicant(applicantResponse.data);
      
      // Then try to get notes, but don't let it block the main applicant data
      try {
        const notesResponse = await apiService.applicants.getNotes(id);
        console.log("Notes response:", notesResponse);
        setNotes(notesResponse.data || []);
      } catch (notesError) {
        console.error("Error fetching applicant notes:", notesError);
        // Don't show toast error for notes - just log it
        setNotes([]);
      }
      
      // Fetch interview history
      try {
        const interviewsResponse = await apiService.applicants.getInterviews(id);
        console.log("Interviews response:", interviewsResponse);
        // Update applicant with interviews data
        setApplicant(prev => ({
          ...prev,
          interviews: interviewsResponse.data || []
        }));
      } catch (interviewsError) {
        console.error("Error fetching interview history:", interviewsError);
        // Don't block the UI for interview error
      }
    } catch (error) {
      console.error("Error fetching applicant details:", error);
      console.error("Error response:", error.response);
      setError(error.response?.data?.message || "Failed to load applicant details");
      toast.error(error.response?.data?.message || "Failed to load applicant details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackData.text.trim()) {
      toast.error("Please enter feedback text");
      return;
    }

    if (feedbackData.rating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    try {
      const feedbackPayload = {
        applicant_id: applicant.id,
        ...feedbackData,
        created_by: "Current User" // This should come from auth context
      };

      await apiService.applicants.addNote(feedbackPayload);
      
      // Update applicant status based on recommendation
      if (feedbackData.recommendation === "Hire") {
        await apiService.applicants.updateStatus(applicant.id, "Reviewed");
      }
      
      // Refresh notes and applicant data
      const [notesResponse, applicantResponse] = await Promise.all([
        apiService.applicants.getNotes(applicant.id),
        apiService.applicants.getById(applicant.id)
      ]);
      
      setNotes(notesResponse.data || []);
      setApplicant(applicantResponse.data);
      
      toast.success("Feedback submitted successfully!");
      
      setFeedbackData({
        text: "",
        rating: 0,
        category: "Technical",
        strengths: "",
        areas_for_improvement: "",
        recommendation: "Hire"
      });
      setFeedbackModalOpen(false);
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error(error.response?.data?.message || "Failed to submit feedback");
    }
  };

  // Function to handle onboard modal close with confirmation
  const handleOnboardModalClose = () => {
    // Only show confirmation if user has entered data
    if (onboardData.position || onboardData.department || onboardData.startDate || onboardData.salary) {
      Swal.fire({
        title: 'Discard changes?',
        text: 'Any information you entered will be lost.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Discard',
        cancelButtonText: 'Continue Editing'
      }).then((result) => {
        if (result.isConfirmed) {
          // Reset form data and close modal
          setOnboardData({
            position: "",
            department: "",
            startDate: "",
            salary: "",
            equipment: [],
            documents: [],
            trainingSchedule: [],
            mentor: ""
          });
          setOnboardModalOpen(false);
        }
      });
    } else {
      // No data entered, just close the modal
      setOnboardModalOpen(false);
    }
  };

  const handleOpenOnboardModal = () => {
    // Validate applicant status
    if (applicant.status !== 'Interviewed' && applicant.status !== 'Reviewed') {
      toast.warning("Applicant must be interviewed before onboarding.", {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }

    setOnboardData({
      position: applicant.position || "",
      department: "",
      startDate: "",
      salary: "",
      equipment: [],
      documents: [],
      trainingSchedule: [],
      mentor: ""
    });
    setOnboardModalOpen(true);
  };

  const handleOnboardApplicant = async () => {
    if (!applicant) {
      toast.error("No applicant selected for onboarding");
      return;
    }
    
    if (applicant.status !== 'Interviewed' && applicant.status !== 'Reviewed') {
      toast.error("Applicant must be interviewed before onboarding");
      setOnboardModalOpen(false);
      return;
    }
    
    if (!onboardData.department || !onboardData.startDate || !onboardData.salary || !onboardData.position) {
      toast.error("Please fill all required onboarding details");
      return;
    }

    const salary = parseFloat(onboardData.salary);
    if (isNaN(salary)) {
      toast.error("Salary must be a valid number");
      return;
    }
    
    // Show confirmation before processing
    const result = await Swal.fire({
      title: 'Confirm Onboarding',
      html: `
        <div class="text-left">
          <p>Are you sure you want to onboard <strong>${applicant.name}</strong> with the following details?</p>
          <div class="mt-3">
            <p><strong>Position:</strong> ${onboardData.position}</p>
            <p><strong>Department:</strong> ${onboardData.department}</p>
            <p><strong>Start Date:</strong> ${onboardData.startDate}</p>
            <p><strong>Salary:</strong> $${salary}</p>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Onboard!',
      cancelButtonText: 'Cancel'
    });
    
    if (!result.isConfirmed) {
      return; // User cancelled the operation
    }
    
    // Close the modal immediately after confirmation
    setOnboardModalOpen(false);
    
    // Save onboard data for API calls
    const onboardingData = { ...onboardData };
    
    // Reset form data
    setOnboardData({
      position: "",
      department: "",
      startDate: "",
      salary: "",
      equipment: [],
      documents: [],
      trainingSchedule: [],
      mentor: ""
    });
    
    setLoading(true);
    try {
      // Create employee record
      const employeeResponse = await apiService.employees.create({
        applicant_id: applicant.id,
        name: applicant.name,
        email: applicant.email,
        phone: applicant.phone || '',
        position: onboardingData.position,
        department: onboardingData.department,
        hire_date: onboardingData.startDate,
        salary: salary,
        mentor: onboardingData.mentor
      });

      // Process equipment requests
      if (onboardingData.equipment.length > 0) {
        await apiService.employees.requestEquipment(employeeResponse.data.id, onboardingData.equipment);
      }

      // Process document uploads
      if (onboardingData.documents.length > 0) {
        await apiService.employees.uploadDocuments(employeeResponse.data.id, onboardingData.documents);
      }

      // Schedule training
      if (onboardingData.trainingSchedule.length > 0) {
        await apiService.employees.scheduleTraining(employeeResponse.data.id, onboardingData.trainingSchedule);
      }

      // Update applicant status
      await apiService.applicants.updateStatus(applicant.id, "Accepted");
      
      // Send welcome email
      await apiService.employees.sendWelcomeEmail(employeeResponse.data.id);
      
      // Update applicant state
      setApplicant(prev => ({ ...prev, status: "Accepted" }));
      
      // Show toast success message
      toast.success(`${applicant.name} successfully onboarded!`, {
        position: "top-right",
        autoClose: 3000
      });
      
      // Refresh the page immediately to show updated data
      window.location.reload();
      
      // Note: The code below will not execute because of the page refresh
      // but we'll keep it in case the refresh behavior changes later
      Swal.fire({
        icon: 'success',
        title: 'Applicant Onboarded!',
        html: `
          <div class="text-left">
            <p><strong>${applicant.name}</strong> has been successfully hired and added to Staff Directory!</p>
            <div class="mt-3">
              <p><strong>Position:</strong> ${onboardingData.position}</p>
              <p><strong>Department:</strong> ${onboardingData.department}</p>
              <p><strong>Start Date:</strong> ${onboardingData.startDate}</p>
              <p><strong>Salary:</strong> $${salary}</p>
            </div>
          </div>
        `,
        confirmButtonColor: '#10B981',
        confirmButtonText: 'Great!',
        allowOutsideClick: false,
        backdrop: `rgba(0,0,0,0.7)`,
        showClass: {
          popup: 'animate__animated animate__fadeIn animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOut animate__faster'
        }
      });
    } catch (error) {
      console.error("Error onboarding applicant:", error);
      toast.error(error.response?.data?.message || "Failed to onboard applicant");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectApplicant = async () => {
    if (!applicant) return;
    
    try {
      await apiService.applicants.updateStatus(applicant.id, "Rejected");
      
      toast.success("Applicant marked as rejected");
      
      // Update local state
      setApplicant(prev => ({ ...prev, status: "Rejected" }));
      
    } catch (error) {
      console.error("Error rejecting applicant:", error);
      toast.error(error.response?.data?.message || "Failed to reject applicant");
    }
  };

  // Handle hiring directly from interview history
  const handleHireFromInterview = (interview) => {
    if (!applicant) return;
    
    // Pre-populate the onboard data with applicant info and interviewer feedback
    setOnboardData({
      position: applicant.position || "",
      department: "",
      startDate: new Date().toISOString().split('T')[0], // Default to today
      salary: "",
      equipment: [],
      documents: [],
      trainingSchedule: [],
      mentor: interview.interviewer || "" // Use the interviewer as default mentor
    });
    
    // Mark the applicant as interviewed if not already
    if (applicant.status !== "Interviewed" && applicant.status !== "Reviewed") {
      apiService.applicants.updateStatus(applicant.id, "Interviewed")
        .then(() => {
          // Update local state
          setApplicant(prev => ({ ...prev, status: "Interviewed" }));
        })
        .catch(error => {
          console.error("Error updating applicant status:", error);
          // Continue with the onboarding modal even if status update fails
        });
    }
    
    // Open the onboarding modal
    setOnboardModalOpen(true);
    
    // Show a SweetAlert notification instead of toast
    Swal.fire({
      icon: 'info',
      title: 'Complete Onboarding',
      text: 'Please complete the onboarding details to hire this applicant.',
      confirmButtonColor: '#3B82F6',
      confirmButtonText: 'Will do!'
    });
  };

  // Mark an interview as completed
  const handleMarkInterviewCompleted = async (interview) => {
    try {
      await apiService.interviews.updateStatus(interview.id, { status: "Completed" });
      
      // Update applicant status
      await apiService.applicants.updateStatus(applicant.id, "Interviewed");
      
      // Update local state
      setApplicant(prev => {
        // Update both the applicant status and the interview status in the interviews array
        const updatedInterviews = prev.interviews.map(item => 
          item.id === interview.id ? { ...item, status: "Completed" } : item
        );
        
        return { 
          ...prev, 
          status: "Interviewed",
          interviews: updatedInterviews
        };
      });
      
      toast.success("Interview marked as completed");
    } catch (error) {
      console.error("Error updating interview status:", error);
      toast.error(error.response?.data?.message || "Failed to update interview status");
    }
  };

  const handleScheduleInterview = async () => {
    // Validate form
    if (!interviewData.date || !interviewData.time || !interviewData.location || !interviewData.interviewer) {
      toast.error("Please fill all interview details");
      return;
    }
    
    try {
      // Schedule the interview using the correct endpoint
      await apiService.interviews.schedule(applicant.id, {
        interview_date: interviewData.date,
        interview_time: interviewData.time,
        location: interviewData.location,
        interviewer: interviewData.interviewer
      });
      
      // Update applicant status
      await apiService.applicants.updateStatus(applicant.id, "Interview Scheduled");
      
      // Update local state
      setApplicant(prev => ({ 
        ...prev, 
        status: "Interview Scheduled", 
        interview_scheduled: true 
      }));
      
      // Try to add feedback about the interview scheduling instead
      try {
        const feedbackPayload = {
          feedback_text: `Interview scheduled on ${interviewData.date} at ${interviewData.time} with ${interviewData.interviewer} at ${interviewData.location}`,
          created_by: "Current User"
        };
        
        await apiService.applicants.addFeedback(applicant.id, feedbackPayload);
        
        // Refresh feedback/notes if available
        try {
          const feedbackResponse = await apiService.applicants.getFeedback(applicant.id);
          setNotes(feedbackResponse.data || []);
        } catch (error) {
          console.log("Could not refresh feedback", error);
        }
      } catch (error) {
        console.log("Could not add scheduling note", error);
        // Non-critical error, we can continue
      }
      
      // Reset interview data
      setInterviewData({
        date: "",
        time: "",
        location: "",
        interviewer: ""
      });
      
      setScheduleModalOpen(false);
      toast.success("Interview scheduled successfully");
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast.error(error.message || "Failed to schedule interview. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen">
        <div className={`min-h-screen p-6 ${isDark ? 'bg-[#1B2537] text-white' : 'bg-gray-50 text-gray-800'}`}>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="w-full min-h-screen">
        <div className={`min-h-screen p-6 ${isDark ? 'bg-[#1B2537] text-white' : 'bg-gray-50 text-gray-800'}`}>
          <div className="text-center">
            <h2 className={`text-2xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {error || "Applicant not found"}
            </h2>
            <button
              onClick={() => navigate('/applicants')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Return to Applicants List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ToastContainer position="top-right" />
      
      <div className={`min-h-screen ${isDark ? 'bg-[#1B2537] text-white' : 'bg-gray-50 text-gray-800'}`}>
        <div className="max-w-7xl mx-auto p-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/applicants')}
            className={`flex items-center ${isDark ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'} mb-6`}
          >
            <FaArrowLeft className="mr-2" />
            Back to Applicants
          </button>

          {/* Applicant Details */}
          <div className={`${isDark ? 'bg-[#232f46] border border-slate-700' : 'bg-white border border-gray-200'} rounded-lg shadow-md p-6 mb-6`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className={`text-2xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                  {`${applicant.first_name} ${applicant.last_name}`}
                </h1>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{applicant.position}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                applicant.status === "Pending" 
                  ? isDark ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800" 
                  : applicant.status === "Reviewed" 
                  ? isDark ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800" 
                  : applicant.status === "Interviewed" 
                  ? isDark ? "bg-purple-900 text-purple-200" : "bg-purple-100 text-purple-800"
                  : applicant.status === "Accepted"
                  ? isDark ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800"
                  : isDark ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"
              }`}>
                {applicant.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{applicant.email}</p>
                </div>
                
                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{applicant.phone}</p>
                </div>
                
                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Application Date</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {applicant.applied_date ? applicant.applied_date.split('T')[0] : ''}
                  </p>
                </div>
              </div>
              
              {/* Right Column */}
              <div>
                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Education</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{applicant.highest_education || 'N/A'}</p>
                </div>
                
                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Gender</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{applicant.gender || 'N/A'}</p>
                </div>
                
                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Job Source</p>
                  <p className={`font-medium whitespace-pre-line ${isDark ? 'text-white' : 'text-gray-800'}`}>{applicant.job_post_source || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Note button - always available */}
            <button
              onClick={() => setFeedbackModalOpen(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FaStickyNote className="mr-2" />
              Add Note
            </button>
            
            {/* Schedule Interview button - available when not hired, rejected, or already interviewed */}
            {applicant.status !== "Accepted" && applicant.status !== "Rejected" && applicant.status !== "Interviewed" && (
              <button
                onClick={() => setScheduleModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaCalendarAlt className="mr-2" />
                Schedule Interview
              </button>
            )}
            
            {/* Hire button - available when interviewed or reviewed */}
            {(applicant.status === "Interviewed" || applicant.status === "Reviewed") && (
              <button
                onClick={handleOpenOnboardModal}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaUserPlus className="mr-2" />
                Hire Applicant
              </button>
            )}
            
            {/* Reject button - available when not hired or rejected */}
            {applicant.status !== "Accepted" && applicant.status !== "Rejected" && (
              <button
                onClick={handleRejectApplicant}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaTimesCircle className="mr-2" />
                Reject Applicant
              </button>
            )}
          </div>

          {/* Interview History Section */}
          <div className={`${isDark ? 'bg-[#232f46] border border-slate-700' : 'bg-white border border-gray-200'} rounded-lg shadow-md p-6 mb-6`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Interview History</h2>
            {applicant.interviews && applicant.interviews.length > 0 ? (
              <div className="overflow-x-auto">
                <table className={`min-w-full ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <thead>
                    <tr className={`${isDark ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                      <th className="py-3 px-4 text-left">Interviewer</th>
                      <th className="py-3 px-4 text-left">Date & Time</th>
                      <th className="py-3 px-4 text-left">Location</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicant.interviews.map((interview) => (
                      <tr 
                        key={interview.id} 
                        className={`${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} border-b transition-colors`}
                      >
                        <td className="py-3 px-4">{interview.interviewer}</td>
                        <td className="py-3 px-4">
                          {interview.interview_date ? interview.interview_date.split('T')[0] : new Date(interview.interview_date).toLocaleDateString()} at {interview.interview_time}
                        </td>
                        <td className="py-3 px-4">{interview.location}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            interview.status === "Scheduled" 
                              ? isDark ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
                              : interview.status === "Completed" 
                              ? isDark ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800"
                              : interview.status === "Cancelled" 
                              ? isDark ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"
                              : isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"
                          }`}>
                            {interview.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {interview.status === "Scheduled" && (
                            <button
                              onClick={() => handleMarkInterviewCompleted(interview)}
                              className={`text-xs font-medium px-3 py-1.5 rounded ${
                                isDark ? "bg-blue-900 text-blue-200 hover:bg-blue-800" : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                              }`}
                            >
                              <span className="flex items-center">
                                <FaCalendarAlt className="mr-1" size={12} />
                                Mark Completed
                              </span>
                            </button>
                          )}
                          {interview.status === "Completed" && applicant.status !== "Accepted" ? (
                            <button
                              onClick={() => handleHireFromInterview(interview)}
                              className={`text-xs font-medium px-3 py-1.5 rounded ${
                                isDark ? "bg-green-900 text-green-200 hover:bg-green-800" : "bg-green-100 text-green-800 hover:bg-green-200"
                              }`}
                            >
                              <span className="flex items-center">
                                <FaUserPlus className="mr-1" size={12} />
                                Hire
                              </span>
                            </button>
                          ) : interview.status === "Completed" && applicant.status === "Accepted" ? (
                            <span className={`text-xs font-medium px-3 py-1.5 rounded opacity-50 cursor-not-allowed ${
                              isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-500"
                            }`}>
                              <span className="flex items-center">
                                <FaUserPlus className="mr-1" size={12} />
                                Already Hired
                              </span>
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={`text-center py-8 ${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg border ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No interviews scheduled yet.</p>
                {applicant.status !== "Accepted" && applicant.status !== "Rejected" && (
                  <button
                    onClick={() => setScheduleModalOpen(true)}
                    className="mt-3 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <FaCalendarAlt className="mr-2" />
                    Schedule Interview
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-[#232f46] text-white' : 'bg-white text-gray-800'} rounded-lg shadow-lg p-6 max-w-md w-full`}>
            <h3 className="text-xl font-semibold mb-4">Add Note</h3>
            <div>
              <textarea
                value={feedbackData.text}
                onChange={(e) => setFeedbackData({...feedbackData, text: e.target.value})}
                placeholder="Enter your notes or feedback..."
                className={`w-full px-3 py-2 border rounded-lg h-32 ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              ></textarea>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setFeedbackModalOpen(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Modal */}
      {onboardModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800/90 border border-slate-700' : 'bg-white/90 border border-gray-200'} p-6 rounded-xl shadow-lg max-w-md w-full backdrop-blur-md`}>
            {/* Header with title and close button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Onboard {applicant.name}</h2>
              <button 
                onClick={handleOnboardModalClose}
                className={`p-1 rounded-full hover:bg-opacity-80 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
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
                  value={onboardData.startDate ? onboardData.startDate.split('T')[0] : onboardData.startDate}
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
                  placeholder="e.g. 50000"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark 
                      ? 'bg-slate-700/80 border-slate-600 text-white' 
                      : 'bg-white/80 border-gray-300 text-gray-800'
                  }`}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={handleOnboardModalClose} 
                className={`px-4 py-2 rounded-lg ${
                  isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleOnboardApplicant} 
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : "Process Onboarding"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-[#232f46] text-white' : 'bg-white text-gray-800'} rounded-lg shadow-lg p-6 max-w-md w-full`}>
            <h3 className="text-xl font-semibold mb-4">Schedule Interview for {applicant.name}</h3>
            <div className="space-y-4">
              <div>
                <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date</label>
                <input
                  type="date"
                  value={interviewData.date}
                  onChange={(e) => setInterviewData({...interviewData, date: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Time</label>
                <input
                  type="time"
                  value={interviewData.time}
                  onChange={(e) => setInterviewData({...interviewData, time: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
                <input
                  type="text"
                  value={interviewData.location}
                  onChange={(e) => setInterviewData({...interviewData, location: e.target.value})}
                  placeholder="Office location or video call link"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Interviewer</label>
                <input
                  type="text"
                  value={interviewData.interviewer}
                  onChange={(e) => setInterviewData({...interviewData, interviewer: e.target.value})}
                  placeholder="Name of interviewer"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setScheduleModalOpen(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleInterview}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantDetails; 