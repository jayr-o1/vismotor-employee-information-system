import React, { useState, useEffect, useContext } from "react";
import Header from "../components/Layouts/Header";
import Sidebar from "../components/Layouts/Sidebar";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import apiService from "../services/api";
import { ThemeContext } from "../ThemeContext";

const Employees = () => {
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

  // Add ThemeContext
  const { isDarkMode } = useContext(ThemeContext);

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
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64">
        <Header />
        <ToastContainer position="top-right" />

        <main className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6 flex-1 mt-16 transition-colors duration-200`}>
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">Employee Directory</h1>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
              </div>
            </div>

            {loading ? (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 flex justify-center items-center h-64`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <>
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {currentItems.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.position}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              employee.status === "Active" 
                                ? "bg-green-100 text-green-800" 
                                : employee.status === "On Leave" 
                                ? "bg-yellow-100 text-yellow-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {employee.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onClick={() => handleViewEmployee(employee)} className="text-blue-500 hover:text-blue-700 mr-2">
                              <FaEye />
                            </button>
                            <button onClick={() => handleEditEmployee(employee)} className="text-blue-500 hover:text-blue-700 mr-2">
                              <FaEdit />
                            </button>
                            <button onClick={() => handleDeleteClick(employee)} className="text-red-500 hover:text-red-700">
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-6">
                  <ReactPaginate
                    previousLabel="← Previous"
                    nextLabel="Next →"
                    pageCount={pageCount}
                    onPageChange={handlePageChange}
                    containerClassName="flex justify-center items-center mt-6 space-x-1"
                    pageLinkClassName="px-3 py-2 rounded border border-gray-300 hover:bg-gray-100"
                    previousLinkClassName="px-3 py-2 rounded border border-gray-300 hover:bg-gray-100"
                    nextLinkClassName="px-3 py-2 rounded border border-gray-300 hover:bg-gray-100"
                    activeLinkClassName="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                    disabledLinkClassName="opacity-50 cursor-not-allowed"
                    breakClassName="px-3 py-2 rounded border border-gray-300"
                  />
                </div>
              </>
            )}
          </div>

          {/* View Employee Modal */}
          {viewModalOpen && currentEmployee && (
            <div className="fixed inset-0 flex items-center justify-center backdrop-filter backdrop-blur-md bg-gray-900/50 z-50">
              <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <h2 className="text-2xl font-semibold mb-4">Employee Details</h2>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{currentEmployee.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{currentEmployee.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Position</p>
                    <p className="font-medium">{currentEmployee.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{currentEmployee.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{currentEmployee.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">{currentEmployee.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hire Date</p>
                    <p className="font-medium">{currentEmployee.hire_date}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => setViewModalOpen(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Employee Modal */}
          {editModalOpen && currentEmployee && (
            <div className="fixed inset-0 flex items-center justify-center backdrop-filter backdrop-blur-md bg-gray-900/50 z-50">
              <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <h2 className="text-2xl font-semibold mb-4">Edit Employee</h2>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Position</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setEditModalOpen(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                    Cancel
                  </button>
                  <button onClick={handleUpdateEmployee} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteModalOpen && currentEmployee && (
            <div className="fixed inset-0 flex items-center justify-center backdrop-filter backdrop-blur-md bg-gray-900/50 z-50">
              <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <h2 className="text-2xl font-semibold mb-4">Confirm Delete</h2>
                <p className="mb-6">Are you sure you want to delete {currentEmployee.name}? This action cannot be undone.</p>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setDeleteModalOpen(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                    Cancel
                  </button>
                  <button onClick={handleDeleteEmployee} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Employees;