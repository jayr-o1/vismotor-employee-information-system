import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaStickyNote, 
  FaUserPlus, 
  FaTimesCircle, 
  FaPaperclip, 
  FaStar, 
  FaCalendarAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaMoneyBillWave,
  FaHistory,
  FaUserTie,
  FaFileAlt,
  FaTasks,
  FaClock
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import apiService from "../services/api";
import { ThemeContext } from "../ThemeContext";
import Swal from 'sweetalert2';
import 'animate.css';
import NoDataFound from "../components/NoDataFound";

const ApplicantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
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
    // Check if token exists first
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      setError("Authentication required. Please log in to view applicant details.");
      setLoading(false);
      return;
    }
    
    fetchApplicantDetails();
  }, [id]);

  const fetchApplicantDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch applicant details from the API
      const applicantResponse = await apiService.applicants.getById(id);
      
      if (!applicantResponse || !applicantResponse.data) {
        console.error("No data returned from API or malformed response:", applicantResponse);
        throw new Error("Applicant data not found or API returned invalid response");
      }
      
      // Check if we have a noDataFound indicator
      if (applicantResponse.data.noDataFound) {
        setApplicant({ noDataFound: true, id: id });
        setLoading(false);
        return;
      }
      
      // Check if we received proper data with expected fields
      const applicantData = applicantResponse.data.data || applicantResponse.data; 
      
      if (!applicantData.id) {
        console.warn("Applicant data missing ID field:", applicantData);
      }
      
      // Let's create a default placeholder if data is incomplete
      const processedData = {
        id: applicantData.id || id,
        first_name: applicantData.first_name || "Unknown",
        last_name: applicantData.last_name || "Applicant",
        email: applicantData.email || "",
        phone: applicantData.phone || "",
        position: applicantData.position || "Position not specified",
        status: applicantData.status || "Pending",
        interviews: applicantData.interviews || [],
        ...applicantData  // Include any other fields from the original data
      };
      
      setApplicant(processedData);
      
      // Then try to get notes, but don't let it block the main applicant data
      try {
        // Get feedback instead of notes - notes endpoint doesn't exist
        const feedbackResponse = await apiService.applicants.getFeedback(id);
        setNotes(feedbackResponse.data || []);
      } catch (notesError) {
        console.error("Error fetching applicant feedback:", notesError);
        // Don't show toast error for notes - just set empty array
        setNotes([]);
      }
      
      // Fetch interview history using the API service
      try {
        const interviewsResponse = await apiService.applicants.getInterviews(id);
        
        // Update applicant with interviews data
        if (interviewsResponse && interviewsResponse.data) {
          setApplicant(prev => ({
            ...prev,
            interviews: interviewsResponse.data || []
          }));
        } else {
          console.warn("No interview data available or mock data returned");
        }
      } catch (interviewsError) {
        console.error("Error fetching interview history:", interviewsError);
        // Set empty interviews array on error
        setApplicant(prev => ({
          ...prev,
          interviews: []
        }));
      }
    } catch (error) {
      console.error("Error fetching applicant details:", error);
      console.error("Error response:", error.response);
      
      // Provide more detailed error message
      const errorMessage = error.response?.data?.message || error.message || "Failed to load applicant details";
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Create a placeholder applicant with minimal data so the UI doesn't break
      setApplicant({
        id: id,
        first_name: "Data",
        last_name: "Unavailable",
        status: "Unknown",
        position: "Could not retrieve applicant data",
        interviews: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackData.text.trim()) {
      toast.error("Please enter note text");
      return;
    }
    
    try {
      // Send feedback to API
      const response = await apiService.applicants.addFeedback(applicant.id, {
        feedback_text: feedbackData.text,
        created_by: "Current User"
      });
      
      // Get the new feedback data from the response
      const newFeedback = response.data;
      
      // Create a default feedback object if response doesn't contain proper data
      const feedbackToAdd = newFeedback && newFeedback.id ? newFeedback : {
        id: Date.now(),
        feedback_text: feedbackData.text,
        created_by: "Current User",
        created_at: new Date().toISOString()
      };
      
      // Update local state with new feedback
      setNotes(prevNotes => [...prevNotes, feedbackToAdd]);
      
      // Reset feedback form
      setFeedbackData({
        text: "",
        rating: 0
      });
      
      setFeedbackModalOpen(false);
      toast.success("Note added successfully");
      
      // Optionally refresh all feedback
      try {
        const feedbackResponse = await apiService.applicants.getFeedback(applicant.id);
        if (feedbackResponse && feedbackResponse.data) {
          setNotes(feedbackResponse.data);
        }
      } catch (refreshError) {
        console.error("Error refreshing feedback:", refreshError);
        // Not critical, we already added the note to the UI
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error(error.response?.data?.message || "Failed to add note. Please try again.");
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

    // Skip the modal and directly hire the applicant
    handleOnboardApplicant();
  };

  const handleOnboardApplicant = async () => {
    if (!applicant) {
      toast.error("No applicant selected for onboarding");
      return;
    }
    
    if (applicant.status !== "Interviewed" && applicant.status !== "Reviewed") {
      toast.error("Applicant must be interviewed before onboarding");
      return;
    }
    
    // Create the employee record
    try {
      setLoading(true);
      
      // Initialize onboardData with the applicant's information
      const position = applicant.position || "";
      const department = applicant.branch_department || "";
      const salary = applicant.desired_pay || "0";
      const startDate = new Date().toISOString().split('T')[0]; // Today's date
      
      // Format the employee data - no validation needed since we're providing default values
      const employeeData = {
        applicant_id: applicant.id,
        position: position,
        department: department,
        hire_date: startDate,
        salary: salary,
        mentor: ""
      };
      
      // Create the employee
      const response = await apiService.employees.create(employeeData);
      
      // If successful, save the equipment, documents, and training data
      if (response.data && response.data.id) {
        const employeeId = response.data.id;
        
        // Save equipment if any
        if (onboardData.equipment.length > 0) {
          try {
            await apiService.employees.saveEquipment(employeeId, onboardData.equipment);
          } catch (equipmentError) {
            console.error("Error saving equipment:", equipmentError);
          }
        }
        
        // Save documents if any
        if (onboardData.documents.length > 0) {
          try {
            await apiService.employees.saveDocuments(employeeId, onboardData.documents);
          } catch (documentsError) {
            console.error("Error saving documents:", documentsError);
          }
        }
        
        // Save training schedule if any
        if (onboardData.trainingSchedule.length > 0) {
          try {
            await apiService.employees.saveTraining(employeeId, onboardData.trainingSchedule);
          } catch (trainingError) {
            console.error("Error saving training schedule:", trainingError);
          }
        }
        
        // Show success message
        toast.success("Applicant successfully onboarded as an employee");
        
        // Navigate to the new employee's onboarding detail page
        navigate(`/onboarding/${employeeId}`);
      }
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
      // Get user confirmation before rejecting
      const result = await Swal.fire({
        title: 'Reject Applicant',
        html: `Are you sure you want to reject <strong>${applicant.first_name} ${applicant.last_name}</strong>?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, Reject',
        cancelButtonText: 'Cancel'
      });
      
      if (!result.isConfirmed) {
        return;
      }
    
      // Use the PATCH method to update status
      await apiService.applicants.updateStatus(applicant.id, "Rejected");
      
      // Try to add a note about the rejection
      try {
        const feedbackPayload = {
          feedback_text: `Applicant was rejected on ${new Date().toLocaleDateString()}.`,
          created_by: "Current User"
        };
        
        await apiService.applicants.addFeedback(applicant.id, feedbackPayload);
      } catch (error) {
        // Non-critical error, we can continue
      }
      
      toast.success("Applicant marked as rejected");
      
      // Update local state
      setApplicant(prev => ({ ...prev, status: "Rejected" }));
      
      // Refresh the applicant data
      fetchApplicantDetails();
      
    } catch (error) {
      console.error("Error rejecting applicant:", error);
      toast.error(error.response?.data?.message || "Failed to reject applicant");
    }
  };

  // Handle hiring directly from interview history
  const handleHireFromInterview = async (interview) => {
    if (!applicant) return;
    
    try {
      // Mark the applicant as interviewed if not already
      if (applicant.status !== "Interviewed" && applicant.status !== "Reviewed") {
        await apiService.applicants.updateStatus(applicant.id, "Interviewed");
        
        // Update local state
        setApplicant(prev => ({ ...prev, status: "Interviewed" }));
      }
      
      // Now proceed with the onboarding process
      handleOnboardApplicant();
    } catch (error) {
      console.error("Error updating applicant status:", error);
      toast.error(error.response?.data?.message || "Failed to update applicant status");
    }
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
        status: "Interviewed" // The backend updates this automatically
      }));
      
      // Refresh the applicant data to ensure it's consistent with the database
      try {
        const applicantResponse = await apiService.applicants.getById(applicant.id);
        if (applicantResponse.data) {
          setApplicant(prev => ({
            ...prev,
            ...applicantResponse.data,
            interviews: updatedInterviews // Keep our updated interviews
          }));
        }
      } catch (refreshError) {
        // Non-critical error, we can continue
      }
      
      toast.success("Interview marked as completed");
      
      // Ask if the user wants to proceed with hiring
      const result = await Swal.fire({
        title: 'Interview Completed',
        html: `The interview with <strong>${applicant.first_name} ${applicant.last_name}</strong> is now marked as completed. Would you like to proceed with the hiring process?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, Hire Now',
        cancelButtonText: 'Not Yet'
      });
      
      if (result.isConfirmed) {
        // Call handleOnboardApplicant directly
        handleOnboardApplicant();
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
      const response = await apiService.applicants.scheduleInterview(applicant.id, {
        interview_date: interviewData.date,
        interview_time: interviewData.time,
        location: interviewData.location,
        interviewer: interviewData.interviewer
      });
      
      // Update local state with new status
      setApplicant(prev => ({ 
        ...prev, 
        status: "Scheduled",
        interview_scheduled: true 
      }));
      
      // Add the new interview to the local list
      let newInterview = response.data;
      
      // If we didn't get a properly formatted interview object in the response,
      // create one with the data we have
      if (!newInterview || !newInterview.id) {
        newInterview = {
          id: Date.now(), // Use timestamp as ID
          applicant_id: applicant.id,
          interview_date: interviewData.date,
          interview_time: interviewData.time,
          location: interviewData.location,
          interviewer: interviewData.interviewer,
          status: "Scheduled",
          created_at: new Date().toISOString()
        };
      }
      
      // Update the interviews array with the new interview
      const updatedInterviews = applicant.interviews ? [...applicant.interviews, newInterview] : [newInterview];
      setApplicant(prev => ({
        ...prev,
        interviews: updatedInterviews
      }));
      
      // Add a note about the interview scheduling
      try {
        const feedbackPayload = {
          feedback_text: `Interview scheduled on ${interviewData.date} at ${interviewData.time} with ${interviewData.interviewer} at ${interviewData.location}`,
          created_by: "Current User"
        };
        
        await apiService.applicants.addFeedback(applicant.id, feedbackPayload);
        
        // Refresh feedback/notes
        try {
          const feedbackResponse = await apiService.applicants.getFeedback(applicant.id);
          setNotes(feedbackResponse.data || []);
        } catch (error) {
          // Non-critical error
        }
      } catch (error) {
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
      toast.error(error.response?.data?.message || "Failed to schedule interview. Please try again.");
    }
  };

  // Calculate onboarding progress
  useEffect(() => {
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
  }, [onboardData]);

  // Load equipment, document, and training types on component mount
  useEffect(() => {
    // Only fetch these if we have a token and the applicant is loaded
    if (localStorage.getItem('userToken') && !loading && applicant && applicant.id) {
      fetchEquipmentTypes();
      fetchDocumentTypes();
      fetchTrainingTypes();
    }
  }, [loading, applicant]);

  // Fetch equipment types
  const fetchEquipmentTypes = async () => {
    try {
      const response = await apiService.employees.getEquipmentTypes();
      if (response && response.data && Array.isArray(response.data)) {
        setEquipmentTypes(response.data);
      } else {
        // Set some default equipment types if the API fails
        setEquipmentTypes([
          { id: 1, name: "Laptop", description: "Standard work laptop" },
          { id: 2, name: "Desktop", description: "Office desktop computer" },
          { id: 3, name: "Phone", description: "Company mobile phone" },
          { id: 4, name: "Monitor", description: "Computer monitor" },
          { id: 5, name: "Headset", description: "Audio headset for calls" }
        ]);
      }
    } catch (error) {
      console.error("Error fetching equipment types:", error);
      // Set default values on error
      setEquipmentTypes([
        { id: 1, name: "Laptop", description: "Standard work laptop" },
        { id: 2, name: "Desktop", description: "Office desktop computer" },
        { id: 3, name: "Phone", description: "Company mobile phone" },
        { id: 4, name: "Monitor", description: "Computer monitor" },
        { id: 5, name: "Headset", description: "Audio headset for calls" }
      ]);
    }
  };

  // Fetch document types
  const fetchDocumentTypes = async () => {
    try {
      const response = await apiService.employees.getDocumentTypes();
      if (response && response.data && Array.isArray(response.data)) {
        setDocumentTypes(response.data);
      } else {
        // Set some default document types if the API fails
        setDocumentTypes([
          { id: 1, name: "ID Card", required: true },
          { id: 2, name: "Resume/CV", required: true },
          { id: 3, name: "Educational Certificate", required: true },
          { id: 4, name: "Work Experience Letter", required: false },
          { id: 5, name: "Tax Documents", required: true }
        ]);
      }
    } catch (error) {
      console.error("Error fetching document types:", error);
      // Set default values on error
      setDocumentTypes([
        { id: 1, name: "ID Card", required: true },
        { id: 2, name: "Resume/CV", required: true },
        { id: 3, name: "Educational Certificate", required: true },
        { id: 4, name: "Work Experience Letter", required: false },
        { id: 5, name: "Tax Documents", required: true }
      ]);
    }
  };

  // Fetch training types
  const fetchTrainingTypes = async () => {
    try {
      const response = await apiService.employees.getTrainingTypes();
      if (response && response.data && Array.isArray(response.data)) {
        setTrainingTypes(response.data);
      } else {
        // Set some default training types if the API fails
        setTrainingTypes([
          { id: 1, name: "Orientation", description: "New employee orientation" },
          { id: 2, name: "Software Training", description: "Training on company software" },
          { id: 3, name: "Security Protocols", description: "Information security training" },
          { id: 4, name: "HR Policies", description: "Human resources policy training" },
          { id: 5, name: "Job-specific Training", description: "Role-specific training" }
        ]);
      }
    } catch (error) {
      console.error("Error fetching training types:", error);
      // Set default values on error
      setTrainingTypes([
        { id: 1, name: "Orientation", description: "New employee orientation" },
        { id: 2, name: "Software Training", description: "Training on company software" },
        { id: 3, name: "Security Protocols", description: "Information security training" },
        { id: 4, name: "HR Policies", description: "Human resources policy training" },
        { id: 5, name: "Job-specific Training", description: "Role-specific training" }
      ]);
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

  // Main UI
  return (
    <div className={`w-full min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {/* Header section with back button and actions */}
      <div className={`w-full ${isDark ? 'bg-[#1a2234] border-b border-slate-700' : 'bg-white border-b'} sticky top-0 z-10 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/applicants')}
            className={`flex items-center ${
              isDark ? 'text-white hover:text-green-400' : 'text-gray-700 hover:text-green-600'
            } transition-colors duration-200`}
          >
            <FaArrowLeft className="mr-2" />
            <span>Back to Applicants</span>
          </button>
          
          <div className="flex space-x-3">
            {applicant && applicant.status !== 'Rejected' && (
              <button
                onClick={handleRejectApplicant}
                className={`px-4 py-2 flex items-center rounded-lg text-sm font-medium
                ${isDark ? 'bg-red-900 hover:bg-red-800 text-white' : 'bg-red-50 hover:bg-red-100 text-red-700'}`}
              >
                <FaTimesCircle className="mr-2" />
                Reject
              </button>
            )}
            
            {applicant && applicant.status !== 'Hired' && (
              <button
                onClick={handleOpenOnboardModal}
                className={`px-4 py-2 flex items-center rounded-lg text-sm font-medium
                ${isDark ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
              >
                <FaUserPlus className="mr-2" />
                Hire
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      {loading ? (
        <div className="w-full h-96 flex items-center justify-center">
          <div className="loader-spinner" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className={`max-w-7xl mx-auto my-8 p-4 rounded-lg ${isDark ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'}`}>
          <p className="text-center">{error}</p>
        </div>
      ) : applicant && applicant.noDataFound ? (
        <NoDataFound message="Applicant not found" />
      ) : (
        <div className="max-w-7xl mx-auto py-6 px-4">
          {/* Tabbed Content */}
          <div className={`rounded-xl overflow-hidden shadow-lg ${isDark ? 'bg-[#1a2234] border border-slate-700' : 'bg-white'}`}>
            {/* Tab Navigation */}
            <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button 
                onClick={() => setActiveTab('details')}
                className={`px-4 py-3 text-sm font-medium flex items-center ${
                  activeTab === 'details' 
                    ? isDark 
                      ? 'text-blue-400 border-b-2 border-blue-400' 
                      : 'text-blue-600 border-b-2 border-blue-600'
                    : isDark 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaUserTie className="mr-2" />
                Applicant Details
              </button>
              <button 
                onClick={() => setActiveTab('interviews')}
                className={`px-4 py-3 text-sm font-medium flex items-center ${
                  activeTab === 'interviews' 
                    ? isDark 
                      ? 'text-blue-400 border-b-2 border-blue-400' 
                      : 'text-blue-600 border-b-2 border-blue-600'
                    : isDark 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaHistory className="mr-2" />
                Interview History
              </button>
              <button 
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-3 text-sm font-medium flex items-center ${
                  activeTab === 'notes' 
                    ? isDark 
                      ? 'text-blue-400 border-b-2 border-blue-400' 
                      : 'text-blue-600 border-b-2 border-blue-600'
                    : isDark 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaFileAlt className="mr-2" />
                Notes
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Applicant Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Gender</h4>
                      <p className={`mt-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {applicant?.gender || 'N/A'}
                        {applicant?.other_gender && ` (${applicant.other_gender})`}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Age</h4>
                      <p className={`mt-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{applicant?.age || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Marital Status</h4>
                      <p className={`mt-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {applicant?.marital_status || 'N/A'}
                        {applicant?.other_marital_status && ` (${applicant.other_marital_status})`}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Address</h4>
                      <p className={`mt-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {applicant?.street_address || applicant?.address || 'N/A'}
                        {applicant?.barangay && `, ${applicant.barangay}`}
                        {applicant?.city && `, ${applicant.city}`}
                        {applicant?.province && `, ${applicant.province}`}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Previously Employed</h4>
                      <p className={`mt-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{applicant?.previously_employed || 'No'}</p>
                    </div>
                    
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Date Available</h4>
                      <p className={`mt-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {applicant?.date_availability || 'Immediately'}
                        {applicant?.other_date_availability && ` (${applicant.other_date_availability})`}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`w-full h-px my-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Qualifications</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center">
                          <FaGraduationCap className="mr-2" />
                          Education
                        </div>
                      </h4>
                      <p className={`mt-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {applicant?.highest_education || 'N/A'}
                        {applicant?.other_highest_education && ` (${applicant.other_highest_education})`}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center">
                          <FaBriefcase className="mr-2" />
                          Experience
                        </div>
                      </h4>
                      <p className={`mt-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{applicant?.experience || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center">
                          <FaTasks className="mr-2" />
                          Skills
                        </div>
                      </h4>
                      <p className={`mt-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{applicant?.skills || 'N/A'}</p>
                    </div>
                    
                    <div className="md:col-span-2 lg:col-span-3">
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Documents</h4>
                      <div className="mt-2 flex flex-wrap gap-3">
                        {applicant?.resume_url ? (
                          <a 
                            href={applicant.resume_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`px-4 py-2 rounded-lg text-sm flex items-center ${
                              isDark ? 'bg-gray-800 hover:bg-gray-700 text-blue-400' : 'bg-gray-100 hover:bg-gray-200 text-blue-600'
                            }`}
                          >
                            <FaPaperclip className="mr-2" />
                            View Resume
                          </a>
                        ) : (
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No resume uploaded</span>
                        )}
                        
                        {applicant?.house_sketch_url && (
                          <a 
                            href={applicant.house_sketch_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`px-4 py-2 rounded-lg text-sm flex items-center ${
                              isDark ? 'bg-gray-800 hover:bg-gray-700 text-blue-400' : 'bg-gray-100 hover:bg-gray-200 text-blue-600'
                            }`}
                          >
                            <FaPaperclip className="mr-2" />
                            View House Sketch
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Interview History Tab */}
              {activeTab === 'interviews' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Interview History</h3>
                    <button
                      onClick={() => setScheduleModalOpen(true)}
                      className={`flex items-center px-3 py-1 rounded text-sm ${
                        isDark ? 'bg-blue-800 hover:bg-blue-700 text-white' : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                      }`}
                    >
                      <FaCalendarAlt className="mr-1 text-xs" />
                      Schedule
                    </button>
                  </div>
                  
                  {applicant?.interviews && applicant.interviews.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
                          <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Date</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Time</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Location</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Interviewer</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                          </tr>
                        </thead>
                        <tbody className={`${isDark ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}`}>
                          {applicant.interviews.map((interview, index) => (
                            <tr key={interview.id || index} className={isDark ? 'bg-gray-800/40 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{interview.interview_date}</td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{interview.interview_time}</td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{interview.location}</td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{interview.interviewer}</td>
                              <td className={`px-6 py-4 whitespace-nowrap`}>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  interview.status === 'Scheduled' 
                                    ? isDark ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                                    : interview.status === 'Completed'
                                    ? isDark ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'
                                    : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {interview.status || 'Scheduled'}
                                </span>
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium`}>
                                {interview.status !== 'Completed' ? (
                                  <button
                                    onClick={() => handleMarkInterviewCompleted(interview)}
                                    className={`text-xs ${isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'} mr-4`}
                                  >
                                    Mark Completed
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleHireFromInterview(interview)}
                                    className={`text-xs ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                                  >
                                    Proceed to Hire
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={`py-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <p>No interviews scheduled yet.</p>
                      <button
                        onClick={() => setScheduleModalOpen(true)}
                        className={`mt-4 flex items-center px-4 py-2 mx-auto rounded-lg text-sm ${
                          isDark ? 'bg-blue-800 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <FaCalendarAlt className="mr-2" />
                        Schedule Interview
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Feedback & Notes</h3>
                    <button
                      onClick={() => setFeedbackModalOpen(true)}
                      className={`flex items-center px-3 py-1 rounded text-sm ${
                        isDark ? 'bg-purple-800 hover:bg-purple-700 text-white' : 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                      }`}
                    >
                      <FaStickyNote className="mr-1 text-xs" />
                      Add Note
                    </button>
                  </div>
                  
                  {notes && notes.length > 0 ? (
                    <div className="space-y-4">
                      {notes.map((note, index) => (
                        <div
                          key={note.id || index}
                          className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/60' : 'bg-gray-50'}`}
                        >
                          <div className="flex justify-between mb-2">
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>{note.created_by || 'User'}</span>
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {note.created_at ? new Date(note.created_at).toLocaleString() : 'Date not available'}
                            </span>
                          </div>
                          <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {note.feedback_text || note.text || 'No content'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`py-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <p>No notes added yet.</p>
                      <button
                        onClick={() => setFeedbackModalOpen(true)}
                        className={`mt-4 flex items-center px-4 py-2 mx-auto rounded-lg text-sm ${
                          isDark ? 'bg-purple-800 hover:bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        <FaStickyNote className="mr-2" />
                        Add First Note
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Add Note Modal */}
          {feedbackModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate__animated animate__fadeIn">
              <div 
                className={`w-full max-w-lg rounded-xl shadow-xl p-6 relative animate__animated animate__fadeInUp ${
                  isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
                }`}
              >
                <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Add Note</h3>
                
                <div className="mb-4">
                  <textarea
                    value={feedbackData.text}
                    onChange={(e) => setFeedbackData({...feedbackData, text: e.target.value})}
                    placeholder="Enter your note here..."
                    className={`w-full px-3 py-2 rounded-lg shadow-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark 
                        ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                        : 'bg-white text-gray-800 border-gray-300 placeholder-gray-500'
                    }`}
                    rows={5}
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setFeedbackModalOpen(false)}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitFeedback}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      isDark 
                        ? 'bg-blue-700 hover:bg-blue-600' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Schedule Interview Modal */}
          {scheduleModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate__animated animate__fadeIn">
              <div 
                className={`w-full max-w-lg rounded-xl shadow-xl p-6 relative animate__animated animate__fadeInUp ${
                  isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
                }`}
              >
                <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-500" />
                    Schedule Interview
                  </div>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block mb-1 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Date *
                    </label>
                    <input
                      type="date"
                      value={interviewData.date}
                      onChange={(e) => setInterviewData({...interviewData, date: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg shadow-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-white text-gray-800 border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block mb-1 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Time *
                    </label>
                    <input
                      type="time"
                      value={interviewData.time}
                      onChange={(e) => setInterviewData({...interviewData, time: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg shadow-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-white text-gray-800 border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block mb-1 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Location *
                    </label>
                    <input
                      type="text"
                      value={interviewData.location}
                      onChange={(e) => setInterviewData({...interviewData, location: e.target.value})}
                      placeholder="Interview location"
                      className={`w-full px-3 py-2 rounded-lg shadow-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark 
                          ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                          : 'bg-white text-gray-800 border-gray-300 placeholder-gray-500'
                      }`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block mb-1 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Interviewer *
                    </label>
                    <input
                      type="text"
                      value={interviewData.interviewer}
                      onChange={(e) => setInterviewData({...interviewData, interviewer: e.target.value})}
                      placeholder="Interviewer name"
                      className={`w-full px-3 py-2 rounded-lg shadow-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark 
                          ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                          : 'bg-white text-gray-800 border-gray-300 placeholder-gray-500'
                      }`}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setScheduleModalOpen(false)}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleScheduleInterview}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      isDark 
                        ? 'bg-blue-700 hover:bg-blue-600' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    Schedule Interview
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <ToastContainer position="top-right" theme={isDark ? "dark" : "light"} />
    </div>
  );
};

export default ApplicantDetails;