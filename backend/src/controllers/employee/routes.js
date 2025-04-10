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
    console.log("Received applicant data:", req.body);
    
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
    
    // Process skills (could be string or array)
    let processedSkills = skills;
    if (Array.isArray(skills)) {
      processedSkills = skills.join("\n");
    }
    
    console.log("Connecting to database...");
    const connection = await pool.getConnection();
    console.log("Connected. Inserting applicant...");
    
    const [result] = await connection.query(
      "INSERT INTO applicants (name, email, phone, position, education, experience, skills, status, applied_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [name, email, phone, position, education, experience, processedSkills, "Pending"]
    );
    connection.release();
    
    console.log("Applicant added with ID:", result.insertId);
    res.status(201).json({ 
      id: result.insertId,
      message: "Applicant added successfully" 
    });
  } catch (error) {
    console.error("Error adding applicant:", error);
    if (error.code) {
      console.error("SQL Error Code:", error.code);
    }
    if (error.sqlMessage) {
      console.error("SQL Error Message:", error.sqlMessage);
    }
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

// Update applicant status (match frontend API path)
router.patch("/api/applicants/:id/status", async (req, res) => {
  try {
    console.log("Updating status for applicant ID:", req.params.id);
    console.log("Status data:", req.body);
    
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

// Get employee by ID
router.get("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT * FROM employees WHERE id = ?", [id]);
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ message: "Failed to fetch employee" });
  }
});

// Update employee
router.put("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      phone, 
      position, 
      department, 
      hire_date, 
      salary,
      status
    } = req.body;
    
    console.log("Updating employee:", id, req.body);
    
    // Validate required fields - only if all fields are provided
    // If only partial update, skip validation
    if (req.body.name && (!name || !position || !department)) {
      return res.status(400).json({ message: "Name, position, and department are required" });
    }
    
    const connection = await pool.getConnection();
    
    // Check if employee exists
    const [employees] = await connection.query("SELECT * FROM employees WHERE id = ?", [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    const existingEmployee = employees[0];
    
    // If this is a status-only update
    if (status && Object.keys(req.body).length === 1) {
      console.log("Processing status-only update to:", status);
      const [result] = await connection.query(
        "UPDATE employees SET status = ? WHERE id = ?",
        [status, id]
      );
      connection.release();
      return res.json({ message: "Employee status updated successfully" });
    }
    
    // For full or partial updates
    const updateQuery = "UPDATE employees SET name = ?, email = ?, phone = ?, position = ?, department = ?, hire_date = ?, salary = ?, status = ? WHERE id = ?";
    const [result] = await connection.query(
      updateQuery,
      [
        name || existingEmployee.name, 
        email || existingEmployee.email, 
        phone || existingEmployee.phone, 
        position || existingEmployee.position, 
        department || existingEmployee.department, 
        hire_date || existingEmployee.hire_date, 
        salary || existingEmployee.salary,
        status || existingEmployee.status, 
        id
      ]
    );
    
    connection.release();
    
    res.json({ 
      message: "Employee updated successfully" 
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Failed to update employee" });
  }
});

// Update employee status
router.patch("/api/employees/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    const connection = await pool.getConnection();
    
    // Check if employee exists
    const [employees] = await connection.query("SELECT * FROM employees WHERE id = ?", [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Update employee status
    const [result] = await connection.query(
      "UPDATE employees SET status = ? WHERE id = ?",
      [status, id]
    );
    
    connection.release();
    
    res.json({ 
      message: "Employee status updated successfully" 
    });
  } catch (error) {
    console.error("Error updating employee status:", error);
    res.status(500).json({ message: "Failed to update employee status" });
  }
});

// Delete employee
router.delete("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    // Check if employee exists
    const [employees] = await connection.query("SELECT * FROM employees WHERE id = ?", [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Delete employee
    const [result] = await connection.query("DELETE FROM employees WHERE id = ?", [id]);
    connection.release();
    
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Failed to delete employee" });
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

// Get applicant trends by month
router.get("/api/dashboard/applicant-trends", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get applicants grouped by month
    const [trends] = await connection.query(`
      SELECT 
        MONTH(applied_date) as month,
        YEAR(applied_date) as year,
        COUNT(*) as count
      FROM 
        applicants
      WHERE 
        applied_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY 
        YEAR(applied_date), MONTH(applied_date)
      ORDER BY 
        YEAR(applied_date), MONTH(applied_date)
    `);
    
    connection.release();
    
    // Transform the data to match the expected format for the chart
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11
    const currentYear = currentDate.getFullYear();
    
    // Create an array of the last 12 months with proper labels
    const months = [];
    const counts = [];
    
    for (let i = 11; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12; // Ensure it's a positive number
      const year = currentYear - Math.floor((i - currentMonth) / 12);
      
      // Get the month name
      const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'short' });
      months.push(monthName);
      
      // Find the count for this month in the database results
      const found = trends.find(item => item.month === month + 1 && item.year === year);
      counts.push(found ? found.count : 0);
    }
    
    res.json({
      labels: months,
      data: counts
    });
  } catch (error) {
    console.error("Error fetching applicant trends:", error);
    res.status(500).json({ message: "Failed to fetch applicant trends" });
  }
});

module.exports = router; 