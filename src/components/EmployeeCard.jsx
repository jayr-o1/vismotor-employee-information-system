import React, { useState } from "react";

// Function to get profile picture URL
const getProfilePictureUrl = (filename) => {
  if (!filename) return null;
  return `http://10.10.1.71:5000/uploads/profile-pictures/${filename}`;
};

// Function to get employee initials
const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

const EmployeeCard = ({ employee, onClick, className = "" }) => {
  const [imgError, setImgError] = useState(false);
  const profilePictureUrl = getProfilePictureUrl(employee.profile_picture);
  
  const handleImageError = () => {
    setImgError(true);
  };
  
  return (
    <div 
      className={`flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
      onClick={() => onClick(employee)}
    >
      <div className="flex-shrink-0 mr-4">
        {profilePictureUrl && !imgError ? (
          <img
            src={profilePictureUrl}
            alt={`${employee.first_name} ${employee.last_name}`}
            className="w-12 h-12 rounded-full object-cover"
            onError={handleImageError}
            key={employee.profile_picture} // Add key to force re-render when image changes
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-lg">
            {getInitials(employee.first_name, employee.last_name)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-900 truncate">
          {employee.first_name} {employee.last_name}
        </h3>
        <p className="text-sm text-gray-500 truncate">
          {employee.position || 'Employee'}
        </p>
      </div>
      <div className="ml-2">
        <i className="fas fa-chevron-right text-gray-400"></i>
      </div>
    </div>
  );
};

export default EmployeeCard; 