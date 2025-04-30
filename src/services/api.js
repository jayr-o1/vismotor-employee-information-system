import axios from 'axios';

// Get API base URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    forgotPassword: (email) => api.post('/api/forgot-password', { email }),
    resetPassword: (resetData) => api.post('/api/reset-password', resetData),
    verifyEmail: (token) => api.get(`/api/verify-email?token=${token}`),
    resendVerification: (email) => api.post('/api/resend-verification', { email }),
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
    create: (applicantData) => api.post('/api/applicants', applicantData),
    update: (id, applicantData) => api.put(`/api/applicants/${id}`, applicantData),
    updateStatus: (id, status) => api.patch(`/api/applicants/${id}/status`, { status }),
    delete: (id) => api.delete(`/api/applicants/${id}`),
    
    // File uploads
    uploadFiles: (formData) => {
      // Create a special instance for file uploads with multipart/form-data
      const formDataConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      };
      return api.post('/api/applications/upload', formData, formDataConfig);
    },
    
    // Feedback
    addFeedback: (id, feedbackData) => api.post(`/api/applicants/${id}/feedback`, feedbackData),
    getFeedback: (id) => api.get(`/api/applicants/${id}/feedback`),
    
    // Notes
    getNotes: (id) => api.get(`/api/applicants/${id}/notes`),
    addNote: (noteData) => api.post(`/api/applicants/${noteData.applicant_id}/notes`, noteData),
    
    // Interviews
    getInterviews: (id) => api.get(`/api/applicants/${id}/interviews`),
  },
  
  // Interviews endpoints
  interviews: {
    getAll: () => api.get('/api/interviews'),
    getById: (id) => api.get(`/api/interviews/${id}`),
    schedule: (interviewData) => api.post('/api/interviews', interviewData),
    update: (id, interviewData) => api.put(`/api/interviews/${id}`, interviewData),
    updateStatus: (id, statusData) => api.patch(`/api/interviews/${id}/status`, statusData),
    delete: (id) => api.delete(`/api/interviews/${id}`),
  },
  
  // Employees endpoints
  employees: {
    getAll: () => api.get('/api/employees'),
    getById: (id) => api.get(`/api/employees/${id}`),
    create: (employeeData) => api.post('/api/employees', employeeData),
    update: (id, employeeData) => api.put(`/api/employees/${id}`, employeeData),
    updateStatus: (id, status) => api.put(`/api/employees/${id}`, { status }),
    delete: (id) => api.delete(`/api/employees/${id}`),
  },
  
  // Users endpoints
  users: {
    getAll: () => api.get('/api/users'),
    getById: (id) => api.get(`/api/users/${id}`),
    create: (userData) => api.post('/api/users', userData),
    update: (id, userData) => api.put(`/api/users/${id}`, userData),
    updatePassword: (id, passwordData) => api.patch(`/api/users/${id}/password`, passwordData),
    delete: (id) => api.delete(`/api/users/${id}`),
  }
};

export default apiService;
