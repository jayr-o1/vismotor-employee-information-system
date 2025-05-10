const express = require("express");
const router = express.Router();
const db = require("../configs/database");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { sendErrorResponse } = require("../utils/errorHandler");

// Configure file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const uploadDir = path.join(__dirname, "../../uploads");
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

// Configure error handling for multer
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

// Handle file uploads with error handling
router.post("/upload", (req, res) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred (e.g., file too large)
      console.error("Multer error:", err);
      const multerError = new Error(err.message || "File upload error");
      multerError.code = "FILE_UPLOAD_ERROR";
      multerError.details = { field: err.field };
      return sendErrorResponse(res, multerError, "File upload failed", 400);
    } else if (err) {
      // Some other error occurred
      console.error("Upload error:", err);
      return sendErrorResponse(res, err, "File upload failed", 500);
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
      return sendErrorResponse(res, error, "Error processing uploaded files", 500);
    }
  });
});

// Submit application form
router.post("/submit", async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      gender,
      otherGender,
      age,
      maritalStatus,
      otherMaritalStatus,
      highestEducation,
      otherHighestEducation,
      region,
      province,
      city,
      barangay,
      streetAddress,
      positionApplyingFor,
      otherPosition,
      branchDepartment,
      otherBranchDepartment,
      dateAvailability,
      otherDateAvailability,
      desiredPay,
      jobPostSource,
      otherJobSource,
      previouslyEmployed,
      resumeFile,
      houseSketchFile
    } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName || !positionApplyingFor) {
      const validationError = new Error("Missing required fields");
      validationError.code = "VALIDATION_ERROR";
      validationError.details = {
        missingFields: [
          ...(!email ? ['email'] : []),
          ...(!firstName ? ['firstName'] : []),
          ...(!lastName ? ['lastName'] : []),
          ...(!positionApplyingFor ? ['positionApplyingFor'] : [])
        ]
      };
      throw validationError;
    }

    // Insert into applicants table
    const query = `
      INSERT INTO applicants (
        email, first_name, last_name, gender, other_gender, age, 
        marital_status, other_marital_status, highest_education, other_highest_education,
        region, province, city, barangay, street_address,
        position, other_position, branch_department, other_branch_department,
        date_availability, other_date_availability, desired_pay,
        job_post_source, other_job_source, previously_employed,
        resume_filename, resume_originalname, resume_path,
        house_sketch_filename, house_sketch_originalname, house_sketch_path,
        status, applied_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      email, firstName, lastName, gender, otherGender, age,
      maritalStatus, otherMaritalStatus, highestEducation, otherHighestEducation,
      region, province, city, barangay, streetAddress,
      positionApplyingFor, otherPosition, branchDepartment, otherBranchDepartment,
      dateAvailability, otherDateAvailability, desiredPay,
      jobPostSource, otherJobSource, previouslyEmployed,
      resumeFile?.filename, resumeFile?.originalname, resumeFile?.path,
      houseSketchFile?.filename, houseSketchFile?.originalname, houseSketchFile?.path,
      "Pending"
    ];

    try {
      // Execute query using promise interface instead of callback
      const connection = await db.getConnection();
      const [result] = await connection.query(query, values);
      connection.release();
      
      return res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        applicantId: result.insertId
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      const error = new Error(dbError.message || "Database operation failed");
      error.code = "DATABASE_ERROR";
      error.sqlMessage = dbError.sqlMessage;
      error.sqlState = dbError.sqlState;
      error.errno = dbError.errno;
      return sendErrorResponse(res, error, "Failed to save applicant data", 500);
    }
  } catch (error) {
    console.error("Error submitting application:", error);
    
    if (error.code === "VALIDATION_ERROR") {
      return sendErrorResponse(res, error, "Validation failed: Missing required fields", 400);
    }
    
    return sendErrorResponse(res, error, "Failed to submit application", 500);
  }
});

module.exports = router; 