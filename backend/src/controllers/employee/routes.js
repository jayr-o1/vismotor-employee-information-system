const express = require("express");
const router = express.Router();
const db = require("../../configs/database");

// API Endpoints

// Get all employees
router.get("/api/employees", async (req, res) => {
  try {
    const connection = await db.getConnection();
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
    const connection = await db.getConnection();
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
    
    const connection = await db.getConnection();
    
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
    
    const connection = await db.getConnection();
    
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
    const connection = await db.getConnection();
    
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

// Process onboarding (add employee)
router.post("/api/employees", async (req, res) => {
  try {
    const { 
      applicant_id,
      position,
      department,
      hire_date,
      salary,
      mentor
    } = req.body;
    
    // Validate required fields
    if (!applicant_id || !position || !department || !hire_date) {
      return res.status(400).json({ message: "All required employee details must be provided" });
    }
    
    const connection = await db.getConnection();
    
    // First check if the applicant exists
    const [applicants] = await connection.query("SELECT * FROM applicants WHERE id = ?", [applicant_id]);
    
    if (applicants.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    const applicant = applicants[0];
    
    // Combine first_name and last_name to create the full name
    const fullName = `${applicant.first_name} ${applicant.last_name}`;
    
    // Add to employees table
    const [result] = await connection.query(
      "INSERT INTO employees (applicant_id, name, email, phone, position, department, hire_date, salary, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [applicant_id, fullName, applicant.email, applicant.phone, position, department, hire_date, salary]
    );
    
    const employeeId = result.insertId;
    
    // Update applicant status to "Accepted"
    await connection.query(
      "UPDATE applicants SET status = 'Accepted' WHERE id = ?",
      [applicant_id]
    );
    
    // Send welcome email to the newly hired employee
    try {
      const { sendWelcomeEmail } = require('../../services/emailService');
      await sendWelcomeEmail(
        applicant.email,
        fullName,
        {
          position,
          department,
          hire_date,
          reporting_manager: mentor || 'HR Manager'
        }
      );
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Continue even if email sending fails
    }
    
    connection.release();
    
    res.status(201).json({ 
      id: employeeId,
      message: "Employee created successfully" 
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "Failed to create employee" });
  }
});

// Export employee data
router.get("/api/employees/:id/export", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    // Get employee data
    const [employees] = await connection.query(
      "SELECT * FROM employees WHERE id = ?", 
      [id]
    );
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    const employee = employees[0];
    
    // Get applicant data if available
    let applicant = null;
    if (employee.applicant_id) {
      const [applicants] = await connection.query(
        "SELECT * FROM applicants WHERE id = ?", 
        [employee.applicant_id]
      );
      
      if (applicants.length > 0) {
        applicant = applicants[0];
      }
    }
    
    connection.release();
    
    // Prepare the export data
    const exportData = {
      employee: employee,
      applicant: applicant,
      generated_at: new Date().toISOString()
    };
    
    res.json(exportData);
  } catch (error) {
    console.error("Error exporting employee data:", error);
    res.status(500).json({ message: "Failed to export employee data" });
  }
});

// Public profile endpoint - accessible without authentication
router.get("/api/employees/:id/public-profile", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    // Get limited employee data for public profile
    const [employees] = await connection.query(
      "SELECT id, name, position, department FROM employees WHERE id = ?", 
      [id]
    );
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    connection.release();
    
    res.json(employees[0]);
  } catch (error) {
    console.error("Error fetching employee public profile:", error);
    res.status(500).json({ message: "Failed to fetch employee public profile" });
  }
});

module.exports = router; 