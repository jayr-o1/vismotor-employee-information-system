import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeContext } from "../ThemeContext";
import apiService from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaCheck, FaTimes, FaUserCheck, FaClipboardCheck, FaLaptop, FaFileAlt, FaGraduationCap } from "react-icons/fa";

const OnboardingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [onboardingData, setOnboardingData] = useState({
    equipment: [],
    documents: [],
    training: []
  });
  
  // Fetch employee data on component mount
  useEffect(() => {
    fetchEmployeeData();
  }, [id]);
  
  // Fetch employee data and onboarding details
  const fetchEmployeeData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get basic employee data
      const response = await apiService.employees.getById(id);
      
      if (!response.data) {
        throw new Error("Employee not found");
      }
      
      setEmployee(response.data);
      
      // Fetch onboarding progress
      try {
        const progressResponse = await apiService.employees.getOnboardingProgress(id);
        console.log('Onboarding progress:', progressResponse.data);
      } catch (progressError) {
        console.error("Error fetching onboarding progress:", progressError);
      }
      
      // Fetch equipment data
      try {
        const equipmentResponse = await apiService.employees.getEquipment(id);
        if (equipmentResponse.data) {
          setOnboardingData(prev => ({
            ...prev,
            equipment: equipmentResponse.data || []
          }));
        }
      } catch (equipmentError) {
        console.error("Error fetching equipment data:", equipmentError);
      }
      
      // Fetch documents data
      try {
        const documentsResponse = await apiService.employees.getDocuments(id);
        if (documentsResponse.data) {
          setOnboardingData(prev => ({
            ...prev,
            documents: documentsResponse.data || []
          }));
        }
      } catch (documentsError) {
        console.error("Error fetching documents data:", documentsError);
      }
      
      // Fetch training data
      try {
        const trainingResponse = await apiService.employees.getTraining(id);
        if (trainingResponse.data) {
          setOnboardingData(prev => ({
            ...prev,
            training: trainingResponse.data || []
          }));
        }
      } catch (trainingError) {
        console.error("Error fetching training data:", trainingError);
      }
      
    } catch (error) {
      console.error("Error fetching employee:", error);
      setError(`Failed to fetch employee: ${error.response?.data?.message || error.message}`);
      toast.error(`Failed to fetch employee: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate onboarding progress
  const calculateProgress = () => {
    let completed = 0;
    let total = 0;
    
    // Equipment progress
    if (onboardingData.equipment.length > 0) {
      total += onboardingData.equipment.length;
      completed += onboardingData.equipment.filter(e => e.status === 'Delivered').length;
    }
    
    // Documents progress
    if (onboardingData.documents.length > 0) {
      total += onboardingData.documents.length;
      completed += onboardingData.documents.filter(d => d.submitted).length;
    }
    
    // Training progress
    if (onboardingData.training.length > 0) {
      total += onboardingData.training.length;
      completed += onboardingData.training.filter(t => t.status === 'Completed').length;
    }
    
    return total > 0 ? Math.floor((completed / total) * 100) : 0;
  };
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }
  
  if (error || !employee) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <div className="text-center">
          <h2 className={`text-2xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            {error || "Employee not found"}
          </h2>
          <button
            onClick={() => navigate('/onboarding')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Onboarding List
          </button>
        </div>
      </div>
    );
  }
  
  const progress = calculateProgress();

  return (
    <>
      <ToastContainer position="top-right" />
      <div className="max-w-7xl mx-auto py-6">
        {/* Header with back button and title */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/onboarding')}
            className={`mr-4 p-2 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-semibold flex-1">Onboarding: {employee.name}</h1>
        </div>
        
        {/* Employee details card */}
        <div className={`${isDark ? 'bg-[#232f46] border border-slate-700' : 'bg-white border border-gray-200'} rounded-xl shadow-md p-6 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center md:items-start">
              {/* Add profile picture here */}
              {employee.profile_picture ? (
                <div className="mb-4 flex justify-center md:justify-start">
                  <img 
                    src={`http://10.10.1.71:5000/api/profile-pictures/${employee.profile_picture}`}
                    alt={`${employee.first_name} ${employee.last_name}`}
                    className="w-24 h-24 rounded-full object-cover border-2 border-green-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/100?text=N/A';
                    }}
                  />
                </div>
              ) : (
                <div className="mb-4 flex justify-center md:justify-start">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-medium ${
                    isDark ? 'bg-green-700' : 'bg-green-600'
                  }`}>
                    {employee.first_name?.[0]}{employee.last_name?.[0]}
                  </div>
                </div>
              )}
              <h2 className="text-lg font-semibold mb-2">Employee Details</h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}><span className="font-medium">Position:</span> {employee.position}</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}><span className="font-medium">Department:</span> {employee.department}</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}><span className="font-medium">Hire Date:</span> {new Date(employee.hire_date).toLocaleDateString()}</p>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}><span className="font-medium">Email:</span> {employee.email}</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}><span className="font-medium">Phone:</span> {employee.phone || "N/A"}</p>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-2">Onboarding Progress</h2>
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2 dark:bg-gray-700">
                <div 
                  className={`${progress === 100 ? 'bg-green-600' : 'bg-blue-600'} h-4 rounded-full transition-all duration-500`} 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="font-medium">{progress}%</span> completed
              </p>
              <div className="flex space-x-4 mt-2">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${onboardingData.equipment.length > 0 ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></div>
                  <span className="text-sm">Equipment</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${onboardingData.documents.length > 0 ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></div>
                  <span className="text-sm">Documents</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${onboardingData.training.length > 0 ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></div>
                  <span className="text-sm">Training</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button
                className={`inline-block py-3 px-4 border-b-2 rounded-t-lg ${activeTab === 'overview' 
                  ? `${isDark ? 'text-blue-500 border-blue-500' : 'text-blue-600 border-blue-600'}`
                  : `${isDark ? 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300' : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300'}`
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-block py-3 px-4 border-b-2 rounded-t-lg ${activeTab === 'equipment' 
                  ? `${isDark ? 'text-blue-500 border-blue-500' : 'text-blue-600 border-blue-600'}`
                  : `${isDark ? 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300' : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300'}`
                }`}
                onClick={() => setActiveTab('equipment')}
              >
                <FaLaptop className="inline mr-2" />
                Equipment
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-block py-3 px-4 border-b-2 rounded-t-lg ${activeTab === 'documents' 
                  ? `${isDark ? 'text-blue-500 border-blue-500' : 'text-blue-600 border-blue-600'}`
                  : `${isDark ? 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300' : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300'}`
                }`}
                onClick={() => setActiveTab('documents')}
              >
                <FaFileAlt className="inline mr-2" />
                Documents
              </button>
            </li>
            <li>
              <button
                className={`inline-block py-3 px-4 border-b-2 rounded-t-lg ${activeTab === 'training' 
                  ? `${isDark ? 'text-blue-500 border-blue-500' : 'text-blue-600 border-blue-600'}`
                  : `${isDark ? 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300' : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300'}`
                }`}
                onClick={() => setActiveTab('training')}
              >
                <FaGraduationCap className="inline mr-2" />
                Training
              </button>
            </li>
          </ul>
        </div>
        
        {/* Tab content */}
        <div className={`${isDark ? 'bg-[#232f46] border border-slate-700' : 'bg-white border border-gray-200'} rounded-xl shadow-md p-6`}>
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Onboarding Overview</h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                This page provides an overview of the onboarding process for {employee.name}.
                Use the tabs above to manage equipment assignments, required documents, and training sessions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex items-center mb-2">
                    <FaLaptop className="mr-2 text-blue-500" />
                    <h3 className="text-lg font-medium">Equipment</h3>
                  </div>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    {onboardingData.equipment.length > 0 
                      ? `${onboardingData.equipment.length} items assigned`
                      : "No equipment assigned yet"}
                  </p>
                  <button
                    onClick={() => setActiveTab('equipment')}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Manage Equipment
                  </button>
                </div>
                
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex items-center mb-2">
                    <FaFileAlt className="mr-2 text-green-500" />
                    <h3 className="text-lg font-medium">Documents</h3>
                  </div>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    {onboardingData.documents.length > 0 
                      ? `${onboardingData.documents.length} documents required`
                      : "No documents required yet"}
                  </p>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Manage Documents
                  </button>
                </div>
                
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex items-center mb-2">
                    <FaGraduationCap className="mr-2 text-purple-500" />
                    <h3 className="text-lg font-medium">Training</h3>
                  </div>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    {onboardingData.training.length > 0 
                      ? `${onboardingData.training.length} training sessions scheduled`
                      : "No training scheduled yet"}
                  </p>
                  <button
                    onClick={() => setActiveTab('training')}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Manage Training
                  </button>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
                <ul className={`list-disc pl-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li className="mb-2">
                    {onboardingData.equipment.length === 0 ? (
                      <span>Assign equipment to the employee</span>
                    ) : (
                      <span className="line-through text-green-600 dark:text-green-400">Assign equipment to the employee</span>
                    )}
                  </li>
                  <li className="mb-2">
                    {onboardingData.documents.length === 0 ? (
                      <span>Specify required documentation</span>
                    ) : (
                      <span className="line-through text-green-600 dark:text-green-400">Specify required documentation</span>
                    )}
                  </li>
                  <li className="mb-2">
                    {onboardingData.training.length === 0 ? (
                      <span>Schedule training sessions</span>
                    ) : (
                      <span className="line-through text-green-600 dark:text-green-400">Schedule training sessions</span>
                    )}
                  </li>
                  <li className="mb-2">
                    {progress === 100 ? (
                      <span className="line-through text-green-600 dark:text-green-400">Complete the onboarding process</span>
                    ) : (
                      <span>Complete the onboarding process</span>
                    )}
                  </li>
                </ul>
              </div>
            </div>
          )}
          
          {activeTab === 'equipment' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Equipment Management</h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                Assign and manage equipment for {employee.name}.
              </p>
              
              {/* Equipment list will be added here in the next step */}
              <div className="flex justify-center items-center h-40">
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Equipment management interface will go here.
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'documents' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Document Requirements</h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                Manage required documents for {employee.name}.
              </p>
              
              {/* Documents list will be added here in the next step */}
              <div className="flex justify-center items-center h-40">
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Document management interface will go here.
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'training' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Training Schedule</h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                Schedule and manage training sessions for {employee.name}.
              </p>
              
              {/* Training list will be added here in the next step */}
              <div className="flex justify-center items-center h-40">
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Training management interface will go here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OnboardingDetail; 