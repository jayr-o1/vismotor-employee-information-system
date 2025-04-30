import React, { useState, useEffect } from 'react';
import { regions, provinces, cities, barangays } from '../utils/locations';
import { toast } from 'react-toastify';
import apiService from '../services/api';

function ApplicantManualEntry({ onClose, refreshApplicants }) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    gender: '',
    otherGender: '',
    age: '',
    maritalStatus: '',
    otherMaritalStatus: '',
    highestEducation: '',
    otherHighestEducation: '',
    region: '',
    province: '',
    city: '',
    barangay: '',
    streetAddress: '',
    positionApplyingFor: '',
    otherPosition: '',
    branchDepartment: '',
    otherBranchDepartment: '',
    dateAvailability: '',
    otherDateAvailability: '',
    desiredPay: '',
    jobPostSource: '',
    otherJobSource: '',
    previouslyEmployed: '',
    resumeFile: null,
    houseSketchFile: null,
    status: 'NEW' // Default status for manually added applicants
  });
  
  // State for filtered location options
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableBarangays, setAvailableBarangays] = useState([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState(1);

  // Location filtering logic based on selected region/province/city
  useEffect(() => {
    if (formData.region) {
      const filteredProvinces = provinces.filter(
        province => province.regCode === formData.region
      );
      setAvailableProvinces(filteredProvinces);
    } else {
      setAvailableProvinces([]);
      setAvailableCities([]);
      setAvailableBarangays([]);
    }
  }, [formData.region]);
  
  useEffect(() => {
    if (formData.province) {
      const filteredCities = cities.filter(
        city => city.provCode === formData.province
      );
      setAvailableCities(filteredCities);
    } else {
      setAvailableCities([]);
      setAvailableBarangays([]);
    }
  }, [formData.province]);
  
  useEffect(() => {
    if (formData.city) {
      const filteredBarangays = barangays.filter(
        barangay => barangay.cityCode === formData.city
      );
      setAvailableBarangays(filteredBarangays);
    } else {
      setAvailableBarangays([]);
    }
  }, [formData.city]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Create FormData object for file uploads
      const formDataWithFiles = new FormData();
      
      // Append files if they exist
      if (formData.resumeFile) {
        formDataWithFiles.append('resumeFile', formData.resumeFile);
      }
      
      if (formData.houseSketchFile) {
        formDataWithFiles.append('houseSketchFile', formData.houseSketchFile);
      }
      
      // Upload files first if they exist
      let fileUploadResult = {};
      if (formData.resumeFile || formData.houseSketchFile) {
        const fileUploadResponse = await apiService.applicants.uploadFiles(formDataWithFiles);
        fileUploadResult = fileUploadResponse.data.files || {};
      }
      
      // Prepare data for submission with file references
      const applicationData = {
        ...formData,
        resumeFile: fileUploadResult.resumeFile || null,
        houseSketchFile: fileUploadResult.houseSketchFile || null
      };
      
      // Submit applicant data
      const response = await apiService.applicants.create(applicationData);
      
      toast.success("Applicant added successfully!");
      if (refreshApplicants) refreshApplicants();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error adding applicant:", error);
      setError(error.response?.data?.message || 'Failed to add applicant');
      toast.error(error.response?.data?.message || 'Failed to add applicant');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simple section navigation for this basic version
  const renderSectionNav = () => (
    <div className="flex mb-4 border-b">
      <button 
        type="button"
        className={`py-2 px-4 ${activeSection === 1 ? 'border-b-2 border-orange-500 font-medium' : ''}`}
        onClick={() => setActiveSection(1)}
      >
        Personal Info
      </button>
      <button 
        type="button"
        className={`py-2 px-4 ${activeSection === 2 ? 'border-b-2 border-orange-500 font-medium' : ''}`}
        onClick={() => setActiveSection(2)}
      >
        Address
      </button>
      <button 
        type="button"
        className={`py-2 px-4 ${activeSection === 3 ? 'border-b-2 border-orange-500 font-medium' : ''}`}
        onClick={() => setActiveSection(3)}
      >
        Employment
      </button>
      <button 
        type="button"
        className={`py-2 px-4 ${activeSection === 4 ? 'border-b-2 border-orange-500 font-medium' : ''}`}
        onClick={() => setActiveSection(4)}
      >
        Documents
      </button>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl mx-auto my-4 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add Applicant Manually</h2>
        {onClose && (
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {renderSectionNav()}
        
        {/* This is just a placeholder for now - we'd implement all sections based on ApplicationForm */}
        {activeSection === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            {/* More fields would go here - simplified for now */}
          </div>
        )}
        
        {/* Placeholder for Address Section */}
        {activeSection === 2 && (
          <div className="space-y-4">
            {/* Address fields would go here */}
            <p className="text-gray-700 dark:text-gray-300">Address information fields would be displayed here</p>
          </div>
        )}
        
        {/* Placeholder for Employment Section */}
        {activeSection === 3 && (
          <div className="space-y-4">
            {/* Employment fields would go here */}
            <p className="text-gray-700 dark:text-gray-300">Employment information fields would be displayed here</p>
          </div>
        )}
        
        {/* Placeholder for Documents Section */}
        {activeSection === 4 && (
          <div className="space-y-4">
            {/* Document upload fields would go here */}
            <p className="text-gray-700 dark:text-gray-300">Document upload fields would be displayed here</p>
          </div>
        )}
        
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Applicant'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ApplicantManualEntry; 