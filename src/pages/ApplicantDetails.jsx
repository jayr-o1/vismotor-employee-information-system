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
  const [activeTab, setActiveTab] = useState('details');
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [equipmentNotes, setEquipmentNotes] = useState('');
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [onboardingProgress, setOnboardingProgress] = useState(25);

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
      
      setLoading(false);
      
      // Show success message with navigation options
      const navigationResult = await Swal.fire({
        icon: 'success',
        title: 'Applicant Hired Successfully!',
        html: `
          <div class="text-left">
            <p><strong>${applicant.name}</strong> has been successfully hired and added to the staff directory!</p>
            <div class="mt-3">
              <p><strong>Position:</strong> ${onboardingData.position}</p>
              <p><strong>Department:</strong> ${onboardingData.department}</p>
              <p><strong>Start Date:</strong> ${onboardingData.startDate}</p>
            </div>
          </div>
        `,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        denyButtonColor: '#3B82F6',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Go to Onboarding',
        denyButtonText: 'View Staff Directory',
        cancelButtonText: 'Stay Here'
      });
      
      if (navigationResult.isConfirmed) {
        // Navigate to onboarding page
        navigate('/onboarding');
      } else if (navigationResult.isDenied) {
        // Navigate to employees page
        navigate('/employees');
      }
      
    } catch (error) {
      console.error("Error onboarding applicant:", error);
      toast.error(error.response?.data?.message || "Failed to onboard applicant");
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
    if (!applicant) return;
    
    try {
      // Update interview status to "Completed"
      await apiService.interviews.updateStatus(interview.id, { status: "Completed" });
      
      // Update local state
      const updatedInterviews = applicant.interviews.map(i => 
        i.id === interview.id ? { ...i, status: "Completed" } : i
      );
      
      setApplicant(prev => ({ 
        ...prev, 
        interviews: updatedInterviews,
        status: "Interviewed"
      }));
      
      toast.success("Interview marked as completed");
      
      // Ask if the user wants to proceed with hiring
      const result = await Swal.fire({
        title: 'Interview Completed',
        html: `The interview with <strong>${applicant.name}</strong> is now marked as completed. Would you like to proceed with the hiring process?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, Hire Now',
        cancelButtonText: 'Not Yet'
      });
      
      if (result.isConfirmed) {
        handleHireFromInterview(interview);
      }
    } catch (error) {
      console.error("Error marking interview as completed:", error);
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

  // Calculate onboarding progress
  useEffect(() => {
    if (!onboardModalOpen) return;
    
    let progress = 0;
    let totalSteps = 4; // 4 tabs
    
    // Basic details progress (25%)
    if (onboardData.position && onboardData.department && onboardData.startDate && onboardData.salary) {
      progress += 25;
    } else if (onboardData.position || onboardData.department || onboardData.startDate || onboardData.salary) {
      progress += 10; // Partial completion
    }
    
    // Equipment progress (25%)
    if (onboardData.equipment.length > 0) {
      progress += 25;
    }
    
    // Documents progress (25%)
    if (onboardData.documents.length > 0) {
      progress += 25;
    }
    
    // Training progress (25%)
    if (onboardData.trainingSchedule.length > 0) {
      progress += 25;
    }
    
    setOnboardingProgress(progress);
  }, [onboardData, onboardModalOpen]);

  // Fetch equipment, document, and training types when modal opens
  useEffect(() => {
    if (onboardModalOpen) {
      fetchEquipmentTypes();
      fetchDocumentTypes();
      fetchTrainingTypes();
    }
  }, [onboardModalOpen]);

  // Fetch equipment types
  const fetchEquipmentTypes = async () => {
    try {
      const response = await apiService.employees.getEquipmentTypes();
      setEquipmentTypes(response.data);
    } catch (error) {
      console.error("Error fetching equipment types:", error);
      toast.error("Failed to load equipment types");
      setEquipmentTypes([]);
    }
  };

  // Fetch document types
  const fetchDocumentTypes = async () => {
    try {
      const response = await apiService.employees.getDocumentTypes();
      setDocumentTypes(response.data);
    } catch (error) {
      console.error("Error fetching document types:", error);
      toast.error("Failed to load document types");
      setDocumentTypes([]);
    }
  };

  // Fetch training types
  const fetchTrainingTypes = async () => {
    try {
      const response = await apiService.employees.getTrainingTypes();
      setTrainingTypes(response.data);
    } catch (error) {
      console.error("Error fetching training types:", error);
      toast.error("Failed to load training types");
      setTrainingTypes([]);
    }
  };

  // Handle tab navigation
  const handleNextTab = () => {
    if (activeTab === 'details') {
      // Validate required fields before moving to next tab
      if (!onboardData.position || !onboardData.department || !onboardData.startDate || !onboardData.salary) {
        toast.error("Please fill in all required fields marked with *");
        return;
      }
      setActiveTab('equipment');
    } else if (activeTab === 'equipment') {
      setActiveTab('documents');
    } else if (activeTab === 'documents') {
      setActiveTab('training');
    }
  };

  const handlePreviousTab = () => {
    if (activeTab === 'equipment') {
      setActiveTab('details');
    } else if (activeTab === 'documents') {
      setActiveTab('equipment');
    } else if (activeTab === 'training') {
      setActiveTab('documents');
    }
  };

  // Equipment handlers
  const handleToggleEquipment = (equipmentType) => {
    const existing = onboardData.equipment.findIndex(eq => eq.equipment_type === equipmentType);
    
    if (existing >= 0) {
      // Already selected, remove it
      const updated = [...onboardData.equipment];
      updated.splice(existing, 1);
      setOnboardData({...onboardData, equipment: updated});
    } else {
      // Add new equipment
      setOnboardData({
        ...onboardData, 
        equipment: [...onboardData.equipment, { 
          equipment_type: equipmentType,
          description: '',
          notes: ''
        }]
      });
    }
  };

  const handleRemoveEquipment = (index) => {
    const updated = [...onboardData.equipment];
    updated.splice(index, 1);
    setOnboardData({...onboardData, equipment: updated});
  };

  const handleUpdateEquipmentNotes = () => {
    if (onboardData.equipment.length === 0) return;
    
    // Update the notes for all selected equipment
    const updatedEquipment = onboardData.equipment.map(eq => ({
      ...eq,
      notes: equipmentNotes
    }));
    
    setOnboardData({...onboardData, equipment: updatedEquipment});
    toast.success("Equipment notes updated");
  };

  // Document handlers
  const handleToggleDocument = (documentType, daysToSubmit = 7) => {
    const existing = onboardData.documents.findIndex(doc => doc.document_type === documentType);
    
    if (existing >= 0) {
      // Already selected, remove it
      const updated = [...onboardData.documents];
      updated.splice(existing, 1);
      setOnboardData({...onboardData, documents: updated});
    } else {
      // Add new document
      const docType = documentTypes.find(dt => dt.name === documentType);
      const isRequired = docType ? docType.required : true;
      
      setOnboardData({
        ...onboardData, 
        documents: [...onboardData.documents, { 
          document_type: documentType,
          document_name: documentType,
          required: isRequired,
          days_to_submit: daysToSubmit,
          notes: ''
        }]
      });
    }
  };

  const handleRemoveDocument = (index) => {
    const updated = [...onboardData.documents];
    updated.splice(index, 1);
    setOnboardData({...onboardData, documents: updated});
  };

  // Training handlers
  const handleToggleTraining = (trainingType) => {
    const existing = onboardData.trainingSchedule.findIndex(tr => tr.training_type === trainingType);
    
    if (existing >= 0) {
      // Already selected, remove it
      const updated = [...onboardData.trainingSchedule];
      updated.splice(existing, 1);
      setOnboardData({...onboardData, trainingSchedule: updated});
      setSelectedTraining(null);
    } else {
      // Add new training
      const newTraining = { 
        training_type: trainingType,
        description: '',
        trainer: '',
        location: '',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: 60
      };
      
      setOnboardData({
        ...onboardData, 
        trainingSchedule: [...onboardData.trainingSchedule, newTraining]
      });
      
      // Set this as the selected training to edit details
      setSelectedTraining(newTraining);
    }
  };

  const handleRemoveTraining = (index) => {
    const updated = [...onboardData.trainingSchedule];
    const removedItem = updated[index];
    updated.splice(index, 1);
    setOnboardData({...onboardData, trainingSchedule: updated});
    
    // If we were editing this training, reset the selection
    if (selectedTraining && selectedTraining.training_type === removedItem.training_type) {
      setSelectedTraining(null);
    }
  };

  const handleUpdateTrainingDetails = () => {
    if (!selectedTraining) return;
    
    // Find the training in our list and update it
    const updated = onboardData.trainingSchedule.map(tr => 
      tr.training_type === selectedTraining.training_type ? selectedTraining : tr
    );
    
    setOnboardData({...onboardData, trainingSchedule: updated});
    toast.success(`${selectedTraining.training_type} training details updated`);
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
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Gender</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {applicant.gender}
                    {applicant.other_gender && ` (${applicant.other_gender})`}
                  </p>
                </div>
                
                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Age</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{applicant.age || 'N/A'}</p>
                </div>
                
                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Marital Status</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {applicant.marital_status}
                    {applicant.other_marital_status && ` (${applicant.other_marital_status})`}
                  </p>
                </div>

                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Education</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {applicant.highest_education}
                    {applicant.other_highest_education && ` (${applicant.other_highest_education})`}
                  </p>
                </div>

                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Position Applying For</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {applicant.position}
                    {applicant.other_position && ` (${applicant.other_position})`}
                  </p>
                </div>

                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Desired Pay</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{applicant.desired_pay || 'N/A'}</p>
                </div>

                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Previously Employed at Vismotor</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{applicant.previously_employed || 'N/A'}</p>
                </div>
              </div>
              
              {/* Right Column */}
              <div>
                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Branch/Department</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {applicant.branch_department}
                    {applicant.other_branch_department && ` (${applicant.other_branch_department})`}
                  </p>
                </div>
                
                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Date Availability</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {applicant.date_availability}
                    {applicant.other_date_availability && ` (${applicant.other_date_availability})`}
                  </p>
                </div>
                
                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Job Post Source</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {applicant.job_post_source}
                    {applicant.other_job_source && ` (${applicant.other_job_source})`}
                  </p>
                </div>

                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Address</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {[
                      applicant.street_address,
                      applicant.barangay,
                      applicant.city,
                      applicant.province,
                      applicant.region
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
                
                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Application Date</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {applicant.applied_date ? applicant.applied_date.split('T')[0] : ''}
                  </p>
                </div>

                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Files</p>
                  <div className="flex flex-col space-y-2 mt-2">
                    {applicant.resume_filename && (
                      <a 
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/applicants/download/${applicant.resume_filename}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`flex items-center ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                      >
                        <FaPaperclip className="mr-2" /> 
                        Resume/CV: {applicant.resume_originalname}
                      </a>
                    )}
                    {applicant.house_sketch_filename && (
                      <a 
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/applicants/download/${applicant.house_sketch_filename}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`flex items-center ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                      >
                        <FaPaperclip className="mr-2" /> 
                        House Sketch: {applicant.house_sketch_originalname}
                      </a>
                    )}
                  </div>
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
          <div className={`${isDark ? 'bg-slate-800/90 border border-slate-700' : 'bg-white/90 border border-gray-200'} p-6 rounded-xl shadow-lg max-w-2xl w-full backdrop-blur-md`}>
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

            {/* Tabs for multi-step form */}
            <div className="mb-6">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button 
                  className={`py-2 px-4 border-b-2 ${activeTab === 'details' 
                    ? 'border-green-500 text-green-500' 
                    : 'border-transparent hover:border-gray-300'}`}
                  onClick={() => setActiveTab('details')}
                >
                  Basic Details
                </button>
                <button 
                  className={`py-2 px-4 border-b-2 ${activeTab === 'equipment' 
                    ? 'border-green-500 text-green-500' 
                    : 'border-transparent hover:border-gray-300'}`}
                  onClick={() => setActiveTab('equipment')}
                >
                  Equipment
                </button>
                <button 
                  className={`py-2 px-4 border-b-2 ${activeTab === 'documents' 
                    ? 'border-green-500 text-green-500' 
                    : 'border-transparent hover:border-gray-300'}`}
                  onClick={() => setActiveTab('documents')}
                >
                  Documents
                </button>
                <button 
                  className={`py-2 px-4 border-b-2 ${activeTab === 'training' 
                    ? 'border-green-500 text-green-500' 
                    : 'border-transparent hover:border-gray-300'}`}
                  onClick={() => setActiveTab('training')}
                >
                  Training
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="overflow-y-auto max-h-[60vh]">
              {/* Basic Details Tab */}
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Position <span className="text-red-500">*</span></label>
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
                    <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Department <span className="text-red-500">*</span></label>
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
                    <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Start Date <span className="text-red-500">*</span></label>
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
                    <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Salary <span className="text-red-500">*</span></label>
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
                  <div>
                    <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Mentor/Buddy</label>
                    <input
                      type="text"
                      value={onboardData.mentor}
                      onChange={(e) => setOnboardData({...onboardData, mentor: e.target.value})}
                      placeholder="Name of assigned mentor"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        isDark 
                          ? 'bg-slate-700/80 border-slate-600 text-white' 
                          : 'bg-white/80 border-gray-300 text-gray-800'
                      }`}
                    />
                  </div>
                </div>
              )}
              
              {/* Equipment Tab */}
              {activeTab === 'equipment' && (
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Required Equipment
                  </h3>
                  {equipmentTypes.length === 0 ? (
                    <div className={`text-center py-4 ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'} rounded-lg mb-4`}>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading equipment types...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {equipmentTypes.map(type => (
                          <div 
                            key={type.id}
                            className={`px-3 py-2 rounded-lg cursor-pointer ${
                              onboardData.equipment.some(eq => eq.equipment_type === type.name)
                                ? 'bg-green-600 text-white'
                                : isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            onClick={() => handleToggleEquipment(type.name)}
                          >
                            {type.name}
                          </div>
                        ))}
                      </div>
                      
                      {onboardData.equipment.length > 0 && (
                        <div className={`p-3 rounded-lg overflow-hidden ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                          <h4 className="font-medium mb-2">Selected Equipment:</h4>
                          <div className="space-y-2">
                            {onboardData.equipment.map((eq, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <span className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{eq.equipment_type}</span>
                                  {eq.description && (
                                    <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                      ({eq.description})
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleRemoveEquipment(index)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <FaTimesCircle />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {onboardData.equipment.length > 0 && (
                        <div className="mt-4">
                          <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            Additional Notes for Selected Equipment
                          </label>
                          <textarea
                            value={equipmentNotes}
                            onChange={(e) => setEquipmentNotes(e.target.value)}
                            placeholder="Any special requirements or configurations..."
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                              isDark 
                                ? 'bg-slate-700/80 border-slate-600 text-white' 
                                : 'bg-white/80 border-gray-300 text-gray-800'
                            }`}
                            rows={3}
                          ></textarea>
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={handleUpdateEquipmentNotes}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Update Notes
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Required Documents
                  </h3>
                  {documentTypes.length === 0 ? (
                    <div className={`text-center py-4 ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'} rounded-lg mb-4`}>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading document types...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {documentTypes.map(type => (
                          <div 
                            key={type.id}
                            className={`px-3 py-2 rounded-lg cursor-pointer flex items-center ${
                              onboardData.documents.some(doc => doc.document_type === type.name)
                                ? 'bg-green-600 text-white'
                                : isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            onClick={() => handleToggleDocument(type.name, type.days_to_submit)}
                          >
                            <FaPaperclip className="mr-1" />
                            {type.name}
                            {type.required && <span className="ml-1 text-red-500">*</span>}
                          </div>
                        ))}
                      </div>
                      
                      {onboardData.documents.length > 0 && (
                        <div className={`p-3 rounded-lg overflow-hidden ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                          <h4 className="font-medium mb-2">Selected Documents:</h4>
                          <div className="space-y-2">
                            {onboardData.documents.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <span className={`${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    {doc.document_type}
                                    {doc.required && <span className="text-red-500 ml-1">*</span>}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleRemoveDocument(index)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <FaTimesCircle />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {/* Training Tab */}
              {activeTab === 'training' && (
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Training Schedule
                  </h3>
                  {trainingTypes.length === 0 ? (
                    <div className={`text-center py-4 ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'} rounded-lg mb-4`}>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading training types...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {trainingTypes.map(type => (
                          <div 
                            key={type.id}
                            className={`px-3 py-2 rounded-lg cursor-pointer ${
                              onboardData.trainingSchedule.some(tr => tr.training_type === type.name)
                                ? 'bg-green-600 text-white'
                                : isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            onClick={() => handleToggleTraining(type.name)}
                          >
                            {type.name}
                          </div>
                        ))}
                      </div>
                      
                      {onboardData.trainingSchedule.length > 0 && (
                        <div className={`p-3 rounded-lg overflow-hidden ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                          <h4 className="font-medium mb-2">Selected Training:</h4>
                          <div className="space-y-2">
                            {onboardData.trainingSchedule.map((training, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className={`${isDark ? 'text-white' : 'text-gray-800'}`}>
                                  {training.training_type}
                                </span>
                                <button
                                  onClick={() => handleRemoveTraining(index)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <FaTimesCircle />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Training Schedule Fields */}
                      {selectedTraining && (
                        <div className="mt-4 p-3 rounded-lg border border-green-500">
                          <h4 className="font-medium mb-2">Schedule "{selectedTraining.training_type}" Training</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Trainer
                              </label>
                              <input
                                type="text"
                                value={selectedTraining.trainer || ''}
                                onChange={(e) => setSelectedTraining({...selectedTraining, trainer: e.target.value})}
                                className={`w-full px-3 py-2 text-sm border rounded-lg ${
                                  isDark 
                                    ? 'bg-slate-700/80 border-slate-600 text-white' 
                                    : 'bg-white/80 border-gray-300 text-gray-800'
                                }`}
                              />
                            </div>
                            <div>
                              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Location
                              </label>
                              <input
                                type="text"
                                value={selectedTraining.location || ''}
                                onChange={(e) => setSelectedTraining({...selectedTraining, location: e.target.value})}
                                className={`w-full px-3 py-2 text-sm border rounded-lg ${
                                  isDark 
                                    ? 'bg-slate-700/80 border-slate-600 text-white' 
                                    : 'bg-white/80 border-gray-300 text-gray-800'
                                }`}
                              />
                            </div>
                            <div>
                              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Date
                              </label>
                              <input
                                type="date"
                                value={selectedTraining.scheduled_date || ''}
                                onChange={(e) => setSelectedTraining({...selectedTraining, scheduled_date: e.target.value})}
                                className={`w-full px-3 py-2 text-sm border rounded-lg ${
                                  isDark 
                                    ? 'bg-slate-700/80 border-slate-600 text-white' 
                                    : 'bg-white/80 border-gray-300 text-gray-800'
                                }`}
                              />
                            </div>
                            <div>
                              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Time
                              </label>
                              <input
                                type="time"
                                value={selectedTraining.scheduled_time || ''}
                                onChange={(e) => setSelectedTraining({...selectedTraining, scheduled_time: e.target.value})}
                                className={`w-full px-3 py-2 text-sm border rounded-lg ${
                                  isDark 
                                    ? 'bg-slate-700/80 border-slate-600 text-white' 
                                    : 'bg-white/80 border-gray-300 text-gray-800'
                                }`}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end mt-3">
                            <button
                              onClick={handleUpdateTrainingDetails}
                              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                            >
                              Update Training Details
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Progress indicator */}
            <div className="flex justify-between items-center my-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${onboardingProgress}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm">{onboardingProgress}%</span>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-between mt-4">
              <div>
                {activeTab !== 'details' && (
                  <button 
                    onClick={handlePreviousTab}
                    className={`px-4 py-2 rounded-lg ${
                      isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                )}
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={handleOnboardModalClose} 
                  className={`px-4 py-2 rounded-lg ${
                    isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  disabled={loading}
                >
                  Cancel
                </button>
                {activeTab !== 'training' ? (
                  <button 
                    onClick={handleNextTab}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : (
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
                    ) : "Complete Onboarding"}
                  </button>
                )}
              </div>
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