const db = require("../database");

/**
 * Get all applicants
 */
const findAll = async () => {
  try {
    const applicants = await db('applicants').orderBy('application_date', 'desc');
    return applicants;
  } catch (error) {
    console.error('Error finding all applicants:', error);
    throw error;
  }
};

/**
 * Find applicant by ID
 */
const findById = async (id) => {
  try {
    const applicant = await db('applicants').where({ id }).first();
    return applicant || null;
  } catch (error) {
    console.error('Error finding applicant by id:', error);
    throw error;
  }
};

/**
 * Create a new applicant
 */
const create = async (applicantData) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    position_applied,
    resume_path,
    expected_salary,
    status = 'new'
  } = applicantData;
  
  try {
    const [id] = await db('applicants').insert({
      first_name,
      last_name,
      email,
      phone,
      position_applied,
      resume_path,
      expected_salary,
      status,
      application_date: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    });
    
    return { id, ...applicantData };
  } catch (error) {
    console.error('Error creating applicant:', error);
    throw error;
  }
};

/**
 * Update an applicant
 */
const update = async (id, applicantData) => {
  try {
    const updated = await db('applicants')
      .where({ id })
      .update({
        ...applicantData,
        updated_at: new Date()
      });
      
    return updated > 0 ? { id, ...applicantData } : null;
  } catch (error) {
    console.error('Error updating applicant:', error);
    throw error;
  }
};

/**
 * Update applicant status
 */
const updateStatus = async (id, status) => {
  try {
    const updated = await db('applicants')
      .where({ id })
      .update({ 
        status,
        updated_at: new Date()
      });
      
    return updated > 0;
  } catch (error) {
    console.error('Error updating applicant status:', error);
    throw error;
  }
};

/**
 * Delete an applicant and related records
 */
const remove = async (id) => {
  try {
    // Using Knex transaction
    return await db.transaction(async trx => {
      // Delete related feedback
      await trx('feedback').where({ applicant_id: id }).del();
      
      // Delete related interviews
      await trx('interviews').where({ applicant_id: id }).del();
      
      // Delete the applicant
      const deleted = await trx('applicants').where({ id }).del();
      
      return deleted > 0;
    });
  } catch (error) {
    console.error('Error deleting applicant:', error);
    throw error;
  }
};

/**
 * Submit a complete application
 */
const submitApplication = async (applicationData) => {
  try {
    console.log("Received application data:", JSON.stringify(applicationData));
    
    // Map frontend field names to database field names with non-null defaults for required fields
    const dbData = {
      email: applicationData.email || '',
      first_name: applicationData.firstName || '',
      last_name: applicationData.lastName || '',
      phone: applicationData.phone || 'Not provided', // Required field in DB
      address: applicationData.completeAddress || null,
      resume_path: applicationData.resumeFile ? 
        (typeof applicationData.resumeFile === 'object' ? 
          JSON.stringify(applicationData.resumeFile) : applicationData.resumeFile) : null,
      position_applied: applicationData.positionApplyingFor === 'OTHER' 
        ? applicationData.otherPosition 
        : (applicationData.positionApplyingFor || 'General Application'), // Required field in DB
      expected_salary: applicationData.desiredPay || null,
      // Store additional fields in JSON format within the skills, education, and experience fields
      skills: JSON.stringify({
        gender: applicationData.gender === 'OTHER' ? applicationData.otherGender : applicationData.gender,
        marital_status: applicationData.maritalStatus === 'OTHER' ? applicationData.otherMaritalStatus : applicationData.maritalStatus,
        age: applicationData.age || null,
        job_post_source: applicationData.jobPostSource === 'Other' ? applicationData.otherJobSource : applicationData.jobPostSource,
        previously_employed: applicationData.previouslyEmployed || null,
        branch_department: applicationData.branchDepartment === 'Other' ? applicationData.otherBranchDepartment : applicationData.branchDepartment,
        date_availability: applicationData.dateAvailability === 'OTHER' ? applicationData.otherDateAvailability : applicationData.dateAvailability,
      }),
      education: applicationData.highestEducation === 'OTHER'
        ? applicationData.otherHighestEducation
        : applicationData.highestEducation || null,
      experience: JSON.stringify({
        house_sketch_path: applicationData.houseSketchFile || null
      }),
      status: 'pending', // Changed from 'new' to 'pending'
      application_date: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };

    console.log("Mapped database data:", JSON.stringify(dbData));
    
    // Validate required fields based on database schema
    if (!dbData.email || !dbData.first_name || !dbData.last_name) {
      throw new Error('Required fields (email, first_name, last_name) must be provided');
    }

    // Insert the properly mapped data
    const [id] = await db('applicants').insert(dbData);
    
    return { id, ...applicationData };
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
};

/**
 * Get applicant statistics for dashboard
 */
const getStats = async () => {
  try {
    // Get count by status
    const statusCounts = await db('applicants')
      .select('status')
      .count('* as count')
      .groupBy('status');
    
    // Get total count
    const [{ count: total }] = await db('applicants').count('* as count');
    
    // Get recent applicants
    const recentApplicants = await db('applicants')
      .select('id', 'first_name', 'last_name', 'position_applied', 'status', 'application_date')
      .orderBy('application_date', 'desc')
      .limit(5);
    
    return {
      statusCounts,
      total,
      recentApplicants
    };
  } catch (error) {
    console.error('Error getting applicant stats:', error);
    throw error;
  }
};

/**
 * Get all interviews
 */
const getAllInterviews = async () => {
  try {
    const interviews = await db('interviews')
      .join('applicants', 'interviews.applicant_id', 'applicants.id')
      .select(
        'interviews.*',
        db.raw('CONCAT(applicants.first_name, " ", applicants.last_name) as applicant_name'),
        'applicants.position_applied as applicant_position'
      )
      .orderBy('interviews.interview_date', 'desc');
      
    return interviews;
  } catch (error) {
    console.error('Error getting all interviews:', error);
    throw error;
  }
};

/**
 * Get interviews for a specific applicant
 */
const getApplicantInterviews = async (applicantId) => {
  try {
    const interviews = await db('interviews')
      .where({ applicant_id: applicantId })
      .orderBy('interview_date', 'desc');
      
    return interviews;
  } catch (error) {
    console.error('Error getting applicant interviews:', error);
    throw error;
  }
};

/**
 * Schedule an interview for an applicant
 */
const scheduleInterview = async (applicantId, interviewData) => {
  console.log("Backend received interview data:", interviewData);
  
  // Extract data with defaults for safety
  const {
    interview_date = new Date().toISOString().split('T')[0],
    type = 'in-person',
    location = 'Office',
    interviewer = 'HR Staff',
    notes = null
  } = interviewData;
  
  try {
    return await db.transaction(async trx => {
      // Add the interview
      const [interviewId] = await trx('interviews').insert({
        applicant_id: applicantId,
        interview_date: new Date(interview_date),
        type,
        location,
        interviewer,
        status: 'scheduled',
        notes,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      console.log("Interview scheduled, insert ID:", interviewId);
      
      // Update the applicant status if it's not already scheduled or higher
      await trx('applicants')
        .where({ id: applicantId })
        .whereIn('status', ['new', 'reviewed'])
        .update({ 
          status: 'scheduled',
          updated_at: new Date()
        });
      
      // Return the newly created interview
      const interview = await trx('interviews').where({ id: interviewId }).first();
      console.log("Returning scheduled interview:", interview);
      
      return interview;
    });
  } catch (error) {
    console.error("Error in scheduleInterview:", error);
    throw error;
  }
};

/**
 * Update interview status
 */
const updateInterviewStatus = async (interviewId, status, notes = null) => {
  try {
    return await db.transaction(async trx => {
      // Update the interview status
      const updated = await trx('interviews')
        .where({ id: interviewId })
        .update({ 
          status,
          notes,
          updated_at: new Date()
        });
      
      if (updated === 0) {
        return null;
      }
      
      // Get the applicant ID for the interview
      const interview = await trx('interviews')
        .select('applicant_id')
        .where({ id: interviewId })
        .first();
      
      if (interview) {
        // If interview is completed, update applicant status to 'interviewed'
        if (status === 'completed') {
          await trx('applicants')
            .where({ id: interview.applicant_id })
            .update({ 
              status: 'interviewed',
              updated_at: new Date()
            });
        }
      }
      
      // Return the updated interview
      return await trx('interviews').where({ id: interviewId }).first();
    });
  } catch (error) {
    console.error('Error updating interview status:', error);
    throw error;
  }
};

/**
 * Delete an interview
 */
const deleteInterview = async (interviewId) => {
  try {
    const deleted = await db('interviews').where({ id: interviewId }).del();
    return deleted > 0;
  } catch (error) {
    console.error('Error deleting interview:', error);
    throw error;
  }
};

/**
 * Send interview email
 */
const sendInterviewEmail = async (applicantId, interviewId, emailData) => {
  // This would typically connect to an email service
  // For now, just returning success
  return {
    success: true,
    applicantId,
    interviewId,
    emailSent: true
  };
};

/**
 * Convert applicant to employee
 */
const convertToEmployee = async (applicantId, employeeData) => {
  try {
    return await db.transaction(async trx => {
      // Get the applicant data
      const applicant = await trx('applicants')
        .where({ id: applicantId })
        .first();
      
      if (!applicant) {
        return null;
      }
      
      // Create employee record with data from applicant and provided employee data
      const [employeeId] = await trx('employees').insert({
        applicant_id: applicantId,
        first_name: applicant.first_name,
        last_name: applicant.last_name,
        email: applicant.email,
        phone: applicant.phone,
        address: applicant.address,
        position: employeeData.position,
        department: employeeData.department,
        hire_date: employeeData.hire_date,
        salary: employeeData.salary,
        mentor: employeeData.mentor || null,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // Update the applicant status to 'hired'
      await trx('applicants')
        .where({ id: applicantId })
        .update({ 
          status: 'hired',
          updated_at: new Date()
        });
      
      // Get the newly created employee
      const newEmployee = await trx('employees')
        .where({ id: employeeId })
        .first();
      
      return newEmployee;
    });
  } catch (error) {
    console.error('Error converting applicant to employee:', error);
    throw error;
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
  getAllInterviews,
  getApplicantInterviews,
  scheduleInterview,
  updateInterviewStatus,
  deleteInterview,
  sendInterviewEmail,
  convertToEmployee
}; 