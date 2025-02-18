import React, { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const Employees = () => {
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [employees, setEmployees] = useState([
        { id: 1, name: 'James Smith', department: 'Engineering' },
        { id: 2, name: 'Sophia Lee', department: 'Marketing' },
        { id: 3, name: 'John Doe', department: 'HR' },
        { id: 4, name: 'Olivia Brown', department: 'Engineering' },
        { id: 5, name: 'Mason Johnson', department: 'Sales' },
        { id: 6, name: 'Emma Wilson', department: 'IT' },
        { id: 7, name: 'Liam Martinez', department: 'Liaison' },
        { id: 8, name: 'Noah Davis', department: 'CCA' },
        { id: 9, name: 'Ava Garcia', department: 'CNC' },
        { id: 10, name: 'Isabella Rodriguez', department: 'Accounting' },
    ]);

    const handleEdit = (id) => {
        // Implement edit functionality here
        console.log(`Edit employee with id: ${id}`);
    };

    const handleDelete = (id) => {
        setEmployees(employees.filter(employee => employee.id !== id));
    };

    const filteredEmployees = selectedDepartment
        ? employees.filter(employee => employee.department === selectedDepartment)
        : employees;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Employee List</h1>
            <label htmlFor="department-select" className="block mb-2">Filter by Department: </label>
            <select
                id="department-select"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="mb-4 p-2 border border-gray-300 rounded"
            >
                <option value="">All</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="IT">IT</option>
                <option value="Liaison">Liaison</option>
                <option value="CCA">CCA</option>
                <option value="CNC">CNC</option>
                <option value="Accounting">Accounting</option>
            </select>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="py-3 px-4 border-b text-left">ID</th>
                            <th className="py-3 px-4 border-b text-left">Name</th>
                            <th className="py-3 px-4 border-b text-left">Department</th>
                            <th className="py-3 px-4 border-b text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map(employee => (
                            <tr key={employee.id} className="hover:bg-gray-100">
                                <td className="py-3 px-4 border-b">{employee.id}</td>
                                <td className="py-3 px-4 border-b">{employee.name}</td>
                                <td className="py-3 px-4 border-b">{employee.department}</td>
                                <td className="py-3 px-4 border-b">
                                    <button
                                        onClick={() => handleEdit(employee.id)}
                                        className="text-blue-500 hover:text-blue-700 mr-2"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(employee.id)}
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
        </div>
    );
}

export default Employees;