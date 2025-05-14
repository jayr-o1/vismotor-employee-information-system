const db = require("../config/database");

/**
 * Get all employees
 */
const findAll = async () => {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query(
      "SELECT * FROM employees ORDER BY hire_date DESC"
    );
    return rows;
  } finally {
    connection.release();
  }
};

/**
 * Find employee by ID
 */
const findById = async (id) => {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query(
      "SELECT * FROM employees WHERE id = ?",
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
};

/**
 * Create a new employee
 */
const create = async (employeeData) => {
  const {
    name,
    email,
    phone,
    position,
    department,
    hire_date,
    salary,
    status = 'Active',
    applicant_id = null,
    profile_picture = null
  } = employeeData;
  
  const connection = await db.getConnection();
  try {
    const [result] = await connection.query(
      "INSERT INTO employees (name, email, phone, position, department, hire_date, salary, status, applicant_id, profile_picture) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [name, email, phone, position, department, hire_date, salary, status, applicant_id, profile_picture]
    );
    return { id: result.insertId, ...employeeData };
  } finally {
    connection.release();
  }
};

/**
 * Update an employee
 */
const update = async (id, employeeData) => {
  const {
    name,
    email,
    phone,
    position,
    department,
    status,
    profile_picture,
    hire_date,
    salary
  } = employeeData;
  
  const connection = await db.getConnection();
  try {
    const [result] = await connection.query(
      "UPDATE employees SET name = ?, email = ?, phone = ?, position = ?, department = ?, status = ?, profile_picture = ?, hire_date = ?, salary = ? WHERE id = ?",
      [name, email, phone, position, department, status, profile_picture, hire_date, salary, id]
    );
    return result.affectedRows > 0 ? { id, ...employeeData } : null;
  } finally {
    connection.release();
  }
};

/**
 * Update employee status
 */
const updateStatus = async (id, status) => {
  const connection = await db.getConnection();
  try {
    const [result] = await connection.query(
      "UPDATE employees SET status = ? WHERE id = ?",
      [status, id]
    );
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
};

/**
 * Delete an employee
 */
const remove = async (id) => {
  const connection = await db.getConnection();
  try {
    const [result] = await connection.query(
      "DELETE FROM employees WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
};

/**
 * Upload profile picture
 */
const updateProfilePicture = async (id, pictureData) => {
  const connection = await db.getConnection();
  try {
    const [result] = await connection.query(
      "UPDATE employees SET profile_picture = ? WHERE id = ?",
      [pictureData.path, id]
    );
    return result.affectedRows > 0 ? { id, profile_picture: pictureData.path } : null;
  } finally {
    connection.release();
  }
};

/**
 * Get employee statistics for dashboard
 */
const getStats = async () => {
  const connection = await db.getConnection();
  try {
    // Get count by department
    const [departmentCounts] = await connection.query(
      "SELECT department, COUNT(*) as count FROM employees GROUP BY department"
    );
    
    // Get count by status
    const [statusCounts] = await connection.query(
      "SELECT status, COUNT(*) as count FROM employees GROUP BY status"
    );
    
    // Get total count
    const [totalResult] = await connection.query(
      "SELECT COUNT(*) as total FROM employees"
    );
    
    // Get recent employees
    const [recentEmployees] = await connection.query(
      "SELECT id, name, position, department, hire_date FROM employees ORDER BY hire_date DESC LIMIT 5"
    );
    
    return {
      departmentCounts,
      statusCounts,
      total: totalResult[0].total,
      recentEmployees
    };
  } finally {
    connection.release();
  }
};

/**
 * Get onboarding progress
 */
const getOnboardingProgress = async (id) => {
  // This would typically query a separate onboarding_progress table
  // For now, return a placeholder structure
  return {
    employeeId: id,
    steps: [
      { name: 'Documentation', completed: true },
      { name: 'Equipment Setup', completed: false },
      { name: 'Training', completed: false }
    ],
    overallProgress: 33
  };
};

/**
 * Get equipment
 */
const getEquipment = async (id) => {
  // This would typically query a separate employee_equipment table
  // For now, return a placeholder
  return {
    employeeId: id,
    equipment: []
  };
};

/**
 * Save equipment
 */
const saveEquipment = async (id, equipmentData) => {
  // This would typically update a separate employee_equipment table
  // For now, return the data that would be saved
  return {
    employeeId: id,
    equipment: equipmentData
  };
};

/**
 * Get documents
 */
const getDocuments = async (id) => {
  // This would typically query a separate employee_documents table
  // For now, return a placeholder
  return {
    employeeId: id,
    documents: []
  };
};

/**
 * Save documents
 */
const saveDocuments = async (id, documentsData) => {
  // This would typically update a separate employee_documents table
  // For now, return the data that would be saved
  return {
    employeeId: id,
    documents: documentsData
  };
};

/**
 * Get training
 */
const getTraining = async (id) => {
  // This would typically query a separate employee_training table
  // For now, return a placeholder
  return {
    employeeId: id,
    training: []
  };
};

/**
 * Save training
 */
const saveTraining = async (id, trainingData) => {
  // This would typically update a separate employee_training table
  // For now, return the data that would be saved
  return {
    employeeId: id,
    training: trainingData
  };
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  updateStatus,
  remove,
  updateProfilePicture,
  getStats,
  getOnboardingProgress,
  getEquipment,
  saveEquipment,
  getDocuments,
  saveDocuments,
  getTraining,
  saveTraining
}; 