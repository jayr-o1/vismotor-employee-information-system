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
    <div className={`min-h-screen ${isDark ? 'bg-[#1B2537] text-white' : 'bg-gray-50 text-gray-800'}`}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto p-4 pt-2">
        {/* Header with search */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Employees</h1>
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

        {/* Main content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
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
                activeClassName={`${isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}
                disabledClassName={"text-gray-400 cursor-not-allowed"}
              />
            </div>
          </>
        )}
      </div>

      {/* View Employee Modal */}
      {viewModalOpen && currentEmployee && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800/90 border border-slate-700' : 'bg-white/90 border border-gray-200'} p-6 rounded-xl shadow-lg max-w-md w-full backdrop-blur-md`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Employee Details</h2>
              <button 
                onClick={() => setViewModalOpen(false)}
                className={`p-2 rounded-full ${
                  isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-200 text-gray-500'
                }`}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Name</h3>
                <p className="font-medium">{currentEmployee.name}</p>
              </div>
              <div>
                <h3 className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Position</h3>
                <p className="font-medium">{currentEmployee.position}</p>
              </div>
              <div>
                <h3 className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Department</h3>
                <p className="font-medium">{currentEmployee.department}</p>
              </div>
              <div>
                <h3 className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</h3>
                <p className="font-medium">{currentEmployee.email}</p>
              </div>
              <div>
                <h3 className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Phone</h3>
                <p className="font-medium">{currentEmployee.phone}</p>
              </div>
              <div>
                <h3 className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</h3>
                <p className={`inline-block px-2 py-1 rounded-full text-sm font-semibold ${
                  currentEmployee.status === 'Active' 
                    ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                    : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                }`}>
                  {currentEmployee.status}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark 
                      ? 'bg-slate-700/80 border-slate-600 text-white' 
                      : 'bg-white/80 border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Position</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark 
                      ? 'bg-slate-700/80 border-slate-600 text-white' 
                      : 'bg-white/80 border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark 
                      ? 'bg-slate-700/80 border-slate-600 text-white' 
                      : 'bg-white/80 border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark 
                      ? 'bg-slate-700/80 border-slate-600 text-white' 
                      : 'bg-white/80 border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark 
                      ? 'bg-slate-700/80 border-slate-600 text-white' 
                      : 'bg-white/80 border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDark 
                      ? 'bg-slate-700/80 border-slate-600 text-white' 
                      : 'bg-white/80 border-gray-300 text-gray-800'
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
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
    </div>
  );
};

export default Employees;