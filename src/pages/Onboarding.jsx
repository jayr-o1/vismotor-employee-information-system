import React, { useState, useEffect } from "react";
import Header from "../components/Layouts/Header";
import Sidebar from "../components/Layouts/Sidebar";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from "react-toastify";
import apiService from "../services/api";

const Onboarding = () => {
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
    if (progress < 40) return "bg-red-200 text-red-800";
    if (progress < 75) return "bg-yellow-200 text-yellow-800";
    return "bg-green-200 text-green-800";
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64">
        <Header />
        <ToastContainer position="top-right" />

        <main className="bg-gray-100 p-6 flex-1 mt-16">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">Employee Onboarding</h1>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
              </div>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center h-64">
                <p className="text-gray-500">No employees in onboarding process</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                              <div className="text-sm text-gray-500">{employee.position}</div>
                              <div className="text-sm text-gray-500">{employee.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(employee.startDate).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(employee.progress)}`}>
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ width: `${employee.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">{employee.progress}% Complete</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleCompleteOnboarding(employee.id)}
                            disabled={employee.progress === 100}
                            className={`px-3 py-1 rounded ${
                              employee.progress === 100 
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Onboarding; 