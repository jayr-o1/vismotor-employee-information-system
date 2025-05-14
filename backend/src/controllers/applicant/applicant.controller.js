const applicantModel = require('../../models/applicant.model');
const { AppError } = require('../../middleware/error.middleware');

/**
 * Controller for applicant operations
 * Implementing actual business logic using model functions
 */

// Get all applicants
const getAllApplicants = async (req, res, next) => {
  try {
    const applicants = await applicantModel.findAll();
    res.status(200).json({
      success: true,
      message: "Successfully retrieved all applicants",
      data: applicants
    });
  } catch (error) {
    next(error);
  }
};

// Get applicant by ID
const getApplicantById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const applicant = await applicantModel.findById(id);
    
    if (!applicant) {
      return next(new AppError(`Applicant with ID ${id} not found`, 404));
    }
    
    res.status(200).json({
      success: true,
      message: "Successfully retrieved applicant",
      data: applicant
    });
  } catch (error) {
    next(error);
  }
};

// Get applicant public profile
const getPublicProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const applicant = await applicantModel.findById(id);
    
    if (!applicant) {
      return next(new AppError(`Applicant with ID ${id} not found`, 404));
    }
    
    // Only return public information
    const publicProfile = {
      id: applicant.id,
      firstName: applicant.first_name,
      lastName: applicant.last_name,
      position: applicant.position,
      status: applicant.status,
      appliedDate: applicant.applied_date
    };
    
    res.status(200).json({
      success: true,
      message: "Successfully retrieved applicant public profile",
      data: publicProfile
    });
  } catch (error) {
    next(error);
  }
};

// Create applicant
const createApplicant = async (req, res, next) => {
  try {
    const newApplicant = await applicantModel.create(req.body);
    
    res.status(201).json({
      success: true,
      message: "Successfully created applicant",
      data: newApplicant
    });
  } catch (error) {
    next(error);
  }
};

// Update applicant
const updateApplicant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedApplicant = await applicantModel.update(id, req.body);
    
    if (!updatedApplicant) {
      return next(new AppError(`Applicant with ID ${id} not found`, 404));
    }
    
    res.status(200).json({
      success: true,
      message: "Successfully updated applicant",
      data: updatedApplicant
    });
  } catch (error) {
    next(error);
  }
};

// Update applicant status
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return next(new AppError('Status is required', 400));
    }
    
    const success = await applicantModel.updateStatus(id, status);
    
    if (!success) {
      return next(new AppError(`Applicant with ID ${id} not found`, 404));
    }
    
    res.status(200).json({
      success: true,
      message: `Successfully updated applicant status to ${status}`,
      data: { id, status }
    });
  } catch (error) {
    next(error);
  }
};

// Delete applicant
const deleteApplicant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = await applicantModel.remove(id);
    
    if (!success) {
      return next(new AppError(`Applicant with ID ${id} not found`, 404));
    }
    
    res.status(200).json({
      success: true,
      message: "Successfully deleted applicant and related records",
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

// Upload files
const uploadFiles = async (req, res, next) => {
  try {
    // Files are processed by the upload middleware and available in req.files
    const { resumeFile, houseSketchFile } = req.files || {};
    
    if (!resumeFile && !houseSketchFile) {
      return next(new AppError('No files were uploaded', 400));
    }
    
    res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      data: {
        resumeFile: resumeFile ? {
          filename: resumeFile[0].filename,
          originalname: resumeFile[0].originalname,
          path: resumeFile[0].path
        } : null,
        houseSketchFile: houseSketchFile ? {
          filename: houseSketchFile[0].filename,
          originalname: houseSketchFile[0].originalname,
          path: houseSketchFile[0].path
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// Submit application
const submitApplication = async (req, res, next) => {
  try {
    const applicationData = req.body;
    
    console.log("Controller received application data:", JSON.stringify(applicationData));
    
    // Validate required fields
    if (!applicationData.email || !applicationData.firstName || !applicationData.lastName) {
      return next(new AppError('Required fields are missing: email, firstName, and lastName must be provided', 400));
    }
    
    const newApplication = await applicantModel.submitApplication(applicationData);
    
    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: {
        applicationId: newApplication.id,
        status: "Pending"
      }
    });
  } catch (error) {
    console.error("Error in submitApplication controller:", error);
    
    // Provide a more specific error message for SQL errors
    if (error.code === 'ER_NO_DEFAULT_FOR_FIELD') {
      return next(new AppError(`Database error: A required field is missing - ${error.sqlMessage}`, 400));
    }
    
    next(error);
  }
};

// Get all interviews
const getAllInterviews = async (req, res, next) => {
  try {
    const interviews = await applicantModel.getAllInterviews();
    
    res.status(200).json({
      success: true,
      message: "Successfully retrieved all interviews",
      data: interviews
    });
  } catch (error) {
    next(error);
  }
};

// Get applicant interviews
const getApplicantInterviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interviews = await applicantModel.getApplicantInterviews(id);
    
    res.status(200).json({
      success: true,
      message: "Successfully retrieved applicant interviews",
      data: interviews
    });
  } catch (error) {
    next(error);
  }
};

// Schedule interview
const scheduleInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interviewData = req.body;
    
    console.log("Scheduling interview for applicant ID:", id);
    console.log("Received interview data:", interviewData);
    
    if (!interviewData.interview_date || !interviewData.interview_time) {
      return next(new AppError('Interview date and time are required', 400));
    }
    
    const newInterview = await applicantModel.scheduleInterview(id, interviewData);
    
    if (!newInterview) {
      return next(new AppError('Failed to schedule interview. Please check the provided data.', 400));
    }
    
    console.log("Interview scheduled successfully:", newInterview);
    
    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      data: newInterview
    });
  } catch (error) {
    console.error("Error in scheduleInterview controller:", error);
    next(error);
  }
};

// Update interview status
const updateInterviewStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status) {
      return next(new AppError('Status is required', 400));
    }
    
    const updatedInterview = await applicantModel.updateInterviewStatus(id, status, notes);
    
    if (!updatedInterview) {
      return next(new AppError(`Interview with ID ${id} not found`, 404));
    }
    
    res.status(200).json({
      success: true,
      message: `Interview status updated to ${status}`,
      data: updatedInterview
    });
  } catch (error) {
    next(error);
  }
};

// Delete interview
const deleteInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = await applicantModel.deleteInterview(id);
    
    if (!success) {
      return next(new AppError(`Interview with ID ${id} not found`, 404));
    }
    
    res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

// Send interview email
const sendInterviewEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { interviewId, emailData } = req.body;
    
    if (!interviewId) {
      return next(new AppError('Interview ID is required', 400));
    }
    
    const result = await applicantModel.sendInterviewEmail(id, interviewId, emailData);
    
    res.status(200).json({
      success: true,
      message: "Interview email sent successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Send rejection email
const sendRejectionEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, additionalNotes } = req.body;
    
    const result = await applicantModel.sendRejectionEmail(id, {
      reason,
      additionalNotes
    });
    
    res.status(200).json({
      success: true,
      message: "Rejection email sent successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Convert to employee
const convertToEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employeeData = req.body;
    
    if (!employeeData.position || !employeeData.department || !employeeData.hire_date || !employeeData.salary) {
      return next(new AppError('Position, department, hire date, and salary are required', 400));
    }
    
    const newEmployee = await applicantModel.convertToEmployee(id, employeeData);
    
    if (!newEmployee) {
      return next(new AppError(`Applicant with ID ${id} not found or already converted`, 404));
    }
    
    res.status(201).json({
      success: true,
      message: "Applicant successfully converted to employee",
      data: newEmployee
    });
  } catch (error) {
    next(error);
  }
};

// Export the controller methods
module.exports = {
  getAllApplicants,
  getApplicantById,
  getPublicProfile,
  createApplicant,
  updateApplicant,
  updateStatus,
  deleteApplicant,
  uploadFiles,
  submitApplication,
  getAllInterviews,
  getApplicantInterviews,
  scheduleInterview,
  updateInterviewStatus,
  deleteInterview,
  sendInterviewEmail,
  sendRejectionEmail,
  convertToEmployee
}; 