import React, { useState, useEffect, useContext } from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import ReactPaginate from 'react-paginate';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import apiService from "../services/api";
import { ThemeContext } from "../ThemeContext";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
// Import with ES module named imports style for Vite compatibility
import XLSX from 'xlsx/dist/xlsx.full.min.js';
import { saveAs } from 'file-saver/dist/FileSaver.min.js';

const Employees = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  
  // State management
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    position: "",
    email: "",
    phone: "",
    status: "Active"
  });

  // Pagination settings
  const itemsPerPage = 10;

  // Fetch data on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch employees from API
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if token exists
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("Authentication required. Please log in to view employee data.");
        setLoading(false);
        return;
      }
      
      const response = await apiService.employees.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError(`Failed to fetch employees: ${error.response?.data?.message || error.message}`);
      toast.error(`Failed to fetch employees: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee =>
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate page count for pagination
  const pageCount = Math.ceil(filteredEmployees.length / itemsPerPage);

  // Get current page items
  const currentItems = filteredEmployees.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Handle page change
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Navigate to employee details page
  const handleViewEmployee = (employee) => {
    navigate(`/employees/${employee.id}`);
  };

  // Open edit employee modal
  const handleEditEmployee = (employee) => {
    setCurrentEmployee(employee);
    setFormData({
      name: employee.name,
      department: employee.department,
      position: employee.position,
      email: employee.email,
      phone: employee.phone,
      status: employee.status
    });
    setEditModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (employee) => {
    setCurrentEmployee(employee);
    setDeleteModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file selection for profile picture
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("Selected file:", file.name, "type:", file.type, "size:", file.size);
      setSelectedFile(file);
    }
  };

  // Update employee
  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError("");

    try {
      const userId = currentEmployee.id;

      if (!userId) {
        throw new Error('Employee ID is required');
      }

      // Create employee data object with only necessary fields
      const updatedEmployee = {
        id: userId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        position: formData.position,
        department: formData.department,
        status: formData.status
      };

      // Only include these fields if they exist in the current employee
      if (currentEmployee.hire_date) {
        // Format the date as YYYY-MM-DD for MySQL
        if (typeof currentEmployee.hire_date === 'string' && currentEmployee.hire_date.includes('T')) {
          // If it's an ISO string, extract just the date part
          updatedEmployee.hire_date = currentEmployee.hire_date.split('T')[0];
        } else {
          updatedEmployee.hire_date = currentEmployee.hire_date;
        }
      }
      
      if (currentEmployee.salary) {
        updatedEmployee.salary = currentEmployee.salary;
      }

      // Keep existing profile picture if no new one is selected
      if (currentEmployee.profile_picture) {
        updatedEmployee.profile_picture = currentEmployee.profile_picture;
      }

      // Split the process: first update employee data
      console.log("Sending update with data:", JSON.stringify(updatedEmployee));
      
      // Use direct axios call to better handle the error
      const updateResponse = await axios.put(
        `http://10.10.1.71:5000/api/employees/${userId}`,
        updatedEmployee,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log("Employee update successful, response:", updateResponse.data);

      // Then, upload profile picture if selected (as a separate operation)
      if (selectedFile) {
        const formData = new FormData();
        formData.append('profilePicture', selectedFile);
        
        // Log form data contents for debugging
        console.log("Uploading file:", selectedFile.name, "type:", selectedFile.type, "size:", selectedFile.size);
        
        try {
          console.log("Starting profile picture upload for employee ID:", userId);
          const uploadResponse = await axios.post(
            `http://10.10.1.71:5000/api/employees/${userId}/profile-picture`,
            formData,
            { 
              headers: { 
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          console.log("Upload response:", uploadResponse.data);
          
          // Update the employee object with the new profile picture URL
          updatedEmployee.profile_picture = uploadResponse.data.profile_picture;
          
          // Force a refresh of the employee in the state
          setEmployees(prev => prev.map(emp => 
            emp.id === userId 
              ? {...emp, profile_picture: uploadResponse.data.profile_picture} 
              : emp
          ));
          
          toast.success('Profile picture uploaded successfully');
        } catch (uploadError) {
          console.error('Error uploading profile picture:', uploadError);
          console.error('Error details:', uploadError.response?.data || uploadError.message);
          toast.error(`Failed to upload profile picture: ${uploadError.response?.data?.message || uploadError.message}`);
          // Continue even if profile picture upload fails
        }
      }

      // Update employees state with the updated data
      setEmployees(employees.map(emp => emp.id === userId ? {...emp, ...updatedEmployee} : emp));
      setEditModalOpen(false);
      setSelectedFile(null);
      toast.success('Employee updated successfully');
    } catch (err) {
      console.error('Error updating employee:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update employee';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Delete employee
  const handleDeleteEmployee = async () => {
    try {
      await apiService.employees.delete(currentEmployee.id);

      
      
      // Remove the employee from the local state
      setEmployees(employees.filter(emp => emp.id !== currentEmployee.id));
      
      setDeleteModalOpen(false);
      toast.success("Employee deleted successfully!");
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to delete employee. Please try again.");
    }
  };

  // Export employees to Excel format grouped by department
  const exportEmployeesByDept = (employees) => {
    try {
      // Group employees by department
      const byDepartment = employees.reduce((acc, emp) => {
        const dept = emp.department || "Unassigned";
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(emp);
        return acc;
      }, {});

      // Create column headers (without profile_picture)
      const headers = [
        "DEPARTMENT", "id", "applicant_id", "name", "email", 
        "phone", "position", "department", "hire_date", "salary", "status"
      ];
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const wsData = [];
      
      // Add headers to worksheet data
      wsData.push(headers);
      
      // Add each department and its employees
      Object.entries(byDepartment).forEach(([dept, emps]) => {
        // Add department as a row
        const deptRow = [dept, "", "", "", "", "", "", "", "", "", ""];
        wsData.push(deptRow);
        
        // Add employee rows
        emps.forEach(emp => {
          const row = [
            "", // Empty first column
            emp.id || "",
            emp.applicant_id || "",
            emp.name || "",
            emp.email || "",
            emp.phone || "",
            emp.position || "",
            emp.department || "",
            emp.hire_date || "",
            emp.salary || "",
            emp.status || ""
          ];
          wsData.push(row);
        });
      });
      
      // Create worksheet from data
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Employees");
      
      // Generate Excel file and trigger download
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "EmployeeExport.xlsx");
      
      // Inform the user
      toast.success("Employee data exported successfully to Excel");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data: " + error.message);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header with search and export */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Employees</h1>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => exportEmployeesByDept(employees)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <i className="fas fa-file-csv mr-2"></i>
              Export Employee Data
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={handleSearchChange}
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
        </div>

        {/* Main content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className={`${isDark ? 'bg-[#232f46] border border-slate-700' : 'bg-white border border-gray-200'} rounded-xl shadow-md p-8 flex flex-col justify-center items-center h-64`}>
            <div className="text-red-500 text-5xl mb-4">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-center mb-2 font-semibold`}>
              Error Loading Data
            </p>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center`}>
              {error}
            </p>
            <button 
              onClick={fetchEmployees}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Employees Table */}
            <div className={`${isDark ? 'bg-[#232f46] border border-slate-700' : 'bg-white border border-gray-200'} rounded-xl shadow-md overflow-hidden mb-4`}>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className={isDark ? 'bg-slate-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-slate-300' : 'text-gray-500'
                      }`}>Name</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-slate-300' : 'text-gray-500'
                      }`}>Position</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-slate-300' : 'text-gray-500'
                      }`}>Department</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-slate-300' : 'text-gray-500'
                      }`}>Status</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-slate-300' : 'text-gray-500'
                      }`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDark ? 'divide-slate-700' : 'divide-gray-200'
                  }`}>
                    {currentItems.map(employee => (
                      <tr key={employee.id} className={isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="font-medium">{employee.name}</div>
                          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{employee.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{employee.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{employee.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            employee.status === 'Active' 
                              ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                              : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewEmployee(employee)}
                              className={`p-2 rounded-lg ${
                                isDark 
                                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                              } transition-colors duration-200`}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              onClick={() => handleEditEmployee(employee)}
                              className={`p-2 rounded-lg ${
                                isDark 
                                  ? 'bg-blue-700 hover:bg-blue-600 text-blue-300' 
                                  : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                              } transition-colors duration-200`}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(employee)}
                              className={`p-2 rounded-lg ${
                                isDark 
                                  ? 'bg-red-700 hover:bg-red-600 text-red-300' 
                                  : 'bg-red-100 hover:bg-red-200 text-red-600'
                              } transition-colors duration-200`}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-center my-4">
              <ReactPaginate
                previousLabel={<i className="fas fa-chevron-left"></i>}
                nextLabel={<i className="fas fa-chevron-right"></i>}
                breakLabel={"..."}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageChange}
                containerClassName={`flex items-center space-x-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                pageClassName={`px-3 py-1.5 rounded-md ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
                previousClassName={`px-3 py-1.5 rounded-md ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
                nextClassName={`px-3 py-1.5 rounded-md ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
                activeClassName={`bg-green-600 text-white hover:bg-green-700 ${isDark ? 'hover:text-white' : ''}`}
              />
            </div>
          </>
        )}
      </div>

      {/* Edit Employee Modal */}
      {editModalOpen && currentEmployee && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800/90 border border-slate-700' : 'bg-white/90 border border-gray-200'} p-6 rounded-xl shadow-lg max-w-md w-full backdrop-blur-md`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Edit Employee</h2>
              <button 
                onClick={() => setEditModalOpen(false)}
                className={`p-2 rounded-full ${
                  isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-200 text-gray-500'
                }`}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-green-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500'
                  } focus:outline-none focus:ring-2 focus:ring-green-500/40`}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-green-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500'
                  } focus:outline-none focus:ring-2 focus:ring-green-500/40`}
                  placeholder="Department"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Position
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-green-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500'
                  } focus:outline-none focus:ring-2 focus:ring-green-500/40`}
                  placeholder="Position"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-green-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500'
                  } focus:outline-none focus:ring-2 focus:ring-green-500/40`}
                  placeholder="Email address"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-green-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500'
                  } focus:outline-none focus:ring-2 focus:ring-green-500/40`}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-green-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                  } focus:outline-none focus:ring-2 focus:ring-green-500/40`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Attach profile image (optional)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full text-sm"
                />
                {selectedFile && (
                  <p className={`mt-1 text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    Selected file: {selectedFile.name}
                  </p>
                )}
                {uploading && (
                  <p className={`mt-1 text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    Uploading...
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                onClick={() => setEditModalOpen(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEmployee}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && currentEmployee && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800/90 border border-slate-700' : 'bg-white/90 border border-gray-200'} p-6 rounded-xl shadow-lg max-w-md w-full backdrop-blur-md`}>
            <h2 className="text-2xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete {currentEmployee.name} from the employee list? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEmployee}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Employees;