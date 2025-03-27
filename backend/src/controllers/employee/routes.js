const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const dbConfig = require("../../configs/database");

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// API Endpoints

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
      [name, email, phone, position, education, experience, skills ? skills.join("\n") : null, "Pending"]
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

// Update applicant status
router.patch("/api/applicants/:id", async (req, res) => {
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
    console.error("Error updating applicant:", error);
    res.status(500).json({ message: "Failed to update applicant" });
  }
});

// Delete applicant
router.delete("/api/applicants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [result] = await connection.query("DELETE FROM applicants WHERE id = ?", [id]);
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    res.json({ message: "Applicant deleted successfully" });
  } catch (error) {
    console.error("Error deleting applicant:", error);
    res.status(500).json({ message: "Failed to delete applicant" });
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
    
    // Update applicant status to "Reviewed"
    await connection.query(
      "UPDATE applicants SET status = 'Reviewed' WHERE id = ?",
      [id]
    );
    
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
    if (!applicant_id || !interview_date || !interview_time || !location || !interviewer) {
      return res.status(400).json({ message: "All interview details are required" });
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
    
    // Update applicant status to "Interviewed"
    await connection.query(
      "UPDATE applicants SET status = 'Interviewed' WHERE id = ?",
      [applicant_id]
    );
    
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

// Process onboarding (add employee)
router.post("/api/employees", async (req, res) => {
  try {
    const { 
      applicant_id,
      position,
      department,
      hire_date,
      salary
    } = req.body;
    
    // Validate required fields
    if (!applicant_id || !position || !department || !hire_date) {
      return res.status(400).json({ message: "All required onboarding details must be provided" });
    }
    
    const connection = await pool.getConnection();
    
    // First check if the applicant exists
    const [applicants] = await connection.query("SELECT * FROM applicants WHERE id = ?", [applicant_id]);
    
    if (applicants.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    const applicant = applicants[0];
    
    // Add to employees table
    const [result] = await connection.query(
      "INSERT INTO employees (name, email, phone, position, department, hire_date, salary, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
      [applicant.name, applicant.email, applicant.phone, position, department, hire_date, salary]
    );
    
    // Update applicant status to "Accepted"
    await connection.query(
      "UPDATE applicants SET status = 'Accepted' WHERE id = ?",
      [applicant_id]
    );
    
    connection.release();
    
    res.status(201).json({ 
      id: result.insertId,
      message: "Employee onboarded successfully" 
    });
  } catch (error) {
    console.error("Error onboarding employee:", error);
    res.status(500).json({ message: "Failed to onboard employee" });
  }
});

// Get all employees
router.get("/api/employees", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT * FROM employees ORDER BY hire_date DESC");
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
});

// Dashboard data
router.get("/api/dashboard", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get total applicants
    const [applicantsResult] = await connection.query("SELECT COUNT(*) as total FROM applicants");
    
    // Get total employees
    const [employeesResult] = await connection.query("SELECT COUNT(*) as total FROM employees");
    
    // Get total onboarding (applicants with Accepted status)
    const [onboardingResult] = await connection.query(
      "SELECT COUNT(*) as total FROM applicants WHERE status = 'Accepted'"
    );
    
    // Get recent applicants
    const [recentApplicants] = await connection.query(
      "SELECT id, name, position, status, applied_date as date FROM applicants ORDER BY applied_date DESC LIMIT 5"
    );
    
    connection.release();
    
    res.json({
      totalApplicants: applicantsResult[0].total,
      totalEmployees: employeesResult[0].total,
      totalOnboarding: onboardingResult[0].total,
      recentApplicants
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

module.exports = router; 