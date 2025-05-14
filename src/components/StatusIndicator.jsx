import React from 'react';

const StatusIndicator = ({ status }) => {
  // Define color schemes based on status
  let colorClass = '';
  let textColor = '';
  let bgColor = '';
  
  switch(status?.toLowerCase()) {
    case 'active':
      colorClass = 'bg-green-100 text-green-800 border-green-200';
      textColor = 'text-green-800';
      bgColor = 'bg-green-100';
      break;
    case 'inactive':
      colorClass = 'bg-red-100 text-red-800 border-red-200';
      textColor = 'text-red-800';
      bgColor = 'bg-red-100';
      break;
    case 'onboarding':
      colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
      textColor = 'text-blue-800';
      bgColor = 'bg-blue-100';
      break;
    case 'vacation':
      colorClass = 'bg-amber-100 text-amber-800 border-amber-200';
      textColor = 'text-amber-800';
      bgColor = 'bg-amber-100';
      break;
    case 'leave':
      colorClass = 'bg-purple-100 text-purple-800 border-purple-200';
      textColor = 'text-purple-800';
      bgColor = 'bg-purple-100';
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
      textColor = 'text-gray-800';
      bgColor = 'bg-gray-100';
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      <span className={`inline-block w-2 h-2 rounded-full ${bgColor} mr-1.5`}></span>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusIndicator; 