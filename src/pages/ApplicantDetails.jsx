import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Layouts/Header";
import Sidebar from "../components/Layouts/Sidebar";
import { FaArrowLeft, FaCalendarAlt, FaStickyNote } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import apiService from "../services/api";
import { ThemeContext } from "../ThemeContext";

const ApplicantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [interviewData, setInterviewData] = useState({
    date: "",
    time: "",
    location: "",
    interviewer: ""
  });
  const [feedbackData, setFeedbackData] = useState("");
  const [notes, setNotes] = useState([]);

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
    if (!interviewData.date || !interviewData.time || !interviewData.location || !interviewData.interviewer) {
      toast.error("Please fill all interview details");
      return;
    }
    
    try {
      await apiService.interviews.schedule({
        applicant_id: applicant.id,
        interview_date: interviewData.date,
        interview_time: interviewData.time,
        location: interviewData.location,
        interviewer: interviewData.interviewer
      });
      
      // Refresh applicant details
      fetchApplicantDetails();
      setScheduleModalOpen(false);
      toast.success("Interview scheduled successfully");
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast.error(error.response?.data?.message || "Failed to schedule interview");
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
      <div className="flex">
        <Sidebar />
        <div className="flex flex-col flex-1 ml-64">
          <Header />
          <main className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6 flex-1 mt-16 transition-colors duration-200`}>
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex flex-col flex-1 ml-64">
          <Header />
          <main className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6 flex-1 mt-16 transition-colors duration-200`}>
            <div className="text-center">
              <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {error || "Applicant not found"}
              </h2>
              <button
                onClick={() => navigate('/applicants')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Return to Applicants List
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64">
        <Header />
        <ToastContainer position="top-right" />

        <main className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6 flex-1 mt-16 transition-colors duration-200`}>
          <div className="container mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate('/applicants')}
              className={`flex items-center ${isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'} mb-6`}
            >
              <FaArrowLeft className="mr-2" />
              Back to Applicants
            </button>

            {/* Applicant Details */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{applicant.name}</h1>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{applicant.position}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  applicant.status === "Pending" 
                    ? isDarkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800" 
                    : applicant.status === "Reviewed" 
                    ? isDarkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800" 
                    : applicant.status === "Interviewed" 
                    ? isDarkMode ? "bg-purple-900 text-purple-200" : "bg-purple-100 text-purple-800"
                    : applicant.status === "Accepted" 
                    ? isDarkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800"
                    : isDarkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"
                }`}>
                  {applicant.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{applicant.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{applicant.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Application Date</p>
                      <p className="font-medium">{applicant.applied_date}</p>
                    </div>
                  </div>
                </div>

                {/* Education & Experience */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Qualifications</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Education</p>
                      <p className="font-medium">{applicant.education}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium">{applicant.experience}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Skills</p>
                      <p className="font-medium whitespace-pre-line">{applicant.skills}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setScheduleModalOpen(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FaCalendarAlt className="mr-2" />
                Schedule Interview
              </button>
              <button
                onClick={() => setFeedbackModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FaStickyNote className="mr-2" />
                Add Note
              </button>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Notes & Feedback</h2>
              <div className="space-y-4">
                {notes.map((note, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <p className="text-gray-800">{note.feedback_text}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Added by {note.created_by} on {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {notes.length === 0 && (
                  <p className="text-gray-500">No notes or feedback yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Schedule Interview Modal */}
          {scheduleModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center backdrop-filter backdrop-blur-md bg-gray-900/50 z-50">
              <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <h2 className="text-2xl font-semibold mb-4">Schedule Interview</h2>
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

          {/* Feedback Modal */}
          {feedbackModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center backdrop-filter backdrop-blur-md bg-gray-900/50 z-50">
              <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <h2 className="text-2xl font-semibold mb-4">Add Note</h2>
                <div className="mb-4">
                  <label className="block text-sm text-gray-500 mb-1">Note</label>
                  <textarea
                    value={feedbackData}
                    onChange={(e) => setFeedbackData(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-40"
                    placeholder="Enter your note about this applicant..."
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setFeedbackModalOpen(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                    Cancel
                  </button>
                  <button onClick={handleSubmitFeedback} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Submit Note
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

export default ApplicantDetails; 