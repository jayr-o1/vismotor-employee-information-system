import React, { useState, useEffect } from 'react';
import { branchesByRegion } from '../data/branchOptions';

const BranchSelector = ({ onBranchSelect, selectedBranch }) => {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [error, setError] = useState(false);
  
  // Find which region the selectedBranch belongs to
  useEffect(() => {
    if (selectedBranch) {
      for (const [region, branches] of Object.entries(branchesByRegion)) {
        if (branches.includes(selectedBranch)) {
          setSelectedRegion(region);
          setError(false);
          break;
        }
      }
    }
  }, [selectedBranch]);
  
  const regions = Object.keys(branchesByRegion);
  
  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
    setError(e.target.value === '');
    
    // Reset branch selection when region changes
    if (selectedBranch && branchesByRegion[e.target.value] && !branchesByRegion[e.target.value].includes(selectedBranch)) {
      onBranchSelect('');
    }
  };
  
  const handleBranchChange = (e) => {
    onBranchSelect(e.target.value);
  };
  
  const validateOnBlur = () => {
    setError(selectedRegion === '');
  };
  
  return (
    <div className="space-y-3">
      <div className="relative w-full">
        <select
          id="region"
          name="region"
          className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm appearance-none text-sm sm:text-base`}
          value={selectedRegion}
          onChange={handleRegionChange}
          onBlur={validateOnBlur}
          required
        >
          <option value="">Select a region</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {error && <p className="text-red-500 text-xs mt-1">Please select a region</p>}
      
      {selectedRegion && (
        <div className="relative w-full mt-2 sm:mt-3">
          <select
            id="branch"
            name="branch"
            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C00] focus:border-[#FF5C00] shadow-sm appearance-none text-sm sm:text-base"
            value={selectedBranch}
            onChange={handleBranchChange}
            required
          >
            <option value="">Select a branch</option>
            {branchesByRegion[selectedRegion].map((branch) => (
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
      )}
    </div>
  );
};

export default BranchSelector; 