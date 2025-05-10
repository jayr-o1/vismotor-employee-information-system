import React from "react";

const EmployeeCard = ({ employee, onView, onEdit, onDelete, isDark }) => {
  // Function to get profile picture URL
  const getProfilePictureUrl = (filename) => {
    if (!filename) return null;
    return `http://10.10.1.71:5000/uploads/profile-pictures/${filename}`;
  };

  // Function to get employee initials
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Use useEffect to log when an employee's profile_picture changes
  React.useEffect(() => {
    console.log(`EmployeeCard: Employee ${employee.id} profile_picture:`, employee.profile_picture);
  }, [employee.profile_picture, employee.id]);

  return (
    <div className={`${isDark ? 'bg-[#232f46] border-slate-700' : 'bg-white border-gray-200'} border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer w-full`}>
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-4">
          {employee.profile_picture ? (
            <div className="relative">
              <img
                src={getProfilePictureUrl(employee.profile_picture)}
                alt={employee.name}
                onError={(e) => {
                  console.log("Image failed to load, falling back to initials");
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
                className="w-12 h-12 rounded-full object-cover"
                key={employee.profile_picture} // Add key to force re-render when image changes
              />
              <div 
                className={`hidden w-12 h-12 rounded-full ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'} items-center justify-center font-semibold text-lg`}
              >
                {getInitials(employee.name)}
              </div>
            </div>
          ) : (
            <div className={`w-12 h-12 rounded-full ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'} flex items-center justify-center font-semibold text-lg`}>
              {getInitials(employee.name)}
            </div>
          )}
        </div>
        <div>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{employee.name}</h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{employee.position}</p>
          <div className="flex items-center mt-1">
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
              employee.status === 'Active' 
                ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
            }`}>
              {employee.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard; 