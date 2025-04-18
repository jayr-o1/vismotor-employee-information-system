import React, { useState, useEffect, useContext } from "react";
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
  const [refreshData, setRefreshData] = useState(false);

  // Fetch employees with Accepted status (in onboarding process)
  useEffect(() => {
    const fetchOnboardingEmployees = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.employees.getAll();
        console.log("Fetched employees data:", response.data);
        
        // Process the data to add progress percentages
        const processedEmployees = response.data.map(employee => {
          if (employee.status === "Completed") {
            return {
              ...employee,
              startDate: employee.hire_date,
              status: "Completed",
              progress: 100
            };
          }
          
          let progress = 0;
          const hireDate = new Date(employee.hire_date);
          const daysSinceHire = Math.floor((Date.now() - hireDate) / (1000 * 60 * 60 * 24));
          
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
            startDate: employee.hire_date,
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
  }, [refreshData]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredEmployees = employees.filter(employee => 
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCompleteOnboarding = async (id) => {
    try {
      console.log("Marking onboarding as complete for employee ID:", id);
      
      await apiService.employees.update(id, { 
        status: "Completed"
      });
      
      const response = await apiService.employees.getById(id);
      console.log("Updated employee data:", response.data);
      
      setEmployees(employees.map(emp => 
        emp.id === id ? { ...emp, status: "Completed", progress: 100 } : emp
      ));
      
      toast.success("Onboarding marked as complete!");
      setRefreshData(prev => !prev);
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        toast.error(`Failed to update: ${error.response.data.message || error.message}`);
      } else {
        toast.error("Failed to update onboarding status");
      }
    }
  };

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
    <div className={`min-h-screen ${isDark ? 'bg-[#1B2537] text-white' : 'bg-gray-50 text-gray-800'}`}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto p-4 pt-2">
        {/* Header with search */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Employee Onboarding</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={handleSearch}
              className={`pl-10 pr-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            <div className="absolute left-3 top-2.5">
              <i className={`fas fa-search ${isDark ? 'text-gray-400' : 'text-gray-500'}`}></i>
            </div>
          </div>
        </div>

        {/* Main content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className={`${isDark ? 'bg-[#232f46] border border-slate-700' : 'bg-white border border-gray-200'} rounded-xl shadow-md p-6 flex justify-center items-center h-64`}>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No employees in onboarding process
            </p>
          </div>
        ) : (
          <div className={`${isDark ? 'bg-[#232f46] border border-slate-700' : 'bg-white border border-gray-200'} rounded-xl shadow-md overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className={isDark ? 'bg-slate-800/50' : 'bg-gray-50'}>
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
                <tbody className={isDark ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className={`${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } transition-colors duration-150`}>
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
                          isDark ? 'text-gray-300' : 'text-gray-900'
                        }`}>{new Date(employee.startDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(employee.progress)}`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`w-full ${
                          isDark ? 'bg-gray-700' : 'bg-gray-200'
                        } rounded-full h-2.5`}>
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${employee.progress}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        } mt-1`}>{employee.progress}% Complete</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleCompleteOnboarding(employee.id)}
                          disabled={employee.progress === 100}
                          className={`px-3 py-1 rounded transition-colors duration-150 ${
                            employee.progress === 100 
                              ? isDark 
                                ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {employee.progress === 100 ? "Completed" : "Complete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding; 