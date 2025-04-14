import React, { useState, useEffect, useContext } from "react";
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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
      
      // Fallback to sample data when API is not available
      console.log("Using sample employee data instead");
      const sampleEmployees = Array.from({ length: 50 }, (_, index) => ({
        id: index + 1,
        name: `Employee ${index + 1}`,
        department: `Department ${Math.floor(index/10) + 1}`,
        position: `Position ${Math.floor(index/5) + 1}`,
        email: `employee${index + 1}@example.com`,
        phone: `(555) ${100 + index}-${1000 + index}`,
        status: ['Active', 'On Leave', 'Terminated'][Math.floor(Math.random() * 3)],
        hire_date: new Date(2020, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      }));
      
      setEmployees(sampleEmployees);
      toast.info("Connected to sample data mode");
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

  // Function to determine status style based on status
  const getStatusStyle = (status) => {
    if (status === 'Active') {
      return isDark 
        ? "bg-green-900/30 text-green-400" 
        : "bg-green-200 text-green-800";
    } else if (status === 'On Leave') {
      return isDark 
        ? "bg-yellow-900/30 text-yellow-400" 
        : "bg-yellow-200 text-yellow-800";
    } else {
      return isDark 
        ? "bg-red-900/30 text-red-400" 
        : "bg-red-200 text-red-800";
    }
  };

  return (
    <div className="w-full">
      <ToastContainer position="top-right" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Staff Directory
        </h1>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
            }`}
          />
          <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
        </div>
      </div>

      {loading ? (
        <div className={`rounded-lg shadow p-6 flex justify-center items-center h-64 ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <>
          <div className={`rounded-lg shadow overflow-hidden ${
            isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
          }`}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDark ? 'bg-slate-700' : 'bg-gray-50'}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>ID</th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>Name</th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>Department</th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>Status</th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDark ? 'bg-slate-800 divide-slate-700' : 'bg-white divide-gray-200'
              }`}>
                {currentItems.map((employee) => (
                  <tr key={employee.id} className={isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {employee.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className={`text-sm font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>{employee.name}</div>
                          <div className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(employee.status)}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewEmployee(employee)}
                          className={`p-1.5 rounded-full ${
                            isDark ? 'text-blue-400 hover:bg-slate-700' : 'text-blue-600 hover:bg-gray-100'
                          }`}
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditEmployee(employee)}
                          className={`p-1.5 rounded-full ${
                            isDark ? 'text-yellow-400 hover:bg-slate-700' : 'text-yellow-600 hover:bg-gray-100'
                          }`}
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(employee)}
                          className={`p-1.5 rounded-full ${
                            isDark ? 'text-red-400 hover:bg-slate-700' : 'text-red-600 hover:bg-gray-100'
                          }`}
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <ReactPaginate
              previousLabel={"← Previous"}
              nextLabel={"Next →"}
              pageCount={pageCount}
              onPageChange={handlePageChange}
              forcePage={currentPage}
              containerClassName={`flex space-x-2 overflow-x-auto ${
                isDark ? 'text-gray-300' : 'text-gray-500'
              }`}
              pageClassName={`border rounded-md ${
                isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
              }`}
              previousClassName={`border rounded-md px-4 py-2 ${
                isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
              }`}
              nextClassName={`border rounded-md px-4 py-2 ${
                isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
              }`}
              pageLinkClassName="px-4 py-2 block"
              previousLinkClassName=""
              nextLinkClassName=""
              activeClassName={isDark ? 'bg-gray-700 text-white' : 'bg-green-600 text-white'}
              disabledClassName="opacity-50 cursor-not-allowed"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Employees;