import React from "react";

const DashboardTable = ({ data = [] }) => {
  // If no data, show a message
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No recent applicants found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-4 text-left">Name</th>
            <th className="py-3 px-4 text-left">Position</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-left">Date</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm">
          {data.map((applicant, index) => (
            <tr
              key={index}
              className="border-b border-gray-200 hover:bg-gray-50"
            >
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <span>{applicant.name}</span>
                </div>
              </td>
              <td className="py-3 px-4">{applicant.position}</td>
              <td className="py-3 px-4">
                <span
                  className={`py-1 px-3 rounded-full text-xs ${
                    applicant.status === "Pending"
                      ? "bg-yellow-200 text-yellow-800"
                      : applicant.status === "Approved"
                      ? "bg-green-200 text-green-800"
                      : applicant.status === "Rejected"
                      ? "bg-red-200 text-red-800"
                      : "bg-blue-200 text-blue-800"
                  }`}
                >
                  {applicant.status}
                </span>
              </td>
              <td className="py-3 px-4">
                {new Date(applicant.date).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardTable; 