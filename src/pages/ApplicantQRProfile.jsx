import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiService from "../services/api";
import defaultAvatar from "../assets/default-avatar.png";

const ApplicantQRProfile = () => {
  const { id } = useParams();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplicant = async () => {
      try {
        if (!id) {
          throw new Error("No applicant ID provided in URL");
        }
        
        // Use the public endpoint that doesn't require authentication
        const response = await apiService.applicants.getPublicProfile(id);
        
        if (!response.data) {
          throw new Error("No applicant data returned from API");
        }
        
        setApplicant(response.data);
      } catch (err) {
        setError(`Applicant not found or an error occurred. Error: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchApplicant();
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
          <div className="mt-4">
            <p className="text-sm text-gray-500">Applicant ID: {id || 'Not provided'}</p>
            <p className="text-sm text-gray-500">Please make sure the QR code is valid.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-300">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-t-8 border-green-600">
        <img
          src={applicant.avatar || defaultAvatar}
          alt="Applicant Avatar"
          className="w-32 h-32 rounded-full mx-auto shadow-lg border-4 border-green-200 object-cover mb-4"
        />
        <h1 className="text-3xl font-bold text-green-800 mb-1">{applicant.name}</h1>
        <p className="text-lg text-gray-600 mb-2">{applicant.position}</p>
        <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4 ${
          applicant.status === 'Hired' ? 'bg-green-200 text-green-800' :
          applicant.status === 'Rejected' ? 'bg-red-200 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {applicant.status}
        </span>
        <div className="text-left mt-4 space-y-2">
          <div className="flex items-center text-gray-700">
            <i className="fas fa-envelope mr-2 text-green-600"></i>
            <span>{applicant.email}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <i className="fas fa-phone mr-2 text-green-600"></i>
            <span>{applicant.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <i className="fas fa-id-badge mr-2 text-green-600"></i>
            <span>APP-{applicant.id.toString().padStart(4, '0')}</span>
          </div>
        </div>
        <div className="mt-8 text-xs text-gray-400">Powered by Vismotor Employee Information System</div>
      </div>
    </div>
  );
};

export default ApplicantQRProfile; 