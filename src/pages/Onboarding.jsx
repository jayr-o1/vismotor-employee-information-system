import React, { useState, useEffect, useContext } from "react";
import Header from "../components/Layouts/Header";
import Sidebar from "../components/Layouts/Sidebar";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from "react-toastify";
import apiService from "../services/api";
import { ThemeContext } from "../ThemeContext";

const Onboarding = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  // State for onboarding employee data
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch employees with Accepted status (in onboarding process)
  useEffect(() => {
    const fetchOnboardingEmployees = async () => {
      setIsLoading(true);
      try {
        // Fetch employees who are in the onboarding process
        // We'll filter employees by status or join with applicants table
        const response = await apiService.employees.getAll();
        
        // Process the data to add progress percentages
        const processedEmployees = response.data.map(employee => {
          // In a real application, we might have a more complex way to calculate progress
          // For now, we'll simulate it based on some business logic
          let progress = 0;
          
          // Example business logic to calculate onboarding progress:
          // 1. If they have been hired recently (less than 7 days), they might be in documentation phase
          const hireDate = new Date(employee.hire_date);
          const daysSinceHire = Math.floor((Date.now() - hireDate) / (1000 * 60 * 60 * 24));
          
          // Determine status and progress based on time since hire
          let status = "";
          if (daysSinceHire < 3) {
            status = "Documents Pending";
            progress = 30;
          } else if (daysSinceHire < 7) {
            status = "Training";
            progress = 65;
          } else if (daysSinceHire < 14) {
            status = "Orientation Complete";
            progress = 90;
          } else {
            status = "Completed";
            progress = 100;
          }
          
          return {
            ...employee,
            startDate: employee.hire_date, // Map hire_date to startDate for consistency
            status,
            progress
          };
        });
        
        setEmployees(processedEmployees);
      } catch (error) {
        console.error("Error fetching onboarding employees:", error);
        toast.error("Failed to load employee data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOnboardingEmployees();
  }, []);

  // Handler for search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee => 
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handler for marking onboarding as complete
  const handleCompleteOnboarding = async (id) => {
    try {
      // In a real application, you would update the employee status in the database
      await apiService.employees.update(id, { 
        onboarding_status: "Completed"
      });
      
      // Update local state to reflect the change
      setEmployees(employees.map(emp => 
        emp.id === id ? { ...emp, status: "Completed", progress: 100 } : emp
      ));
      
      toast.success("Onboarding marked as complete!");
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      toast.error("Failed to update onboarding status");
    }
  };

  // Get status color based on progress
  const getStatusColor = (progress) => {
    if (progress < 40) {
      return isDark 
        ? "bg-red-900/30 text-red-400" 
        : "bg-red-200 text-red-800";
    }
    if (progress < 75) {
      return isDark 
        ? "bg-yellow-900/30 text-yellow-400" 
        : "bg-yellow-200 text-yellow-800";
    }
    return isDark 
      ? "bg-green-900/30 text-green-400" 
      : "bg-green-200 text-green-800";
  };

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar />
      <div className="flex flex-col flex-1 lg:ml-64">
        <Header />
        <ToastContainer position="top-right" />

        <main className={`flex-1 p-4 sm:p-6 pt-16 md:pt-20 overflow-y-auto transition-colors duration-200 ${
          isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
        }`}>
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Employee Onboarding
              </h1>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search employees..."
                  className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <i className={`fas fa-search absolute right-3 top-3 ${
                  isDark ? 'text-gray-400' : 'text-gray-400'
                }`}></i>
              </div>
            </div>

            {isLoading ? (
              <div className={`rounded-lg shadow p-6 flex justify-center items-center h-64 ${
                isDark ? 'bg-slate-800' : 'bg-white'
              }`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className={`rounded-lg shadow p-6 flex justify-center items-center h-64 ${
                isDark ? 'bg-slate-800' : 'bg-white'
              }`}>
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No employees in onboarding process</p>
              </div>
            ) : (
              <div className={`rounded-lg shadow overflow-hidden ${
                isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
              }`}>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={isDark ? 'bg-slate-700' : 'bg-gray-50'}>
                    <tr>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Employee
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Start Date
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Status
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Progress
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDark ? 'bg-slate-800 divide-slate-700' : 'bg-white divide-gray-200'
                  }`}>
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id} className={isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className={`text-sm font-medium ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>{employee.name}</div>
                              <div className={`text-sm ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>{employee.position}</div>
                              <div className={`text-sm ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>{employee.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>{new Date(employee.startDate).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(employee.progress)}`}>
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`w-full rounded-full h-2.5 ${
                            isDark ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ width: `${employee.progress}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs mt-1 ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>{employee.progress}% Complete</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleCompleteOnboarding(employee.id)}
                            disabled={employee.progress === 100}
                            className={`px-3 py-1 rounded ${
                              employee.progress === 100 
                                ? isDark ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {employee.progress === 100 ? "Completed" : "Mark Complete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Onboarding; 