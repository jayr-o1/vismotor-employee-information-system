import { useState, useEffect } from 'react';
import apiService from '../services/api';  // Import the API service

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
  
  // Toggle for validation during development
  const [validationEnabled, setValidationEnabled] = useState(true);

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

  // Toggle validation function
  const toggleValidation = () => {
    const newValidationState = !validationEnabled;
    setValidationEnabled(newValidationState);
    setValidationError('');
    
    // If turning validation off, allow navigation to any section
    if (!newValidationState) {
      // Clear any validation errors when disabling validation
      setValidationError('');
    } else {
      // When turning validation back on, verify current section
      switch(activeSection) {
        case 2:
          if (!validatePersonalSection()) {
            setActiveSection(1);
            setValidationError("Please complete Personal Information section first.");
          }
          break;
        case 3:
          if (!validatePersonalSection() || !validateAddressSection()) {
            if (!validatePersonalSection()) {
              setActiveSection(1);
            } else {
              setActiveSection(2);
            }
            setValidationError("Please complete all previous sections first.");
          }
          break;
        case 4:
          if (!validatePersonalSection() || !validateAddressSection() || !validateEmploymentSection()) {
            if (!validatePersonalSection()) {
              setActiveSection(1);
            } else if (!validateAddressSection()) {
              setActiveSection(2);
            } else {
              setActiveSection(3);
            }
            setValidationError("Please complete all previous sections first.");
          }
          break;
        default:
          break;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  // Add validation functions for each section
  const validatePersonalSection = () => {
    // Only skip validation if disabled
    if (!validationEnabled) return true;
    
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
    // Only skip validation if disabled
    if (!validationEnabled) return true;
    
    // Only check for complete address
    if (!formData.completeAddress) {
      return false;
    }
    
    return true;
  };

  const validateEmploymentSection = () => {
    // Only skip validation if disabled
    if (!validationEnabled) return true;
    
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
    // Only skip validation if disabled
    if (!validationEnabled) return true;
    
    // Check only required fields - house sketch is now optional
    if (!formData.resumeFile) {
      return false;
    }
    return true;
  };

  // Add the document upload section render
  const renderDocumentSection = () => (
    <div className={`bg-white p-6 rounded-b-lg mt-px ${activeSection !== 4 ? 'hidden' : ''}`}>
      <div className="mb-5">
        <label className="block mb-2 font-medium text-gray-700" htmlFor="resumeFile">
          Resume/CV <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input 
            type="file" 
            id="resumeFile"
            name="resumeFile"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2 cursor-pointer bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#FF5C00] file:text-white hover:file:bg-[#E65100]"
            accept=".pdf,.doc,.docx"
            required
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">Upload your resume (PDF, DOC, DOCX)</p>
      </div>
      
      <div className="mb-5">
        <label className="block mb-2 font-medium text-gray-700" htmlFor="houseSketchFile">
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
          className="back-button px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          onClick={() => setActiveSection(3)}
        >
          Back
        </button>
        <button 
          type="submit"
          className="submit-button px-6 py-2 bg-[#FF5C00] text-white rounded-md hover:bg-[#e05400] transition disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </div>
  );

  // Add a test function to debug regions and provinces
  const testPhLocation = () => {
    console.log("Testing ph-locations data:");
    console.log("Regions:", regions);
    console.log("Provinces:", provinces);
    
    // Try to directly access and test a relationship between a region and its provinces
    if (regions.length > 0) {
      const firstRegion = regions[0];
      console.log("First region:", firstRegion);
      
      // Try to find provinces for this region using different possible property names
      const regCodeProvinces = provinces.filter(p => p.regCode === firstRegion.code);
      const regionCodeProvinces = provinces.filter(p => p.regionCode === firstRegion.code);
      const regProvinces = provinces.filter(p => p.reg === firstRegion.code);
      
      console.log("Provinces with regCode match:", regCodeProvinces.length);
      console.log("Provinces with regionCode match:", regionCodeProvinces.length);
      console.log("Provinces with reg match:", regProvinces.length);
    }
  };
  
  // Debug function for Talisay cities
  const debugTalisayCities = () => {
    console.log("=== TALISAY CITIES DEBUG ===");
    
    // Find Talisay in Negros Occidental
    const talisayNegros = cities.find(c => c.code === "060503");
    const negrosProvince = provinces.find(p => p.code === talisayNegros.provCode);
    console.log(`Talisay in ${negrosProvince.name}:`, talisayNegros);
    
    // Find barangays for Talisay in Negros Occidental
    const talisayNegrosBarangays = barangays.filter(b => b.cityCode === talisayNegros.code);
    console.log(`Found ${talisayNegrosBarangays.length} barangays for Talisay in Negros Occidental`);
    
    // Find Talisay in Cebu
    const talisayCebu = cities.find(c => c.code === "070204");
    const cebuProvince = provinces.find(p => p.code === talisayCebu.provCode);
    console.log(`Talisay in ${cebuProvince.name}:`, talisayCebu);
    
    // Find barangays for Talisay in Cebu
    const talisayCebuBarangays = barangays.filter(b => b.cityCode === talisayCebu.code);
    console.log(`Found ${talisayCebuBarangays.length} barangays for Talisay in Cebu`);
    
    // Check for any barangays still using old cityCode formats
    const oldFormatBarangays = barangays.filter(b => 
      b.cityCode.includes("454") || b.cityCode.includes("222")
    );
    
    console.log("Barangays still using old city codes:", oldFormatBarangays);
  };

  // New debug function to identify problematic barangays
  const debugProblematicBarangays = () => {
    console.log("=== PROBLEMATIC BARANGAYS DEBUG ===");
    
    // Check for the specific barangays mentioned
    const problematicNames = [
      "Biasong", "Bulacao", "Cansojong", "Dumlog", "Jaclupan", "Lagtang", 
      "Lawaan I", "Lawaan II", "Lawaan III", "Linao", "Maghaway", "Manipis", 
      "Mohon", "Poblacion", "Pooc", "San Isidro", "San Roque", "Tabunok", 
      "Tangke", "Tapul"
    ];
    
    // Find these barangays in the data
    const foundBarangays = problematicNames.map(name => {
      const matches = barangays.filter(b => b.name === name);
      return {
        name,
        count: matches.length,
        matches: matches.map(m => ({
          code: m.code,
          cityCode: m.cityCode,
          cityName: cities.find(c => c.code === m.cityCode)?.name || "Unknown City"
        }))
      };
    });
    
    console.log("Found problematic barangays:", foundBarangays);
    
    // Check for all Cebu City barangays
    const cebuCity = cities.find(c => c.name === "City of Cebu");
    console.log("Cebu City code:", cebuCity?.code);
    
    if (cebuCity) {
      const cebuBarangays = barangays.filter(b => b.cityCode === cebuCity.code);
      console.log(`Found ${cebuBarangays.length} barangays for Cebu City`);
      console.log("Sample Cebu City barangays:", cebuBarangays.slice(0, 5));
    }
    
    // Check for Talisay City barangays
    const talisayCity = cities.find(c => c.name === "City of Talisay" && c.provCode === "0722");
    console.log("Talisay City code:", talisayCity?.code);
    
    if (talisayCity) {
      const talisayBarangays = barangays.filter(b => b.cityCode === talisayCity.code);
      console.log(`Found ${talisayBarangays.length} barangays for Talisay City`);
      console.log("Talisay City barangays:", talisayBarangays);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-0 overflow-hidden">
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
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Dev Mode Toggle */}
      <div className="bg-gray-100 p-3 mb-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-gray-700 text-sm font-medium">
            {validationEnabled ? "Development Mode: OFF" : "Development Mode: ON"}
          </span>
          <button 
            type="button" 
            onClick={testPhLocation}
            className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1 px-2 rounded transition-colors"
          >
            Test Location Data
          </button>
          <button 
            type="button" 
            onClick={debugTalisayCities}
            className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1 px-2 rounded transition-colors"
          >
            Debug Talisay Cities
          </button>
          <button 
            type="button" 
            onClick={debugProblematicBarangays}
            className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1 px-2 rounded transition-colors"
          >
            Debug Barangays
          </button>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!validationEnabled}
            onChange={toggleValidation}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-700">
            Skip Validation
          </span>
        </label>
      </div>

      {/* Form Header */}
      <div className="form-header bg-white p-6 rounded-t-lg">
        <h1 className="text-[#202124] text-3xl font-normal">CANDIDATE INFORMATION DATA</h1>
        <p className="text-[#5f6368] mt-2">Join our growing team. Here at VISMOTOR, we value your interest in applying to our company.</p>
        <div className="mt-4 h-0.5 bg-[#dadce0]"></div>
      </div>
      
      {submitError && (
        <div className="mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {submitError}
        </div>
      )}
      
      {validationError && (
        <div className="mx-auto bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {validationError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mt-4">
        {/* Section Tabs */}
        <div className="bg-white px-6 py-3 flex overflow-x-auto tab-buttons-container">
          <button 
            type="button"
            className={`tab-button px-4 py-2 mr-2 rounded-full text-sm font-medium transition-colors ${activeSection === 1 ? 'bg-[#FF5C00] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveSection(1)}
          >
            1. Personal Information
          </button>
          <button 
            type="button"
            className={`tab-button px-4 py-2 mr-2 rounded-full text-sm font-medium transition-colors ${activeSection === 2 ? 'bg-[#FF5C00] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => {
              if (validatePersonalSection()) {
                setValidationError("");
                setActiveSection(2);
              } else {
                setValidationError("Please complete Personal Information section first.");
              }
            }}
          >
            2. Address Information
          </button>
          <button 
            type="button"
            className={`tab-button px-4 py-2 mr-2 rounded-full text-sm font-medium transition-colors ${activeSection === 3 ? 'bg-[#FF5C00] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => {
              if (validatePersonalSection() && validateAddressSection()) {
                setValidationError("");
                setActiveSection(3);
              } else {
                setValidationError("Please complete all previous sections first.");
              }
            }}
          >
            3. Employment Information
          </button>
          <button 
            type="button"
            className={`tab-button px-4 py-2 mr-2 rounded-full text-sm font-medium transition-colors ${activeSection === 4 ? 'bg-[#FF5C00] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => {
              if (validatePersonalSection() && validateAddressSection() && validateEmploymentSection()) {
                setValidationError("");
                setActiveSection(4);
              } else {
                setValidationError("Please complete all previous sections first.");
              }
            }}
          >
            4. Documents Upload
          </button>
        </div>
        
        {/* Basic Information Section */}
        <div className={`form-section bg-white p-6 mb-4 ${activeSection === 1 ? 'block' : 'hidden'}`}>
          <div className="flex items-center mb-4">
            <div className="section-number">1</div>
            <h2 className="section-title text-xl font-normal text-[#202124]">Personal Information</h2>
          </div>
          <div className="section-divider"></div>
          
          <div className="input-container mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="email">
              Email <span className="required-star text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00]"
              placeholder="Your email address"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="input-container">
              <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="firstName">
                First Name <span className="required-star text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00]"
                placeholder="Your first name"
                style={{
                  '::placeholder': placeholderStyle
                }}
              />
            </div>
            
            <div className="input-container">
              <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="lastName">
                Last Name <span className="required-star text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00]"
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
                Gender <span className="required-star text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] bg-white appearance-none focus:outline-none"
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
                  Specify Gender <span className="required-star text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="otherGender"
                  name="otherGender"
                  value={formData.otherGender || ''}
                  onChange={handleChange}
                  required={formData.gender === "OTHER"}
                  className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00]"
                  placeholder="Please specify"
                />
              </div>
            )}
            
            <div className="mb-0">
              <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="age">
                Age <span className="required-star text-red-500">*</span>
              </label>
              <input
                type="number"
                id="age"
                name="age"
                min="18"
                max="100"
                value={formData.age}
                onChange={handleChange}
                required
                className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] bg-white focus:outline-none"
                placeholder="Your age"
              />
            </div>
          </div>
          
          <div className="mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="maritalStatus">
              Marital Status <span className="required-star text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="maritalStatus"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                required
                className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] bg-white appearance-none focus:outline-none"
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
                Specify Marital Status <span className="required-star text-red-500">*</span>
              </label>
              <input
                type="text"
                id="otherMaritalStatus"
                name="otherMaritalStatus"
                value={formData.otherMaritalStatus || ''}
                onChange={handleChange}
                required={formData.maritalStatus === "OTHER"}
                className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00]"
                placeholder="Please specify"
              />
            </div>
          )}
          
          <div className="input-container mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="highestEducation">
              Highest Educational Attainment <span className="required-star text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="highestEducation"
                name="highestEducation"
                value={formData.highestEducation}
                onChange={handleChange}
                required
                className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] bg-white appearance-none focus:outline-none"
              >
                <option value="">Select Education Level</option>
                <option value="HIGH SCHOOL">High School</option>
                <option value="VOCATIONAL">Vocational</option>
                <option value="BACHELOR'S DEGREE">Bachelor's Degree</option>
                <option value="MASTER'S DEGREE">Master's Degree</option>
                <option value="DOCTORATE">Doctorate</option>
                <option value="OTHER">Other</option>
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
                Specify Educational Attainment <span className="required-star text-red-500">*</span>
              </label>
              <input
                type="text"
                id="otherHighestEducation"
                name="otherHighestEducation"
                value={formData.otherHighestEducation || ''}
                onChange={handleChange}
                required={formData.highestEducation === "OTHER"}
                className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00]"
                placeholder="Please specify"
              />
            </div>
          )}
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className="submit-button px-6 py-2 text-white rounded-md hover:bg-[#E65100] focus:outline-none transition-colors disabled:opacity-70"
              onClick={() => {
                if (validatePersonalSection()) {
                  setValidationError("");
                  setActiveSection(2);
                } else {
                  setValidationError("Please fill in all required fields before proceeding.");
                }
              }}
            >
              Next
            </button>
          </div>
          {activeSection === 1 && validationError && (
            <div className="validation-alert mt-2 text-sm text-red-600">
              {validationError}
            </div>
          )}
        </div>
        
        {/* Address Section */}
        <div className={`form-section bg-white p-6 mb-4 ${activeSection === 2 ? 'block' : 'hidden'}`}>
          <div className="flex items-center mb-4">
            <div className="section-number">2</div>
            <h2 className="section-title text-xl font-normal text-[#202124]">Address Information</h2>
          </div>
          <div className="section-divider"></div>
          
          <div className="mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="completeAddress">
              Complete Address <span className="required-star text-red-500">*</span>
            </label>
            <input
              type="text"
              id="completeAddress"
              name="completeAddress"
              value={formData.completeAddress}
              onChange={handleChange}
              required
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00]"
              placeholder="e.g. House No., Street, Barangay, City/Municipality, Province, Region"
            />
          </div>
          
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              className="px-6 py-2 border border-[#FF5C00] text-[#FF5C00] rounded-md hover:bg-orange-50 transition focus:outline-none"
              onClick={() => setActiveSection(1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="submit-button px-6 py-2 text-white rounded-md hover:bg-[#E65100] focus:outline-none transition-colors disabled:opacity-70"
              onClick={() => {
                if (validateAddressSection()) {
                  setValidationError("");
                  setActiveSection(3);
                } else {
                  setValidationError("Please fill in all required fields before proceeding.");
                }
              }}
            >
              Next
            </button>
          </div>
          {activeSection === 2 && validationError && (
            <div className="validation-alert mt-2 text-sm text-red-600">
              {validationError}
            </div>
          )}
        </div>
        
        {/* Employment Details Section */}
        <div className={`form-section bg-white p-6 mb-4 ${activeSection === 3 ? 'block' : 'hidden'}`}>
          <div className="flex items-center mb-4">
            <div className="section-number">3</div>
            <h2 className="section-title text-xl font-normal text-[#202124]">Employment Details</h2>
          </div>
          <div className="section-divider"></div>
          
          <div className="mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="positionApplyingFor">
              Position Applying For <span className="required-star text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="positionApplyingFor"
                name="positionApplyingFor"
                value={formData.positionApplyingFor}
                onChange={handleChange}
                required
                className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] bg-white appearance-none focus:outline-none"
              >
                <option value="">Select Position</option>
                <option value="ACCOUNTING STAFF">Accounting Staff</option>
                <option value="AREA COLLECTION OFFICER">Area Collection Officer</option>
                <option value="BRANCH AUDITOR">Branch Auditor</option>
                <option value="BUSINESS PROCESS ANALYST">Business Process Analyst</option>
                <option value="BUSINESS PROCESS AND APPLICATION">Business Process and Application</option>
                <option value="CASHIER">Cashier</option>
                <option value="CLUSTER HEAD CREDIT AND COLLECTION">Cluster Head Credit and Collection</option>
                <option value="CLUSTER HEAD SALES">Cluster Head Sales</option>
                <option value="CREDIT AND COLLECTION ADVISOR (CCA / CI / COLLECTOR)">Credit and Collection Advisor (CCA / CI / Collector)</option>
                <option value="DIGITAL MARKETING AND SEO OFFICER">Digital Marketing and SEO Officer</option>
                <option value="FINANCE AUDIT">Finance Audit</option>
                <option value="FINANCE MANAGER">Finance Manager</option>
                <option value="GENERAL ACCOUNTANT">General Accountant</option>
                <option value="GRAPHIC ARTIST">Graphic Artist</option>
                <option value="LIAISON ADMIN / STAFF">Liaison Admin / Staff</option>
                <option value="LIAISON MANAGER">Liaison Manager</option>
                <option value="LIAISON OFFICER">Liaison Officer</option>
                <option value="MANAGEMENT ACCOUNTANT">Management Accountant</option>
                <option value="MARKETING ASSISTANT">Marketing Assistant</option>
                <option value="MARKETING MANAGER">Marketing Manager</option>
                <option value="MECHANIC">Mechanic</option>
                <option value="MERCHANDISING">Merchandising</option>
                <option value="PARTS CUSTODIAN">Parts Custodian</option>
                <option value="SALES ADMIN (FEMALE)">Sales Admin (Female)</option>
                <option value="SALES ADVISOR (MALE)">Sales Advisor (Male)</option>
                <option value="SALES AND OPERATION MANAGER">Sales and Operation Manager</option>
                <option value="SUPERVISOR - BRANCH OPERATIONS/ BRANCH MANAGER">Supervisor - Branch Operations/ Branch Manager</option>
                <option value="OTHER">Other</option>
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
                Specify Other Position <span className="required-star text-red-500">*</span>
              </label>
              <input
                type="text"
                id="otherPosition"
                name="otherPosition"
                value={formData.otherPosition}
                onChange={handleChange}
                required={formData.positionApplyingFor === "OTHER"}
                className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00]"
                placeholder="Specify the position you're applying for"
              />
            </div>
          )}
          
          <div className="mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="branchDepartment">
              Branch or Department Applying For <span className="required-star text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="branchDepartment"
                name="branchDepartment"
                value={formData.branchDepartment}
                onChange={handleChange}
                required
                className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] bg-white appearance-none focus:outline-none"
              >
                <option value="">Select Branch/Department</option>
                <optgroup label="CEBU AREAS">
                  <option value="Basak">Basak</option>
                  <option value="Bogo">Bogo</option>
                  <option value="Daanbantayan">Daanbantayan</option>
                  <option value="Liloan">Liloan</option>
                  <option value="Mandaue">Mandaue</option>
                  <option value="Medellin">Medellin</option>
                  <option value="Pajo">Pajo</option>
                  <option value="San Remigio">San Remigio</option>
                  <option value="Talamban">Talamban</option>
                  <option value="Colon">Colon</option>
                  <option value="Balamban">Balamban</option>
                  <option value="Danao">Danao</option>
                  <option value="Babag">Babag</option>
                  <option value="Badian">Badian</option>
                  <option value="Dumanjug">Dumanjug</option>
                  <option value="Sibonga">Sibonga</option>
                  <option value="Pinamungahan">Pinamungahan</option>
                  <option value="San Fernando">San Fernando</option>
                  <option value="Madridejos">Madridejos</option>
                  <option value="Camotes">Camotes</option>
                  <option value="Tayud">Tayud</option>
                  <option value="Barili">Barili</option>
                  <option value="Labogon">Labogon</option>
                  <option value="Casuntingan">Casuntingan</option>
                  <option value="Bantayan">Bantayan</option>
                </optgroup>
                <optgroup label="NEGROS AREAS">
                  <option value="Bayawan">Bayawan</option>
                  <option value="Dumaguete">Dumaguete</option>
                  <option value="Tanjay">Tanjay</option>
                  <option value="San Carlos">San Carlos</option>
                  <option value="Sta Catalina">Sta Catalina</option>
                </optgroup>
                <optgroup label="LEYTE AREAS">
                  <option value="Bato">Bato</option>
                  <option value="Baybay">Baybay</option>
                  <option value="Cabalian">Cabalian</option>
                  <option value="Hilongos">Hilongos</option>
                  <option value="HInunangan">HInunangan</option>
                  <option value="Kananga">Kananga</option>
                  <option value="Liloan-Leyte">Liloan-Leyte</option>
                  <option value="Maasin">Maasin</option>
                  <option value="Sogod">Sogod</option>
                  <option value="Burauen">Burauen</option>
                  <option value="Naval">Naval</option>
                  <option value="Villaba">Villaba</option>
                  <option value="Capoocan">Capoocan</option>
                  <option value="Alang-Alang">Alang-Alang</option>
                  <option value="Palompon">Palompon</option>
                  <option value="Abuyog">Abuyog</option>
                  <option value="Tanauan">Tanauan</option>
                  <option value="Dulag">Dulag</option>
                  <option value="Palo Leyte">Palo Leyte</option>
                  <option value="Marasbaras">Marasbaras</option>
                  <option value="Isabel">Isabel</option>
                  <option value="Nula-Tula">Nula-Tula</option>
                </optgroup>
                <optgroup label="SAMAR AREAS">
                  <option value="Balangiga">Balangiga</option>
                  <option value="Borongan">Borongan</option>
                  <option value="Calbayog">Calbayog</option>
                  <option value="Catarman">Catarman</option>
                  <option value="Dolores">Dolores</option>
                  <option value="Guiuan">Guiuan</option>
                  <option value="Rawis">Rawis</option>
                  <option value="Basey">Basey</option>
                  <option value="Gamay">Gamay</option>
                  <option value="Dolores MB">Dolores MB</option>
                  <option value="Gandara">Gandara</option>
                  <option value="Catbalogan">Catbalogan</option>
                  <option value="Mondragon">Mondragon</option>
                </optgroup>
                <optgroup label="OTHER">
                  <option value="Other">Other (please specify)</option>
                </optgroup>
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
                Specify Other Branch/Department <span className="required-star text-red-500">*</span>
              </label>
              <input
                type="text"
                id="otherBranchDepartment"
                name="otherBranchDepartment"
                value={formData.otherBranchDepartment || ''}
                onChange={handleChange}
                required={formData.branchDepartment === "Other"}
                className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00]"
                placeholder="Specify the branch or department"
              />
            </div>
          )}
          
          <div className="mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="previouslyEmployed">
              Have you been employed to Vismotor Corporation before? <span className="required-star text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="previouslyEmployed"
                name="previouslyEmployed"
                value={formData.previouslyEmployed}
                onChange={handleChange}
                required
                className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] bg-white appearance-none focus:outline-none"
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
              Date Availability to Start <span className="required-star text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="dateAvailability"
                name="dateAvailability"
                value={formData.dateAvailability}
                onChange={handleChange}
                required
                className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] bg-white appearance-none focus:outline-none"
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
                Specify Availability <span className="required-star text-red-500">*</span>
              </label>
              <input
                type="text"
                id="otherDateAvailability"
                name="otherDateAvailability"
                value={formData.otherDateAvailability || ''}
                onChange={handleChange}
                required={formData.dateAvailability === "OTHER"}
                className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00]"
                placeholder="Please specify your availability"
              />
            </div>
          )}
          
          <div className="input-container mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="desiredPay">
              Desired Pay <span className="required-star text-red-500">*</span>
            </label>
            <input
              type="text"
              id="desiredPay"
              name="desiredPay"
              value={formData.desiredPay}
              onChange={handleChange}
              required
              placeholder="e.g. ₱15,000 - ₱20,000"
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00]"
            />
          </div>
          
          <div className="mb-5">
            <label className="block form-label mb-2 font-medium text-gray-700" htmlFor="jobPostSource">
              Where did you see our job posting or hiring? <span className="required-star text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="jobPostSource"
                name="jobPostSource"
                value={formData.jobPostSource}
                onChange={handleChange}
                required
                className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] bg-white appearance-none focus:outline-none"
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
                Specify Other Source <span className="required-star text-red-500">*</span>
              </label>
              <input
                type="text"
                id="otherJobSource"
                name="otherJobSource"
                value={formData.otherJobSource}
                onChange={handleChange}
                required={formData.jobPostSource === "Other"}
                className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00]"
                placeholder="Enter the source"
              />
            </div>
          )}
          
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              className="px-6 py-2 border border-[#FF5C00] text-[#FF5C00] rounded-md hover:bg-orange-50 transition focus:outline-none"
              onClick={() => setActiveSection(2)}
            >
              Previous
            </button>
            <button
              type="button"
              className="submit-button px-6 py-2 text-white rounded-md hover:bg-[#E65100] focus:outline-none transition-colors disabled:opacity-70"
              onClick={() => {
                if (validateEmploymentSection()) {
                  setValidationError("");
                  setActiveSection(4);
                } else {
                  setValidationError("Please fill in all required fields before proceeding.");
                }
              }}
            >
              Next
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
      
      <div className="text-sm text-[#5f6368] p-4 flex items-center">
        <span className="required-star text-red-500 mr-1">*</span> Required fields
      </div>
    </div>
  );
}

export default ApplicationForm; 