const express = require("express");
const router = express.Router();
const db = require("../../configs/database");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Configure storage for profile pictures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const uploadDir = path.join(__dirname, '../../../uploads/profile-pictures');
      
      // Create directories if they don't exist
      if (!fs.existsSync(path.join(__dirname, '../../../uploads'))) {
        fs.mkdirSync(path.join(__dirname, '../../../uploads'), { recursive: true });
        console.log("Created main uploads directory from multer config");
      }
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log("Created profile-pictures directory from multer config");
      }
      
      cb(null, uploadDir);
    } catch (error) {
      console.error("Error in storage destination:", error);
      cb(error, null);
    }
  },
  filename: function (req, file, cb) {
    try {
      // Create unique filename with original extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const newFilename = 'profile-' + uniqueSuffix + path.extname(file.originalname);
      console.log("Generated filename:", newFilename);
      cb(null, newFilename);
    } catch (error) {
      console.error("Error in filename generation:", error);
      cb(error, null);
    }
  }
});

// Set up multer with file size and type validation
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    try {
      // Log the file details
      console.log("Uploading file:", file.originalname, "mimetype:", file.mimetype);
      
      // Accept only images
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        console.error("Invalid file type:", file.originalname);
        return cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'), false);
      }
      
      cb(null, true);
    } catch (error) {
      console.error("Error in file filter:", error);
      cb(error, false);
    }
  }
}).single('profilePicture');

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
    
    console.log("UPDATE REQUEST BODY:", JSON.stringify(req.body));
    
    const { 
      name, 
      email, 
      phone, 
      position, 
      department, 
      hire_date, 
      salary,
      status,
      profile_picture
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
    console.log("Existing employee:", existingEmployee);
    
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
    
    // Check if profile_picture column exists in employees table
    let profilePictureColumnExists = true;
    try {
      const [columns] = await connection.query("SHOW COLUMNS FROM employees LIKE 'profile_picture'");
      profilePictureColumnExists = columns.length > 0;
      console.log("Profile picture column exists:", profilePictureColumnExists);
    } catch (error) {
      console.error("Error checking for profile_picture column:", error);
      profilePictureColumnExists = false;
    }
    
    // If profile_picture column doesn't exist but is provided, add it
    if (!profilePictureColumnExists && profile_picture) {
      try {
        await connection.query("ALTER TABLE employees ADD COLUMN profile_picture VARCHAR(255) AFTER email");
        console.log("Added profile_picture column to employees table");
        profilePictureColumnExists = true;
      } catch (alterError) {
        console.error("Error adding profile_picture column:", alterError);
        // Continue with the update, but don't try to set profile_picture
      }
    }

    try {
      // Build the update query based on whether profile_picture column exists
      let updateQuery;
      let queryParams;
      
      if (profilePictureColumnExists) {
        updateQuery = "UPDATE employees SET name = ?, email = ?, phone = ?, position = ?, department = ?, status = ?";
        queryParams = [
          name || existingEmployee.name, 
          email || existingEmployee.email, 
          phone || existingEmployee.phone, 
          position || existingEmployee.position, 
          department || existingEmployee.department,
          status || existingEmployee.status
        ];
        
        // Add profile_picture to the query if it exists
        if (profile_picture !== undefined) {
          updateQuery += ", profile_picture = ?";
          queryParams.push(profile_picture);
        }
        
        // Add hire_date and salary only if they exist in the request
        if (hire_date !== undefined) {
          updateQuery += ", hire_date = ?";
          queryParams.push(hire_date);
        }
        
        if (salary !== undefined) {
          updateQuery += ", salary = ?";
          queryParams.push(salary);
        }
        
        // Add WHERE clause
        updateQuery += " WHERE id = ?";
        queryParams.push(id);
      } else {
        updateQuery = "UPDATE employees SET name = ?, email = ?, phone = ?, position = ?, department = ?, status = ? WHERE id = ?";
        queryParams = [
          name || existingEmployee.name, 
          email || existingEmployee.email, 
          phone || existingEmployee.phone, 
          position || existingEmployee.position, 
          department || existingEmployee.department,
          status || existingEmployee.status,
          id
        ];
      }
      
      console.log("Update query:", updateQuery);
      console.log("Query params:", queryParams);
      
      // Execute the update query
      const [result] = await connection.query(updateQuery, queryParams);
      
      connection.release();
      
      return res.json({ 
        message: "Employee updated successfully",
        id: id
      });
    } catch (queryError) {
      console.error("Database query error:", queryError);
      connection.release();
      return res.status(500).json({ message: `Database query error: ${queryError.message}` });
    }
  } catch (error) {
    console.error("Error updating employee:", error);
    return res.status(500).json({ message: `Failed to update employee: ${error.message}` });
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

// Get equipment types
router.get("/api/equipment-types", async (req, res) => {
  try {
    const connection = await db.getConnection();
    
    // Check if equipment_types table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'equipment_types'");
    
    if (tables.length === 0) {
      // Create the table if it doesn't exist
      await connection.query(`
        CREATE TABLE equipment_types (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          required BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Insert default equipment types
      await connection.query(`
        INSERT INTO equipment_types (name, description, required) VALUES
        ('Laptop', 'Standard work laptop', TRUE),
        ('Desktop Computer', 'Office desktop workstation', TRUE),
        ('Mouse', 'Wireless mouse', FALSE),
        ('Keyboard', 'Wireless keyboard', FALSE),
        ('Headset', 'Noise-cancelling headset', FALSE),
        ('Monitor', 'Standard 24" monitor', FALSE),
        ('Phone', 'Company mobile phone', FALSE),
        ('ID Card', 'Employee identification card', TRUE),
        ('Uniforms', 'Company-issued uniforms', FALSE),
        ('Access Card', 'Building access card', TRUE)
      `);
    }
    
    // Fetch equipment types
    const [rows] = await connection.query("SELECT * FROM equipment_types ORDER BY name");
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching equipment types:", error);
    res.status(500).json({ message: "Failed to fetch equipment types" });
  }
});

// Get document types
router.get("/api/document-types", async (req, res) => {
  try {
    const connection = await db.getConnection();
    
    // Check if document_types table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'document_types'");
    
    if (tables.length === 0) {
      // Create the table if it doesn't exist
      await connection.query(`
        CREATE TABLE document_types (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          required BOOLEAN DEFAULT TRUE,
          days_to_submit INT DEFAULT 7,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Insert default document types
      await connection.query(`
        INSERT INTO document_types (name, description, required, days_to_submit) VALUES
        ('Employment Contract', 'Signed employment agreement', TRUE, 1),
        ('Tax Forms', 'Required tax declaration forms', TRUE, 7),
        ('ID Card Photo', 'Recent ID-sized photo for company ID', TRUE, 3),
        ('Bank Account Details', 'For payroll processing', TRUE, 7),
        ('Health Insurance Form', 'Health insurance enrollment', TRUE, 14),
        ('Emergency Contact Form', 'Emergency contact information', TRUE, 3),
        ('Diploma/Certificates', 'Academic credentials', TRUE, 14),
        ('Previous Employment Certificate', 'Certificate of employment from previous employer', FALSE, 30),
        ('NBI Clearance', 'National Bureau of Investigation clearance', TRUE, 30),
        ('SSS Number', 'Social Security System registration', TRUE, 30),
        ('TIN', 'Tax Identification Number', TRUE, 14),
        ('PhilHealth ID', 'PhilHealth registration', TRUE, 30),
        ('Pag-IBIG ID', 'Pag-IBIG/HDMF registration', TRUE, 30)
      `);
    }
    
    // Fetch document types
    const [rows] = await connection.query("SELECT * FROM document_types ORDER BY name");
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching document types:", error);
    res.status(500).json({ message: "Failed to fetch document types" });
  }
});

// Get training types
router.get("/api/training-types", async (req, res) => {
  try {
    const connection = await db.getConnection();
    
    // Check if training_types table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'training_types'");
    
    if (tables.length === 0) {
      // Create the table if it doesn't exist
      await connection.query(`
        CREATE TABLE training_types (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          default_duration_minutes INT DEFAULT 60,
          required BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Insert default training types
      await connection.query(`
        INSERT INTO training_types (name, description, default_duration_minutes, required) VALUES
        ('Company Orientation', 'Introduction to company policies, culture, and procedures', 240, TRUE),
        ('Department Orientation', 'Introduction to department-specific processes', 120, TRUE),
        ('IT Systems Training', 'Training on company systems and software', 180, TRUE),
        ('Security Awareness', 'Basic security protocols and data protection', 60, TRUE),
        ('Safety Training', 'Workplace safety procedures', 60, TRUE),
        ('Job-Specific Training', 'Role-specific skills and knowledge training', 240, TRUE),
        ('HR Systems', 'Training on HR systems like leave requests, payroll', 90, FALSE),
        ('Ethics and Compliance', 'Company ethics policies and compliance requirements', 60, TRUE),
        ('Customer Service Training', 'Customer interaction best practices', 120, FALSE),
        ('Productivity Tools', 'Training on office productivity software', 120, FALSE)
      `);
    }
    
    // Fetch training types
    const [rows] = await connection.query("SELECT * FROM training_types ORDER BY name");
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching training types:", error);
    res.status(500).json({ message: "Failed to fetch training types" });
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
    
    // Get limited employee data for public profile including profile_picture
    const [employees] = await connection.query(
      "SELECT id, name, position, department, status, email, phone, profile_picture FROM employees WHERE id = ?", 
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

// Save employee equipment
router.post("/api/employees/:id/equipment", async (req, res) => {
  try {
    const { id } = req.params;
    const equipmentList = req.body;
    
    if (!Array.isArray(equipmentList)) {
      return res.status(400).json({ message: "Equipment list must be an array" });
    }
    
    const connection = await db.getConnection();
    
    // Check if employee exists
    const [employees] = await connection.query("SELECT * FROM employees WHERE id = ?", [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Check if employee_equipment table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'employee_equipment'");
    
    if (tables.length === 0) {
      // Create the table if it doesn't exist
      await connection.query(`
        CREATE TABLE employee_equipment (
          id INT PRIMARY KEY AUTO_INCREMENT,
          employee_id INT NOT NULL,
          equipment_type VARCHAR(100) NOT NULL,
          description TEXT,
          notes TEXT,
          assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status ENUM('Assigned', 'Delivered', 'Returned') DEFAULT 'Assigned',
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
        )
      `);
    }
    
    // Delete existing equipment assignments
    await connection.query("DELETE FROM employee_equipment WHERE employee_id = ?", [id]);
    
    // Insert new equipment assignments
    for (const equipment of equipmentList) {
      await connection.query(
        "INSERT INTO employee_equipment (employee_id, equipment_type, description, notes) VALUES (?, ?, ?, ?)",
        [id, equipment.equipment_type, equipment.description || "", equipment.notes || ""]
      );
    }
    
    connection.release();
    
    res.json({ 
      message: "Employee equipment saved successfully",
      count: equipmentList.length
    });
  } catch (error) {
    console.error("Error saving employee equipment:", error);
    res.status(500).json({ message: "Failed to save employee equipment" });
  }
});

// Save employee documents
router.post("/api/employees/:id/documents", async (req, res) => {
  try {
    const { id } = req.params;
    const documentList = req.body;
    
    if (!Array.isArray(documentList)) {
      return res.status(400).json({ message: "Document list must be an array" });
    }
    
    const connection = await db.getConnection();
    
    // Check if employee exists
    const [employees] = await connection.query("SELECT * FROM employees WHERE id = ?", [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Check if employee_documents table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'employee_documents'");
    
    if (tables.length === 0) {
      // Create the table if it doesn't exist
      await connection.query(`
        CREATE TABLE employee_documents (
          id INT PRIMARY KEY AUTO_INCREMENT,
          employee_id INT NOT NULL,
          document_type VARCHAR(100) NOT NULL,
          document_name VARCHAR(255) NOT NULL,
          required BOOLEAN DEFAULT TRUE,
          days_to_submit INT DEFAULT 7,
          notes TEXT,
          submitted BOOLEAN DEFAULT FALSE,
          submitted_date TIMESTAMP NULL,
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
        )
      `);
    }
    
    // Delete existing document requirements
    await connection.query("DELETE FROM employee_documents WHERE employee_id = ?", [id]);
    
    // Insert new document requirements
    for (const document of documentList) {
      await connection.query(
        "INSERT INTO employee_documents (employee_id, document_type, document_name, required, days_to_submit, notes) VALUES (?, ?, ?, ?, ?, ?)",
        [
          id, 
          document.document_type, 
          document.document_name || document.document_type, 
          document.required !== undefined ? document.required : true,
          document.days_to_submit || 7,
          document.notes || ""
        ]
      );
    }
    
    connection.release();
    
    res.json({ 
      message: "Employee documents saved successfully",
      count: documentList.length
    });
  } catch (error) {
    console.error("Error saving employee documents:", error);
    res.status(500).json({ message: "Failed to save employee documents" });
  }
});

// Save employee training schedule
router.post("/api/employees/:id/training", async (req, res) => {
  try {
    const { id } = req.params;
    const trainingList = req.body;
    
    if (!Array.isArray(trainingList)) {
      return res.status(400).json({ message: "Training list must be an array" });
    }
    
    const connection = await db.getConnection();
    
    // Check if employee exists
    const [employees] = await connection.query("SELECT * FROM employees WHERE id = ?", [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Check if employee_training table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'employee_training'");
    
    if (tables.length === 0) {
      // Create the table if it doesn't exist
      await connection.query(`
        CREATE TABLE employee_training (
          id INT PRIMARY KEY AUTO_INCREMENT,
          employee_id INT NOT NULL,
          training_type VARCHAR(100) NOT NULL,
          description TEXT,
          trainer VARCHAR(100),
          location VARCHAR(255),
          scheduled_date DATE,
          scheduled_time TIME,
          duration_minutes INT DEFAULT 60,
          status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
          completion_date TIMESTAMP NULL,
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
        )
      `);
    }
    
    // Delete existing training sessions
    await connection.query("DELETE FROM employee_training WHERE employee_id = ?", [id]);
    
    // Insert new training sessions
    for (const training of trainingList) {
      await connection.query(
        "INSERT INTO employee_training (employee_id, training_type, description, trainer, location, scheduled_date, scheduled_time, duration_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          id, 
          training.training_type, 
          training.description || "", 
          training.trainer || "",
          training.location || "",
          training.scheduled_date || null,
          training.scheduled_time || null,
          training.duration_minutes || 60
        ]
      );
    }
    
    connection.release();
    
    res.json({ 
      message: "Employee training saved successfully",
      count: trainingList.length
    });
  } catch (error) {
    console.error("Error saving employee training:", error);
    res.status(500).json({ message: "Failed to save employee training" });
  }
});

// Get employee onboarding data (equipment, documents, training)
router.get("/api/employees/:id/onboarding", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    // Check if employee exists
    const [employees] = await connection.query("SELECT * FROM employees WHERE id = ?", [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Initialize result object
    const result = {
      employee: employees[0],
      equipment: [],
      documents: [],
      training: []
    };
    
    // Check if tables exist
    const [tables] = await connection.query(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN ('employee_equipment', 'employee_documents', 'employee_training')
    `);
    
    // Create a map of existing tables
    const existingTables = tables.reduce((acc, table) => {
      acc[table.TABLE_NAME] = true;
      return acc;
    }, {});
    
    // Get equipment if table exists
    if (existingTables['employee_equipment']) {
      try {
        const [equipmentRows] = await connection.query(
          "SELECT * FROM employee_equipment WHERE employee_id = ?", 
          [id]
        );
        result.equipment = equipmentRows;
      } catch (error) {
        console.log("Error fetching employee equipment:", error.message);
      }
    } else {
      console.log("employee_equipment table does not exist yet");
    }
    
    // Get documents if table exists
    if (existingTables['employee_documents']) {
      try {
        const [documentRows] = await connection.query(
          "SELECT * FROM employee_documents WHERE employee_id = ?", 
          [id]
        );
        result.documents = documentRows;
      } catch (error) {
        console.log("Error fetching employee documents:", error.message);
      }
    } else {
      console.log("employee_documents table does not exist yet");
    }
    
    // Get training if table exists
    if (existingTables['employee_training']) {
      try {
        const [trainingRows] = await connection.query(
          "SELECT * FROM employee_training WHERE employee_id = ?", 
          [id]
        );
        result.training = trainingRows;
      } catch (error) {
        console.log("Error fetching employee training:", error.message);
      }
    } else {
      console.log("employee_training table does not exist yet");
    }
    
    connection.release();
    
    res.json(result);
  } catch (error) {
    console.error("Error fetching employee onboarding data:", error);
    res.status(500).json({ message: "Failed to fetch employee onboarding data" });
  }
});

// Get employee onboarding progress
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
    
    // Initialize progress object
    const progress = {
      equipment: { total: 0, completed: 0 },
      documents: { total: 0, completed: 0 },
      training: { total: 0, completed: 0 },
      overall: 0
    };
    
    // Check if tables exist first
    const [tables] = await connection.query(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN ('employee_equipment', 'employee_documents', 'employee_training')
    `);
    
    // Create a map of existing tables
    const existingTables = tables.reduce((acc, table) => {
      acc[table.TABLE_NAME] = true;
      return acc;
    }, {});
    
    // Get equipment progress if table exists
    if (existingTables['employee_equipment']) {
      try {
        const [equipmentRows] = await connection.query(
          "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as completed FROM employee_equipment WHERE employee_id = ?",
          [id]
        );
        
        if (equipmentRows.length > 0) {
          progress.equipment.total = equipmentRows[0].total || 0;
          progress.equipment.completed = equipmentRows[0].completed || 0;
        }
      } catch (error) {
        console.error("Error getting equipment progress:", error);
        // Continue even if there's an error
      }
    } else {
      console.log("employee_equipment table does not exist yet");
    }
    
    // Get documents progress if table exists
    if (existingTables['employee_documents']) {
      try {
        const [documentRows] = await connection.query(
          "SELECT COUNT(*) as total, SUM(CASE WHEN submitted = TRUE THEN 1 ELSE 0 END) as completed FROM employee_documents WHERE employee_id = ?",
          [id]
        );
        
        if (documentRows.length > 0) {
          progress.documents.total = documentRows[0].total || 0;
          progress.documents.completed = documentRows[0].completed || 0;
        }
      } catch (error) {
        console.error("Error getting documents progress:", error);
        // Continue even if there's an error
      }
    } else {
      console.log("employee_documents table does not exist yet");
    }
    
    // Get training progress if table exists
    if (existingTables['employee_training']) {
      try {
        const [trainingRows] = await connection.query(
          "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed FROM employee_training WHERE employee_id = ?",
          [id]
        );
        
        if (trainingRows.length > 0) {
          progress.training.total = trainingRows[0].total || 0;
          progress.training.completed = trainingRows[0].completed || 0;
        }
      } catch (error) {
        console.error("Error getting training progress:", error);
        // Continue even if there's an error
      }
    } else {
      console.log("employee_training table does not exist yet");
    }
    
    // Calculate overall progress
    const totalItems = progress.equipment.total + progress.documents.total + progress.training.total;
    const completedItems = progress.equipment.completed + progress.documents.completed + progress.training.completed;
    
    progress.overall = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    connection.release();
    
    res.json(progress);
  } catch (error) {
    console.error("Error fetching onboarding progress:", error);
    res.status(500).json({ message: "Failed to fetch onboarding progress" });
  }
});

// Get employee equipment
router.get("/api/employees/:id/equipment", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    // Check if employee exists
    const [employees] = await connection.query("SELECT * FROM employees WHERE id = ?", [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Check if table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'employee_equipment'");
    if (tables.length === 0) {
      // Table doesn't exist yet, return empty array
      connection.release();
      console.log("employee_equipment table doesn't exist yet - returning empty array");
      return res.json([]);
    }
    
    // Get employee equipment
    const [rows] = await connection.query(
      "SELECT * FROM employee_equipment WHERE employee_id = ?",
      [id]
    );
    
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching employee equipment:", error);
    res.status(500).json({ message: "Failed to fetch employee equipment" });
  }
});

// Get employee documents
router.get("/api/employees/:id/documents", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    // Check if employee exists
    const [employees] = await connection.query("SELECT * FROM employees WHERE id = ?", [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Check if table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'employee_documents'");
    if (tables.length === 0) {
      // Table doesn't exist yet, return empty array
      connection.release();
      console.log("employee_documents table doesn't exist yet - returning empty array");
      return res.json([]);
    }
    
    // Get employee documents
    const [rows] = await connection.query(
      "SELECT * FROM employee_documents WHERE employee_id = ?",
      [id]
    );
    
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching employee documents:", error);
    res.status(500).json({ message: "Failed to fetch employee documents" });
  }
});

// Get employee training
router.get("/api/employees/:id/training", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    // Check if employee exists
    const [employees] = await connection.query("SELECT * FROM employees WHERE id = ?", [id]);
    
    if (employees.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Check if table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'employee_training'");
    if (tables.length === 0) {
      // Table doesn't exist yet, return empty array
      connection.release();
      console.log("employee_training table doesn't exist yet - returning empty array");
      return res.json([]);
    }
    
    // Get employee training
    const [rows] = await connection.query(
      "SELECT * FROM employee_training WHERE employee_id = ?",
      [id]
    );
    
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching employee training:", error);
    res.status(500).json({ message: "Failed to fetch employee training" });
  }
});

// Get profile picture
router.get('/api/profile-pictures/:filename', (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, '../../../uploads/profile-pictures', filename);
  
  // Check if file exists
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ message: 'Profile picture not found' });
  }
  
  // Send the file
  res.sendFile(filepath);
});

// Upload employee profile picture
router.post('/api/employees/:id/profile-picture', (req, res) => {
  console.log("Profile picture upload request for employee ID:", req.params.id);
  
  // Create uploads directories synchronously before handling file upload
  try {
    const uploadDir = path.join(__dirname, '../../../uploads/profile-pictures');
    fs.mkdirSync(path.join(__dirname, '../../../uploads'), { recursive: true });
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Ensured upload directories exist");
  } catch (mkdirError) {
    console.error("Error creating upload directories:", mkdirError);
    return res.status(500).json({ message: `Server error: ${mkdirError.message}` });
  }
  
  upload(req, res, async function(err) {
    if (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ message: `Upload failed: ${err.message}` });
    }
    
    // If file upload was successful
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    try {
      const { id } = req.params;
      const profilePicturePath = req.file.filename;
      console.log("File uploaded successfully:", profilePicturePath);
      
      const connection = await db.getConnection();
      
      // Check if employee exists
      const [employees] = await connection.query('SELECT * FROM employees WHERE id = ?', [id]);
      
      if (employees.length === 0) {
        connection.release();
        console.error("Employee not found with ID:", id);
        return res.status(404).json({ message: 'Employee not found' });
      }
      
      // Ensure the profile_picture column exists
      try {
        const [columns] = await connection.query("SHOW COLUMNS FROM employees LIKE 'profile_picture'");
        if (columns.length === 0) {
          await connection.query("ALTER TABLE employees ADD COLUMN profile_picture VARCHAR(255) AFTER email");
          console.log("Added profile_picture column to employees table");
        }
      } catch (columnError) {
        console.error("Error checking/adding profile_picture column:", columnError);
        connection.release();
        return res.status(500).json({ message: `Database error: ${columnError.message}` });
      }
      
      // Delete old profile picture if it exists
      if (employees[0].profile_picture) {
        try {
          const oldPicturePath = path.join(__dirname, '../../../uploads/profile-pictures', employees[0].profile_picture);
          if (fs.existsSync(oldPicturePath)) {
            fs.unlinkSync(oldPicturePath);
            console.log("Deleted old profile picture");
          }
        } catch (unlinkError) {
          console.error("Error deleting old profile picture:", unlinkError);
          // Continue even if old file deletion fails
        }
      }
      
      // Update employee with new profile picture
      try {
        await connection.query(
          'UPDATE employees SET profile_picture = ? WHERE id = ?',
          [profilePicturePath, id]
        );
        
        connection.release();
        
        return res.status(200).json({ 
          message: 'Profile picture uploaded successfully',
          profile_picture: profilePicturePath
        });
      } catch (dbError) {
        console.error("Database error updating profile picture:", dbError);
        connection.release();
        return res.status(500).json({ message: `Database error: ${dbError.message}` });
      }
    } catch (error) {
      console.error('Error updating employee profile picture:', error);
      return res.status(500).json({ message: `Server error: ${error.message}` });
    }
  });
});

module.exports = router; 