const express = require("express");
const router = express.Router();
const db = require("../../configs/database");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Configure file storage for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const uploadDir = path.join(__dirname, "../../../uploads");
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (error) {
      console.error("Error setting upload destination:", error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    try {
      // Generate unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    } catch (error) {
      console.error("Error generating filename:", error);
      cb(error);
    }
  },
});

// Configure multer for file uploads
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Check allowed file types
    const allowedMimeTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed types: PDF, DOC, DOCX, JPG, PNG. Received: ${file.mimetype}`));
    }
  }
}).fields([
  { name: "resumeFile", maxCount: 1 },
  { name: "houseSketchFile", maxCount: 1 }
]);

// APPLICANTS ENDPOINTS

// Get all applicants
router.get("/api/applicants", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM applicants ORDER BY applied_date DESC");
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ message: "Failed to fetch applicants" });
  }
});

// Add a new applicant
router.post("/api/applicants", async (req, res) => {
  try {
    const { 
      firstName,
      lastName,
      email,
      gender,
      position,
      highestEducation
    } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !position) {
      return res.status(400).json({ message: "First name, last name, email and position are required" });
    }
    
    const connection = await db.getConnection();
    const [result] = await connection.query(
      "INSERT INTO applicants (first_name, last_name, email, gender, position, highest_education, status, applied_date) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
      [firstName, lastName, email, gender, position, highestEducation, "Pending"]
    );
    connection.release();
    
    res.status(201).json({ 
      id: result.insertId,
      message: "Applicant added successfully" 
    });
  } catch (error) {
    console.error("Error adding applicant:", error);
    res.status(500).json({ message: "Failed to add applicant" });
  }
});

// Get applicant by ID
router.get("/api/applicants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM applicants WHERE id = ?", [id]);
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching applicant:", error);
    res.status(500).json({ message: "Failed to fetch applicant" });
  }
});

// Update applicant
router.put("/api/applicants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      firstName,
      lastName,
      email,
      gender,
      position,
      highestEducation,
      status
    } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !position) {
      return res.status(400).json({ message: "First name, last name, email and position are required" });
    }
    
    const connection = await db.getConnection();
    const [result] = await connection.query(
      "UPDATE applicants SET first_name = ?, last_name = ?, email = ?, gender = ?, position = ?, highest_education = ?, status = ? WHERE id = ?",
      [firstName, lastName, email, gender, position, highestEducation, status || "Pending", id]
    );
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    res.json({ message: "Applicant updated successfully" });
  } catch (error) {
    console.error("Error updating applicant:", error);
    res.status(500).json({ message: "Failed to update applicant" });
  }
});

// Update applicant status
router.patch("/api/applicants/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    const connection = await db.getConnection();
    const [result] = await connection.query(
      "UPDATE applicants SET status = ? WHERE id = ?",
      [status, id]
    );
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    res.json({ message: "Applicant status updated successfully" });
  } catch (error) {
    console.error("Error updating applicant status:", error);
    res.status(500).json({ message: "Failed to update applicant status" });
  }
});

// Delete applicant
router.delete("/api/applicants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    // Begin transaction to delete related records
    await connection.beginTransaction();
    
    try {
      // Delete related feedback
      await connection.query("DELETE FROM feedback WHERE applicant_id = ?", [id]);
      
      // Delete related interviews
      await connection.query("DELETE FROM interviews WHERE applicant_id = ?", [id]);
      
      // Delete the applicant
      const [result] = await connection.query("DELETE FROM applicants WHERE id = ?", [id]);
      
      if (result.affectedRows === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: "Applicant not found" });
      }
      
      await connection.commit();
      connection.release();
      
      res.json({ message: "Applicant and related records deleted successfully" });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error deleting applicant:", error);
    res.status(500).json({ message: "Failed to delete applicant" });
  }
});

// FEEDBACK ENDPOINTS

// Get all feedback for an applicant
router.get("/api/applicants/:id/feedback", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    // First check if the applicant exists
    const [applicants] = await connection.query("SELECT * FROM applicants WHERE id = ?", [id]);
    
    if (applicants.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    // Get feedback
    const [rows] = await connection.query(
      "SELECT * FROM feedback WHERE applicant_id = ? ORDER BY created_at DESC",
      [id]
    );
    
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

// Add feedback for an applicant
router.post("/api/applicants/:id/feedback", async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback_text, created_by } = req.body;
    
    if (!feedback_text) {
      return res.status(400).json({ message: "Feedback text is required" });
    }
    
    const connection = await db.getConnection();
    
    // First check if the applicant exists
    const [applicants] = await connection.query("SELECT * FROM applicants WHERE id = ?", [id]);
    
    if (applicants.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    // Add feedback
    const [result] = await connection.query(
      "INSERT INTO feedback (applicant_id, feedback_text, created_by, created_at) VALUES (?, ?, ?, NOW())",
      [id, feedback_text, created_by || "HR Team"]
    );
    
    // Update applicant status to "Reviewed" if not already past that stage
    if (applicants[0].status === "Pending") {
      await connection.query(
        "UPDATE applicants SET status = 'Reviewed' WHERE id = ?",
        [id]
      );
    }
    
    connection.release();
    
    res.status(201).json({ 
      id: result.insertId,
      message: "Feedback submitted successfully" 
    });
  } catch (error) {
    console.error("Error adding feedback:", error);
    res.status(500).json({ message: "Failed to add feedback" });
  }
});

// Update feedback
router.put("/api/feedback/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback_text } = req.body;
    
    if (!feedback_text) {
      return res.status(400).json({ message: "Feedback text is required" });
    }
    
    const connection = await db.getConnection();
    const [result] = await connection.query(
      "UPDATE feedback SET feedback_text = ?, updated_at = NOW() WHERE id = ?",
      [feedback_text, id]
    );
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    
    res.json({ message: "Feedback updated successfully" });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ message: "Failed to update feedback" });
  }
});

// Delete feedback
router.delete("/api/feedback/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    const [result] = await connection.query("DELETE FROM feedback WHERE id = ?", [id]);
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    
    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ message: "Failed to delete feedback" });
  }
});

// INTERVIEW ENDPOINTS

// Get all interviews
router.get("/api/interviews", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(`
      SELECT i.*, a.name as applicant_name, a.position as applicant_position
      FROM interviews i
      JOIN applicants a ON i.applicant_id = a.id
      ORDER BY i.interview_date DESC, i.interview_time DESC
    `);
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({ message: "Failed to fetch interviews" });
  }
});

// Schedule an interview
router.post("/api/applicants/:id/interviews", async (req, res) => {
  try {
    const { id } = req.params;
    const { interview_date, interview_time, location, interviewer } = req.body;

    if (!interview_date || !interview_time || !location || !interviewer) {
      return res.status(400).json({ message: "All interview details are required" });
    }

    // Start a transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Get applicant information to send email
      const [applicants] = await connection.query(
        "SELECT * FROM applicants WHERE id = ?",
        [id]
      );
      
      if (applicants.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: "Applicant not found" });
      }
      
      const applicant = applicants[0];

      // Insert interview record
      const [result] = await connection.query(
        "INSERT INTO interviews (applicant_id, interview_date, interview_time, location, interviewer) VALUES (?, ?, ?, ?, ?)",
        [id, interview_date, interview_time, location, interviewer]
      );

      // Update applicant status
      await connection.query(
        "UPDATE applicants SET status = 'Scheduled' WHERE id = ?",
        [id]
      );

      await connection.commit();
      connection.release();

      const interviewDetails = {
        id: result.insertId,
        applicant_id: id,
        interview_date,
        interview_time,
        location,
        interviewer,
        status: 'Scheduled',
        created_at: new Date()
      };

      // Send email notification to the applicant
      try {
        const { sendInterviewNotification } = require('../../services/emailService');
        await sendInterviewNotification(
          applicant.email,
          applicant.name,
          interviewDetails
        );
      } catch (emailError) {
        console.error("Error sending interview notification email:", emailError);
        // Continue even if email sending fails
      }

      res.status(201).json(interviewDetails);
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error scheduling interview:", error);
    res.status(500).json({ message: "Error scheduling interview" });
  }
});

// Get all interviews for an applicant
router.get("/api/applicants/:id/interviews", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    // First check if the applicant exists
    const [applicants] = await connection.query("SELECT * FROM applicants WHERE id = ?", [id]);
    
    if (applicants.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    // Get interviews
    const [rows] = await connection.query(
      "SELECT * FROM interviews WHERE applicant_id = ? ORDER BY interview_date DESC, interview_time DESC",
      [id]
    );
    
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({ message: "Failed to fetch interviews" });
  }
});

// Update interview status
router.patch("/api/interviews/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid interview status" });
    }

    const connection = await db.getConnection();
    
    // Get the interview to find the applicant_id
    const [interviews] = await connection.query("SELECT * FROM interviews WHERE id = ?", [id]);
    
    if (interviews.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Interview not found" });
    }
    
    const interview = interviews[0];
    
    // Get applicant information for email notification
    const [applicants] = await connection.query("SELECT * FROM applicants WHERE id = ?", [interview.applicant_id]);
    
    if (applicants.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    const applicant = applicants[0];
    
    // Update interview status
    const [result] = await connection.query(
      "UPDATE interviews SET status = ? WHERE id = ?",
      [status, id]
    );
    
    // If interview is completed, update applicant status to "Interviewed"
    if (status === "Completed") {
      await connection.query(
        "UPDATE applicants SET status = 'Interviewed' WHERE id = ?",
        [interview.applicant_id]
      );
    }
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Send appropriate email notification based on status
    try {
      const { 
        sendInterviewCompletionEmail, 
        sendInterviewCancellationEmail 
      } = require('../../services/emailService');
      
      if (status === 'Completed') {
        await sendInterviewCompletionEmail(
          applicant.email,
          applicant.name,
          interview
        );
      } else if (status === 'Cancelled') {
        await sendInterviewCancellationEmail(
          applicant.email,
          applicant.name,
          interview
        );
      }
    } catch (emailError) {
      console.error(`Error sending interview ${status.toLowerCase()} email:`, emailError);
      // Continue even if email sending fails
    }

    res.json({ message: "Interview status updated successfully" });
  } catch (error) {
    console.error("Error updating interview status:", error);
    res.status(500).json({ message: "Error updating interview status" });
  }
});

// Delete interview
router.delete("/api/interviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    const [result] = await connection.query("DELETE FROM interviews WHERE id = ?", [id]);
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Interview not found" });
    }
    
    res.json({ message: "Interview deleted successfully" });
  } catch (error) {
    console.error("Error deleting interview:", error);
    res.status(500).json({ message: "Failed to delete interview" });
  }
});

// NOTES ENDPOINTS

// Get all notes for an applicant
router.get("/api/applicants/:id/notes", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    // First check if the applicant exists
    const [applicants] = await connection.query("SELECT * FROM applicants WHERE id = ?", [id]);
    
    if (applicants.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    // Get notes (using the feedback table for now)
    const [rows] = await connection.query(
      "SELECT * FROM feedback WHERE applicant_id = ? ORDER BY created_at DESC",
      [id]
    );
    
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

// Add a note for an applicant
router.post("/api/applicants/:id/notes", async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback_text, created_by } = req.body;
    
    if (!feedback_text) {
      return res.status(400).json({ message: "Note text is required" });
    }
    
    const connection = await db.getConnection();
    
    // First check if the applicant exists
    const [applicants] = await connection.query("SELECT * FROM applicants WHERE id = ?", [id]);
    
    if (applicants.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    // Add note (using the feedback table for now)
    const [result] = await connection.query(
      "INSERT INTO feedback (applicant_id, feedback_text, created_by, created_at) VALUES (?, ?, ?, NOW())",
      [id, feedback_text, created_by || "HR Team"]
    );
    
    connection.release();
    
    res.status(201).json({
      id: result.insertId,
      message: "Note added successfully"
    });
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).json({ message: "Failed to add note" });
  }
});

// Add a file download endpoint
router.get("/api/applicants/download/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security check to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ message: "Invalid filename" });
    }
    
    // Path to uploads folder
    const uploadsDir = path.join(__dirname, "../../../uploads");
    const filePath = path.join(uploadsDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    
    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ message: "Failed to download file" });
  }
});

// Public endpoint for QR code scanning - doesn't require authentication
router.get("/api/applicants/:id/public-profile", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    const [rows] = await connection.query(`
      SELECT id, CONCAT(first_name, ' ', last_name) as name, 
      email, phone, position, status 
      FROM applicants WHERE id = ?`, 
      [id]
    );
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching applicant public profile:", error);
    res.status(500).json({ message: "Failed to fetch applicant profile" });
  }
});

// Handle file uploads endpoint
router.post("/api/applicants/upload-files", (req, res) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred (e.g., file too large)
      console.error("Multer error:", err);
      return res.status(400).json({
        message: "File upload failed",
        error: err.message,
        field: err.field
      });
    } else if (err) {
      // Some other error occurred
      console.error("Upload error:", err);
      return res.status(500).json({
        message: "File upload failed",
        error: err.message
      });
    }
    
    try {
      const files = {};
      
      if (req.files) {
        if (req.files.resumeFile) {
          files.resumeFile = {
            filename: req.files.resumeFile[0].filename,
            originalname: req.files.resumeFile[0].originalname,
            path: req.files.resumeFile[0].path
          };
        }
        
        if (req.files.houseSketchFile) {
          files.houseSketchFile = {
            filename: req.files.houseSketchFile[0].filename,
            originalname: req.files.houseSketchFile[0].originalname,
            path: req.files.houseSketchFile[0].path
          };
        }
      }
      
      return res.status(200).json({
        success: true,
        files: files
      });
    } catch (error) {
      console.error("Error processing uploaded files:", error);
      return res.status(500).json({
        message: "Error processing uploaded files",
        error: error.message
      });
    }
  });
});

module.exports = router; 