import React, { useState, useEffect } from 'react';
import apiService from '../services/api';  // Import the API service
import { validPositions, validBranches, validEducation } from "../data/formOptions";
import "../styles/applicationForm.css";
import BranchSelector from "../components/BranchSelector";

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
    houseSketchFile: null,
    phone: '', // Add phone field
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
      let resumeFilePath = null;
      let houseSketchFilePath = null;
      
      try {
        if (formData.resumeFile || formData.houseSketchFile) {
          console.log("Uploading files...");
          const fileUploadResponse = await apiService.applicants.uploadFiles(formDataFiles);
          uploadResult = fileUploadResponse.data;
          console.log('Files uploaded:', uploadResult);
          
          if (uploadResult.data && uploadResult.data.files) {
            resumeFilePath = uploadResult.data.files.resumeFile?.path || null;
            houseSketchFilePath = uploadResult.data.files.houseSketchFile?.path || null;
          }
        }
      } catch (uploadError) {
        console.error("Error uploading files:", uploadError);
        throw new Error(uploadError.response?.data?.message || "Failed to upload files. Please try again.");
      }
      
      // Prepare data for submission with file references
      const applicationData = {
        ...formData,
        // Replace file objects with file paths
        resumeFile: resumeFilePath || (formData.resumeFile ? formData.resumeFile.name : null),
        houseSketchFile: houseSketchFilePath || (formData.houseSketchFile ? formData.houseSketchFile.name : null),
        phone: formData.phone || "",
      };
      
      console.log("Submitting application with data:", applicationData);
      
      // Use the apiService for submission
      const submitResponse = await apiService.applicants.submitApplication(applicationData);
      
      console.log('Application submitted:', submitResponse.data);
      
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
        houseSketchFile: null,
        phone: '',
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
    if (!formData.phone) missingFields.push({ section: 1, name: "Phone Number" });
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
    <div className={`form-section bg-white p-4 sm:p-6 md:p-8 mb-6 max-w-6xl mx-auto shadow-sm rounded-b-xl ${activeSection !== 4 ? 'hidden' : ''}`}>
      <div className="flex items-center mb-4 sm:mb-6">
        <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100 text-[#FF5C00] flex items-center justify-center font-bold text-lg sm:text-xl mr-2 sm:mr-3">4</span>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Documents Upload</h2>
      </div>
      <div className="h-px w-full bg-gray-100 mb-6 sm:mb-8"></div>
      
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
            className="hidden"
            accept=".pdf,.doc,.docx"
          />
          <label 
            htmlFor="resumeFile" 
            className="file-upload-label flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="file-upload-icon flex-shrink-0 bg-[#FF5C00] rounded-md flex items-center justify-center text-white p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-left flex-grow">
              <span className="file-upload-text font-medium text-sm sm:text-base block truncate">
                {formData.resumeFile ? formData.resumeFile.name : 'Choose file'}
              </span>
              <span className="text-xs text-gray-500">Upload your resume (PDF, DOC, DOCX)</span>
            </div>
          </label>
        </div>
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
            className="hidden" 
            accept=".jpg,.jpeg,.png,.pdf"
          />
          <label 
            htmlFor="houseSketchFile" 
            className="file-upload-label flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="file-upload-icon flex-shrink-0 bg-[#FF5C00] rounded-md flex items-center justify-center text-white p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left flex-grow">
              <span className="file-upload-text font-medium text-sm sm:text-base block truncate">
                {formData.houseSketchFile ? formData.houseSketchFile.name : 'Choose file'}
              </span>
              <span className="text-xs text-gray-500">Upload a sketch of your house location (JPG, JPEG, PNG, PDF) - Optional</span>
            </div>
          </label>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        <button 
          type="button"
          className="back-button px-4 sm:px-6 py-2.5 sm:py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors mr-0 sm:mr-4 shadow-sm flex items-center justify-center sm:justify-start w-full sm:w-auto"
          onClick={() => setActiveSection(3)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <button 
          type="submit"
          className="submit-button px-4 sm:px-8 py-2.5 sm:py-3 text-white bg-[#FF5C00] rounded-lg hover:bg-[#E65100] focus:outline-none transition-colors shadow-md flex items-center justify-center sm:justify-start w-full sm:w-auto"
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
          <div className="form-header bg-white p-4 sm:p-6 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-12 sm:w-12 text-[#34A853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-normal text-[#202124] mt-4">Application Submitted!</h2>
            <p className="text-sm sm:text-base text-[#5f6368] mt-2 mb-6">Thank you for your application. We will be in touch soon.</p>
            <button 
              className="submit-button px-4 sm:px-6 py-2 sm:py-2.5 text-white rounded-md transition"
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
      <div className="form-header bg-white p-4 sm:p-6 md:p-8 rounded-t-xl max-w-6xl mx-auto shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-orange-50 rounded-full -mr-10 sm:-mr-20 -mt-10 sm:-mt-20 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-[#202124] text-xl sm:text-2xl md:text-3xl font-bold">JOIN OUR TEAM</h1>
          <p className="text-[#5f6368] mt-2 sm:mt-3 text-sm sm:text-base md:text-lg">We're excited about your interest in applying to VISMOTOR. Tell us about yourself below.</p>
        </div>
        <div className="mt-4 sm:mt-6 h-1 bg-gradient-to-r from-[#FF5C00] to-orange-300 rounded-full"></div>
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
        <div className="bg-white px-3 sm:px-6 py-3 sm:py-5 flex overflow-x-auto tab-buttons-container rounded-t-xl shadow-sm mb-1 no-scrollbar">
          <button 
            type="button"
            className={`tab-button flex items-center px-2 sm:px-5 py-2 sm:py-3 mr-2 sm:mr-4 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeSection === 1 ? 'bg-orange-50 text-[#FF5C00] border-l-4 border-[#FF5C00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveSection(1)}
          >
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-orange-100 text-[#FF5C00] flex items-center justify-center mr-1 sm:mr-2 font-bold text-xs sm:text-sm">1</span>
            <span className="hidden xs:inline">Personal</span>
            <span className="xs:hidden">Per.</span>
          </button>
          <button 
            type="button"
            className={`tab-button flex items-center px-2 sm:px-5 py-2 sm:py-3 mr-2 sm:mr-4 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeSection === 2 ? 'bg-orange-50 text-[#FF5C00] border-l-4 border-[#FF5C00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveSection(2)}
          >
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-orange-100 text-[#FF5C00] flex items-center justify-center mr-1 sm:mr-2 font-bold text-xs sm:text-sm">2</span>
            <span className="hidden xs:inline">Address</span>
            <span className="xs:hidden">Addr.</span>
          </button>
          <button 
            type="button"
            className={`tab-button flex items-center px-2 sm:px-5 py-2 sm:py-3 mr-2 sm:mr-4 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeSection === 3 ? 'bg-orange-50 text-[#FF5C00] border-l-4 border-[#FF5C00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveSection(3)}
          >
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-orange-100 text-[#FF5C00] flex items-center justify-center mr-1 sm:mr-2 font-bold text-xs sm:text-sm">3</span>
            <span className="hidden xs:inline">Employment</span>
            <span className="xs:hidden">Emp.</span>
          </button>
          <button 
            type="button"
            className={`tab-button flex items-center px-2 sm:px-5 py-2 sm:py-3 mr-2 sm:mr-4 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeSection === 4 ? 'bg-orange-50 text-[#FF5C00] border-l-4 border-[#FF5C00]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveSection(4)}
          >
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-orange-100 text-[#FF5C00] flex items-center justify-center mr-1 sm:mr-2 font-bold text-xs sm:text-sm">4</span>
            <span className="hidden xs:inline">Documents</span>
            <span className="xs:hidden">Docs</span>
          </button>
        </div>
        
        {/* Basic Information Section */}
        <div className={`form-section bg-white p-4 sm:p-6 md:p-8 mb-6 max-w-6xl mx-auto shadow-sm rounded-b-xl ${activeSection === 1 ? 'block' : 'hidden'}`}>
          <div className="flex items-center mb-4 sm:mb-6">
            <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100 text-[#FF5C00] flex items-center justify-center font-bold text-lg sm:text-xl mr-2 sm:mr-3">1</span>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Personal Information</h2>
          </div>
          <div className="h-px w-full bg-gray-100 mb-6 sm:mb-8"></div>
          
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
          
          <div className="input-container mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="phone">
              Phone Number <span className="text-red-500 text-sm">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm"
              placeholder="Your phone number"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-5">
            <div className="input-container mb-0">
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
            
            <div className="input-container mb-0">
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-5">
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
          
          {formData.gender === "OTHER" && (
            <div className="mb-5 -mt-2 sm:mt-0 sm:ml-0 sm:w-1/2">
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
              className="submit-button px-4 sm:px-6 py-2.5 sm:py-3 text-white bg-[#FF5C00] rounded-lg hover:bg-[#E65100] focus:outline-none transition-colors disabled:opacity-70 shadow-md flex items-center w-full sm:w-auto justify-center"
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
        <div className={`form-section bg-white p-4 sm:p-6 md:p-8 mb-6 max-w-6xl mx-auto shadow-sm rounded-b-xl ${activeSection === 2 ? 'block' : 'hidden'}`}>
          <div className="flex items-center mb-4 sm:mb-6">
            <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100 text-[#FF5C00] flex items-center justify-center font-bold text-lg sm:text-xl mr-2 sm:mr-3">2</span>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Address Information</h2>
          </div>
          <div className="h-px w-full bg-gray-100 mb-6 sm:mb-8"></div>
          
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
          
          <div className="mt-8 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
            <button
              type="button"
              className="back-button px-4 sm:px-6 py-2.5 sm:py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors mr-0 sm:mr-4 shadow-sm flex items-center justify-center sm:justify-start w-full sm:w-auto"
              onClick={() => setActiveSection(1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            <button
              type="button"
              className="submit-button px-4 sm:px-6 py-2.5 sm:py-3 text-white bg-[#FF5C00] rounded-lg hover:bg-[#E65100] focus:outline-none transition-colors disabled:opacity-70 shadow-md flex items-center justify-center sm:justify-start w-full sm:w-auto"
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
        <div className={`form-section bg-white p-4 sm:p-6 md:p-8 mb-6 max-w-6xl mx-auto shadow-sm rounded-b-xl ${activeSection === 3 ? 'block' : 'hidden'}`}>
          <div className="flex items-center mb-4 sm:mb-6">
            <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100 text-[#FF5C00] flex items-center justify-center font-bold text-lg sm:text-xl mr-2 sm:mr-3">3</span>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Employment Information</h2>
          </div>
          <div className="h-px w-full bg-gray-100 mb-6 sm:mb-8"></div>
          
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
            <BranchSelector 
              onBranchSelect={(branch) => {
                setFormData({
                  ...formData,
                  branchDepartment: branch
                });
              }} 
              selectedBranch={formData.branchDepartment}
            />
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
          
          <div className="mt-8 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
            <button
              type="button"
              className="back-button px-4 sm:px-6 py-2.5 sm:py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors mr-0 sm:mr-4 shadow-sm flex items-center justify-center sm:justify-start w-full sm:w-auto"
              onClick={() => setActiveSection(2)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            <button
              type="button"
              className="submit-button px-4 sm:px-6 py-2.5 sm:py-3 text-white bg-[#FF5C00] rounded-lg hover:bg-[#E65100] focus:outline-none transition-colors disabled:opacity-70 shadow-md flex items-center justify-center sm:justify-start w-full sm:w-auto"
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