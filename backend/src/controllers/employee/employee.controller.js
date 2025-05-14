const employeeModel = require('../../models/employee.model');
const { AppError } = require('../../middleware/error.middleware');

/**
 * Controller for employee operations
 * Implementing actual business logic using model functions
 */

// Get all employees
const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await employeeModel.findAll();
    res.status(200).json({
      success: true,
      message: "Successfully retrieved all employees",
      data: employees
    });
  } catch (error) {
    next(error);
  }
};

// Get employee by ID
const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await employeeModel.findById(id);
    
    if (!employee) {
      return next(new AppError(`Employee with ID ${id} not found`, 404));
    }
    
    res.status(200).json({
      success: true,
      message: "Successfully retrieved employee",
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

// Get employee public profile
const getPublicProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await employeeModel.findById(id);
    
    if (!employee) {
      return next(new AppError(`Employee with ID ${id} not found`, 404));
    }
    
    // Only return public information
    const publicProfile = {
      id: employee.id,
      name: employee.name,
      position: employee.position,
      department: employee.department,
      profile_picture: employee.profile_picture
    };
    
    res.status(200).json({
      success: true,
      message: "Successfully retrieved employee public profile",
      data: publicProfile
    });
  } catch (error) {
    next(error);
  }
};

// Create employee
const createEmployee = async (req, res, next) => {
  try {
    const newEmployee = await employeeModel.create(req.body);
    
    res.status(201).json({
      success: true,
      message: "Successfully created employee",
      data: newEmployee
    });
  } catch (error) {
    next(error);
  }
};

// Update employee
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedEmployee = await employeeModel.update(id, req.body);
    
    if (!updatedEmployee) {
      return next(new AppError(`Employee with ID ${id} not found`, 404));
    }
    
    res.status(200).json({
      success: true,
      message: "Successfully updated employee",
      data: updatedEmployee
    });
  } catch (error) {
    next(error);
  }
};

// Update employee status
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return next(new AppError('Status is required', 400));
    }
    
    const success = await employeeModel.updateStatus(id, status);
    
    if (!success) {
      return next(new AppError(`Employee with ID ${id} not found`, 404));
    }
    
    res.status(200).json({
      success: true,
      message: `Successfully updated employee status to ${status}`,
      data: { id, status }
    });
  } catch (error) {
    next(error);
  }
};

// Delete employee
const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = await employeeModel.remove(id);
    
    if (!success) {
      return next(new AppError(`Employee with ID ${id} not found`, 404));
    }
    
    res.status(200).json({
      success: true,
      message: "Successfully deleted employee",
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return next(new AppError('No profile picture uploaded', 400));
    }
    
    const pictureData = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: `/uploads/profile-pictures/${req.file.filename}`
    };
    
    const result = await employeeModel.updateProfilePicture(id, pictureData);
    
    if (!result) {
      return next(new AppError(`Employee with ID ${id} not found`, 404));
    }
    
    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Get onboarding progress
const getOnboardingProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const progress = await employeeModel.getOnboardingProgress(id);
    
    res.status(200).json({
      success: true,
      message: "Successfully retrieved onboarding progress",
      data: progress
    });
  } catch (error) {
    next(error);
  }
};

// Get equipment
const getEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const equipment = await employeeModel.getEquipment(id);
    
    res.status(200).json({
      success: true,
      message: "Successfully retrieved employee equipment",
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

// Save equipment
const saveEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await employeeModel.saveEquipment(id, req.body);
    
    res.status(200).json({
      success: true,
      message: "Equipment information saved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Get documents
const getDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const documents = await employeeModel.getDocuments(id);
    
    res.status(200).json({
      success: true,
      message: "Successfully retrieved employee documents",
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

// Save documents
const saveDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await employeeModel.saveDocuments(id, req.body);
    
    res.status(200).json({
      success: true,
      message: "Document information saved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Get training
const getTraining = async (req, res, next) => {
  try {
    const { id } = req.params;
    const training = await employeeModel.getTraining(id);
    
    res.status(200).json({
      success: true,
      message: "Successfully retrieved employee training",
      data: training
    });
  } catch (error) {
    next(error);
  }
};

// Save training
const saveTraining = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await employeeModel.saveTraining(id, req.body);
    
    res.status(200).json({
      success: true,
      message: "Training information saved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get equipment types
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEquipmentTypes = async (req, res) => {
  try {
    const equipmentTypes = [
      { id: 1, name: "Laptop", description: "Company laptop" },
      { id: 2, name: "Mouse", description: "Computer mouse" },
      { id: 3, name: "Keyboard", description: "Computer keyboard" },
      { id: 4, name: "Monitor", description: "Computer monitor" },
      { id: 5, name: "Phone", description: "Company phone" },
      { id: 6, name: "Headset", description: "Audio headset" },
      { id: 7, name: "ID Card", description: "Employee identification card" },
      { id: 8, name: "Security Badge", description: "Building access badge" },
      { id: 9, name: "Uniform", description: "Company uniform" },
      { id: 10, name: "Safety Equipment", description: "Personal protective equipment" }
    ];

    res.status(200).json({
      success: true,
      data: equipmentTypes
    });
  } catch (error) {
    console.error("Error getting equipment types:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch equipment types."
    });
  }
};

/**
 * Get document types
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDocumentTypes = async (req, res) => {
  try {
    const documentTypes = [
      { id: 1, name: "ID Card", required: true, description: "Government issued ID" },
      { id: 2, name: "Resume/CV", required: true, description: "Current resume" },
      { id: 3, name: "Education Certificate", required: true, description: "Highest education certificate" },
      { id: 4, name: "Birth Certificate", required: false, description: "Birth certificate" },
      { id: 5, name: "Tax Declaration Form", required: true, description: "Tax declaration form" },
      { id: 6, name: "Bank Account Details", required: true, description: "Bank account information for salary" },
      { id: 7, name: "Health Insurance Form", required: true, description: "Health insurance enrollment" },
      { id: 8, name: "Employment Contract", required: true, description: "Signed employment contract" },
      { id: 9, name: "Work Permit", required: false, description: "For non-citizens" },
      { id: 10, name: "Professional License", required: false, description: "If applicable to position" }
    ];

    res.status(200).json({
      success: true,
      data: documentTypes
    });
  } catch (error) {
    console.error("Error getting document types:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch document types."
    });
  }
};

/**
 * Get training types
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTrainingTypes = async (req, res) => {
  try {
    const trainingTypes = [
      { id: 1, name: "Company Orientation", description: "Introduction to company values and policies" },
      { id: 2, name: "Safety Training", description: "Workplace safety procedures" },
      { id: 3, name: "IT Systems Training", description: "Introduction to company IT systems" },
      { id: 4, name: "Security Awareness", description: "Information security best practices" },
      { id: 5, name: "Departmental Orientation", description: "Introduction to department processes" },
      { id: 6, name: "Product Training", description: "Overview of company products and services" },
      { id: 7, name: "Customer Service", description: "Customer service standards and practices" },
      { id: 8, name: "Management Training", description: "For managerial positions" },
      { id: 9, name: "Ethics and Compliance", description: "Ethical standards and compliance requirements" },
      { id: 10, name: "Soft Skills Development", description: "Communication and teamwork skills" }
    ];

    res.status(200).json({
      success: true,
      data: trainingTypes
    });
  } catch (error) {
    console.error("Error getting training types:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch training types."
    });
  }
};

/**
 * Update onboarding checklist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateOnboardingChecklist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, itemId, completed } = req.body;
    
    // Validate required fields
    if (!category || !itemId || completed === undefined) {
      return next(new AppError('Missing required fields for checklist update', 400));
    }
    
    const result = await employeeModel.updateOnboardingChecklist(id, { category, itemId, completed });
    
    res.status(200).json({
      success: true,
      message: "Checklist item updated successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  getPublicProfile,
  createEmployee,
  updateEmployee,
  updateStatus,
  deleteEmployee,
  uploadProfilePicture,
  getOnboardingProgress,
  getEquipment,
  saveEquipment,
  getDocuments,
  saveDocuments,
  getTraining,
  saveTraining,
  getEquipmentTypes,
  getDocumentTypes,
  getTrainingTypes,
  updateOnboardingChecklist
}; 