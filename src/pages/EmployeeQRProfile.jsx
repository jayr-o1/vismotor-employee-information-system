import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiService from "../services/api";
import defaultAvatar from "../assets/default-avatar.png";

const EmployeeQRProfile = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await apiService.employees.getById(id);
        setEmployee(response.data);
      } catch (err) {
        setError("Employee not found or an error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-300">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-t-8 border-green-600">
        <img
          src={employee.avatar || defaultAvatar}
          alt="Employee Avatar"
          className="w-32 h-32 rounded-full mx-auto shadow-lg border-4 border-green-200 object-cover mb-4"
        />
        <h1 className="text-3xl font-bold text-green-800 mb-1">{employee.name}</h1>
        <p className="text-lg text-gray-600 mb-2">{employee.position}</p>
        <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4 ${
          employee.status === 'Active' ? 'bg-green-200 text-green-800' :
          employee.status === 'Inactive' ? 'bg-gray-200 text-gray-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {employee.status}
        </span>
        <div className="text-left mt-4 space-y-2">
          <div className="flex items-center text-gray-700">
            <i className="fas fa-envelope mr-2 text-green-600"></i>
            <span>{employee.email}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <i className="fas fa-phone mr-2 text-green-600"></i>
            <span>{employee.phone || 'N/A'}</span>
          </div>
        </div>
        <div className="mt-8 text-xs text-gray-400">Powered by Vismotor Employee Information System</div>
      </div>
    </div>
  );
};

export default EmployeeQRProfile; 