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
      return res.status(400).json({ message: "All required onboarding details must be provided" });
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
      id: result.insertId,
      message: "Employee onboarded successfully" 
    });
  } catch (error) {
    console.error("Error onboarding employee:", error);
    res.status(500).json({ message: "Failed to onboard employee" });
  }
});

// Dashboard data
router.get("/api/dashboard", async (req, res) => {
  try {
    const connection = await db.getConnection();
    
    // Get total applicants
    const [applicantsResult] = await connection.query("SELECT COUNT(*) as total FROM applicants");
    
    // Get total employees
    const [employeesResult] = await connection.query("SELECT COUNT(*) as total FROM employees");
    
    // Get total onboarding (applicants with Accepted status)
    const [onboardingResult] = await connection.query(
      "SELECT COUNT(*) as total FROM applicants WHERE status = 'Accepted'"
    );
    
    // Get recent applicants with properly formatted name
    const [recentApplicants] = await connection.query(`
      SELECT 
        id, 
        CONCAT(first_name, ' ', last_name) as name, 
        position, 
        status, 
        applied_date as date 
      FROM 
        applicants 
      ORDER BY 
        applied_date DESC 
      LIMIT 5
    `);
    
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
    const connection = await db.getConnection();
    
    // Check if applicants table has any records
    const [countCheck] = await connection.query("SELECT COUNT(*) as count FROM applicants");
    const applicantsCount = countCheck[0].count;
    
    if (applicantsCount === 0) {
      connection.release();
      // Return empty data structure with zero counts
      const months = [];
      const counts = [];
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleString('default', { month: 'short' });
        months.push(monthName);
        counts.push(0);
      }
      
      return res.json({
        labels: months,
        data: counts,
        isEmpty: true
      });
    }
    
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
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth(); // 0-11
      const year = date.getFullYear();
      
      // Get the month name - using full date object to ensure proper localization
      const monthName = date.toLocaleString('default', { month: 'short' });
      months.push(monthName);
      
      // Find the count for this month in the database results
      const found = trends.find(item => item.month === month + 1 && item.year === year);
      counts.push(found ? found.count : 0);
    }
    
    res.json({
      labels: months,
      data: counts,
      isEmpty: false
    });
  } catch (error) {
    console.error("Error fetching applicant trends:", error);
    res.status(500).json({ message: "Failed to fetch applicant trends" });
  }
});

// Get all equipment types
router.get("/api/equipment-types", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM equipment_types WHERE is_active = TRUE ORDER BY name");
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching equipment types:", error);
    res.status(500).json({ message: "Failed to fetch equipment types" });
  }
});

// Get all document types
router.get("/api/document-types", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM document_types WHERE is_active = TRUE ORDER BY name");
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching document types:", error);
    res.status(500).json({ message: "Failed to fetch document types" });
  }
});

// Get all training types
router.get("/api/training-types", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM training_types WHERE is_active = TRUE ORDER BY name");
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching training types:", error);
    res.status(500).json({ message: "Failed to fetch training types" });
  }
});

// Request equipment for employee
router.post("/api/employees/:id/equipment", async (req, res) => {
  try {
    const { id } = req.params;
    const equipmentItems = req.body.equipment;
    
    if (!Array.isArray(equipmentItems) || equipmentItems.length === 0) {
      return res.status(400).json({ message: "Equipment list is required and must be an array" });
    }
    
    const connection = await db.getConnection();
    
    // Verify employee exists
    const [employees] = await connection.query("SELECT * FROM employees WHERE id = ?", [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Insert equipment requests
    const values = [];
    const placeholders = [];
    
    for (const item of equipmentItems) {
      placeholders.push("(?, ?, ?, ?)");
      values.push(
        id,
        item.equipment_type,
        item.description || null,
        item.notes || null
      );
    }
    
    const query = `
      INSERT INTO employee_equipment 
      (employee_id, equipment_type, description, notes)
      VALUES ${placeholders.join(", ")}
    `;
    
    await connection.query(query, values);
    connection.release();
    
    res.status(201).json({ 
      message: "Equipment requested successfully",
      count: equipmentItems.length
    });
  } catch (error) {
    console.error("Error requesting equipment:", error);
    res.status(500).json({ message: "Failed to request equipment" });
  }
});

// Upload documents for employee
router.post("/api/employees/:id/documents", async (req, res) => {
  try {
    const { id } = req.params;
    const documents = req.body.documents;
    
    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ message: "Documents list is required and must be an array" });
    }
    
    const connection = await db.getConnection();
    
    // Verify employee exists
    const [employees] = await connection.query("SELECT * FROM employees WHERE id = ?", [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Calculate required by dates based on hire date
    const hireDate = new Date(employees[0].hire_date);
    
    // Get document types with submission days
    const [docTypes] = await connection.query("SELECT * FROM document_types WHERE is_active = TRUE");
    const docTypeMap = {};
    docTypes.forEach(dt => {
      docTypeMap[dt.name] = dt.days_to_submit;
    });
    
    // Insert document requirements
    const values = [];
    const placeholders = [];
    
    for (const doc of documents) {
      const daysToSubmit = docTypeMap[doc.document_type] || 7; // Default to 7 days if not specified
      const requiredByDate = new Date(hireDate);
      requiredByDate.setDate(requiredByDate.getDate() + daysToSubmit);
      
      placeholders.push("(?, ?, ?, ?, ?, ?)");
      values.push(
        id,
        doc.document_type,
        doc.document_name || doc.document_type,
        doc.required !== undefined ? doc.required : true,
        requiredByDate.toISOString().split('T')[0],
        doc.notes || null
      );
    }
    
    const query = `
      INSERT INTO employee_documents 
      (employee_id, document_type, document_name, required, required_by_date, notes)
      VALUES ${placeholders.join(", ")}
    `;
    
    await connection.query(query, values);
    connection.release();
    
    res.status(201).json({ 
      message: "Documents added successfully",
      count: documents.length
    });
  } catch (error) {
    console.error("Error adding documents:", error);
    res.status(500).json({ message: "Failed to add documents" });
  }
});

// Schedule training for employee
router.post("/api/employees/:id/training", async (req, res) => {
  try {
    const { id } = req.params;
    const trainingItems = req.body.training;
    
    if (!Array.isArray(trainingItems) || trainingItems.length === 0) {
      return res.status(400).json({ message: "Training list is required and must be an array" });
    }
    
    const connection = await db.getConnection();
    
    // Verify employee exists
    const [employees] = await connection.query("SELECT * FROM employees WHERE id = ?", [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Get default durations from training types
    const [trainingTypes] = await connection.query("SELECT * FROM training_types WHERE is_active = TRUE");
    const trainingTypesMap = {};
    trainingTypes.forEach(tt => {
      trainingTypesMap[tt.name] = tt.duration_minutes;
    });
    
    // Insert training schedule
    const values = [];
    const placeholders = [];
    
    for (const training of trainingItems) {
      const defaultDuration = trainingTypesMap[training.training_type] || 60;
      
      placeholders.push("(?, ?, ?, ?, ?, ?, ?, ?)");
      values.push(
        id,
        training.training_type,
        training.description || null,
        training.trainer || null,
        training.location || null,
        training.scheduled_date || null,
        training.scheduled_time || null,
        training.duration_minutes || defaultDuration
      );
    }
    
    const query = `
      INSERT INTO employee_training 
      (employee_id, training_type, description, trainer, location, scheduled_date, scheduled_time, duration_minutes)
      VALUES ${placeholders.join(", ")}
    `;
    
    await connection.query(query, values);
    connection.release();
    
    res.status(201).json({ 
      message: "Training scheduled successfully",
      count: trainingItems.length
    });
  } catch (error) {
    console.error("Error scheduling training:", error);
    res.status(500).json({ message: "Failed to schedule training" });
  }
});

// Get equipment for employee
router.get("/api/employees/:id/equipment", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    const [equipment] = await connection.query(
      "SELECT * FROM employee_equipment WHERE employee_id = ? ORDER BY status, request_date DESC", 
      [id]
    );
    
    connection.release();
    res.json(equipment);
  } catch (error) {
    console.error("Error fetching employee equipment:", error);
    res.status(500).json({ message: "Failed to fetch employee equipment" });
  }
});

// Get documents for employee
router.get("/api/employees/:id/documents", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    const [documents] = await connection.query(
      "SELECT * FROM employee_documents WHERE employee_id = ? ORDER BY required_by_date", 
      [id]
    );
    
    connection.release();
    res.json(documents);
  } catch (error) {
    console.error("Error fetching employee documents:", error);
    res.status(500).json({ message: "Failed to fetch employee documents" });
  }
});

// Get training for employee
router.get("/api/employees/:id/training", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    const [training] = await connection.query(
      "SELECT * FROM employee_training WHERE employee_id = ? ORDER BY scheduled_date, scheduled_time", 
      [id]
    );
    
    connection.release();
    res.json(training);
  } catch (error) {
    console.error("Error fetching employee training:", error);
    res.status(500).json({ message: "Failed to fetch employee training" });
  }
});

// Update employee document status (e.g., when document is submitted or verified)
router.patch("/api/employees/:employeeId/documents/:documentId", async (req, res) => {
  try {
    const { employeeId, documentId } = req.params;
    const { status, notes, submission_date } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    const connection = await db.getConnection();
    
    // Check if document exists and belongs to employee
    const [documents] = await connection.query(
      "SELECT * FROM employee_documents WHERE id = ? AND employee_id = ?", 
      [documentId, employeeId]
    );
    
    if (documents.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Document not found or does not belong to this employee" });
    }
    
    // Update document status
    let query = "UPDATE employee_documents SET status = ?";
    let params = [status];
    
    if (notes) {
      query += ", notes = ?";
      params.push(notes);
    }
    
    if (submission_date) {
      query += ", submission_date = ?";
      params.push(submission_date);
    } else if (status === 'Submitted' || status === 'Verified') {
      query += ", submission_date = CURRENT_DATE()";
    }
    
    query += " WHERE id = ?";
    params.push(documentId);
    
    await connection.query(query, params);
    connection.release();
    
    res.json({ message: "Document status updated successfully" });
  } catch (error) {
    console.error("Error updating document status:", error);
    res.status(500).json({ message: "Failed to update document status" });
  }
});

// Update employee equipment status
router.patch("/api/employees/:employeeId/equipment/:equipmentId", async (req, res) => {
  try {
    const { employeeId, equipmentId } = req.params;
    const { status, notes, fulfillment_date } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    const connection = await db.getConnection();
    
    // Check if equipment exists and belongs to employee
    const [equipment] = await connection.query(
      "SELECT * FROM employee_equipment WHERE id = ? AND employee_id = ?", 
      [equipmentId, employeeId]
    );
    
    if (equipment.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Equipment not found or does not belong to this employee" });
    }
    
    // Update equipment status
    let query = "UPDATE employee_equipment SET status = ?";
    let params = [status];
    
    if (notes) {
      query += ", notes = ?";
      params.push(notes);
    }
    
    if (fulfillment_date) {
      query += ", fulfillment_date = ?";
      params.push(fulfillment_date);
    } else if (status === 'Assigned') {
      query += ", fulfillment_date = CURRENT_DATE()";
    }
    
    query += " WHERE id = ?";
    params.push(equipmentId);
    
    await connection.query(query, params);
    connection.release();
    
    res.json({ message: "Equipment status updated successfully" });
  } catch (error) {
    console.error("Error updating equipment status:", error);
    res.status(500).json({ message: "Failed to update equipment status" });
  }
});

// Update employee training status
router.patch("/api/employees/:employeeId/training/:trainingId", async (req, res) => {
  try {
    const { employeeId, trainingId } = req.params;
    const { status, notes, completion_date } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    const connection = await db.getConnection();
    
    // Check if training exists and belongs to employee
    const [training] = await connection.query(
      "SELECT * FROM employee_training WHERE id = ? AND employee_id = ?", 
      [trainingId, employeeId]
    );
    
    if (training.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Training not found or does not belong to this employee" });
    }
    
    // Update training status
    let query = "UPDATE employee_training SET status = ?";
    let params = [status];
    
    if (notes) {
      query += ", notes = ?";
      params.push(notes);
    }
    
    if (completion_date) {
      query += ", completion_date = ?";
      params.push(completion_date);
    } else if (status === 'Completed') {
      query += ", completion_date = CURRENT_DATE()";
    }
    
    query += " WHERE id = ?";
    params.push(trainingId);
    
    await connection.query(query, params);
    connection.release();
    
    res.json({ message: "Training status updated successfully" });
  } catch (error) {
    console.error("Error updating training status:", error);
    res.status(500).json({ message: "Failed to update training status" });
  }
});

// Get onboarding progress for employee (aggregated data for dashboard)
router.get("/api/employees/:id/onboarding-progress", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    // First check if employee exists
    const [employees] = await connection.query("SELECT * FROM employees WHERE id = ?", [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    const employee = employees[0];
    
    // Get counts of documents by status
    const [documents] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Verified' THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN required = 1 THEN 1 ELSE 0 END) as required
      FROM employee_documents
      WHERE employee_id = ?
    `, [id]);
    
    // Get counts of equipment by status
    const [equipment] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Assigned' THEN 1 ELSE 0 END) as assigned,
        SUM(CASE WHEN status = 'Ordered' THEN 1 ELSE 0 END) as ordered,
        SUM(CASE WHEN status = 'Requested' THEN 1 ELSE 0 END) as requested
      FROM employee_equipment
      WHERE employee_id = ?
    `, [id]);
    
    // Get counts of training by status
    const [training] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'Postponed' THEN 1 ELSE 0 END) as postponed
      FROM employee_training
      WHERE employee_id = ?
    `, [id]);
    
    // Calculate progress
    const docRequired = documents[0].required || 0;
    const docVerified = documents[0].verified || 0;
    const docProgress = docRequired > 0 ? Math.round((docVerified / docRequired) * 100) : 100;
    
    const equipmentTotal = equipment[0].total || 0;
    const equipmentAssigned = equipment[0].assigned || 0;
    const equipmentProgress = equipmentTotal > 0 ? Math.round((equipmentAssigned / equipmentTotal) * 100) : 100;
    
    const trainingTotal = training[0].total || 0;
    const trainingCompleted = training[0].completed || 0;
    const trainingProgress = trainingTotal > 0 ? Math.round((trainingCompleted / trainingTotal) * 100) : 100;
    
    // Overall progress - gives more weight to documents as they're usually more critical
    let overallProgress = 0;
    if (docRequired > 0 || equipmentTotal > 0 || trainingTotal > 0) {
      const weightedProgress = (docProgress * 0.5) + (equipmentProgress * 0.25) + (trainingProgress * 0.25);
      overallProgress = Math.round(weightedProgress);
    } else {
      overallProgress = 100; // No requirements means complete
    }
    
    connection.release();
    
    // Calculate days since hire
    const hireDate = new Date(employee.hire_date);
    const today = new Date();
    const daysSinceHire = Math.ceil((today - hireDate) / (1000 * 60 * 60 * 24));
    
    res.json({
      employee: {
        id: employee.id,
        name: employee.name,
        position: employee.position,
        department: employee.department,
        hire_date: employee.hire_date,
        days_since_hire: daysSinceHire
      },
      documents: documents[0],
      equipment: equipment[0],
      training: training[0],
      progress: {
        documents: docProgress,
        equipment: equipmentProgress,
        training: trainingProgress,
        overall: overallProgress
      }
    });
  } catch (error) {
    console.error("Error fetching onboarding progress:", error);
    res.status(500).json({ message: "Failed to fetch onboarding progress" });
  }
});

// Send welcome email to onboarded employee
router.post("/api/employees/:id/send-welcome-email", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    // Check if employee exists
    const [employees] = await connection.query(`
      SELECT e.*, a.first_name, a.last_name, a.status as applicant_status 
      FROM employees e 
      LEFT JOIN applicants a ON e.applicant_id = a.id 
      WHERE e.id = ?
    `, [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    const employee = employees[0];
    
    connection.release();
    
    // Send the welcome email
    try {
      const { sendWelcomeEmail } = require('../../services/emailService');
      
      // Use the name field from employees table, or construct from first_name and last_name if available
      const employeeName = employee.name || 
                          (employee.first_name && employee.last_name ? 
                           `${employee.first_name} ${employee.last_name}` : 
                           'New Employee');
      
      await sendWelcomeEmail(
        employee.email,
        employeeName,
        {
          position: employee.position,
          department: employee.department,
          hire_date: employee.hire_date,
          reporting_manager: employee.mentor || 'HR Manager'
        }
      );
      
      console.log(`✉️ Welcome email sent to ${employeeName} at ${employee.email}`);
      
      res.json({ 
        success: true,
        message: "Welcome email sent successfully" 
      });
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      res.status(500).json({ message: "Failed to send welcome email" });
    }
  } catch (error) {
    console.error("Error sending welcome email:", error);
    res.status(500).json({ message: "Failed to send welcome email" });
  }
});

// Public endpoint for QR code scanning - doesn't require authentication
router.get("/api/employees/:id/public-profile", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT id, name, email, phone, position, department, status FROM employees WHERE id = ?", [id]);
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching employee public profile:", error);
    res.status(500).json({ message: "Failed to fetch employee profile" });
  }
});

module.exports = router; 