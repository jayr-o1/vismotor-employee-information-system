import { useState, useEffect } from 'react';
import { regions, provinces, cities, barangays } from 'ph-locations';

function InspectLocation() {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [regionProvinces, setRegionProvinces] = useState([]);
  
  useEffect(() => {
    if (selectedRegion) {
      const filtered = provinces.filter(p => p.regionCode === selectedRegion);
      setRegionProvinces(filtered);
    } else {
      setRegionProvinces([]);
    }
  }, [selectedRegion]);
  
  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Location Data Debugger</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Test Region Selection
        </label>
        <select 
          value={selectedRegion}
          onChange={handleRegionChange}
          className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 border"
        >
          <option value="">Select a region to test</option>
          {regions.map(region => (
            <option key={region.code} value={region.code}>
              {region.name} (Code: {region.code})
            </option>
          ))}
        </select>
      </div>
      
      <div className="text-sm">
        <p className="font-medium">Data counts:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Total regions: {regions.length}</li>
          <li>Total provinces: {provinces.length}</li>
          <li>Total cities: {cities.length}</li>
          <li>Total barangays: {barangays.length}</li>
        </ul>
      </div>
      
      {selectedRegion && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="font-medium">Provinces in {regions.find(r => r.code === selectedRegion)?.name} (Code: {selectedRegion}):</p>
          {regionProvinces.length > 0 ? (
            <ul className="list-disc pl-5 mt-1 space-y-1 max-h-40 overflow-y-auto">
              {regionProvinces.map(province => (
                <li key={province.code}>
                  {province.name} (Code: {province.code})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-red-500 mt-2">No provinces found for this region code!</p>
          )}
        </div>
      )}
    </div>
  );
}

export default InspectLocation; 