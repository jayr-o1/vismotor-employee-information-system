import React, { useState } from 'react';
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState(1);

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
        
        {activeSection === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  min="18"
                  max="80"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Highest Education</label>
                <select
                  name="highestEducation"
                  value={formData.highestEducation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select Education</option>
                  <option value="High School">High School</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="Doctorate">Doctorate</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {activeSection === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter region (e.g. Region VII - Central Visayas)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Province</label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter province (e.g. Cebu)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City/Municipality</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter city (e.g. Cebu City)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Barangay</label>
              <input
                type="text"
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter barangay"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter street address"
              />
            </div>
          </div>
        )}
        
        {activeSection === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position Applying For</label>
              <input
                type="text"
                name="positionApplyingFor"
                value={formData.positionApplyingFor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch/Department</label>
              <input
                type="text"
                name="branchDepartment"
                value={formData.branchDepartment}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Availability</label>
              <input
                type="date"
                name="dateAvailability"
                value={formData.dateAvailability}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Desired Pay (PHP)</label>
              <input
                type="text"
                name="desiredPay"
                value={formData.desiredPay}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g. 25,000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Previously Employed at Vismotor?</label>
              <select
                name="previouslyEmployed"
                value={formData.previouslyEmployed}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        )}
        
        {activeSection === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resume/CV</label>
              <input
                type="file"
                name="resumeFile"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                accept=".pdf,.doc,.docx"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Accepted formats: PDF, DOC, DOCX</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">House Sketch/Map</label>
              <input
                type="file"
                name="houseSketchFile"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                accept=".jpg,.jpeg,.png,.pdf"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Accepted formats: JPG, JPEG, PNG, PDF</p>
            </div>
            
            <div className="pt-4 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Submitting...' : 'Add Applicant'}
              </button>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-6 pt-4 border-t">
          <button
            type="button"
            onClick={() => setActiveSection(Math.max(1, activeSection - 1))}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            disabled={activeSection === 1}
          >
            Previous
          </button>
          
          {activeSection < 4 ? (
            <button
              type="button"
              onClick={() => setActiveSection(Math.min(4, activeSection + 1))}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Add Applicant'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ApplicantManualEntry; 