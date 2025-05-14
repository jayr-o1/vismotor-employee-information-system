import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiService from "../services/api";
import defaultAvatar from "../assets/default-avatar.png";

const getProfilePictureUrl = (filename) => {
  if (!filename) return null;
  return `http://10.10.1.71:5000/uploads/profile-pictures/${filename}`;
};

const EmployeeQRProfile = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        if (!id) {
          throw new Error("No employee ID provided in URL");
        }
        
        // Use the public endpoint that doesn't require authentication
        const response = await apiService.employees.getPublicProfile(id);
        
        if (!response.data) {
          throw new Error("No employee data returned from API");
        }
        
        setEmployee(response.data);
      } catch (err) {
        setError(`Employee not found or an error occurred. Error: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleImageError = () => {
    setImgError(true);
  };

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
          <div className="mt-4">
            <p className="text-sm text-gray-500">Employee ID: {id || 'Not provided'}</p>
            <p className="text-sm text-gray-500">Please make sure the QR code is valid.</p>
          </div>
        </div>
      </div>
    );
  }

  const profilePictureUrl = getProfilePictureUrl(employee.profile_picture);
  const avatarDisplay = profilePictureUrl && !imgError ? (
    <img
      src={profilePictureUrl}
      alt={`${employee.first_name} ${employee.last_name}`}
      className="w-32 h-32 rounded-full mx-auto shadow-lg border-4 border-green-200 object-cover mb-4"
      onError={handleImageError}
    />
  ) : (
    <div className="w-32 h-32 rounded-full mx-auto shadow-lg border-4 border-green-200 flex items-center justify-center bg-green-600 text-white text-4xl font-bold mb-4">
      {`${employee.first_name.charAt(0)}${employee.last_name.charAt(0)}`}
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-300">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-t-8 border-green-600">
        {avatarDisplay}
        <h1 className="text-3xl font-bold text-green-800 mb-1">
          {employee.first_name} {employee.last_name}
        </h1>
        <p className="text-lg text-gray-600 mb-2">{employee.position}</p>
        <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold bg-green-200 text-green-800 mb-4">
          Employee
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
          <div className="flex items-center text-gray-700">
            <i className="fas fa-building mr-2 text-green-600"></i>
            <span>{employee.department || 'N/A'}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <i className="fas fa-id-badge mr-2 text-green-600"></i>
            <span>EMP-{employee.id.toString().padStart(4, '0')}</span>
          </div>
        </div>
        <div className="mt-8 text-xs text-gray-400">Powered by Vismotor Employee Information System</div>
      </div>
    </div>
  );
};

export default EmployeeQRProfile; 