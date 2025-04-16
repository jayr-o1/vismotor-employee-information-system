import React, { useState, useEffect, useContext } from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import ReactPaginate from 'react-paginate';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import apiService from "../services/api";
import { ThemeContext } from "../ThemeContext";

const Employees = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  // State management
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
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
    try {
      const response = await apiService.employees.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees. Please check your connection or contact support.");
      setEmployees([]);
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

  // Open view employee modal
  const handleViewEmployee = (employee) => {
    setCurrentEmployee(employee);
    setViewModalOpen(true);
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

  // Update employee
  const handleUpdateEmployee = async () => {
    try {
      await apiService.employees.update(currentEmployee.id, formData);
      
      // Update the local state
      setEmployees(employees.map(emp => 
        emp.id === currentEmployee.id ? { ...emp, ...formData } : emp
      ));
      
      setEditModalOpen(false);
      toast.success("Employee updated successfully!");
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to update employee. Please try again.");
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

  return (
    <div className={`w-full min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <ToastContainer 
        position="top-right"
        theme={isDark ? 'dark' : 'light'}
      />
      <main className="p-6 flex-1 mt-16 transition-colors duration-200">
        <div className="container mx-auto">
          {/* Header Section */}
          <div className={`flex justify-between items-center mb-6 p-4 rounded-lg shadow-sm ${
            isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
          }`}>
            <h1 className={`text-2xl font-semibold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
              Employees
            </h1>
            <div className="flex space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search employees..."
                  className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark 
                      ? 'bg-slate-700 text-slate-50 border-slate-600 placeholder-slate-400' 
                      : 'bg-white text-slate-900 border-gray-300 placeholder-gray-400'
                  }`}
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <i className={`fas fa-search absolute right-3 top-3 ${
                  isDark ? 'text-slate-400' : 'text-gray-400'
                }`}></i>
              </div>
              <button
                onClick={() => setEditModalOpen(true)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isDark 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white transition-colors duration-200`}
              >
                <i className="fas fa-plus"></i>
                <span>Add Employee</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          {loading ? (
            <div className={`flex justify-center items-center h-64 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className={`rounded-lg shadow-sm overflow-hidden ${
              isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
            }`}>
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
                    {currentItems.map((employee) => (
                      <tr key={employee.id} className={`${
                        isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'
                      } transition-colors duration-150`}>
                        <td className={`px-6 py-4 whitespace-nowrap ${
                          isDark ? 'text-slate-50' : 'text-slate-900'
                        }`}>{employee.name}</td>
                        <td className={`px-6 py-4 whitespace-nowrap ${
                          isDark ? 'text-slate-300' : 'text-gray-500'
                        }`}>{employee.position}</td>
                        <td className={`px-6 py-4 whitespace-nowrap ${
                          isDark ? 'text-slate-300' : 'text-gray-500'
                        }`}>{employee.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            employee.status === 'Active' 
                              ? isDark 
                                ? 'bg-green-900/30 text-green-400' 
                                : 'bg-green-100 text-green-800'
                              : isDark 
                                ? 'bg-yellow-900/30 text-yellow-400' 
                                : 'bg-yellow-100 text-yellow-800'
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
          )}
        </div>
      </main>

      {/* View Modal */}
      {viewModalOpen && currentEmployee && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-filter backdrop-blur-md bg-gray-900/50 z-50">
          <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full ${isDark ? 'text-white' : 'text-gray-800'}`}>
            <h2 className="text-2xl font-semibold mb-4">Employee Details</h2>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Name</label>
                <p className="text-lg">{currentEmployee.name}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Position</label>
                <p className="text-lg">{currentEmployee.position}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Department</label>
                <p className="text-lg">{currentEmployee.department}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email</label>
                <p className="text-lg">{currentEmployee.email}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Phone</label>
                <p className="text-lg">{currentEmployee.phone}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Status</label>
                <p className="text-lg">{currentEmployee.status}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setViewModalOpen(false)}
                className={`px-4 py-2 rounded ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && currentEmployee && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-filter backdrop-blur-md bg-gray-900/50 z-50">
          <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full ${isDark ? 'text-white' : 'text-gray-800'}`}>
            <h2 className="text-2xl font-semibold mb-4">Edit Employee</h2>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Position</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className={`px-4 py-2 rounded ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEmployee}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && currentEmployee && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-filter backdrop-blur-md bg-gray-900/50 z-50">
          <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full ${isDark ? 'text-white' : 'text-gray-800'}`}>
            <h2 className="text-2xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete {currentEmployee.name}? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className={`px-4 py-2 rounded ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEmployee}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;