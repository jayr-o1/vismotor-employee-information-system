// apiService.js
import axios from 'axios';

const apiService = {
  applicants: {
    // Example GET request to fetch applicant details
    getById: (id) => axios.get(`/api/applicants/${id}`),

    // Example POST request to add an interview
    addInterview: (applicantId, interviewDetails) => {
      return axios.post(`/api/applicants/${applicantId}/interviews`, interviewDetails);
    },

    // Example GET request to fetch interview history
    getInterviews: (id) => axios.get(`/api/applicants/${id}/interviews`),

    // Example PUT request to update applicant status
    update: (applicantId, data) => axios.put(`/api/applicants/${applicantId}`, data),

    // Example POST request to add feedback
    addFeedback: (applicantId, feedback) => {
      return axios.post(`/api/applicants/${applicantId}/feedback`, feedback);
    }
  }
};

export default apiService;