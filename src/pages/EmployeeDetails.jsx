import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft } from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";
import apiService from "../services/api";
import { ThemeContext } from "../ThemeContext";
import defaultAvatar from "../assets/default-avatar.png";
import { mockEmployees } from "../mocks/employeeData";

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      setLoading(true);
      try {
        // Check if token exists
        const token = localStorage.getItem("userToken");
        if (!token) {
          console.warn("No authentication token found. Using mock data.");
          const mockEmployee = mockEmployees.find(emp => emp.id === parseInt(id));
          if (mockEmployee) {
            setEmployee(mockEmployee);
          } else {
            toast.error("Employee not found in mock data.");
          }
          setLoading(false);
          return;
        }
        
        const response = await apiService.employees.getById(id);
        setEmployee(response.data);
      } catch (error) {
        console.error("Error fetching employee details:", error);
        toast.error("Failed to fetch employee details. Using mock data for development.");
        
        // Use mock data when API fails
        const mockEmployee = mockEmployees.find(emp => emp.id === parseInt(id));
        if (mockEmployee) {
          setEmployee(mockEmployee);
        } else {
          toast.error("Employee not found in mock data.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeDetails();
  }, [id]);

  const handleGoBack = () => {
    navigate("/employees");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} p-4`}>
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={handleGoBack}
            className={`flex items-center px-4 py-2 mb-4 rounded-lg ${
              isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <FaArrowLeft className="mr-2" /> Back to Employees
          </button>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Employee not found or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} p-4`}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={handleGoBack}
          className={`flex items-center px-4 py-2 mb-4 rounded-lg ${
            isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          <FaArrowLeft className="mr-2" /> Back to Employees
        </button>
        
        <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-md overflow-hidden`}>
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Employee Details</h1>
            
            <div className="flex flex-col md:flex-row">
              {/* Profile and Details - Left column */}
              <div className="w-full md:w-2/3 pr-0 md:pr-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
                  {/* Profile Picture */}
                  <div className="w-32 h-32 mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
                    <img 
                      src={employee.profilePicture || defaultAvatar} 
                      alt={employee.name} 
                      className="w-full h-full object-cover rounded-full border-4 border-green-500"
                    />
                  </div>
                  
                  {/* Name and Position */}
                  <div>
                    <h2 className="text-3xl font-bold">{employee.name}</h2>
                    <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {employee.position}
                    </p>
                    <div className={`inline-block px-3 py-1 mt-2 rounded-full text-sm font-semibold ${
                      employee.status === 'Active' 
                        ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                        : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status}
                    </div>
                  </div>
                </div>
                
                {/* Employee Details */}
                <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} p-6 rounded-xl mt-6`}>
                  <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                      <p className="font-medium">{employee.email}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                      <p className="font-medium">{employee.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} p-6 rounded-xl mt-6`}>
                  <h3 className="text-xl font-semibold mb-4">Employment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Department</p>
                      <p className="font-medium">{employee.department}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Hire Date</p>
                      <p className="font-medium">{new Date(employee.hire_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Employee ID</p>
                      <p className="font-medium">EMP-{employee.id.toString().padStart(4, '0')}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* QR Code - Right column */}
              <div className="w-full md:w-1/3 mt-6 md:mt-0">
                <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} p-6 rounded-xl h-full flex flex-col items-center justify-center`}>
                  <h3 className="text-xl font-semibold mb-6 text-center">Employee ID Card</h3>
                  <div className={`p-4 bg-white rounded-xl shadow-md`}>
                    <QRCodeSVG 
                      value={JSON.stringify({
                        id: employee.id,
                        name: employee.name,
                        position: employee.position,
                        department: employee.department,
                        employeeId: `EMP-${employee.id.toString().padStart(4, '0')}`
                      })} 
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="mt-4 text-center text-sm">
                    Scan to view employee details
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails; 