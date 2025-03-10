import React, { useState, useEffect, useContext } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import ReactPaginate from 'react-paginate';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/employee.css';
import { motion } from 'framer-motion';
import { ThemeContext } from '../ThemeContext';

const Employees = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [employees, setEmployees] = useState([
        { id: 1, name: 'James Smith', department: 'Cashier', status: 'Active', reason: '', branch: 'Talamban', role: 'Regular Employee' },
        { id: 2, name: 'Sophia Lee', department: 'Marketing', status: 'Active', reason: '', branch: 'Mandaue' },
        { id: 3, name: 'John Doe', department: 'HR', status: 'Inactive', reason: 'Retired', branch: 'Headoffice' },
        { id: 4, name: 'Olivia Brown', department: 'Cashier', status: 'Active', reason: '', branch: 'Bogo' },
        { id: 5, name: 'Mason Johnson', department: 'Sales', status: 'Inactive', reason: 'On Leave', branch: 'Talamban' },
        { id: 6, name: 'Emma Wilson', department: 'IT', status: 'Active', reason: '', branch: 'Mandaue' },
        { id: 7, name: 'Liam Martinez', department: 'Liaison', status: 'Active', reason: '', branch: 'Headoffice' },
        { id: 8, name: 'Noah Davis', department: 'CCA', status: 'Inactive', reason: 'Retired', branch: 'Bogo' },
        { id: 9, name: 'Ava Garcia', department: 'CNC', status: 'Active', reason: '', branch: 'Talamban' },
        { id: 10, name: 'Isabella Rodriguez', department: 'Accounting', status: 'Active', reason: '', branch: 'Mandaue' },
        { id: 11, name: 'Ethan Clark', department: 'Cashier', status: 'Inactive', reason: 'On Leave', branch: 'Headoffice' },
        { id: 12, name: 'Mia Turner', department: 'Marketing', status: 'Active', reason: '', branch: 'Bogo' },
        { id: 13, name: 'Lucas Walker', department: 'HR', status: 'Active', reason: '', branch: 'Talamban' },
        { id: 14, name: 'Amelia Harris', department: 'Sales', status: 'Inactive', reason: 'Retired', branch: 'Mandaue' },
        { id: 15, name: 'Henry Young', department: 'IT', status: 'Active', reason: '', branch: 'Headoffice' },
        { id: 16, name: 'Charlotte King', department: 'Liaison', status: 'Active', reason: '', branch: 'Bogo' },
        { id: 17, name: 'Alexander Scott', department: 'CCA', status: 'Inactive', reason: 'On Leave', branch: 'Talamban' },
        { id: 18, name: 'Grace Green', department: 'IT', status: 'Active', reason: '', branch: 'Mandaue' },
        { id: 19, name: 'Benjamin Adams', department: 'Accounting', status: 'Inactive', reason: 'Retired', branch: 'Headoffice' },
        { id: 20, name: 'Ella Baker', department: 'Cashier', status: 'Active', reason: '', branch: 'Bogo' },
        { id: 21, name: 'David Johnson', department: 'Sales', status: 'Active', reason: '', branch: 'Talamban' },
        { id: 22, name: 'Sophia Brown', department: 'Marketing', status: 'Active', reason: '', branch: 'Mandaue' },
        { id: 23, name: 'Michael White', department: 'HR', status: 'Active', reason: '', branch: 'Headoffice' },
        { id: 24, name: 'Emily Davis', department: 'Cashier', status: 'Active', reason: '', branch: 'Bogo' },
        { id: 25, name: 'Daniel Wilson', department: 'Sales', status: 'Active', reason: '', branch: 'Talamban' },
        { id: 26, name: 'Emma Moore', department: 'IT', status: 'Active', reason: '', branch: 'Mandaue' },
        { id: 27, name: 'James Taylor', department: 'Liaison', status: 'Active', reason: '', branch: 'Headoffice' },
        { id: 28, name: 'Olivia Anderson', department: 'CCA', status: 'Active', reason: '', branch: 'Bogo' },
        { id: 29, name: 'Liam Thomas', department: 'CNC', status: 'Active', reason: '', branch: 'Talamban' },
        { id: 30, name: 'Sophia Jackson', department: 'Accounting', status: 'Active', reason: '', branch: 'Mandaue' },
        { id: 31, name: 'John Harris', department: 'Cashier', status: 'Active', reason: '', branch: 'Headoffice' },
        { id: 32, name: 'Mia Martin', department: 'Marketing', status: 'Active', reason: '', branch: 'Bogo' },
        { id: 33, name: 'Lucas Thompson', department: 'HR', status: 'Active', reason: '', branch: 'Talamban' },
        { id: 34, name: 'Amelia Garcia', department: 'Sales', status: 'Active', reason: '', branch: 'Mandaue' },
        { id: 35, name: 'Henry Martinez', department: 'IT', status: 'Active', reason: '', branch: 'Headoffice' },
        { id: 36, name: 'Charlotte Robinson', department: 'Liaison', status: 'Active', reason: '', branch: 'Bogo' },
        { id: 37, name: 'Alexander Clark', department: 'CCA', status: 'Active', reason: '', branch: 'Talamban' },
        { id: 38, name: 'Grace Rodriguez', department: 'IT', status: 'Active', reason: '', branch: 'Mandaue' },
        { id: 39, name: 'Benjamin Lewis', department: 'Accounting', status: 'Active', reason: '', branch: 'Headoffice' },
        { id: 40, name: 'Ella Lee', department: 'Cashier', status: 'Active', reason: '', branch: 'Bogo' },
        { id: 41, name: 'David Walker', department: 'Sales', status: 'Active', reason: '', branch: 'Talamban' },
        { id: 42, name: 'Sophia Hall', department: 'Marketing', status: 'Active', reason: '', branch: 'Mandaue' },
        { id: 43, name: 'Michael Allen', department: 'HR', status: 'Active', reason: '', branch: 'Headoffice' },
        { id: 44, name: 'Emily Young', department: 'Cashier', status: 'Active', reason: '', branch: 'Bogo' },
        { id: 45, name: 'Daniel Hernandez', department: 'Sales', status: 'Active', reason: '', branch: 'Talamban' },
        { id: 46, name: 'Emma King', department: 'IT', status: 'Active', reason: '', branch: 'Mandaue' },
        { id: 47, name: 'James Wright', department: 'Liaison', status: 'Active', reason: '', branch: 'Headoffice' },
        { id: 48, name: 'Olivia Lopez', department: 'CCA', status: 'Active', reason: '', branch: 'Bogo' },
        { id: 49, name: 'Liam Hill', department: 'CNC', status: 'Active', reason: '', branch: 'Talamban' },
        { id: 50, name: 'Sophia Scott', department: 'Accounting', status: 'Active', reason: '', branch: 'Mandaue' },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    // New state to force re-render every second for the countdown effect
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const departments = [...new Set(employees.map(employee => employee.department))];

    const calculateHoursRemaining = (employee) => {
        if (
            !employee ||
            employee.role !== 'Intern' ||
            !employee.startingDate ||
            !employee.hoursNeeded ||
            !employee.daysOff
        )
            return "00:00:00";
        const start = new Date(employee.startingDate);
        const now = currentTime;
        const diffInMs = now - start;
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        const weeks = diffInDays / 7;
        const effectiveWorkingDaysPerWeek = 7 - parseInt(employee.daysOff, 10);
        const workedDays = weeks * effectiveWorkingDaysPerWeek;
        const workedHours = workedDays * 8;
        let remaining = employee.hoursNeeded - workedHours;
        if (remaining <= 0) return "00:00:00";
        const hrs = Math.floor(remaining);
        const min = Math.floor((remaining - hrs) * 60);
        const sec = Math.floor((((remaining - hrs) * 60) - min) * 60);
        // Pad with leading zeros if needed.
        const formattedHrs = String(hrs).padStart(2, '0');
        const formattedMin = String(min).padStart(2, '0');
        const formattedSec = String(sec).padStart(2, '0');
        return `${formattedHrs}:${formattedMin}:${formattedSec}`;
    };

    const handleEdit = (employee) => {
        // Add a default role in case it is missing
        if (!employee.role) {
            employee.role = 'Regular Employee';
        }
        setCurrentEmployee(employee);
        setIsModalOpen(true);
        toast.info(`Editing employee: ${employee.name}`);
    };

    const handleDelete = (id) => {
        const employee = employees.find(emp => emp.id === id);
        setEmployeeToDelete(employee);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setEmployees(employees.filter(employee => employee.id !== employeeToDelete.id));
        toast.error(`Deleted employee: ${employeeToDelete.name}`);
        setIsDeleteModalOpen(false);
    };

    const handleSave = () => {
        setEmployees(employees.map(emp => (emp.id === currentEmployee.id ? currentEmployee : emp)));
        setIsModalOpen(false);
        toast.success(`Saved changes for employee: ${currentEmployee.name}`);
    };

    const handleRowClick = (employee) => {
        setCurrentEmployee(employee);
        setIsInfoModalOpen(true);
    };

    const filteredEmployees = selectedDepartment
        ? employees.filter(employee => employee.department === selectedDepartment)
        : employees;

    const employeesPerPage = 5;
    const pageCount = Math.ceil(filteredEmployees.length / employeesPerPage);
    const offset = currentPage * employeesPerPage;
    const currentEmployees = filteredEmployees.slice(offset, offset + employeesPerPage);

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    return (
        <div className={`p-4 transition-colors duration-200 ${isDarkMode ? 'dark:bg-gray-900 dark:text-white' : 'bg-white text-black'}`}>
            <ToastContainer 
                theme="colored"
                position="top-right"
                autoClose={3000}
            />
            <motion.h1
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-2xl font-bold mb-4"
            >
                Employee List
            </motion.h1>
            <motion.label
                htmlFor="department-select"
                className="block mb-2"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                Filter by Department:
            </motion.label>
            <motion.select
                id="department-select"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className={`mb-4 p-2 border rounded ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : 'bg-white border-gray-300 text-black'}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <option value="">All</option>
                {departments.map(department => (
                    <option key={department} value={department}>{department}</option>
                ))}
            </motion.select>

            <div className="overflow-x-auto">
                <motion.table
                    className={`min-w-full border rounded-lg shadow-md transition-colors duration-200 ${isDarkMode ? 'dark:bg-gray-800 dark:border-gray-700' : 'bg-white border-gray-300'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <thead className={`${isDarkMode ? 'dark:bg-gray-700' : 'bg-gray-200'}`}>
                        <tr>
                            <th className={`py-3 px-4 border-b text-left ${isDarkMode ? 'dark:text-gray-200 dark:border-gray-600' : 'text-black border-gray-300'}`}>ID</th>
                            <th className={`py-3 px-4 border-b text-left ${isDarkMode ? 'dark:text-gray-200 dark:border-gray-600' : 'text-black border-gray-300'}`}>Name</th>
                            <th className={`py-3 px-4 border-b text-left ${isDarkMode ? 'dark:text-gray-200 dark:border-gray-600' : 'text-black border-gray-300'}`}>Department</th>
                            <th className={`py-3 px-4 border-b text-left ${isDarkMode ? 'dark:text-gray-200 dark:border-gray-600' : 'text-black border-gray-300'}`}>Status</th>
                            <th className={`py-3 px-4 border-b text-left ${isDarkMode ? 'dark:text-gray-200 dark:border-gray-600' : 'text-black border-gray-300'}`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentEmployees.map(employee => (
                            <motion.tr
                                key={employee.id}
                                className={`hover:bg-gray-100 cursor-pointer ${isDarkMode ? 'dark:hover:bg-gray-700 dark:text-gray-200' : 'hover:bg-gray-200 text-black'}`}
                                onClick={() => handleRowClick(employee)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <td className={`py-3 px-4 border-b ${isDarkMode ? 'dark:border-gray-600' : 'border-gray-300'}`}>{employee.id}</td>
                                <td className={`py-3 px-4 border-b ${isDarkMode ? 'dark:border-gray-600' : 'border-gray-300'}`}>{employee.name}</td>
                                <td className={`py-3 px-4 border-b ${isDarkMode ? 'dark:border-gray-600' : 'border-gray-300'}`}>{employee.department}</td>
                                <td className={`py-3 px-4 border-b ${isDarkMode ? 'dark:border-gray-600' : 'border-gray-300'}`}>
                                    <span className={`inline-block px-4 py-2 rounded-md shadow-lg text-white ${employee.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}>
                                        {employee.status}
                                    </span>
                                </td>
                                <td className={`py-3 px-4 border-b ${isDarkMode ? 'dark:border-gray-600' : 'border-gray-300'}`}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(employee); }}
                                        className={`mr-2 ${isDarkMode ? 'dark:text-blue-400 dark:hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(employee.id); }}
                                        className={`mr-2 ${isDarkMode ? 'dark:text-red-400 dark:hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </motion.table>
            </div>

            <ReactPaginate
                previousLabel={'Previous'}
                nextLabel={'Next'}
                breakLabel={'...'}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName={`pagination ${isDarkMode ? 'dark:pagination-dark' : ''}`}
                activeClassName={`active ${isDarkMode ? 'dark:active-dark' : ''}`}
            />

            {isModalOpen && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-sm dark:bg-opacity-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className={`bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto ${isDarkMode ? 'dark:bg-gray-800 dark:text-white' : 'bg-white text-black'}`}>
                        <h2 className="text-xl font-bold mb-4">Edit Employee</h2>
                        <label className="block mb-2">Name:</label>
                        <input
                            type="text"
                            value={currentEmployee?.name || ''}
                            onChange={(e) => setCurrentEmployee({ ...currentEmployee, name: e.target.value })}
                            className={`mb-4 p-2 border rounded w-full ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : 'bg-white border-gray-300 text-black'}`}
                        />
                        <label className="block mb-2">Department:</label>
                        <select
                            value={currentEmployee?.department || ''}
                            onChange={(e) => setCurrentEmployee({ ...currentEmployee, department: e.target.value })}
                            className={`mb-4 p-2 border rounded w-full ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : 'bg-white border-gray-300 text-black'}`}
                        >
                            {departments.map(department => (
                                <option key={department} value={department}>{department}</option>
                            ))}
                        </select>
                        <label className="block mb-2">Status:</label>
                        <select
                            value={currentEmployee?.status || ''}
                            onChange={(e) => setCurrentEmployee({ ...currentEmployee, status: e.target.value })}
                            className={`mb-4 p-2 border rounded w-full ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : 'bg-white border-gray-300 text-black'}`}
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        {/* New Role Field */}
                        <label className="block mb-2">Role:</label>
                        <select
                            value={currentEmployee?.role || 'Regular Employee'}
                            onChange={(e) => setCurrentEmployee({ ...currentEmployee, role: e.target.value })}
                            className={`mb-4 p-2 border rounded w-full ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : 'bg-white border-gray-300 text-black'}`}
                        >
                            <option value="Regular Employee">Regular Employee</option>
                            <option value="Intern">Intern</option>
                        </select>
                        {/* Intern specific fields */}
                        {currentEmployee?.role === 'Intern' && (
                            <>
                                <label className="block mb-2">Starting Date:</label>
                                <input
                                    type="date"
                                    value={currentEmployee?.startingDate || ''}
                                    onChange={(e) => setCurrentEmployee({ ...currentEmployee, startingDate: e.target.value })}
                                    className={`mb-4 p-2 border rounded w-full ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : 'bg-white border-gray-300 text-black'}`}
                                />
                                <label className="block mb-2">Hours Needed:</label>
                                <input
                                    type="number"
                                    value={currentEmployee?.hoursNeeded || ''}
                                    onChange={(e) => setCurrentEmployee({ ...currentEmployee, hoursNeeded: e.target.value })}
                                    className={`mb-4 p-2 border rounded w-full ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : 'bg-white border-gray-300 text-black'}`}
                                />
                                <label className="block mb-2">Days Off per Week:</label>
                                <input
                                    type="number"
                                    value={currentEmployee?.daysOff || ''}
                                    onChange={(e) => setCurrentEmployee({ ...currentEmployee, daysOff: e.target.value })}
                                    className={`mb-4 p-2 border rounded w-full ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : 'bg-white border-gray-300 text-black'}`}
                                />
                                <p className="mb-4">Hours Remaining: {calculateHoursRemaining(currentEmployee)}</p>
                            </>
                        )}
                        {currentEmployee?.status === 'Inactive' && (
                            <>
                                <label className="block mb-2">Reason/s for Inactivity:</label>
                                <input
                                    type="text"
                                    value={currentEmployee?.reason || ''}
                                    onChange={(e) => setCurrentEmployee({ ...currentEmployee, reason: e.target.value })}
                                    className={`mb-4 p-2 border rounded w-full ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : 'bg-white border-gray-300 text-black'}`}
                                />
                            </>
                        )}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {isInfoModalOpen && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-sm dark:bg-opacity-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className={`bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto ${isDarkMode ? 'dark:bg-gray-800 dark:text-white' : 'bg-white text-black'}`}>
                        <h2 className="text-xl font-bold mb-4">Employee Information</h2>
                        <p><strong>ID:</strong> {currentEmployee?.id}</p>
                        <p><strong>Name:</strong> {currentEmployee?.name}</p>
                        <p><strong>Department:</strong> {currentEmployee?.department}</p>
                        <p><strong>Branch:</strong> {currentEmployee?.branch}</p>
                        <p><strong>Status:</strong> <span className={`inline-block px-4 py-2 rounded-md shadow-lg text-white ${currentEmployee?.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}>{currentEmployee?.status}</span></p>
                        <p><strong>Role:</strong> {currentEmployee?.role || 'Regular Employee'}</p>
                        {currentEmployee?.role === 'Intern' && (
                            <p><strong>Hours Remaining:</strong> {calculateHoursRemaining(currentEmployee)}</p>
                        )}
                        {currentEmployee?.status === 'Inactive' && (
                            <p><strong>Reason for Inactivity:</strong> {currentEmployee?.reason}</p>
                        )}
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setIsInfoModalOpen(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {isDeleteModalOpen && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-sm dark:bg-opacity-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className={`bg-white p-6 rounded-lg shadow-lg w-full max-w-md ${isDarkMode ? 'dark:bg-gray-800 dark:text-white' : 'bg-white text-black'}`}>
                        <h2 className="text-xl font-bold mb-4">Delete Employee</h2>
                        <p>Are you sure you want to delete employee: <strong>{employeeToDelete?.name}</strong>?</p>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default Employees;