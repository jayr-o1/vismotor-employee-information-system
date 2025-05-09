import React, { useState, useEffect } from 'react';
import apiService from '../services/api';  // Import the API service
import { validPositions, validBranches, validEducation } from "../data/formOptions";
import "../styles/applicationForm.css";

// Shared placeholder style to ensure consistent appearance regardless of theme
const placeholderStyle = {
  color: '#9ca3af'  // Medium gray that works on both light and dark backgrounds
};

function ApplicationForm() {
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
    completeAddress: '', // New field for complete address
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
    houseSketchFile: null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [activeSection, setActiveSection] = useState(1);
  const [validationError, setValidationError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to:`, value);
    
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [name]: value
      };
      console.log("New form data:", newData);
      return newData;
    });
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
    
    // Validate all fields before submission
    const missingFields = validateAllFields();
    if (missingFields.length > 0) {
      // Group missing fields by section for better user feedback
      const missingFieldsBySection = {
        1: [],
        2: [],
        3: [],
        4: []
      };
      
      missingFields.forEach(field => {
        switch(field.section) {
          case 1:
            missingFieldsBySection[1].push(field.name);
            break;
          case 2:
            missingFieldsBySection[2].push(field.name);
            break;
          case 3:
            missingFieldsBySection[3].push(field.name);
            break;
          case 4:
            missingFieldsBySection[4].push(field.name);
            break;
          default:
            break;
        }
      });
      
      // Build error message
      let errorMessage = "Please fill in all required fields:\n\n";
      
      if (missingFieldsBySection[1].length > 0) {
        errorMessage += "Personal Information Section:\n- " + missingFieldsBySection[1].join("\n- ") + "\n\n";
      }
      
      if (missingFieldsBySection[2].length > 0) {
        errorMessage += "Address Information Section:\n- " + missingFieldsBySection[2].join("\n- ") + "\n\n";
      }
      
      if (missingFieldsBySection[3].length > 0) {
        errorMessage += "Employment Information Section:\n- " + missingFieldsBySection[3].join("\n- ") + "\n\n";
      }
      
      if (missingFieldsBySection[4].length > 0) {
        errorMessage += "Documents Upload Section:\n- " + missingFieldsBySection[4].join("\n- ") + "\n\n";
      }
      
      setValidationError(errorMessage);
      
      // Go to the first section with errors
      for (let i = 1; i <= 4; i++) {
        if (missingFieldsBySection[i].length > 0) {
          setActiveSection(i);
          break;
        }
      }
      
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Upload files to the server first
      const formDataFiles = new FormData();
      
      if (formData.resumeFile) {
        formDataFiles.append('resumeFile', formData.resumeFile);
      }
      
      if (formData.houseSketchFile) {
        formDataFiles.append('houseSketchFile', formData.houseSketchFile);
      }
      
      // Use apiService to upload files with better error handling
      let uploadResult = {};
      try {
        const fileUploadResponse = await apiService.applicants.uploadFiles(formDataFiles);
        uploadResult = fileUploadResponse.data;
        console.log('Files uploaded:', uploadResult);
      } catch (uploadError) {
        console.error("Error uploading files:", uploadError);
        throw new Error(uploadError.response?.data?.message || "Failed to upload files. Please try again.");
      }
      
      // Prepare data for submission with file references
      const applicationData = {
        ...formData,
        resumeFile: uploadResult.files?.resumeFile || null,
        houseSketchFile: uploadResult.files?.houseSketchFile || null
      };
      
      // Use API_URL from environment to construct the full URL for the API call
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const submitResponse = await fetch(`${API_URL}/api/applications/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });
      
      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }
      
      const submitResult = await submitResponse.json();
      console.log('Application submitted:', submitResult);
      
      setSubmitSuccess(true);
      // Reset form
      setFormData({
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
        completeAddress: '',
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
        houseSketchFile: null
      });
    } catch (error) {
      console.error("Error during submission: ", error);
      setSubmitError(error.message || 'There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add validation function that checks all required fields
  const validateAllFields = () => {
    const missingFields = [];
    
    // Section 1: Personal Information
    if (!formData.email) missingFields.push({ section: 1, name: "Email Address" });
    if (!formData.firstName) missingFields.push({ section: 1, name: "First Name" });
    if (!formData.lastName) missingFields.push({ section: 1, name: "Last Name" });
    if (!formData.gender) missingFields.push({ section: 1, name: "Gender" });
    if (formData.gender === "OTHER" && !formData.otherGender) missingFields.push({ section: 1, name: "Specify Gender" });
    if (!formData.age) missingFields.push({ section: 1, name: "Age" });
    if (!formData.maritalStatus) missingFields.push({ section: 1, name: "Marital Status" });
    if (formData.maritalStatus === "OTHER" && !formData.otherMaritalStatus) missingFields.push({ section: 1, name: "Specify Marital Status" });
    if (!formData.highestEducation) missingFields.push({ section: 1, name: "Highest Educational Attainment" });
    if (formData.highestEducation === "OTHER" && !formData.otherHighestEducation) missingFields.push({ section: 1, name: "Specify Educational Attainment" });
    
    // Section 2: Address Information
    if (!formData.completeAddress) missingFields.push({ section: 2, name: "Complete Address" });
    
    // Section 3: Employment Information
    if (!formData.positionApplyingFor) missingFields.push({ section: 3, name: "Position Applying For" });
    if (formData.positionApplyingFor === "OTHER" && !formData.otherPosition) missingFields.push({ section: 3, name: "Specify Other Position" });
    if (!formData.branchDepartment) missingFields.push({ section: 3, name: "Branch or Department" });
    if (formData.branchDepartment === "Other" && !formData.otherBranchDepartment) missingFields.push({ section: 3, name: "Specify Other Branch/Department" });
    if (!formData.previouslyEmployed) missingFields.push({ section: 3, name: "Previous Employment Status" });
    if (!formData.dateAvailability) missingFields.push({ section: 3, name: "Date Availability" });
    if (formData.dateAvailability === "OTHER" && !formData.otherDateAvailability) missingFields.push({ section: 3, name: "Specify Availability" });
    if (!formData.desiredPay) missingFields.push({ section: 3, name: "Desired Pay" });
    if (!formData.jobPostSource) missingFields.push({ section: 3, name: "Job Posting Source" });
    if (formData.jobPostSource === "Other" && !formData.otherJobSource) missingFields.push({ section: 3, name: "Specify Other Source" });
    
    // Section 4: Documents Upload
    if (!formData.resumeFile) missingFields.push({ section: 4, name: "Resume/CV" });
    
    return missingFields;
  };

  // Add validation functions for each section
  const validatePersonalSection = () => {
    // Check all required fields
    if (!formData.email || !formData.firstName || !formData.lastName || 
        !formData.gender || 
        (formData.gender === "OTHER" && !formData.otherGender) ||
        !formData.age || !formData.maritalStatus || 
        (formData.maritalStatus === "OTHER" && !formData.otherMaritalStatus) ||
        !formData.highestEducation ||
        (formData.highestEducation === "OTHER" && !formData.otherHighestEducation)) {
      return false;
    }
    return true;
  };

  const validateAddressSection = () => {
    // Only check for complete address
    if (!formData.completeAddress) {
      return false;
    }
    
    return true;
  };

  const validateEmploymentSection = () => {
    // Check all required fields
    if (!formData.positionApplyingFor || 
        (formData.positionApplyingFor === "OTHER" && !formData.otherPosition) || 
        !formData.branchDepartment || 
        (formData.branchDepartment === "Other" && !formData.otherBranchDepartment) || 
        !formData.dateAvailability || 
        (formData.dateAvailability === "OTHER" && !formData.otherDateAvailability) ||
        !formData.desiredPay || !formData.jobPostSource || 
        (formData.jobPostSource === "Other" && !formData.otherJobSource) ||
        !formData.previouslyEmployed) {
      return false;
    }
    return true;
  };

  const validateDocumentsSection = () => {
    // Check only required fields - house sketch is now optional
    if (!formData.resumeFile) {
      return false;
    }
    return true;
  };

  // Add the document upload section render
  const renderDocumentSection = () => (
    <div className={`form-section bg-white p-8 mb-6 max-w-6xl mx-auto shadow-sm rounded-b-xl ${activeSection !== 4 ? 'hidden' : ''}`}>
      <div className="flex items-center mb-6">
        <span className="w-10 h-10 rounded-full bg-orange-100 text-[#FF5C00] flex items-center justify-center font-bold text-xl mr-3">4</span>
        <h2 className="text-xl font-bold text-gray-800">Documents Upload</h2>
      </div>
      <div className="h-px w-full bg-gray-100 mb-8"></div>
      
      <div className="mb-5">
        <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="resumeFile">
          Resume/CV <span className="text-red-500 text-sm">*</span>
        </label>
        <div className="relative">
          <input 
            type="file" 
            id="resumeFile"
            name="resumeFile"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2 cursor-pointer bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#FF5C00] file:text-white hover:file:bg-[#E65100]"
            accept=".pdf,.doc,.docx"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">Upload your resume (PDF, DOC, DOCX)</p>
      </div>
      
      <div className="mb-5">
        <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="houseSketchFile">
          House Sketch
        </label>
        <div className="relative">
          <input 
            type="file" 
            id="houseSketchFile"
            name="houseSketchFile"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2 cursor-pointer bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#FF5C00] file:text-white hover:file:bg-[#E65100]"
            accept=".jpg,.jpeg,.png,.pdf"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">Upload a sketch of your house location (JPG, JPEG, PNG, PDF) - Optional</p>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button 
          type="button"
          className="back-button px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors mr-4 shadow-sm flex items-center"
          onClick={() => setActiveSection(3)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <button 
          type="submit"
          className="submit-button px-8 py-3 text-white bg-[#FF5C00] rounded-lg hover:bg-[#E65100] focus:outline-none transition-colors shadow-md flex items-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </div>
  );

  if (submitSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-sm p-0 overflow-hidden">
          <div className="form-header bg-white p-6 text-center">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#34A853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-normal text-[#202124] mt-4">Application Submitted!</h2>
            <p className="text-[#5f6368] mt-2 mb-6">Thank you for your application. We will be in touch soon.</p>
            <button 
              className="submit-button px-6 py-2 text-white rounded-md transition"
              onClick={() => setSubmitSuccess(false)}
            >
              Submit Another Response
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-gray-100 px-4 py-6">
      {/* Form Header */}
      <div className="form-header bg-white p-8 rounded-t-xl max-w-6xl mx-auto shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -mr-20 -mt-20 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-[#202124] text-3xl font-bold">JOIN OUR TEAM</h1>
          <p className="text-[#5f6368] mt-3 text-lg">We're excited about your interest in applying to VISMOTOR. Tell us about yourself below.</p>
        </div>
        <div className="mt-6 h-1 bg-gradient-to-r from-[#FF5C00] to-orange-300 rounded-full"></div>
      </div>
      
      {submitError && (
        <div className="mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-6xl">
          {submitError}
        </div>
      )}
      
      {validationError && (
        <div className="mx-auto bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 max-w-6xl whitespace-pre-line">
          {validationError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mt-4 max-w-6xl mx-auto" noValidate>
        {/* Section Tabs */}
        <div className="bg-white px-6 py-5 flex overflow-x-auto tab-buttons-container rounded-t-xl shadow-sm mb-1">
          <button 
            type="button"
            className={`tab-button flex items-center px-5 py-3 mr-4 rounded-lg text-sm font-medium transition-all ${activeSection === 1 ? 'bg-orange-50 text-[#FF5C00] border-l-4 border-[#FF5C00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveSection(1)}
          >
            <span className="w-7 h-7 rounded-full bg-orange-100 text-[#FF5C00] flex items-center justify-center mr-2 font-bold">1</span>
            Personal Information
          </button>
          <button 
            type="button"
            className={`tab-button flex items-center px-5 py-3 mr-4 rounded-lg text-sm font-medium transition-all ${activeSection === 2 ? 'bg-orange-50 text-[#FF5C00] border-l-4 border-[#FF5C00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveSection(2)}
          >
            <span className="w-7 h-7 rounded-full bg-orange-100 text-[#FF5C00] flex items-center justify-center mr-2 font-bold">2</span>
            Address Information
          </button>
          <button 
            type="button"
            className={`tab-button flex items-center px-5 py-3 mr-4 rounded-lg text-sm font-medium transition-all ${activeSection === 3 ? 'bg-orange-50 text-[#FF5C00] border-l-4 border-[#FF5C00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveSection(3)}
          >
            <span className="w-7 h-7 rounded-full bg-orange-100 text-[#FF5C00] flex items-center justify-center mr-2 font-bold">3</span>
            Employment Information
          </button>
          <button 
            type="button"
            className={`tab-button flex items-center px-5 py-3 mr-4 rounded-lg text-sm font-medium transition-all ${activeSection === 4 ? 'bg-orange-50 text-[#FF5C00] border-l-4 border-[#FF5C00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveSection(4)}
          >
            <span className="w-7 h-7 rounded-full bg-orange-100 text-[#FF5C00] flex items-center justify-center mr-2 font-bold">4</span>
            Documents Upload
          </button>
        </div>
        
        {/* Basic Information Section */}
        <div className={`form-section bg-white p-8 mb-6 max-w-6xl mx-auto shadow-sm rounded-b-xl ${activeSection === 1 ? 'block' : 'hidden'}`}>
          <div className="flex items-center mb-6">
            <span className="w-10 h-10 rounded-full bg-orange-100 text-[#FF5C00] flex items-center justify-center font-bold text-xl mr-3">1</span>
            <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
          </div>
          <div className="h-px w-full bg-gray-100 mb-8"></div>
          
          <div className="input-container mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="email">
              Email Address <span className="text-red-500 text-sm">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm"
              placeholder="Your email address"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="input-container">
              <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="firstName">
                First Name <span className="text-red-500 text-sm">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="form-input w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm"
                placeholder="Your first name"
                style={{
                  '::placeholder': placeholderStyle
                }}
              />
            </div>
            
            <div className="input-container">
              <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="lastName">
                Last Name <span className="text-red-500 text-sm">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="form-input w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm"
                placeholder="Your last name"
                style={{
                  '::placeholder': placeholderStyle
                }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="mb-0">
              <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="gender">
                Gender <span className="text-red-500 text-sm">*</span>
              </label>
              <div className="relative">
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm appearance-none"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="LGBTQIA+">LGBTQIA+</option>
                  <option value="OTHER">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            {formData.gender === "OTHER" && (
              <div className="mb-5">
                <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="otherGender">
                  Specify Gender <span className="text-red-500 text-sm">*</span>
                </label>
                <input
                  type="text"
                  id="otherGender"
                  name="otherGender"
                  value={formData.otherGender || ''}
                  onChange={handleChange}
                  className="form-input w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm"
                  placeholder="Please specify"
                />
              </div>
            )}
            
            <div className="mb-0">
              <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="age">
                Age <span className="text-red-500 text-sm">*</span>
              </label>
              <input
                type="number"
                id="age"
                name="age"
                min="18"
                max="100"
                value={formData.age}
                onChange={handleChange}
                className="form-input w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm"
                placeholder="Your age"
              />
            </div>
          </div>
          
          <div className="mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="maritalStatus">
              Marital Status <span className="text-red-500 text-sm">*</span>
            </label>
            <div className="relative">
              <select
                id="maritalStatus"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm appearance-none"
              >
                <option value="">Select Marital Status</option>
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="WIDOWED / WIDOWER">Widowed / Widower</option>
                <option value="SEPARATED">Separated</option>
                <option value="LIVE-IN PARTNER">Live-in Partner</option>
                <option value="DIVORCED">Divorced</option>
                <option value="ANNULED">Annuled</option>
                <option value="OTHER">Other</option>
              </select> 
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {formData.maritalStatus === "OTHER" && (
            <div className="mb-5">
              <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="otherMaritalStatus">
                Specify Marital Status <span className="text-red-500 text-sm">*</span>
              </label>
              <input
                type="text"
                id="otherMaritalStatus"
                name="otherMaritalStatus"
                value={formData.otherMaritalStatus || ''}
                onChange={handleChange}
                className="form-input w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm"
                placeholder="Please specify"
              />
            </div>
          )}
          
          <div className="input-container mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="highestEducation">
              Highest Educational Attainment <span className="text-red-500 text-sm">*</span>
            </label>
            <div className="relative">
              <select
                id="highestEducation"
                name="highestEducation"
                value={formData.highestEducation}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm appearance-none"
              >
                <option value="">Select Education Level</option>
                {validEducation.map((education) => (
                  <option key={education} value={education}>
                    {education}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {formData.highestEducation === "OTHER" && (
            <div className="mb-5">
              <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="otherHighestEducation">
                Specify Educational Attainment <span className="text-red-500 text-sm">*</span>
              </label>
              <input
                type="text"
                id="otherHighestEducation"
                name="otherHighestEducation"
                value={formData.otherHighestEducation || ''}
                onChange={handleChange}
                className="form-input w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm"
                placeholder="Please specify"
              />
            </div>
          )}
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className="submit-button px-6 py-3 text-white bg-[#FF5C00] rounded-lg hover:bg-[#E65100] focus:outline-none transition-colors disabled:opacity-70 shadow-md flex items-center"
              onClick={() => setActiveSection(2)}
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {activeSection === 1 && validationError && (
            <div className="validation-alert mt-2 text-sm text-red-600">
              {validationError}
            </div>
          )}
        </div>
        
        {/* Address Section */}
        <div className={`form-section bg-white p-8 mb-6 max-w-6xl mx-auto shadow-sm rounded-b-xl ${activeSection === 2 ? 'block' : 'hidden'}`}>
          <div className="flex items-center mb-6">
            <span className="w-10 h-10 rounded-full bg-orange-100 text-[#FF5C00] flex items-center justify-center font-bold text-xl mr-3">2</span>
            <h2 className="text-xl font-bold text-gray-800">Address Information</h2>
          </div>
          <div className="h-px w-full bg-gray-100 mb-8"></div>
          
          <div className="mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="completeAddress">
              Complete Address <span className="text-red-500 text-sm">*</span>
            </label>
            <input
              type="text"
              id="completeAddress"
              name="completeAddress"
              value={formData.completeAddress}
              onChange={handleChange}
              className="form-input w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm"
              placeholder="e.g. House No., Street, Barangay, City/Municipality, Province, Region"
            />
          </div>
          
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              className="back-button px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors mr-4 shadow-sm flex items-center"
              onClick={() => setActiveSection(1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            <button
              type="button"
              className="submit-button px-6 py-3 text-white bg-[#FF5C00] rounded-lg hover:bg-[#E65100] focus:outline-none transition-colors disabled:opacity-70 shadow-md flex items-center"
              onClick={() => setActiveSection(3)}
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {activeSection === 2 && validationError && (
            <div className="validation-alert mt-2 text-sm text-red-600">
              {validationError}
            </div>
          )}
        </div>
        
        {/* Employment Details Section */}
        <div className={`form-section bg-white p-8 mb-6 max-w-6xl mx-auto shadow-sm rounded-b-xl ${activeSection === 3 ? 'block' : 'hidden'}`}>
          <div className="flex items-center mb-6">
            <span className="w-10 h-10 rounded-full bg-orange-100 text-[#FF5C00] flex items-center justify-center font-bold text-xl mr-3">3</span>
            <h2 className="text-xl font-bold text-gray-800">Employment Information</h2>
          </div>
          <div className="h-px w-full bg-gray-100 mb-8"></div>
          
          <div className="mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="positionApplyingFor">
              Position Applying For <span className="text-red-500 text-sm">*</span>
            </label>
            <div className="relative">
              <select
                id="positionApplyingFor"
                name="positionApplyingFor"
                value={formData.positionApplyingFor}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm appearance-none"
              >
                <option value="">Select Position</option>
                {validPositions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {formData.positionApplyingFor === "OTHER" && (
            <div className="input-container mb-5">
              <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="otherPosition">
                Specify Other Position <span className="text-red-500 text-sm">*</span>
              </label>
              <input
                type="text"
                id="otherPosition"
                name="otherPosition"
                value={formData.otherPosition}
                onChange={handleChange}
                className="form-input w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm"
                placeholder="Specify the position you're applying for"
              />
            </div>
          )}
          
          <div className="mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="branchDepartment">
              Branch or Department Applying For <span className="text-red-500 text-sm">*</span>
            </label>
            <div className="relative">
              <select
                id="branchDepartment"
                name="branchDepartment"
                value={formData.branchDepartment}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm appearance-none"
              >
                <option value="">Select Branch/Department</option>
                {validBranches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {formData.branchDepartment === "Other" && (
            <div className="input-container mb-5">
              <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="otherBranchDepartment">
                Specify Other Branch/Department <span className="text-red-500 text-sm">*</span>
              </label>
              <input
                type="text"
                id="otherBranchDepartment"
                name="otherBranchDepartment"
                value={formData.otherBranchDepartment || ''}
                onChange={handleChange}
                className="form-input w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm"
                placeholder="Specify the branch or department"
              />
            </div>
          )}
          
          <div className="mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="previouslyEmployed">
              Have you been employed to Vismotor Corporation before? <span className="text-red-500 text-sm">*</span>
            </label>
            <div className="relative">
              <select
                id="previouslyEmployed"
                name="previouslyEmployed"
                value={formData.previouslyEmployed}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm appearance-none"
              >
                <option value="">Select</option>
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="dateAvailability">
              Date Availability to Start <span className="text-red-500 text-sm">*</span>
            </label>
            <div className="relative">
              <select
                id="dateAvailability"
                name="dateAvailability"
                value={formData.dateAvailability}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm appearance-none"
              >
                <option value="">Select Availability</option>
                <option value="ASAP">ASAP</option>
                <option value="30 DAYS">30 DAYS</option>
                <option value="60 DAYS">60 DAYS</option>
                <option value="ANYTIME">ANYTIME</option>
                <option value="OTHER">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {formData.dateAvailability === "OTHER" && (
            <div className="mb-5">
              <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="otherDateAvailability">
                Specify Availability <span className="text-red-500 text-sm">*</span>
              </label>
              <input
                type="text"
                id="otherDateAvailability"
                name="otherDateAvailability"
                value={formData.otherDateAvailability || ''}
                onChange={handleChange}
                className="form-input w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm"
                placeholder="Please specify your availability"
              />
            </div>
          )}
          
          <div className="input-container mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="desiredPay">
              Desired Pay <span className="text-red-500 text-sm">*</span>
            </label>
            <input
              type="text"
              id="desiredPay"
              name="desiredPay"
              value={formData.desiredPay}
              onChange={handleChange}
              className="form-input w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm"
              placeholder="e.g. ₱15,000 - ₱20,000"
            />
          </div>
          
          <div className="mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="jobPostSource">
              Where did you see our job posting or hiring? <span className="text-red-500 text-sm">*</span>
            </label>
            <div className="relative">
              <select
                id="jobPostSource"
                name="jobPostSource"
                value={formData.jobPostSource}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm appearance-none"
              >
                <option value="">Select Source</option>
                <option value="Facebook">Facebook</option>
                <option value="Mynimo">Mynimo</option>
                <option value="Jobstreet">Jobstreet</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Referral">Referral</option>
                <option value="Branch Posting">Branch Posting</option>
                <option value="Job Fair">Job Fair</option>
                <option value="PESO">PESO</option>
                <option value="LGU">LGU</option>
                <option value="Other">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {formData.jobPostSource === "Other" && (
            <div className="input-container mb-5">
              <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="otherJobSource">
                Specify Other Source <span className="text-red-500 text-sm">*</span>
              </label>
              <input
                type="text"
                id="otherJobSource"
                name="otherJobSource"
                value={formData.otherJobSource}
                onChange={handleChange}
                className="form-input w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm"
                placeholder="Enter the source"
              />
            </div>
          )}
          
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              className="back-button px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors mr-4 shadow-sm flex items-center"
              onClick={() => setActiveSection(2)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            <button
              type="button"
              className="submit-button px-6 py-3 text-white bg-[#FF5C00] rounded-lg hover:bg-[#E65100] focus:outline-none transition-colors disabled:opacity-70 shadow-md flex items-center"
              onClick={() => setActiveSection(4)}
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {activeSection === 3 && validationError && (
            <div className="validation-alert mt-2 text-sm text-red-600">
              {validationError}
            </div>
          )}
        </div>
        
        {/* Documents Section */}
        {renderDocumentSection()}
      </form>
      
      <div className="text-sm text-[#5f6368] p-4 flex items-center max-w-6xl mx-auto mb-8">
        <span className="text-red-500 text-sm mr-1">*</span> Required fields
      </div>
    </div>
  );
}

export default ApplicationForm; 