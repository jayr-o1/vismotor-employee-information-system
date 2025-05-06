import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FaPlus, FaSearch, FaUserCheck, FaClipboardCheck, FaClipboardList, FaLaptop, FaFileAlt, FaGraduationCap } from "react-icons/fa";

const Onboarding = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch employees data on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);
  
  // Fetch employees from API
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.employees.getAll();
      
      // Filter to employees hired in the last 90 days
      const recentlyHired = response.data.filter(employee => {
        const hireDate = new Date(employee.hire_date);
        const now = new Date();
        const daysSinceHire = Math.floor((now - hireDate) / (1000 * 60 * 60 * 24));
        
        return daysSinceHire <= 90; // Show employees hired in the last 90 days
      });

      // Fetch progress for each employee
      const employeesWithProgress = await Promise.all(
        recentlyHired.map(async (employee) => {
          try {
            // Get onboarding progress
            const progressResponse = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/employees/${employee.id}/onboarding-progress`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
              }
            });
            
            if (progressResponse.ok) {
              const progressData = await progressResponse.json();
              return { ...employee, progress: progressData.overall };
            }
            
            return { ...employee, progress: 0 };
          } catch (error) {
            console.error(`Error fetching progress for employee ${employee.id}:`, error);
            return { ...employee, progress: 0 };
          }
        })
      );
      
      setEmployees(employeesWithProgress);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError(`Failed to fetch employees: ${error.response?.data?.message || error.message}`);
      toast.error(`Failed to fetch employees: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee =>
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate onboarding progress (placeholder - real data will come from backend)
  const getOnboardingProgress = (employee) => {
    // Return the progress from the API if available
    return employee.progress || 0;
  };
  
  // Navigate to employee onboarding details
  const handleViewOnboarding = (employee) => {
    navigate(`/onboarding/${employee.id}`);
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
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <div className="text-center">
          <h2 className={`text-2xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            {error}
          </h2>
          <button
            onClick={fetchEmployees}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" />
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Employee Onboarding</h1>
          
          <div className="flex space-x-2">
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                className={`pl-10 pr-4 py-2 ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-2.5">
                <FaSearch className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              </div>
            </div>
          </div>
        </div>
        
        {filteredEmployees.length === 0 ? (
          <div className={`${isDark ? 'bg-[#232f46] border border-slate-700 text-gray-300' : 'bg-white border border-gray-200 text-gray-600'} rounded-xl shadow-md p-10 text-center`}>
            <FaClipboardList className="mx-auto text-4xl mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No Employees in Onboarding</h2>
            <p className="mb-4">There are no employees currently in the onboarding process.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map(employee => {
              const progress = getOnboardingProgress(employee);
              
              return (
                <div 
                  key={employee.id}
                  className={`${isDark ? 'bg-[#232f46] border border-slate-700 hover:bg-[#2c3a56]' : 'bg-white border border-gray-200 hover:bg-gray-50'} rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-200`}
                  onClick={() => handleViewOnboarding(employee)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-lg font-semibold">{employee.name}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${progress === 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {progress === 100 ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm`}>{employee.position}</p>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{employee.department}</p>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Hire Date: {new Date(employee.hire_date).toLocaleDateString()}</p>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{progress}% Complete</span>
                      
                      <div className="flex space-x-2">
                        <div className="flex items-center text-blue-500">
                          <FaLaptop className="mr-1" />
                          <span className="text-xs">Equipment</span>
                        </div>
                        <div className="flex items-center text-green-500">
                          <FaFileAlt className="mr-1" />
                          <span className="text-xs">Documents</span>
                        </div>
                        <div className="flex items-center text-purple-500">
                          <FaGraduationCap className="mr-1" />
                          <span className="text-xs">Training</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Onboarding; 