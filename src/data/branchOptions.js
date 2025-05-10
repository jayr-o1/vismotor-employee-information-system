// Branch location data organized by region

export const cebuBranches = [
  "Basak",
  "Bogo",
  "Daanbantayan",
  "Liloan",
  "Mandaue",
  "Medellin",
  "Pajo",
  "San Remigio",
  "Talamban",
  "Colon",
  "Balamban",
  "Danao",
  "Babag",
  "Badian",
  "Dumanjug",
  "Sibonga",
  "Pinamungahan",
  "San Fernando",
  "Madridejos",
  "Camotes",
  "Tayud",
  "Barili",
  "Labogon",
  "Casuntingan",
  "Bantayan 2",
  "Labangon",
  "PIT-OS"
];

export const negrosBranches = [
  "Bayawan",
  "Dumaguete",
  "Tanjay",
  "San Carlos",
  "Sta Catalina"
];

export const leyteBranches = [
  "Bato",
  "Baybay",
  "Cabalian",
  "Hilongos",
  "HInunangan",
  "Kananga",
  "Liloan-Leyte",
  "Maasin",
  "Sogod",
  "Burauen",
  "Naval",
  "Villaba",
  "Capoocan",
  "Alang-Alang",
  "Palompon",
  "Abuyog",
  "Tanauan",
  "Dulag",
  "Palo Leyte",
  "Marasbaras",
  "Isabel",
  "Nula-Tula"
];

export const samarBranches = [
  "Balangiga",
  "Borongan",
  "Calbayog",
  "Catarman",
  "Dolores",
  "Guiuan",
  "Rawis",
  "Basey",
  "Gamay",
  "Dolores MB",
  "Gandara",
  "Catbalogan",
  "Mondragon",
  "PARANAS",
  "Oras"
];

// Other options
export const otherBranches = [
  "Head Office",
  "Other"
];

// Combined list of all branches
export const allBranches = [
  ...cebuBranches,
  ...negrosBranches,
  ...leyteBranches,
  ...samarBranches,
  ...otherBranches
];

// Grouped branches by region for selection
export const branchesByRegion = {
  "Cebu": cebuBranches,
  "Negros": negrosBranches,
  "Leyte": leyteBranches,
  "Samar": samarBranches,
  "Other": otherBranches
}; 