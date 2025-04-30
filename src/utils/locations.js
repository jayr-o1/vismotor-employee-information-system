// Import the ph-locations package
import { regions as phpRegions, provinces as phpProvinces, cities as phpCities, barangays as phpBarangays } from 'ph-locations';
import allBarangays from './barangayData';

// Debug the original ph-locations data
console.log("PH-Locations package data:", {
  regions: phpRegions?.length || 0,
  provinces: phpProvinces?.length || 0,
  cities: phpCities?.length || 0
});

// Debug the barangay data
console.log("Sampling barangay data:", {
  totalBarangays: allBarangays.length,
  firstFewBarangays: allBarangays.slice(0, 5),
  cebuCityBarangays: allBarangays.filter(b => b.cityCode === "070201").length,
  randomCityCodes: [...new Set(allBarangays.slice(0, 100).map(b => b.cityCode))]
});

// Create simplified test data with only Visayas regions
const testRegions = [
  { code: "06", name: "Region VI - Western Visayas" },
  { code: "07", name: "Region VII - Central Visayas" },
  { code: "08", name: "Region VIII - Eastern Visayas" }
];

const testProvinces = [
  // Western Visayas (Region VI)
  { code: "0601", name: "Aklan", regCode: "06" },
  { code: "0602", name: "Antique", regCode: "06" },
  { code: "0603", name: "Capiz", regCode: "06" },
  { code: "0604", name: "Iloilo", regCode: "06" },
  { code: "0605", name: "Negros Occidental", regCode: "06" },
  { code: "0606", name: "Guimaras", regCode: "06" },
  
  // Central Visayas (Region VII)
  { code: "0701", name: "Bohol", regCode: "07" },
  { code: "0702", name: "Cebu", regCode: "07" },
  { code: "0703", name: "Negros Oriental", regCode: "07" },
  { code: "0704", name: "Siquijor", regCode: "07" },
  
  // Eastern Visayas (Region VIII)
  { code: "0801", name: "Biliran", regCode: "08" },
  { code: "0802", name: "Eastern Samar", regCode: "08" },
  { code: "0803", name: "Leyte", regCode: "08" },
  { code: "0804", name: "Northern Samar", regCode: "08" },
  { code: "0805", name: "Samar", regCode: "08" },
  { code: "0806", name: "Southern Leyte", regCode: "08" }
];

const testCities = [
  // Western Visayas Cities (Region VI)
  // Aklan
  { code: "060101", name: "Kalibo", provCode: "0601" },
  { code: "060102", name: "Boracay", provCode: "0601" },
  { code: "060103", name: "Malay", provCode: "0601" },
  { code: "060104", name: "Ibajay", provCode: "0601" },
  { code: "060105", name: "Makato", provCode: "0601" },
  { code: "060106", name: "Tangalan", provCode: "0601" },
  { code: "060107", name: "Nabas", provCode: "0601" },
  { code: "060108", name: "New Washington", provCode: "0601" },
  { code: "060109", name: "Numancia", provCode: "0601" },
  { code: "060110", name: "Lezo", provCode: "0601" },
  
  // Antique
  { code: "060201", name: "San Jose", provCode: "0602" },
  { code: "060202", name: "Sibalom", provCode: "0602" },
  { code: "060203", name: "Culasi", provCode: "0602" },
  { code: "060204", name: "Pandan", provCode: "0602" },
  { code: "060205", name: "Bugasong", provCode: "0602" },
  { code: "060206", name: "Sebaste", provCode: "0602" },
  { code: "060207", name: "Laua-an", provCode: "0602" },
  { code: "060208", name: "Patnongon", provCode: "0602" },
  
  // Capiz
  { code: "060301", name: "Roxas City", provCode: "0603" },
  { code: "060302", name: "Panay", provCode: "0603" },
  { code: "060303", name: "Pilar", provCode: "0603" },
  { code: "060304", name: "Pontevedra", provCode: "0603" },
  { code: "060305", name: "President Roxas", provCode: "0603" },
  { code: "060306", name: "Maayon", provCode: "0603" },
  { code: "060307", name: "Dumalag", provCode: "0603" },
  
  // Iloilo
  { code: "060401", name: "Iloilo City", provCode: "0604" },
  { code: "060402", name: "Passi", provCode: "0604" },
  { code: "060403", name: "Oton", provCode: "0604" },
  { code: "060404", name: "Pavia", provCode: "0604" },
  { code: "060405", name: "Leganes", provCode: "0604" },
  { code: "060406", name: "Santa Barbara", provCode: "0604" },
  { code: "060407", name: "San Miguel", provCode: "0604" },
  { code: "060408", name: "Miagao", provCode: "0604" },
  { code: "060409", name: "Dumangas", provCode: "0604" },
  { code: "060410", name: "Jaro", provCode: "0604" },
  
  // Negros Occidental
  { code: "060501", name: "Bacolod", provCode: "0605" },
  { code: "060502", name: "Silay", provCode: "0605" },
  { code: "060503", name: "Talisay", provCode: "0605" },
  { code: "060504", name: "Bago", provCode: "0605" },
  { code: "060505", name: "La Carlota", provCode: "0605" },
  { code: "060506", name: "Kabankalan", provCode: "0605" },
  { code: "060507", name: "Cadiz", provCode: "0605" },
  { code: "060508", name: "Sagay", provCode: "0605" },
  { code: "060509", name: "Victorias", provCode: "0605" },
  { code: "060510", name: "Escalante", provCode: "0605" },
  
  // Guimaras
  { code: "060601", name: "Jordan", provCode: "0606" },
  { code: "060602", name: "Buenavista", provCode: "0606" },
  { code: "060603", name: "Nueva Valencia", provCode: "0606" },
  { code: "060604", name: "San Lorenzo", provCode: "0606" },
  { code: "060605", name: "Sibunag", provCode: "0606" },
  
  // Central Visayas Cities (Region VII)
  // Bohol
  { code: "070101", name: "Tagbilaran", provCode: "0701" },
  { code: "070102", name: "Panglao", provCode: "0701" },
  { code: "070103", name: "Dauis", provCode: "0701" },
  { code: "070104", name: "Jagna", provCode: "0701" },
  { code: "070105", name: "Tubigon", provCode: "0701" },
  { code: "070106", name: "Carmen", provCode: "0701" },
  { code: "070107", name: "Ubay", provCode: "0701" },
  { code: "070108", name: "Loboc", provCode: "0701" },
  { code: "070109", name: "Cortes", provCode: "0701" },
  { code: "070110", name: "Talibon", provCode: "0701" },
  
  // Cebu
  { code: "070201", name: "Cebu City", provCode: "0702" },
  { code: "070202", name: "Mandaue", provCode: "0702" },
  { code: "070203", name: "Lapu-Lapu", provCode: "0702" },
  { code: "070204", name: "Talisay", provCode: "0702" },
  { code: "070205", name: "Danao", provCode: "0702" },
  { code: "070206", name: "Toledo", provCode: "0702" },
  { code: "070207", name: "Carcar", provCode: "0702" },
  { code: "070208", name: "Naga", provCode: "0702" },
  { code: "070209", name: "Bogo", provCode: "0702" },
  { code: "070210", name: "Liloan", provCode: "0702" },
  { code: "070211", name: "Consolacion", provCode: "0702" },
  { code: "070212", name: "Minglanilla", provCode: "0702" },
  
  // Negros Oriental
  { code: "070301", name: "Dumaguete", provCode: "0703" },
  { code: "070302", name: "Bais", provCode: "0703" },
  { code: "070303", name: "Bayawan", provCode: "0703" },
  { code: "070304", name: "Canlaon", provCode: "0703" },
  { code: "070305", name: "Tanjay", provCode: "0703" },
  { code: "070306", name: "Guihulngan", provCode: "0703" },
  { code: "070307", name: "Valencia", provCode: "0703" },
  { code: "070308", name: "Sibulan", provCode: "0703" },
  { code: "070309", name: "Siaton", provCode: "0703" },
  { code: "070310", name: "Amlan", provCode: "0703" },
  
  // Siquijor
  { code: "070401", name: "Siquijor", provCode: "0704" },
  { code: "070402", name: "Larena", provCode: "0704" },
  { code: "070403", name: "Lazi", provCode: "0704" },
  { code: "070404", name: "San Juan", provCode: "0704" },
  { code: "070405", name: "Maria", provCode: "0704" },
  { code: "070406", name: "Enrique Villanueva", provCode: "0704" },
  
  // Eastern Visayas Cities (Region VIII)
  // Biliran
  { code: "080101", name: "Naval", provCode: "0801" },
  { code: "080102", name: "Biliran", provCode: "0801" },
  { code: "080103", name: "Cabucgayan", provCode: "0801" },
  { code: "080104", name: "Caibiran", provCode: "0801" },
  { code: "080105", name: "Culaba", provCode: "0801" },
  { code: "080106", name: "Kawayan", provCode: "0801" },
  { code: "080107", name: "Maripipi", provCode: "0801" },
  { code: "080108", name: "Almeria", provCode: "0801" },
  
  // Eastern Samar
  { code: "080201", name: "Borongan", provCode: "0802" },
  { code: "080202", name: "Guiuan", provCode: "0802" },
  { code: "080203", name: "Dolores", provCode: "0802" },
  { code: "080204", name: "Oras", provCode: "0802" },
  { code: "080205", name: "Balangiga", provCode: "0802" },
  { code: "080206", name: "Sulat", provCode: "0802" },
  { code: "080207", name: "Taft", provCode: "0802" },
  { code: "080208", name: "San Policarpo", provCode: "0802" },
  
  // Leyte
  { code: "080301", name: "Tacloban", provCode: "0803" },
  { code: "080302", name: "Ormoc", provCode: "0803" },
  { code: "080303", name: "Baybay", provCode: "0803" },
  { code: "080304", name: "Palo", provCode: "0803" },
  { code: "080305", name: "Tanauan", provCode: "0803" },
  { code: "080306", name: "Carigara", provCode: "0803" },
  { code: "080307", name: "Abuyog", provCode: "0803" },
  { code: "080308", name: "Palompon", provCode: "0803" },
  { code: "080309", name: "Hilongos", provCode: "0803" },
  { code: "080310", name: "Dulag", provCode: "0803" },
  
  // Northern Samar
  { code: "080401", name: "Catarman", provCode: "0804" },
  { code: "080402", name: "Laoang", provCode: "0804" },
  { code: "080403", name: "Allen", provCode: "0804" },
  { code: "080404", name: "San Roque", provCode: "0804" },
  { code: "080405", name: "Catubig", provCode: "0804" },
  { code: "080406", name: "Palapag", provCode: "0804" },
  { code: "080407", name: "Las Navas", provCode: "0804" },
  { code: "080408", name: "Pambujan", provCode: "0804" },
  
  // Samar
  { code: "080501", name: "Catbalogan", provCode: "0805" },
  { code: "080502", name: "Calbayog", provCode: "0805" },
  { code: "080503", name: "Basey", provCode: "0805" },
  { code: "080504", name: "Santa Rita", provCode: "0805" },
  { code: "080505", name: "Villareal", provCode: "0805" },
  { code: "080506", name: "Paranas", provCode: "0805" },
  { code: "080507", name: "Zumarraga", provCode: "0805" },
  { code: "080508", name: "Gandara", provCode: "0805" },
  
  // Southern Leyte
  { code: "080601", name: "Maasin", provCode: "0806" },
  { code: "080602", name: "Sogod", provCode: "0806" },
  { code: "080603", name: "Liloan", provCode: "0806" },
  { code: "080604", name: "San Juan", provCode: "0806" },
  { code: "080605", name: "Hinunangan", provCode: "0806" },
  { code: "080606", name: "Silago", provCode: "0806" },
  { code: "080607", name: "Saint Bernard", provCode: "0806" },
  { code: "080608", name: "Macrohon", provCode: "0806" }
];

// Normalize the barangay data to ensure cityCode formats match city.code formats
const normalizeBarangayData = (barangays, cities) => {
  // Create direct city code mapping for quick lookup
  const cityCodes = new Set(cities.map(city => city.code));
  
  // Build a comprehensive mapping of city name + province to city code
  const cityMapping = {};
  
  // Log cities with duplicated names
  const cityNameCount = {};
  cities.forEach(city => {
    const name = city.name.toLowerCase();
    cityNameCount[name] = (cityNameCount[name] || 0) + 1;
  });
  
  const duplicateCityNames = Object.entries(cityNameCount)
    .filter(([_, count]) => count > 1)
    .map(([name]) => name);
  
  console.log("Cities with duplicate names:", duplicateCityNames);
  
  // Create mapping including province info for disambiguation
  cities.forEach(city => {
    const cityName = city.name.toLowerCase();
    const province = city.provCode;
    const regionCode = city.code.substring(0, 2);
    
    // Store both with and without province for lookup
    cityMapping[`${cityName}|${province}`] = city.code;
    
    // Only add simple name mapping if it's not a duplicate name
    if (!duplicateCityNames.includes(cityName)) {
      cityMapping[cityName] = city.code;
    }
    
    // Also store region-prefixed mappings for cities with duplicate names
    if (duplicateCityNames.includes(cityName)) {
      cityMapping[`${regionCode}|${cityName}`] = city.code;
    }
  });
  
  // Special case mapping for known barangay cityCode to actual city.code
  const specialCaseMapping = {
    // Talisay, Negros Occidental (Region 6)
    "064540": "060503",
    
    // Talisay, Cebu (Region 7)
    "072222": "070204",
    
    // Add more mappings as needed for other cities with duplicate names
  };
  
  console.log("Processing barangays with special case mapping:", specialCaseMapping);
  
  // Process each barangay
  const processedBarangays = barangays.map(barangay => {
    // If cityCode already matches a city code exactly, keep it
    if (cityCodes.has(barangay.cityCode)) {
      return barangay;
    }
    
    // Check special case mapping
    if (specialCaseMapping[barangay.cityCode]) {
      return {
        ...barangay,
        cityCode: specialCaseMapping[barangay.cityCode]
      };
    }
    
    // Special case for Talisay cities based on the barangay code prefix
    if (barangay.name.includes("Talisay") || 
        (barangay.cityCode && (barangay.cityCode.includes("454") || barangay.cityCode.includes("222")))) {
      
      // If the barangay code starts with 06, it belongs to Talisay, Negros Occidental
      if (barangay.code.startsWith("06")) {
        return { ...barangay, cityCode: "060503" };
      }
      
      // If the barangay code starts with 07, it belongs to Talisay, Cebu
      if (barangay.code.startsWith("07")) {
        return { ...barangay, cityCode: "070204" };
      }
    }
    
    // Extract region info from the barangay code (first 2 digits)
    const barangayRegion = barangay.code.substring(0, 2);
    
    // Try to derive the city from context
    // First check if we can determine the city based on the code pattern
    const codePattern = barangay.cityCode.substring(0, 4);
    
    // Look for matching cities with the same region prefix
    const potentialMatches = cities.filter(city => 
      city.code.startsWith(barangayRegion) && 
      (city.code.includes(codePattern) || barangay.cityCode.includes(city.code.substring(0, 4)))
    );
    
    if (potentialMatches.length === 1) {
      // Found a unique match
      return {
        ...barangay,
        cityCode: potentialMatches[0].code
      };
    } else if (potentialMatches.length > 1) {
      // Multiple matches, try to disambiguate
      // For Talisay cities, we already handled above, but as a fallback:
      if (barangay.cityCode.includes("454") && barangayRegion === "06") {
        return { ...barangay, cityCode: "060503" }; // Negros Occidental
      } else if (barangay.cityCode.includes("222") && barangayRegion === "07") {
        return { ...barangay, cityCode: "070204" }; // Cebu
      }
      
      // For other duplicate-named cities, use the first match for now
      // This should be improved with better disambiguation if needed
      console.log(`Multiple city matches for barangay ${barangay.name}, cityCode ${barangay.cityCode}: `, 
        potentialMatches.map(m => `${m.name} (${m.code})`));
      return {
        ...barangay,
        cityCode: potentialMatches[0].code
      };
    }
    
    // If we still can't find a match, return the original
    console.log(`No city match found for barangay ${barangay.name}, cityCode ${barangay.cityCode}`);
    return barangay;
  });
  
  // Log statistics of the normalization
  const beforeCodes = new Set(barangays.map(b => b.cityCode));
  const afterCodes = new Set(processedBarangays.map(b => b.cityCode));
  
  console.log("Normalization stats:", {
    totalBarangays: barangays.length,
    uniqueCityCodesBefore: beforeCodes.size,
    uniqueCityCodesAfter: afterCodes.size,
    matchedToCities: [...afterCodes].filter(code => cityCodes.has(code)).length
  });
  
  return processedBarangays;
};

// Create barangay data for major cities
const processedBarangays = normalizeBarangayData(allBarangays, testCities);

// Log results of normalization
console.log("Normalization results:", {
  before: allBarangays.length,
  after: processedBarangays.length,
  sampleBeforeCityCodes: [...new Set(allBarangays.slice(0, 10).map(b => b.cityCode))],
  sampleAfterCityCodes: [...new Set(processedBarangays.slice(0, 10).map(b => b.cityCode))]
});

// Decide whether to use the package data or test data
// Use test data if the package data seems incomplete or always use our Visayas data
const useTestData = true; // Set to true to use test data

// Extract and export the location data, falling back to test data if needed
export const regions = useTestData ? testRegions : phpRegions;
export const provinces = useTestData ? testProvinces : phpProvinces;
export const cities = useTestData ? testCities : phpCities;
export const barangays = useTestData ? processedBarangays : phpBarangays;

// Log what we're actually using
console.log(`Using ${regions.length} regions, ${provinces.length} provinces, ${cities.length} cities, and ${barangays.length} barangays`);
console.log("Final location data:", {
  regions: regions.length,
  provinces: provinces.length,
  cities: cities.length,
  barangays: barangays.length
}); 