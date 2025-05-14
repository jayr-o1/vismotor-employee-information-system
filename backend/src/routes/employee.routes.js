const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee/employee.controller");
const uploadMiddleware = require("../middleware/upload.middleware");
const { validateToken } = require("../middleware/auth.middleware");

// Get all employees
router.get("/api/employees", validateToken, employeeController.getAllEmployees);

// Get employee by ID
router.get("/api/employees/:id", validateToken, employeeController.getEmployeeById);

// Get employee public profile
router.get("/api/employees/:id/public-profile", employeeController.getPublicProfile);

// Create new employee
router.post("/api/employees", validateToken, employeeController.createEmployee);

// Update employee
router.put("/api/employees/:id", validateToken, employeeController.updateEmployee);

// Update employee status
router.patch("/api/employees/:id/status", validateToken, employeeController.updateStatus);

// Delete employee
router.delete("/api/employees/:id", validateToken, employeeController.deleteEmployee);

// Upload profile picture
router.post(
  "/api/employees/:id/profile-picture", 
  validateToken,
  uploadMiddleware.uploadProfilePicture,
  employeeController.uploadProfilePicture
);

// Employee onboarding
router.get("/api/employees/:id/onboarding-progress", validateToken, employeeController.getOnboardingProgress);
router.get("/api/employees/:id/equipment", validateToken, employeeController.getEquipment);
router.post("/api/employees/:id/equipment", validateToken, employeeController.saveEquipment);
router.get("/api/employees/:id/documents", validateToken, employeeController.getDocuments);
router.post("/api/employees/:id/documents", validateToken, employeeController.saveDocuments);
router.get("/api/employees/:id/training", validateToken, employeeController.getTraining);
router.post("/api/employees/:id/training", validateToken, employeeController.saveTraining);

// Type endpoints for onboarding
router.get("/api/equipment-types", employeeController.getEquipmentTypes);
router.get("/api/document-types", employeeController.getDocumentTypes);
router.get("/api/training-types", employeeController.getTrainingTypes);

// Equipment types endpoint
router.get("/api/equipment-types", (req, res) => {
  res.status(200).json([
    { id: 1, name: "Laptop", description: "Standard work laptop" },
    { id: 2, name: "Desktop", description: "Office desktop computer" },
    { id: 3, name: "Phone", description: "Company mobile phone" },
    { id: 4, name: "Monitor", description: "Computer monitor" },
    { id: 5, name: "Headset", description: "Audio headset for calls" }
  ]);
});

// Document types endpoint
router.get("/api/document-types", (req, res) => {
  res.status(200).json([
    { id: 1, name: "ID Card", required: true },
    { id: 2, name: "Resume/CV", required: true },
    { id: 3, name: "Educational Certificate", required: true },
    { id: 4, name: "Work Experience Letter", required: false },
    { id: 5, name: "Tax Documents", required: true }
  ]);
});

// Training types endpoint
router.get("/api/training-types", (req, res) => {
  res.status(200).json([
    { id: 1, name: "Orientation", description: "New employee orientation" },
    { id: 2, name: "Software Training", description: "Training on company software" },
    { id: 3, name: "Security Protocols", description: "Information security training" },
    { id: 4, name: "HR Policies", description: "Human resources policy training" },
    { id: 5, name: "Job-specific Training", description: "Role-specific training" }
  ]);
});

module.exports = router; 