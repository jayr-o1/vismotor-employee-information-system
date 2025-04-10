const express = require("express");
const router = express.Router();
const { validateToken, ensureVerified } = require("../utils/authMiddleware");
const applicantController = require("../controllers/applicants/applicantController");
const notesController = require("../controllers/applicants/notesController");
const interviewController = require("../controllers/applicants/interviewController");

// Base routes
router.get("/", validateToken, ensureVerified, applicantController.getAll);
router.post("/", validateToken, ensureVerified, applicantController.create);
router.get("/:id", validateToken, ensureVerified, applicantController.getById);
router.put("/:id", validateToken, ensureVerified, applicantController.update);
router.patch("/:id/status", validateToken, ensureVerified, applicantController.updateStatus);
router.delete("/:id", validateToken, ensureVerified, applicantController.delete);

// Notes routes
router.get("/:id/notes", validateToken, ensureVerified, notesController.getNotes);
router.post("/:id/notes", validateToken, ensureVerified, notesController.addNote);

// Interview routes
router.get("/:id/interviews", validateToken, ensureVerified, interviewController.getInterviews);
router.post("/:id/interviews", validateToken, ensureVerified, interviewController.scheduleInterview);
router.patch("/:id/interviews/:interviewId/status", validateToken, ensureVerified, interviewController.updateInterviewStatus);

module.exports = router; 