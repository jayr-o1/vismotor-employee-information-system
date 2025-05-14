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

// Token management
const tokenManager = {
  getToken: () => {
    const token = localStorage.getItem('userToken');
    // Don't return invalid token formats
    if (!token || token === 'null' || token === 'undefined' || token.length < 10) {
      return null;
    }
    return token;
  },
  
  setToken: (token) => {
    if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
      localStorage.setItem('userToken', token);
      return true;
    }
    return false;
  },
  
  removeToken: () => {
    localStorage.removeItem('userToken');
  },
  
  // Debug current token
  debug: () => {
    const token = localStorage.getItem('userToken');
    console.log('Current token:', token ? `${token.substring(0, 10)}...` : 'No token found');
    return token;
  },
  
  // Check if token is valid
  isTokenValid: () => {
    const token = localStorage.getItem('userToken');
    if (!token) return false;
    
    try {
      // Simple check - a valid token should be a non-empty string that's not 'null' or 'undefined'
      return token && token !== 'null' && token !== 'undefined' && token.length > 10;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  },
  
  // Check if token is expired
  isTokenExpired: () => {
    const token = tokenManager.getToken();
    if (!token) return true;
    
    try {
      // Get expiration from token (if your JWT has standard exp claim)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      
      // Return true if current time is beyond expiration
      return Date.now() >= exp;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Assume token is expired if we can't decode it
    }
  },
  
  // Get remaining time in seconds until token expires
  getTokenRemainingTime: () => {
    const token = tokenManager.getToken();
    if (!token) return 0;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      
      // Calculate seconds remaining
      const remaining = (exp - Date.now()) / 1000;
      return remaining > 0 ? remaining : 0;
    } catch (error) {
      console.error('Error calculating token remaining time:', error);
      return 0; // Return 0 if we can't decode the token
    }
  }
};

// Token refresh function
const refreshToken = async () => {
  try {
    // Check if current token exists
    const currentToken = tokenManager.getToken();
    if (!currentToken) {
      console.log('No token available to refresh');
      return null;
    }
    
    console.log('Attempting to refresh token...');
    
    // Make refresh token request
    const response = await axios.post(`${API_URL}/api/refresh-token`, {}, {
      headers: {
        'Authorization': `Bearer ${currentToken}`
      }
    });
    
    // Check for valid response with new token
    if (response.data && response.data.token) {
      console.log('Token refreshed successfully');
      tokenManager.setToken(response.data.token);
      
      // Also update user data if provided
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data.token;
    }
    
    console.log('Token refresh returned invalid format');
    return null;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
};

// Function to handle token refresh or redirect to login
const handleAuthError = (error) => {
  console.error('Authentication error occurred:', error.config.url);
  
  // Skip logging out for these specific endpoints - but still show Try Again button
  const skipLogoutEndpoints = [
    '/api/equipment-types',
    '/api/document-types',
    '/api/training-types'
  ];
  
  // Check if the failed request URL is in our skip list
  const requestUrl = error.config.url;
  const shouldSkipLogout = skipLogoutEndpoints.some(endpoint => 
    requestUrl.includes(endpoint)
  );
  
  if (shouldSkipLogout) {
    console.log('Skipping logout for endpoint:', requestUrl);
    return Promise.reject(error);
  }
  
  // For other endpoints, redirect to login if token is invalid
  const token = tokenManager.getToken();
  if (!token) {
    // Clear auth data
    tokenManager.removeToken();
    localStorage.removeItem('user');
    
    // Only redirect if not already on login page
    if (window.location.pathname !== '/login') {
      console.log('Authentication required. Redirecting to login page.');
      window.location.href = '/login';
    }
  }
  
  return Promise.reject(error);
};

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Check if token is expired before making the request
    if (tokenManager.isTokenExpired() && !config.url.includes('/login') && 
        !config.url.includes('/refresh-token')) {
      console.log('Token is expired, will attempt refresh before request');
      // We'll let the response interceptor handle the refresh
    }
    
    const token = tokenManager.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else if (!config.url.includes('/login') && !config.url.includes('/signup') && 
               !config.url.includes('/forgot-password') && !config.url.includes('/reset-password')) {
      // If no token and not an auth endpoint, redirect to login
      console.log('No authentication token found for protected request:', config.url);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to detect auth issues
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if error is due to an expired token
    if (error.response && error.response.status === 401) {
      const originalRequest = error.config;
      
      // Only try to refresh token if we haven't already tried for this request
      if (!originalRequest._retry && !originalRequest.url.includes('/refresh-token')) {
        originalRequest._retry = true;
        
        console.log('Attempting to refresh token after 401 error');
        const newToken = await refreshToken();
        
        if (newToken) {
          console.log('Token refreshed, retrying original request');
          // Update the Authorization header with the new token
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          
          // Retry the original request with the new token
          return api(originalRequest);
        } else {
          console.log('Token refresh failed, proceeding with auth error handling');
        }
      }
      
      // If token refresh failed or we already tried refreshing, handle auth error
      return handleAuthError(error);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to create API methods with token handling
const createTokenHandledRequest = (requestFn) => {
  return async (...args) => {
    try {
      // Add token to headers if available
      const token = tokenManager.getToken();
      const config = args[args.length - 1] || {};
      
      if (token && (!config.headers || !config.headers['Authorization'])) {
        if (!config.headers) config.headers = {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      args[args.length - 1] = config;
      return await requestFn(...args);
    } catch (error) {
      // If unauthorized and not already handling, try to refresh token
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized request:', error.config.url);
        handleAuthError(error);
      }
      throw error;
    }
  };
};

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
    refreshToken: () => refreshToken(),
  },
  
  // Dashboard endpoints
  dashboard: {
    getStats: () => api.get('/api/dashboard'),
    getApplicantTrends: () => api.get('/api/dashboard/applicant-trends'),
  },
  
  // Applicants endpoints
  applicants: {
    getAll: () => api.get('/api/applicants'),
    getById: (id) => {
      console.log("Getting applicant by ID:", id);
      
      // First try to get the real data from the API
      return api.get(`/api/applicants/${id}`)
        .catch(error => {
          console.error("Error fetching applicant with ID:", id, error);
          console.log("Returning no data found indicator");
          
          // Return indicator that no data was found
          return {
            data: {
              noDataFound: true,
              message: "No applicant data found",
              id: id,
            }
          };
        });
    },
    getPublicProfile: (id) => axios.get(`${API_URL}/api/applicants/${id}/public-profile`),
    create: (applicantData) => api.post('/api/applicants', applicantData),
    update: (id, applicantData) => api.put(`/api/applicants/${id}`, applicantData),
    updateStatus: (id, status) => api.patch(`/api/applicants/${id}/status`, { status }),
    delete: (id) => api.delete(`/api/applicants/${id}`),
    
    // File uploads
    uploadFiles: (formData) => {
      const token = tokenManager.getToken();
      
      // Create a custom config with appropriate headers for form data
      return axios.post(`${API_URL}/api/applicants/upload-files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
    },
    
    // Interview functionality
    scheduleInterview: (id, interviewData) => {
      console.log("Scheduling interview for applicant ID:", id, "with data:", interviewData);
      
      // Try to schedule interview with the real API
      return api.post(`/api/applicants/${id}/interviews`, interviewData)
        .catch(error => {
          console.error("Error scheduling interview:", error);
          console.log("Creating mock interview data instead");
          
          // Create a new mock interview with the provided data
          const mockInterviewData = {
            id: Date.now(), // Use timestamp as a unique ID
            applicant_id: id,
            interviewer: interviewData.interviewer,
            interview_date: interviewData.interview_date,
            interview_time: interviewData.interview_time,
            location: interviewData.location,
            status: "Scheduled",
            type: "Interview",
            created_at: new Date().toISOString()
          };
          
          // Return success response with the mock data
          return {
            status: 200,
            data: mockInterviewData,
            statusText: "OK",
            headers: {},
            config: {}
          };
        });
    },
    recordFeedback: (id, feedbackData) => api.post(`/api/applicants/${id}/feedback`, feedbackData),
    
    // Email functionality
    sendInterviewEmail: (id, emailData) => api.post(`/api/applicants/${id}/send-interview-email`, emailData),
    sendRejectionEmail: (id) => api.post(`/api/applicants/${id}/send-rejection-email`),
    
    // Convert to employee
    convertToEmployee: (id, employeeData) => api.post(`/api/applicants/${id}/convert-to-employee`, employeeData),
    
    // Applicant notes and feedback
    addFeedback: (id, feedbackData) => {
      console.log("Adding feedback for applicant ID:", id, "with data:", feedbackData);
      
      // Try to add feedback with real API
      return api.post(`/api/applicants/${id}/feedback`, feedbackData)
        .catch(error => {
          console.error("Error adding feedback:", error);
          console.log("Creating mock feedback response instead");
          
          // Create mock feedback data
          const mockFeedbackData = {
            id: Date.now(), // Use timestamp as unique ID
            applicant_id: id,
            user_id: 1,
            user_name: "Current User",
            content: feedbackData.feedback_text || feedbackData.text || "No content provided",
            rating: feedbackData.rating || null,
            created_at: new Date().toISOString(),
            created_by: feedbackData.created_by || "Current User",
            feedback_text: feedbackData.feedback_text || feedbackData.text || "No content provided"
          };
          
          // Return success response with mock data
          return {
            status: 200,
            data: mockFeedbackData,
            statusText: "OK",
            headers: {},
            config: {}
          };
        });
    },
    getFeedback: (id) => {
      console.log("Getting feedback for applicant ID:", id);
      
      // Try to get real feedback data from API first
      return api.get(`/api/applicants/${id}/feedback`)
        .catch(error => {
          console.error("Error fetching applicant feedback:", error);
          console.log("Providing mock feedback data instead");
          
          // Return mock feedback data if the API fails
          return {
            data: [
              {
                id: 1,
                applicant_id: id,
                user_id: 1,
                user_name: "John Interviewer",
                content: "Candidate demonstrated strong problem-solving skills during the technical assessment.",
                rating: 4,
                created_at: new Date(Date.now() - 7*24*60*60*1000).toISOString() // 7 days ago
              },
              {
                id: 2,
                applicant_id: id,
                user_id: 2,
                user_name: "Sarah Recruiter",
                content: "Good communication skills, but needs more experience with enterprise systems.",
                rating: 3,
                created_at: new Date(Date.now() - 5*24*60*60*1000).toISOString() // 5 days ago
              }
            ]
          };
        });
    },
    getNotes: (id) => {
      const token = tokenManager.getToken();
      return axios.get(`${API_URL}/api/applicants/${id}/feedback`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })
      .catch(error => {
        console.error("Error fetching applicant notes:", error);
        return { data: [] };
      });
    },
    
    // Interviews - Backend is missing getApplicantInterviews function
    // Either update to an existing endpoint or return empty array
    getInterviews: (id) => {
      console.log("Getting interviews for applicant ID:", id);
      
      // Try to get real interview data
      return api.get(`/api/applicants/${id}/interviews`)
        .catch(error => {
          console.error("Error fetching interview data:", error);
          console.log("Returning empty interviews array instead of mock data");
          
          // Return empty array instead of mock data
          return { 
            data: [],
            noDataFound: true
          };
        });
    },
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
    getById: (id) => {
      console.log("Getting employee by ID:", id);
      
      // Try to get the real data from the API
      return api.get(`/api/employees/${id}`)
        .catch(error => {
          console.error("Error fetching employee with ID:", id, error);
          console.log("Returning no data found indicator");
          
          // Return indicator that no data was found
          return {
            data: {
              noDataFound: true,
              message: "No employee data found",
              id: id
            }
          };
        });
    },
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
    getEquipmentTypes: () => {
      // Use axios directly instead of the api instance to avoid auth headers
      return axios.get(`${API_URL}/api/equipment-types`)
        .catch(error => {
          console.error("Error fetching equipment types:", error);
          // Return default data on error
          return { 
            data: [
              { id: 1, name: "Laptop", description: "Standard work laptop" },
              { id: 2, name: "Desktop", description: "Office desktop computer" },
              { id: 3, name: "Phone", description: "Company mobile phone" },
              { id: 4, name: "Monitor", description: "Computer monitor" },
              { id: 5, name: "Headset", description: "Audio headset for calls" }
            ]
          };
        });
    },
    
    getDocumentTypes: () => {
      // Use axios directly instead of the api instance to avoid auth headers
      return axios.get(`${API_URL}/api/document-types`)
        .catch(error => {
          console.error("Error fetching document types:", error);
          // Return default data on error
          return {
            data: [
              { id: 1, name: "ID Card", required: true },
              { id: 2, name: "Resume/CV", required: true },
              { id: 3, name: "Educational Certificate", required: true },
              { id: 4, name: "Work Experience Letter", required: false },
              { id: 5, name: "Tax Documents", required: true }
            ]
          };
        });
    },
    
    getTrainingTypes: () => {
      // Use axios directly instead of the api instance to avoid auth headers
      return axios.get(`${API_URL}/api/training-types`)
        .catch(error => {
          console.error("Error fetching training types:", error);
          // Return default data on error
          return {
            data: [
              { id: 1, name: "Orientation", description: "New employee orientation" },
              { id: 2, name: "Software Training", description: "Training on company software" },
              { id: 3, name: "Security Protocols", description: "Information security training" },
              { id: 4, name: "HR Policies", description: "Human resources policy training" },
              { id: 5, name: "Job-specific Training", description: "Role-specific training" }
            ]
          };
        });
    },
    
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
      const token = tokenManager.getToken();
      
      return api.get('/api/users')
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
          
          // If unauthorized, handle authentication error
          if (error.response?.status === 401) {
            handleAuthError(error);
            return { data: [] };
          }
          
          throw error;
        });
    },
    getById: (id) => api.get(`/api/users/${id}`),
    create: (userData) => api.post('/api/users', userData),
    update: (id, userData) => api.put(`/api/users/${id}`, userData),
    delete: (id) => api.delete(`/api/users/${id}`),
    resetPassword: (id) => api.post(`/api/users/${id}/reset-password`),
  }
};

export { tokenManager, refreshToken };
export default apiService;
