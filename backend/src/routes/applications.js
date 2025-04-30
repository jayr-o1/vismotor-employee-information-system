const express = require("express");
const router = express.Router();
const db = require("../configs/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../uploads");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Handle file uploads
router.post("/upload", upload.fields([
  { name: "resumeFile", maxCount: 1 },
  { name: "houseSketchFile", maxCount: 1 }
]), (req, res) => {
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
    console.error("Error uploading files:", error);
    return res.status(500).json({
      success: false,
      message: "File upload failed",
      error: error.message
    });
  }
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

    // Insert into database
    const query = `
      INSERT INTO applications (
        email, first_name, last_name, gender, other_gender, age, 
        marital_status, other_marital_status, highest_education, other_highest_education,
        region, province, city, barangay, street_address,
        position_applying_for, other_position, branch_department, other_branch_department,
        date_availability, other_date_availability, desired_pay,
        job_post_source, other_job_source, previously_employed,
        resume_filename, resume_originalname, resume_path,
        house_sketch_filename, house_sketch_originalname, house_sketch_path,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      email, firstName, lastName, gender, otherGender, age,
      maritalStatus, otherMaritalStatus, highestEducation, otherHighestEducation,
      region, province, city, barangay, streetAddress,
      positionApplyingFor, otherPosition, branchDepartment, otherBranchDepartment,
      dateAvailability, otherDateAvailability, desiredPay,
      jobPostSource, otherJobSource, previouslyEmployed,
      resumeFile?.filename, resumeFile?.originalname, resumeFile?.path,
      houseSketchFile?.filename, houseSketchFile?.originalname, houseSketchFile?.path
    ];

    // Execute query using promisify
    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to save application data",
          error: err.message
        });
      }
      
      return res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        applicationId: result.insertId
      });
    });
  } catch (error) {
    console.error("Error processing application:", error);
    return res.status(500).json({
      success: false,
      message: "Application submission failed",
      error: error.message
    });
  }
});

module.exports = router; 