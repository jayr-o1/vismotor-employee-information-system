import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt, FaStickyNote } from "react-icons/fa";
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
  const [interviewData, setInterviewData] = useState({
    date: "",
    type: "video", // Default to video interview
    interviewer: "", // Changed from notes to interviewer
    location: "" // Add location field which seems to be required
  });
  const [feedbackData, setFeedbackData] = useState("");
  const [interviews, setInterviews] = useState([]); // Changed from notes to interviews

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
      
      // Then try to get interviews history using the correct API method
      try {
        const interviewsResponse = await apiService.applicants.getInterviews(id);
        console.log("Interviews response:", interviewsResponse);
        setInterviews(interviewsResponse.data || []);
      } catch (interviewsError) {
        console.error("Error fetching interview history:", interviewsError);
        // Don't show toast error for interviews - just log it
        setInterviews([]);
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
    // Check for all required fields
    if (!interviewData.date || !interviewData.interviewer || !interviewData.location) {
      toast.error("Please fill all interview details (date, type, interviewer, and location)");
      return;
    }
    
    try {
      // Parse the datetime-local input
      const dateTimeInput = interviewData.date; // Format: "YYYY-MM-DDThh:mm"
      let interviewDate, interviewTime;
      
      if (dateTimeInput.includes('T')) {
        // Split into date and time components
        const [datePart, timePart] = dateTimeInput.split('T');
        interviewDate = datePart; // YYYY-MM-DD
        interviewTime = timePart; // hh:mm
      } else {
        interviewDate = dateTimeInput;
        interviewTime = "00:00"; // Default time if none provided
      }
      
      // Let's try a direct call to the applicant-specific API endpoint instead
      console.log("Creating interview for applicant ID:", applicant.id);
      
      // Instead of using interviews.schedule, try using a method directly on the applicant
      const response = await apiService.applicants.addInterview(applicant.id, {
        interview_date: interviewDate,
        interview_time: interviewTime,
        interview_type: interviewData.type,
        interviewer: interviewData.interviewer,
        location: interviewData.location,
        status: 'scheduled'
      });
      
      console.log("Interview scheduling response:", response);
      
      // If successful, update applicant status
      await apiService.applicants.update(applicant.id, { status: 'Interviewed' });
      
      setApplicant(prev => ({
        ...prev,
        status: 'Interviewed'
      }));
      
      setScheduleModalOpen(false);
      
      setInterviewData({
        date: '',
        type: 'video',
        interviewer: '',
        location: ''
      });
      
      toast.success("Interview scheduled successfully and applicant status updated!");
      
      // Refresh to get updated interview history
      fetchApplicantDetails();
    } catch (error) {
      console.error("Error scheduling interview:", error);
      // Log more detailed error information
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error config:", error.config);
        toast.error(`Failed to schedule interview: ${error.response.data?.message || error.response.status}`);
      } else if (error.message) {
        console.error("Error message:", error.message);
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Failed to schedule interview. Please try again.");
      }
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackData.trim()) {
      toast.error("Please enter feedback");
      return;
    }
    
    try {
      console.log("Submitting feedback for applicant ID:", applicant.id);
      
      // Use the correct endpoint and parameter names for feedback
      await apiService.applicants.addFeedback(applicant.id, {
        feedback_text: feedbackData,
        created_by: "HR User" // In a real app, this would be the current user's name
      });
      
      // Refresh applicant details after adding feedback
      fetchApplicantDetails();
      
      setFeedbackModalOpen(false);
      setFeedbackData("");
      toast.success("Feedback added successfully");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      console.error("Error response:", error.response);
      toast.error(error.response?.data?.message || "Failed to add feedback");
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
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaCalendarAlt className="mr-2" />
              Schedule Interview
            </button>
            <button
              onClick={() => setFeedbackModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaStickyNote className="mr-2" />
              Add Note
            </button>
          </div>

          {/* Interview History Section */}
          <div className={`${isDark ? 'bg-[#232f46] border border-slate-700' : 'bg-white border border-gray-200'} rounded-lg shadow-md p-6 mb-6`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Interview History</h2>
            {interviews && interviews.length > 0 ? (
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <div key={interview.id} className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'} border p-4 rounded-lg`}>
                    <div className="flex justify-between mb-2">
                      <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {interview.interview_type} Interview
                      </span>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(interview.interview_date).toLocaleDateString()} 
                        {interview.interview_time && ` at ${interview.interview_time}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Interviewer: </span>
                          {interview.interviewer}
                        </p>
                        {interview.notes && (
                          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                            {interview.notes}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        interview.status === 'completed' 
                          ? isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                          : isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {interview.status === 'completed' ? 'Completed' : 'Scheduled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No interviews scheduled yet.</p>
            )}
          </div>

          {/* Add a message explaining the workflow to the UI */}
          <div className={`my-4 p-4 rounded-lg ${
            isDark 
              ? 'bg-blue-900/30 border border-blue-800/50 text-blue-300' 
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-start">
              <i className="fas fa-info-circle mt-0.5 mr-2"></i>
              <p className="text-sm">
                <strong>Workflow:</strong> Applicants must be interviewed before they can be onboarded. 
                Schedule an interview using the button below to proceed with the hiring process.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-lg w-full max-w-md ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>Schedule Interview</h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>Interview Date & Time</label>
                <input
                  type="datetime-local"
                  value={interviewData.date}
                  onChange={(e) => setInterviewData({...interviewData, date: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                  required
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Please select both date and time
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>Interview Type</label>
                <select
                  value={interviewData.type}
                  onChange={(e) => setInterviewData({...interviewData, type: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="phone">Phone Interview</option>
                  <option value="video">Video Interview</option>
                  <option value="in-person">In-Person Interview</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>Interviewer</label>
                <input
                  type="text"
                  value={interviewData.interviewer}
                  onChange={(e) => setInterviewData({...interviewData, interviewer: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                  placeholder="Enter interviewer's name"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>Location</label>
                <input
                  type="text"
                  value={interviewData.location}
                  onChange={(e) => setInterviewData({...interviewData, location: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                  placeholder="Enter the interview location"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setScheduleModalOpen(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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

      {/* Add Feedback Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-lg w-full max-w-md ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>Add Note</h2>
            <div>
              <textarea
                value={feedbackData}
                onChange={(e) => setFeedbackData(e.target.value)}
                placeholder="Enter your notes or feedback..."
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
                rows="3"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setFeedbackModalOpen(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
    </div>
  );
};

export default ApplicantDetails; 