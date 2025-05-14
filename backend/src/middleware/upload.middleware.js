const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Configure storage for profile pictures
 */
const profilePictureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const uploadDir = path.join(__dirname, '../../uploads/profile-pictures');
      
      // Create directories if they don't exist
      if (!fs.existsSync(path.join(__dirname, '../../uploads'))) {
        fs.mkdirSync(path.join(__dirname, '../../uploads'), { recursive: true });
      }
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
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
      cb(null, newFilename);
    } catch (error) {
      console.error("Error in filename generation:", error);
      cb(error, null);
    }
  }
});

/**
 * Configure storage for applicant files (resumes, etc.)
 */
const applicantFilesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const uploadDir = path.join(__dirname, '../../uploads/applicant-files');
      
      // Create directories if they don't exist
      if (!fs.existsSync(path.join(__dirname, '../../uploads'))) {
        fs.mkdirSync(path.join(__dirname, '../../uploads'), { recursive: true });
      }
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
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
      const fieldname = file.fieldname === 'resumeFile' ? 'resume' : 'houseSketch';
      const newFilename = fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
      cb(null, newFilename);
    } catch (error) {
      console.error("Error in filename generation:", error);
      cb(error, null);
    }
  }
});

/**
 * Profile picture upload middleware
 */
const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    try {
      // Accept only images
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'), false);
      }
      
      cb(null, true);
    } catch (error) {
      console.error("Error in file filter:", error);
      cb(error, false);
    }
  }
}).single('profilePicture');

/**
 * Applicant files upload middleware
 */
const uploadApplicantFiles = multer({
  storage: applicantFilesStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    try {
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
    } catch (error) {
      console.error("Error in file filter:", error);
      cb(error, false);
    }
  }
}).fields([
  { name: "resumeFile", maxCount: 1 },
  { name: "houseSketchFile", maxCount: 1 }
]);

// Handle file upload errors
const handleFileUpload = (req, res, next, uploadMiddleware) => {
  uploadMiddleware(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred (e.g., file too large)
      return res.status(400).json({
        success: false,
        message: "File upload error: " + err.message,
        error: {
          code: "FILE_UPLOAD_ERROR",
          field: err.field
        }
      });
    } else if (err) {
      // Some other error occurred
      return res.status(500).json({
        success: false,
        message: "File upload failed: " + err.message,
        error: {
          code: "UPLOAD_FAILED"
        }
      });
    }
    
    // No errors, proceed
    next();
  });
};

module.exports = {
  uploadProfilePicture: (req, res, next) => handleFileUpload(req, res, next, uploadProfilePicture),
  uploadApplicantFiles: (req, res, next) => handleFileUpload(req, res, next, uploadApplicantFiles)
}; 