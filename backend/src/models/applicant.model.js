const db = require("../config/database");

/**
 * Get all applicants
 */
const findAll = async () => {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query(
      "SELECT * FROM applicants ORDER BY applied_date DESC"
    );
    return rows;
  } finally {
    connection.release();
  }
};

/**
 * Find applicant by ID
 */
const findById = async (id) => {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query(
      "SELECT * FROM applicants WHERE id = ?",
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
};

/**
 * Create a new applicant
 */
const create = async (applicantData) => {
  const {
    firstName,
    lastName,
    email,
    gender,
    position,
    highestEducation
  } = applicantData;
  
  const connection = await db.getConnection();
  try {
    const [result] = await connection.query(
      "INSERT INTO applicants (first_name, last_name, email, gender, position, highest_education, status, applied_date) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
      [firstName, lastName, email, gender, position, highestEducation, "Pending"]
    );
    return { id: result.insertId, ...applicantData };
  } finally {
    connection.release();
  }
};

/**
 * Update an applicant
 */
const update = async (id, applicantData) => {
  const {
    firstName,
    lastName,
    email,
    gender,
    position,
    highestEducation,
    status
  } = applicantData;
  
  const connection = await db.getConnection();
  try {
    const [result] = await connection.query(
      "UPDATE applicants SET first_name = ?, last_name = ?, email = ?, gender = ?, position = ?, highest_education = ?, status = ? WHERE id = ?",
      [firstName, lastName, email, gender, position, highestEducation, status || "Pending", id]
    );
    return result.affectedRows > 0 ? { id, ...applicantData } : null;
  } finally {
    connection.release();
  }
};

/**
 * Update applicant status
 */
const updateStatus = async (id, status) => {
  const connection = await db.getConnection();
  try {
    const [result] = await connection.query(
      "UPDATE applicants SET status = ? WHERE id = ?",
      [status, id]
    );
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
};

/**
 * Delete an applicant and related records
 */
const remove = async (id) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // Delete related feedback
    await connection.query("DELETE FROM feedback WHERE applicant_id = ?", [id]);
    
    // Delete related interviews
    await connection.query("DELETE FROM interviews WHERE applicant_id = ?", [id]);
    
    // Delete the applicant
    const [result] = await connection.query("DELETE FROM applicants WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return false;
    }
    
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Submit a complete application
 */
const submitApplication = async (applicationData) => {
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
  } = applicationData;

  const connection = await db.getConnection();
  try {
    const [result] = await connection.query(
      `INSERT INTO applicants (
        email, first_name, last_name, gender, other_gender, age, 
        marital_status, other_marital_status, highest_education, other_highest_education,
        region, province, city, barangay, street_address,
        position, other_position, branch_department, other_branch_department,
        date_availability, other_date_availability, desired_pay,
        job_post_source, other_job_source, previously_employed,
        resume_filename, resume_originalname, resume_path,
        house_sketch_filename, house_sketch_originalname, house_sketch_path,
        status, applied_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        email, firstName, lastName, gender, otherGender, age,
        maritalStatus, otherMaritalStatus, highestEducation, otherHighestEducation,
        region, province, city, barangay, streetAddress,
        positionApplyingFor, otherPosition, branchDepartment, otherBranchDepartment,
        dateAvailability, otherDateAvailability, desiredPay,
        jobPostSource, otherJobSource, previouslyEmployed,
        resumeFile?.filename, resumeFile?.originalname, resumeFile?.path,
        houseSketchFile?.filename, houseSketchFile?.originalname, houseSketchFile?.path,
        "Pending"
      ]
    );
    
    return { id: result.insertId, ...applicationData };
  } finally {
    connection.release();
  }
};

/**
 * Get applicant statistics for dashboard
 */
const getStats = async () => {
  const connection = await db.getConnection();
  try {
    // Get count by status
    const [statusCounts] = await connection.query(
      "SELECT status, COUNT(*) as count FROM applicants GROUP BY status"
    );
    
    // Get total count
    const [totalResult] = await connection.query(
      "SELECT COUNT(*) as total FROM applicants"
    );
    
    // Get recent applicants
    const [recentApplicants] = await connection.query(
      "SELECT id, first_name, last_name, position, status, applied_date FROM applicants ORDER BY applied_date DESC LIMIT 5"
    );
    
    return {
      statusCounts,
      total: totalResult[0].total,
      recentApplicants
    };
  } finally {
    connection.release();
  }
};

/**
 * Get feedback for an applicant
 */
const getFeedback = async (applicantId) => {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query(
      "SELECT * FROM feedback WHERE applicant_id = ? ORDER BY created_at DESC",
      [applicantId]
    );
    return rows;
  } finally {
    connection.release();
  }
};

/**
 * Add feedback for an applicant
 */
const addFeedback = async (applicantId, feedbackData) => {
  const { feedback_text, created_by } = feedbackData;
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // Add feedback
    const [result] = await connection.query(
      "INSERT INTO feedback (applicant_id, feedback_text, created_by, created_at) VALUES (?, ?, ?, NOW())",
      [applicantId, feedback_text, created_by || "HR Team"]
    );
    
    // Update applicant status to "Reviewed" if not already past that stage
    const [applicants] = await connection.query(
      "SELECT status FROM applicants WHERE id = ?",
      [applicantId]
    );
    
    if (applicants.length > 0 && applicants[0].status === "Pending") {
      await connection.query(
        "UPDATE applicants SET status = 'Reviewed' WHERE id = ?",
        [applicantId]
      );
    }
    
    await connection.commit();
    return { id: result.insertId, ...feedbackData };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  updateStatus,
  remove,
  submitApplication,
  getStats,
  getFeedback,
  addFeedback
}; 