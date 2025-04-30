import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt, FaStickyNote, FaUserPlus, FaTimesCircle } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import apiService from "../services/api";
import { ThemeContext } from "../ThemeContext";

const ApplicantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [interviewData, setInterviewData] = useState({
    date: "",
    time: "",
    location: "",
    interviewer: ""
  });
  const [feedbackData, setFeedbackData] = useState("");
  const [notes, setNotes] = useState([]);
  const [onboardData, setOnboardData] = useState({
    position: "",
    department: "",
    startDate: "",
    salary: ""
  });

  useEffect(() => {
    fetchApplicantDetails();
  }, [id]);

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
    } catch (error) {
      console.error("Error fetching applicant details:", error);
      console.error("Error response:", error.response);
      setError(error.response?.data?.message || "Failed to load applicant details");
      toast.error(error.response?.data?.message || "Failed to load applicant details");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async () => {
    // Validate form data
    if (!interviewData.date || !interviewData.time || !interviewData.location || !interviewData.interviewer) {
      toast.error("Please fill all interview details");
      return;
    }

    try {
      // Create interview record
      await apiService.interviews.schedule({
        applicant_id: applicant.id,
        date: interviewData.date,
        time: interviewData.time,
        location: interviewData.location,
        interviewer: interviewData.interviewer
      });

      // Update applicant status to 'Interviewed'
      await apiService.applicants.updateStatus(applicant.id, "Interviewed");
      
      toast.success("Interview scheduled successfully!");
      
      // Update local state
      setApplicant(prev => ({ ...prev, status: "Interviewed" }));
      
      // Close modal
      setScheduleModalOpen(false);
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast.error(error.response?.data?.message || "Failed to schedule interview");
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackData.trim()) {
      toast.error("Please enter some feedback");
      return;
    }

    try {
      await apiService.applicants.addNote(applicant.id, { feedback_text: feedbackData });
      
      // Refresh notes
      const notesResponse = await apiService.applicants.getNotes(applicant.id);
      setNotes(notesResponse.data || []);
      
      toast.success("Note added successfully!");
      
      setFeedbackData("");
      setFeedbackModalOpen(false);
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error(error.response?.data?.message || "Failed to add note");
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
      salary: ""
    });
    setOnboardModalOpen(true);
  };

  const handleOnboardApplicant = async () => {
    // Validate applicant
    if (!applicant) {
      toast.error("No applicant selected for onboarding.");
      return;
    }
    
    // Verify the applicant has been interviewed
    if (applicant.status !== 'Interviewed' && applicant.status !== 'Reviewed') {
      toast.error("Applicant must be interviewed before onboarding.");
      setOnboardModalOpen(false);
      return;
    }
    
    // Validate onboard form data
    if (!onboardData.department || !onboardData.startDate || !onboardData.salary || !onboardData.position) {
      toast.error("Please fill all onboarding details (Position, Department, Start Date, Salary)");
      return;
    }

    // Validate salary is a number
    const salary = parseFloat(onboardData.salary);
    if (isNaN(salary)) {
      toast.error("Salary must be a valid number");
      return;
    }
    
    setLoading(true);
    try {
      // 1. Create employee record
      await apiService.employees.create({
        applicant_id: applicant.id,
        name: applicant.name,
        email: applicant.email,
        phone: applicant.phone || '',
        position: onboardData.position,
        department: onboardData.department,
        hire_date: onboardData.startDate,
        salary: salary
      });

      // 2. Update applicant status to 'Hired'
      await apiService.applicants.updateStatus(applicant.id, "Hired");
      
      toast.success(`${applicant.name} successfully onboarded!`);
      
      // Update local state
      setApplicant(prev => ({ ...prev, status: "Hired" }));
      
      // Close the modal and clear form
      setOnboardModalOpen(false);
      setOnboardData({ position: "", department: "", startDate: "", salary: "" });
      
    } catch (error) {
      console.error("Error onboarding applicant:", error);
      let errorMessage = "Failed to onboard applicant. Please try again.";
      
      // Check for specific error messages from the backend if available
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
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
                <h1 className={`text-2xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{applicant.name}</h1>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{applicant.position}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                applicant.status === "Pending" 
                  ? isDark ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800" 
                  : applicant.status === "Reviewed" 
                  ? isDark ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800" 
                  : applicant.status === "Interviewed" 
                  ? isDark ? "bg-purple-900 text-purple-200" : "bg-purple-100 text-purple-800"
                  : applicant.status === "Hired" || applicant.status === "Accepted"
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
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{applicant.applied_date}</p>
                </div>
              </div>
              
              {/* Right Column */}
              <div>
                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Education</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{applicant.education}</p>
                </div>
                
                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Experience</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{applicant.experience}</p>
                </div>
                
                <div className="mb-6">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Skills</p>
                  <p className={`font-medium whitespace-pre-line ${isDark ? 'text-white' : 'text-gray-800'}`}>{applicant.skills}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Interview button - show only if not hired/rejected */}
            {applicant.status !== "Hired" && applicant.status !== "Rejected" && (
              <button
                onClick={() => setScheduleModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaCalendarAlt className="mr-2" />
                Schedule Interview
              </button>
            )}
            
            {/* Note button - always available */}
            <button
              onClick={() => setFeedbackModalOpen(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FaStickyNote className="mr-2" />
              Add Note
            </button>
            
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
            {applicant.status !== "Hired" && applicant.status !== "Rejected" && (
              <button
                onClick={handleRejectApplicant}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaTimesCircle className="mr-2" />
                Reject Applicant
              </button>
            )}
          </div>

          {/* Notes Section */}
          <div className={`${isDark ? 'bg-[#232f46] border border-slate-700' : 'bg-white border border-gray-200'} rounded-lg shadow-md p-6 mb-6`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Notes & Feedback</h2>
            {notes && notes.length > 0 ? (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'} border p-4 rounded-lg`}>
                    <div className="flex justify-between mb-2">
                      <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{note.created_by}</span>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(note.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{note.feedback_text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No notes or feedback yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-[#232f46] text-white' : 'bg-white text-gray-800'} rounded-lg shadow-lg p-6 max-w-md w-full`}>
            <h3 className="text-xl font-semibold mb-4">Schedule Interview</h3>
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
                  placeholder="e.g. Office Room 3, Zoom, etc."
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

      {/* Add Note Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-[#232f46] text-white' : 'bg-white text-gray-800'} rounded-lg shadow-lg p-6 max-w-md w-full`}>
            <h3 className="text-xl font-semibold mb-4">Add Note</h3>
            <div>
              <textarea
                value={feedbackData}
                onChange={(e) => setFeedbackData(e.target.value)}
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
            <h2 className="text-2xl font-semibold mb-4">Onboard {applicant.name}</h2>
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
                onClick={() => setOnboardModalOpen(false)} 
                className={`px-4 py-2 rounded-lg ${
                  isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={handleOnboardApplicant} 
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Process Onboarding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantDetails; 