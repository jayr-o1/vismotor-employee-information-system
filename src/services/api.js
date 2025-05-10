import axios from 'axios';

// Get API base URL from environment variables 
const API_URL = import.meta.env.VITE_API_URL || 'http://10.10.1.71:5000';
console.log('API URL used:', API_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API services for different entities
const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/api/login', credentials),
    signup: (userData) => api.post('/api/signup', userData),
    forgotPassword: (email) => api.post('/api/forgot-password', email),
    resetPassword: (resetData) => api.post('/api/reset-password', resetData),
    verifyEmail: (token) => api.get(`/api/verify-email?token=${token}`),
    resendVerification: (email) => api.post('/api/resend-verification', { email }),
    createUser: (userData) => api.post('/api/admin/create-user', userData),
  },
  
  // Dashboard endpoints
  dashboard: {
    getStats: () => api.get('/api/dashboard'),
    getApplicantTrends: () => api.get('/api/dashboard/applicant-trends'),
  },
  
  // Applicants endpoints
  applicants: {
    getAll: () => api.get('/api/applicants'),
    getById: (id) => api.get(`/api/applicants/${id}`),
    getPublicProfile: (id) => axios.get(`${API_URL}/api/applicants/${id}/public-profile`),
    create: (applicantData) => api.post('/api/applicants', applicantData),
    update: (id, applicantData) => api.put(`/api/applicants/${id}`, applicantData),
    updateStatus: (id, status) => api.patch(`/api/applicants/${id}/status`, { status }),
    delete: (id) => api.delete(`/api/applicants/${id}`),
    
    // File uploads
    uploadFiles: (formData) => {
      // Create a custom config with appropriate headers for form data
      return axios.post(`${API_URL}/api/applicants/upload-files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
    },
    
    // Interview functionality
    scheduleInterview: (id, interviewData) => api.post(`/api/applicants/${id}/interviews`, interviewData),
    recordFeedback: (id, feedbackData) => api.post(`/api/applicants/${id}/feedback`, feedbackData),
    
    // Email functionality
    sendInterviewEmail: (id, emailData) => api.post(`/api/applicants/${id}/send-interview-email`, emailData),
    sendRejectionEmail: (id) => api.post(`/api/applicants/${id}/send-rejection-email`),
    
    // Convert to employee
    convertToEmployee: (id, employeeData) => api.post(`/api/applicants/${id}/convert-to-employee`, employeeData),
    
    // Applicant notes and feedback
    addFeedback: (id, feedbackData) => api.post(`/api/applicants/${id}/feedback`, feedbackData),
    getFeedback: (id) => api.get(`/api/applicants/${id}/feedback`),
    getNotes: (id) => api.get(`/api/applicants/${id}/notes`),
    
    // Interviews
    getInterviews: (id) => api.get(`/api/applicants/${id}/interviews`),
  },
  
  // Interviews endpoints
  interviews: {
    getAll: () => api.get('/api/interviews'),
    getById: (id) => api.get(`/api/interviews/${id}`),
    schedule: (applicantId, interviewData) => api.post(`/api/applicants/${applicantId}/interviews`, interviewData),
    updateStatus: (id, statusData) => api.patch(`/api/interviews/${id}/status`, statusData),
    delete: (id) => api.delete(`/api/interviews/${id}`),
  },
  
  // Employees endpoints
  employees: {
    getAll: () => api.get('/api/employees'),
    getById: (id) => api.get(`/api/employees/${id}`),
    getPublicProfile: (id) => axios.get(`${API_URL}/api/employees/${id}/public-profile`),
    create: (employeeData) => api.post('/api/employees', employeeData),
    update: (employeeData) => {
      const id = employeeData.id;
      return api.put(`/api/employees/${id}`, employeeData);
    },
    updateStatus: (id, status) => api.put(`/api/employees/${id}`, { status }),
    delete: (id) => api.delete(`/api/employees/${id}`),
    
    // Email functionality
    sendWelcomeEmail: (id) => api.post(`/api/employees/${id}/send-welcome-email`),
    
    // For onboarding
    getEquipmentTypes: () => api.get('/api/equipment-types'),
    getDocumentTypes: () => api.get('/api/document-types'),
    getTrainingTypes: () => api.get('/api/training-types'),
    
    // Employee onboarding data
    getOnboardingProgress: (id) => api.get(`/api/employees/${id}/onboarding-progress`),
    getEquipment: (id) => api.get(`/api/employees/${id}/equipment`),
    saveEquipment: (id, equipmentData) => api.post(`/api/employees/${id}/equipment`, equipmentData),
    getDocuments: (id) => api.get(`/api/employees/${id}/documents`),
    saveDocuments: (id, documentsData) => api.post(`/api/employees/${id}/documents`, documentsData),
    getTraining: (id) => api.get(`/api/employees/${id}/training`),
    saveTraining: (id, trainingData) => api.post(`/api/employees/${id}/training`, trainingData)
  },
  
  // Users endpoints
  users: {
    getAll: () => {
      console.log("Calling users.getAll()");
      return axios.get(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      })
      .then(response => {
        console.log("Users API response:", response.status);
        return response;
      })
      .catch(error => {
        console.error("Users API error:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          errorMessage: error.message
        });
        
        // If it's a 500 error, return an empty array instead of throwing
        if (error.response && error.response.status === 500) {
          console.log("Server error when fetching users, returning empty array");
          return { data: [] };
        }
        throw error;
      });
    },
    getById: (id) => api.get(`/api/users/${id}`),
    create: (userData) => api.post('/api/users', userData),
    update: (id, userData) => api.put(`/api/users/${id}`, userData),
    updatePassword: (id, passwordData) => api.patch(`/api/users/${id}/password`, passwordData),
    delete: (id) => api.delete(`/api/users/${id}`),
    uploadProfilePicture: (id, formData) => {
      // Use custom config with correct headers for form data
      return axios.post(`${API_URL}/api/users/${id}/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
    }
  }
};

export default apiService;
