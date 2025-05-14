const express = require("express");
const router = express.Router();
const applicantController = require("../controllers/applicant/applicant.controller");
const uploadMiddleware = require("../middleware/upload.middleware");

// Get all applicants
router.get("/api/applicants", applicantController.getAllApplicants);

// Get applicant by ID
router.get("/api/applicants/:id", applicantController.getApplicantById);

// Get applicant public profile
router.get("/api/applicants/:id/public-profile", applicantController.getPublicProfile);

// Create applicant
router.post("/api/applicants", applicantController.createApplicant);

// Update applicant
router.put("/api/applicants/:id", applicantController.updateApplicant);

// Update applicant status
router.patch("/api/applicants/:id/status", applicantController.updateStatus);

// Delete applicant
router.delete("/api/applicants/:id", applicantController.deleteApplicant);

// File uploads 
router.post(
  "/api/applicants/upload-files",
  uploadMiddleware.uploadApplicantFiles,
  applicantController.uploadFiles
);

// Application submission (public route)
router.post("/api/applications/submit", applicantController.submitApplication);

// Feedback
router.get("/api/applicants/:id/feedback", applicantController.getFeedback);
router.post("/api/applicants/:id/feedback", applicantController.addFeedback);
router.put("/api/feedback/:id", applicantController.updateFeedback);
router.delete("/api/feedback/:id", applicantController.deleteFeedback);

// Interviews
router.get("/api/interviews", applicantController.getAllInterviews);
router.get("/api/applicants/:id/interviews", applicantController.getApplicantInterviews);
router.post("/api/applicants/:id/interviews", applicantController.scheduleInterview);
router.patch("/api/interviews/:id/status", applicantController.updateInterviewStatus);
router.delete("/api/interviews/:id", applicantController.deleteInterview);

// Email functionality
router.post("/api/applicants/:id/send-interview-email", applicantController.sendInterviewEmail);
router.post("/api/applicants/:id/send-rejection-email", applicantController.sendRejectionEmail);

// Convert to employee
router.post("/api/applicants/:id/convert-to-employee", applicantController.convertToEmployee);

module.exports = router; 