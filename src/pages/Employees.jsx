import React, { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import ReactPaginate from 'react-paginate';
import 'react-toastify/dist/ReactToastify.css';
import './employee.css';


const Employees = () => {
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [employees, setEmployees] = useState([
        { id: 1, name: 'James Smith', department: 'Cashier', status: 'Active', reason: '' },
        { id: 2, name: 'Sophia Lee', department: 'Marketing', status: 'Active', reason: '' },
        { id: 3, name: 'John Doe', department: 'HR', status: 'Inactive', reason: 'Retired' },
        { id: 4, name: 'Olivia Brown', department: 'Cashier', status: 'Active', reason: '' },
        { id: 5, name: 'Mason Johnson', department: 'Sales', status: 'Inactive', reason: 'On Leave' },
        { id: 6, name: 'Emma Wilson', department: 'IT', status: 'Active', reason: '' },
        { id: 7, name: 'Liam Martinez', department: 'Liaison', status: 'Active', reason: '' },
        { id: 8, name: 'Noah Davis', department: 'CCA', status: 'Inactive', reason: 'Retired' },
        { id: 9, name: 'Ava Garcia', department: 'CNC', status: 'Active', reason: '' },
        { id: 10, name: 'Isabella Rodriguez', department: 'Accounting', status: 'Active', reason: '' },
        { id: 11, name: 'Ethan Clark', department: 'Cashier', status: 'Inactive', reason: 'On Leave' },
        { id: 12, name: 'Mia Turner', department: 'Marketing', status: 'Active', reason: '' },
        { id: 13, name: 'Lucas Walker', department: 'HR', status: 'Active', reason: '' },
        { id: 14, name: 'Amelia Harris', department: 'Sales', status: 'Inactive', reason: 'Retired' },
        { id: 15, name: 'Henry Young', department: 'IT', status: 'Active', reason: '' },
        { id: 16, name: 'Charlotte King', department: 'Liaison', status: 'Active', reason: '' },
        { id: 17, name: 'Alexander Scott', department: 'CCA', status: 'Inactive', reason: 'On Leave' },
        { id: 18, name: 'Grace Green', department: 'IT', status: 'Active', reason: '' },
        { id: 19, name: 'Benjamin Adams', department: 'Accounting', status: 'Inactive', reason: 'Retired' },
        { id: 20, name: 'Ella Baker', department: 'Cashier', status: 'Active', reason: '' },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

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
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="IT">IT</option>
                <option value="Liaison">Liaison</option>
                <option value="CCA">CCA</option>
                <option value="CNC">CNC</option>
                <option value="Accounting">Accounting</option>
                <option value="Cashier">Cashier</option>
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
                        <input
                            type="text"
                            value={currentEmployee.department}
                            onChange={(e) => setCurrentEmployee({ ...currentEmployee, department: e.target.value })}
                            className="mb-4 p-2 border border-gray-300 rounded w-full"
                        />
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
                                <label className="block mb-2">Reason for Inactivity:</label>
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