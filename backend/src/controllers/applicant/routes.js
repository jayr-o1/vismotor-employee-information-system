const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const dbConfig = require("../../configs/database");

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// APPLICANTS ENDPOINTS

// Get all applicants
router.get("/api/applicants", async (req, res) => {
  try {
    const connection = await pool.getConnection();
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
      name, 
      email, 
      phone, 
      position, 
      education, 
      experience, 
      skills 
    } = req.body;
    
    // Validate required fields
    if (!name || !email || !position) {
      return res.status(400).json({ message: "Name, email and position are required" });
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      "INSERT INTO applicants (name, email, phone, position, education, experience, skills, status, applied_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [name, email, phone, position, education, experience, skills, "Pending"]
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
    const connection = await pool.getConnection();
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
      name, 
      email, 
      phone, 
      position, 
      education, 
      experience, 
      skills, 
      status 
    } = req.body;
    
    // Validate required fields
    if (!name || !email || !position) {
      return res.status(400).json({ message: "Name, email and position are required" });
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      "UPDATE applicants SET name = ?, email = ?, phone = ?, position = ?, education = ?, experience = ?, skills = ?, status = ? WHERE id = ?",
      [name, email, phone, position, education, experience, skills, status || "Pending", id]
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
    
    const connection = await pool.getConnection();
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
    const connection = await pool.getConnection();
    
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
    const connection = await pool.getConnection();
    
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
    
    const connection = await pool.getConnection();
    
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
    
    const connection = await pool.getConnection();
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
    const connection = await pool.getConnection();
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
    const connection = await pool.getConnection();
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

// Get interviews for an applicant
router.get("/api/applicants/:id/interviews", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
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

// Schedule an interview
router.post("/api/interviews", async (req, res) => {
  try {
    const { 
      applicant_id, 
      interview_date, 
      interview_time, 
      location, 
      interviewer 
    } = req.body;
    
    // Validate required fields
    if (!applicant_id || !interview_date || !interview_time) {
      return res.status(400).json({ message: "Applicant ID, date, and time are required" });
    }
    
    const connection = await pool.getConnection();
    
    // First check if the applicant exists
    const [applicants] = await connection.query("SELECT * FROM applicants WHERE id = ?", [applicant_id]);
    
    if (applicants.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    // Schedule interview
    const [result] = await connection.query(
      "INSERT INTO interviews (applicant_id, interview_date, interview_time, location, interviewer, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [applicant_id, interview_date, interview_time, location, interviewer, "Scheduled"]
    );
    
    // Update applicant status to "Scheduled" if not already past that stage
    if (applicants[0].status === "Pending" || applicants[0].status === "Reviewed") {
      await connection.query(
        "UPDATE applicants SET status = 'Scheduled' WHERE id = ?",
        [applicant_id]
      );
    }
    
    connection.release();
    
    res.status(201).json({ 
      id: result.insertId,
      message: "Interview scheduled successfully" 
    });
  } catch (error) {
    console.error("Error scheduling interview:", error);
    res.status(500).json({ message: "Failed to schedule interview" });
  }
});

// Update interview
router.put("/api/interviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      interview_date, 
      interview_time, 
      location, 
      interviewer,
      status,
      notes
    } = req.body;
    
    // Validate required fields
    if (!interview_date || !interview_time) {
      return res.status(400).json({ message: "Interview date and time are required" });
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      "UPDATE interviews SET interview_date = ?, interview_time = ?, location = ?, interviewer = ?, status = ?, notes = ?, updated_at = NOW() WHERE id = ?",
      [interview_date, interview_time, location, interviewer, status, notes, id]
    );
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Interview not found" });
    }
    
    res.json({ message: "Interview updated successfully" });
  } catch (error) {
    console.error("Error updating interview:", error);
    res.status(500).json({ message: "Failed to update interview" });
  }
});

// Update interview status
router.patch("/api/interviews/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    const connection = await pool.getConnection();
    
    // Get the interview to find the applicant_id
    const [interviews] = await connection.query("SELECT * FROM interviews WHERE id = ?", [id]);
    
    if (interviews.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Interview not found" });
    }
    
    const interview = interviews[0];
    
    // Update interview status
    await connection.query(
      "UPDATE interviews SET status = ?, notes = ?, updated_at = NOW() WHERE id = ?",
      [status, notes, id]
    );
    
    // If interview is completed, update applicant status to "Interviewed"
    if (status === "Completed") {
      await connection.query(
        "UPDATE applicants SET status = 'Interviewed' WHERE id = ?",
        [interview.applicant_id]
      );
    }
    
    connection.release();
    
    res.json({ message: "Interview status updated successfully" });
  } catch (error) {
    console.error("Error updating interview status:", error);
    res.status(500).json({ message: "Failed to update interview status" });
  }
});

// Delete interview
router.delete("/api/interviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
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

module.exports = router; 