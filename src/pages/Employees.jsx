import React, { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import ReactPaginate from 'react-paginate';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/employee.css';

const Employees = () => {
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [employees, setEmployees] = useState([
        { id: 1, name: 'James Smith', department: 'Cashier', status: 'Active', reason: '', branch: 'Talamban' },
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
    const [currentPage, setCurrentPage] = useState(0);

    const departments = [...new Set(employees.map(employee => employee.department))];

    const handleEdit = (employee) => {
        setCurrentEmployee(employee);
        setIsModalOpen(true);
        toast.info(`Editing employee: ${employee.name}`);
    };

    const handleDelete = (id) => {
        const employee = employees.find(emp => emp.id === id);
        if (window.confirm(`Are you sure you want to delete employee: ${employee.name}?`)) {
            setEmployees(employees.filter(employee => employee.id !== id));
            toast.error(`Deleted employee: ${employee.name}`);
        }
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
        <div className="p-4">
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-4">Employee List</h1>
            <label htmlFor="department-select" className="block mb-2">Filter by Department: </label>
            <select
                id="department-select"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="mb-4 p-2 border border-gray-300 rounded"
            >
                <option value="">All</option>
                {departments.map(department => (
                    <option key={department} value={department}>{department}</option>
                ))}
            </select>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="py-3 px-4 border-b text-left">ID</th>
                            <th className="py-3 px-4 border-b text-left">Name</th>
                            <th className="py-3 px-4 border-b text-left">Department</th>
                            <th className="py-3 px-4 border-b text-left">Status</th>
                            <th className="py-3 px-4 border-b text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentEmployees.map(employee => (
                            <tr key={employee.id} className="hover:bg-gray-100 cursor-pointer" onClick={() => handleRowClick(employee)}>
                                <td className="py-3 px-4 border-b">{employee.id}</td>
                                <td className="py-3 px-4 border-b">{employee.name}</td>
                                <td className="py-3 px-4 border-b">{employee.department}</td>
                                <td className="py-3 px-4 border-b">
                                    <span className={`inline-block px-4 py-2 rounded-md shadow-lg text-white ${employee.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}>
                                        {employee.status}
                                    </span>
                                </td>
                                <td className="py-3 px-4 border-b">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(employee); }}
                                        className="text-blue-500 hover:text-blue-700 mr-2"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(employee.id); }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ReactPaginate
                previousLabel={'Previous'}
                nextLabel={'Next'}
                breakLabel={'...'}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName={'pagination'}
                activeClassName={'active'}
            />

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Edit Employee</h2>
                        <label className="block mb-2">Name:</label>
                        <input
                            type="text"
                            value={currentEmployee.name}
                            onChange={(e) => setCurrentEmployee({ ...currentEmployee, name: e.target.value })}
                            className="mb-4 p-2 border border-gray-300 rounded w-full"
                        />
                        <label className="block mb-2">Department:</label>
                        <select
                            value={currentEmployee.department}
                            onChange={(e) => setCurrentEmployee({ ...currentEmployee, department: e.target.value })}
                            className="mb-4 p-2 border border-gray-300 rounded w-full"
                        >
                            {departments.map(department => (
                                <option key={department} value={department}>{department}</option>
                            ))}
                        </select>
                        <label className="block mb-2">Status:</label>
                        <select
                            value={currentEmployee.status}
                            onChange={(e) => setCurrentEmployee({ ...currentEmployee, status: e.target.value })}
                            className="mb-4 p-2 border border-gray-300 rounded w-full"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        {currentEmployee.status === 'Inactive' && (
                            <>
                                <label className="block mb-2">Reason/s for Inactivity:</label>
                                <input
                                    type="text"
                                    value={currentEmployee.reason}
                                    onChange={(e) => setCurrentEmployee({ ...currentEmployee, reason: e.target.value })}
                                    className="mb-4 p-2 border border-gray-300 rounded w-full"
                                />
                            </>
                        )}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isInfoModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Employee Information</h2>
                        <p><strong>ID:</strong> {currentEmployee.id}</p>
                        <p><strong>Name:</strong> {currentEmployee.name}</p>
                        <p><strong>Department:</strong> {currentEmployee.department}</p>
                        <p><strong>Status:</strong> <span className={`inline-block px-4 py-2 rounded-md shadow-lg text-white ${currentEmployee.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}>{currentEmployee.status}</span></p>
                        {currentEmployee.status === 'Inactive' && (
                            <p><strong>Reason for Inactivity:</strong> {currentEmployee.reason}</p>
                        )}
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setIsInfoModalOpen(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Employees;