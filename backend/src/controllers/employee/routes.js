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
      mentor,
      create_default_checklist
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
    
    const employeeId = result.insertId;
    
    // Update applicant status to "Accepted"
    await connection.query(
      "UPDATE applicants SET status = 'Accepted' WHERE id = ?",
      [applicant_id]
    );
    
    // Create default onboarding checklist if requested
    if (create_default_checklist !== false) {
      try {
        // Get active templates
        const [templates] = await connection.query(
          "SELECT * FROM onboarding_templates WHERE is_active = TRUE ORDER BY priority"
        );
        
        // Calculate due dates and create checklist items
        if (templates.length > 0) {
          const hireDate = new Date(hire_date);
          const values = [];
          const placeholders = [];
          
          for (const template of templates) {
            // Calculate due date based on hire date and days_to_complete
            const dueDate = new Date(hireDate);
            dueDate.setDate(dueDate.getDate() + template.days_to_complete);
            
            placeholders.push("(?, ?, ?, ?, ?)");
            values.push(
              employeeId,
              template.title,
              template.description,
              dueDate.toISOString().split('T')[0],
              template.priority
            );
          }
          
          if (placeholders.length > 0) {
            const insertQuery = `
              INSERT INTO onboarding_checklists 
              (employee_id, title, description, due_date, priority)
              VALUES ${placeholders.join(", ")}
            `;
            
            await connection.query(insertQuery, values);
            console.log(`Created ${placeholders.length} checklist items for employee ${employeeId}`);
          }
        }
      } catch (checklistError) {
        console.error("Error creating default checklist:", checklistError);
        // Continue even if checklist creation fails
      }
    }
    
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
      message: "Employee onboarded successfully" 
    });
  } catch (error) {
    console.error("Error onboarding employee:", error);
    res.status(500).json({ message: "Failed to onboard employee" });
  }
});

// Get all onboarding templates
router.get("/api/onboarding/templates", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [templates] = await connection.query(
      "SELECT * FROM onboarding_templates WHERE is_active = TRUE ORDER BY category, priority"
    );
    connection.release();
    
    res.json(templates);
  } catch (error) {
    console.error("Error fetching onboarding templates:", error);
    res.status(500).json({ message: "Failed to fetch onboarding templates" });
  }
});

// Get onboarding checklist for employee
router.get("/api/employees/:id/onboarding-checklist", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    // Check if employee exists
    const [employees] = await connection.query("SELECT * FROM employees WHERE id = ?", [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Get checklist items
    const [checklist] = await connection.query(
      "SELECT * FROM onboarding_checklists WHERE employee_id = ? ORDER BY priority, due_date",
      [id]
    );
    
    // Calculate progress statistics
    const totalItems = checklist.length;
    const completedItems = checklist.filter(item => item.is_completed).length;
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    connection.release();
    
    res.json({
      employee: employees[0],
      checklist: checklist,
      stats: {
        totalItems,
        completedItems,
        progress
      }
    });
  } catch (error) {
    console.error("Error fetching onboarding checklist:", error);
    res.status(500).json({ message: "Failed to fetch onboarding checklist" });
  }
});

// Add checklist item to employee
router.post("/api/employees/:id/onboarding-checklist", async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title,
      description,
      due_date,
      priority,
      notes
    } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    
    const connection = await db.getConnection();
    
    // Check if employee exists
    const [employees] = await connection.query("SELECT * FROM employees WHERE id = ?", [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Add checklist item
    const [result] = await connection.query(`
      INSERT INTO onboarding_checklists
      (employee_id, title, description, due_date, priority, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      id,
      title,
      description || null,
      due_date || null,
      priority || 'Medium',
      notes || null
    ]);
    
    connection.release();
    
    res.status(201).json({ 
      id: result.insertId,
      message: "Checklist item added successfully" 
    });
  } catch (error) {
    console.error("Error adding checklist item:", error);
    res.status(500).json({ message: "Failed to add checklist item" });
  }
});

// Update checklist item
router.put("/api/onboarding-checklist/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title,
      description,
      is_completed,
      completed_date,
      due_date,
      category,
      priority,
      assigned_to,
      notes
    } = req.body;
    
    const connection = await db.getConnection();
    
    // Check if checklist item exists
    const [items] = await connection.query("SELECT * FROM onboarding_checklists WHERE id = ?", [id]);
    
    if (items.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Checklist item not found" });
    }
    
    const existingItem = items[0];
    
    // Auto-fill completed_date if item is being marked as completed
    let completedDateValue = completed_date;
    if (is_completed && !completed_date && !existingItem.is_completed) {
      completedDateValue = new Date().toISOString().split('T')[0]; // Today's date
    }
    
    // Update checklist item
    await connection.query(`
      UPDATE onboarding_checklists SET
        title = ?,
        description = ?,
        is_completed = ?,
        completed_date = ?,
        due_date = ?,
        category = ?,
        priority = ?,
        assigned_to = ?,
        notes = ?
      WHERE id = ?
    `, [
      title || existingItem.title,
      description !== undefined ? description : existingItem.description,
      is_completed !== undefined ? is_completed : existingItem.is_completed,
      completedDateValue !== undefined ? completedDateValue : existingItem.completed_date,
      due_date !== undefined ? due_date : existingItem.due_date,
      category || existingItem.category,
      priority || existingItem.priority,
      assigned_to !== undefined ? assigned_to : existingItem.assigned_to,
      notes !== undefined ? notes : existingItem.notes,
      id
    ]);
    
    connection.release();
    
    res.json({ message: "Checklist item updated successfully" });
  } catch (error) {
    console.error("Error updating checklist item:", error);
    res.status(500).json({ message: "Failed to update checklist item" });
  }
});

// Mark checklist item as completed
router.patch("/api/onboarding-checklist/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const connection = await db.getConnection();
    
    // Check if checklist item exists
    const [items] = await connection.query("SELECT * FROM onboarding_checklists WHERE id = ?", [id]);
    
    if (items.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Checklist item not found" });
    }
    
    // Update completion status and date
    const today = new Date().toISOString().split('T')[0];
    const query = notes 
      ? "UPDATE onboarding_checklists SET is_completed = TRUE, completed_date = ?, notes = ? WHERE id = ?"
      : "UPDATE onboarding_checklists SET is_completed = TRUE, completed_date = ? WHERE id = ?";
    
    const params = notes 
      ? [today, notes, id]
      : [today, id];
    
    await connection.query(query, params);
    
    connection.release();
    
    res.json({ message: "Checklist item marked as completed" });
  } catch (error) {
    console.error("Error completing checklist item:", error);
    res.status(500).json({ message: "Failed to complete checklist item" });
  }
});

// Delete checklist item
router.delete("/api/onboarding-checklist/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await db.getConnection();
    
    // Check if checklist item exists
    const [items] = await connection.query("SELECT * FROM onboarding_checklists WHERE id = ?", [id]);
    
    if (items.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Checklist item not found" });
    }
    
    // Delete checklist item
    await connection.query("DELETE FROM onboarding_checklists WHERE id = ?", [id]);
    
    connection.release();
    
    res.json({ message: "Checklist item deleted successfully" });
  } catch (error) {
    console.error("Error deleting checklist item:", error);
    res.status(500).json({ message: "Failed to delete checklist item" });
  }
});

// Get onboarding progress summary
router.get("/api/employees/:id/onboarding-progress", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    // Check if employee exists
    const [employees] = await connection.query("SELECT * FROM employees WHERE id = ?", [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Get checklist stats
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_completed = TRUE THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN due_date < CURRENT_DATE() AND is_completed = FALSE THEN 1 ELSE 0 END) as overdue
      FROM onboarding_checklists
      WHERE employee_id = ?
    `, [id]);
    
    const data = stats[0];
    
    // Get recently completed items
    const [recentCompletions] = await connection.query(`
      SELECT * FROM onboarding_checklists
      WHERE employee_id = ? AND is_completed = TRUE
      ORDER BY completed_date DESC, updated_at DESC
      LIMIT 5
    `, [id]);
    
    // Get upcoming items
    const [upcomingItems] = await connection.query(`
      SELECT * FROM onboarding_checklists
      WHERE employee_id = ? AND is_completed = FALSE
      ORDER BY due_date ASC
      LIMIT 5
    `, [id]);
    
    connection.release();
    
    const totalItems = data.total || 0;
    const completedItems = data.completed || 0;
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    res.json({
      stats: {
        totalItems,
        completedItems,
        progress,
        overdue: data.overdue || 0
      },
      recentCompletions,
      upcomingItems
    });
  } catch (error) {
    console.error("Error fetching onboarding progress:", error);
    res.status(500).json({ message: "Failed to fetch onboarding progress" });
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
    
    // Get onboarding checklist
    const [checklist] = await connection.query(
      "SELECT * FROM onboarding_checklists WHERE employee_id = ? ORDER BY category, due_date", 
      [id]
    );
    
    connection.release();
    
    // Prepare the export data
    const exportData = {
      employee: employee,
      applicant: applicant,
      onboarding_checklist: checklist,
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