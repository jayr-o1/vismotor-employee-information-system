const db = require("../database");

/**
 * Get all employees
 */
const findAll = async () => {
  try {
    const employees = await db('employees').orderBy('hire_date', 'desc');
    return employees;
  } catch (error) {
    console.error('Error finding all employees:', error);
    throw error;
  }
};

/**
 * Find employee by ID
 */
const findById = async (id) => {
  try {
    const employee = await db('employees').where({ id }).first();
    return employee || null;
  } catch (error) {
    console.error('Error finding employee by id:', error);
    throw error;
  }
};

/**
 * Create a new employee
 */
const create = async (employeeData) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    position,
    department,
    hire_date,
    salary,
    status = 'active',
    applicant_id = null,
    profile_picture = null
  } = employeeData;
  
  try {
    // Generate employee ID
    const employee_id = `EMP${Date.now().toString().slice(-6)}`;
    
    const [id] = await db('employees').insert({
      employee_id,
      first_name,
      last_name,
      email,
      phone,
      position,
      department,
      hire_date,
      salary,
      status,
      applicant_id,
      profile_picture,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    return { id, employee_id, ...employeeData };
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
};

/**
 * Update an employee
 */
const update = async (id, employeeData) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    position,
    department,
    status,
    profile_picture,
    hire_date,
    salary
  } = employeeData;
  
  try {
    const updated = await db('employees')
      .where({ id })
      .update({
        first_name,
        last_name,
        email,
        phone,
        position,
        department,
        status,
        profile_picture,
        hire_date,
        salary,
        updated_at: new Date()
      });
      
    return updated > 0 ? { id, ...employeeData } : null;
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
};

/**
 * Update employee status
 */
const updateStatus = async (id, status) => {
  try {
    const updated = await db('employees')
      .where({ id })
      .update({ 
        status,
        updated_at: new Date()
      });
      
    return updated > 0;
  } catch (error) {
    console.error('Error updating employee status:', error);
    throw error;
  }
};

/**
 * Delete an employee
 */
const remove = async (id) => {
  try {
    return await db.transaction(async trx => {
      // Delete related data first
      await trx('employee_documents').where({ employee_id: id }).del();
      await trx('employee_equipment').where({ employee_id: id }).del();
      await trx('employee_training').where({ employee_id: id }).del();
      
      // Then delete the employee
      const deleted = await trx('employees').where({ id }).del();
      return deleted > 0;
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
};

/**
 * Upload profile picture
 */
const updateProfilePicture = async (id, pictureData) => {
  try {
    const updated = await db('employees')
      .where({ id })
      .update({ 
        profile_picture: pictureData.path,
        updated_at: new Date()
      });
      
    return updated > 0 ? { id, profile_picture: pictureData.path } : null;
  } catch (error) {
    console.error('Error updating employee profile picture:', error);
    throw error;
  }
};

/**
 * Get employee statistics for dashboard
 */
const getStats = async () => {
  try {
    // Get count by department
    const departmentCounts = await db('employees')
      .select('department')
      .count('* as count')
      .groupBy('department');
    
    // Get count by status
    const statusCounts = await db('employees')
      .select('status')
      .count('* as count')
      .groupBy('status');
    
    // Get total count
    const [{ count: total }] = await db('employees').count('* as count');
    
    // Get recent employees
    const recentEmployees = await db('employees')
      .select('id', 'first_name', 'last_name', 'position', 'department', 'hire_date')
      .orderBy('hire_date', 'desc')
      .limit(5);
    
    return {
      departmentCounts,
      statusCounts,
      total,
      recentEmployees
    };
  } catch (error) {
    console.error('Error getting employee stats:', error);
    throw error;
  }
};

/**
 * Get onboarding progress
 */
const getOnboardingProgress = async (id) => {
  try {
    // Get equipment progress
    const equipmentItems = await db('employee_equipment')
      .count('* as total')
      .where({ employee_id: id })
      .first();
    
    // Get document progress
    const documentItems = await db('employee_documents')
      .count('* as total')
      .where({ employee_id: id })
      .first();
    
    // Get training progress
    const trainingItems = await db('employee_training')
      .count('* as total')
      .where({ employee_id: id })
      .first();
    
    // Calculate overall progress (dummy calculation for now)
    const equipmentCount = equipmentItems.total || 0;
    const documentCount = documentItems.total || 0;
    const trainingCount = trainingItems.total || 0;
    
    // Fake integration items since we don't have a dedicated table
    const integrationCount = 2;
    
    // Calculate percentages (assuming targets)
    const equipmentPercentage = Math.min(Math.floor((equipmentCount / 3) * 100), 100);
    const documentsPercentage = Math.min(Math.floor((documentCount / 3) * 100), 100);
    const trainingPercentage = Math.min(Math.floor((trainingCount / 3) * 100), 100);
    const integrationPercentage = 50; // Hardcoded for now
    
    // Calculate overall
    const overall = Math.floor(
      (equipmentPercentage + documentsPercentage + trainingPercentage + integrationPercentage) / 4
    );
    
    // Get actual checklist items from tables
    const equipmentList = await db('employee_equipment')
      .where({ employee_id: id })
      .select('id', 'equipment_name as label', 'issue_date', 'condition')
      .orderBy('issue_date', 'desc');
      
    const documentList = await db('employee_documents')
      .where({ employee_id: id })
      .select('id', 'document_name as label', 'upload_date', 'document_type')
      .orderBy('upload_date', 'desc');
      
    const trainingList = await db('employee_training')
      .where({ employee_id: id })
      .select('id', 'training_name as label', 'status', 'start_date')
      .orderBy('start_date', 'desc');
    
    // Combine into a single list with formatted items
    const checklistItems = [
      ...equipmentList.map(item => ({
        id: `equipment_${item.id}`,
        label: item.label,
        completed: true,
        category: 'equipment',
        date: item.issue_date
      })),
      ...documentList.map(item => ({
        id: `document_${item.id}`,
        label: item.label,
        completed: true,
        category: 'documents',
        date: item.upload_date
      })),
      ...trainingList.map(item => ({
        id: `training_${item.id}`,
        label: item.label,
        completed: item.status === 'completed',
        category: 'training',
        date: item.start_date
      })),
      // Add default integration items
      { id: "introduction", label: "Team Introduction", completed: true, category: "integration" },
      { id: "mentor", label: "Mentor Assignment", completed: false, category: "integration" }
    ];
    
    return {
      equipment: equipmentPercentage,
      documents: documentsPercentage,
      training: trainingPercentage,
      integration: integrationPercentage,
      overall: overall,
      checklistItems
    };
  } catch (error) {
    console.error('Error getting onboarding progress:', error);
    // Return default values if there's an error
    return {
      equipment: 0,
      documents: 0,
      training: 0,
      integration: 0,
      overall: 0,
      checklistItems: []
    };
  }
};

/**
 * Update onboarding checklist item
 */
const updateOnboardingChecklist = async (employeeId, checklistData) => {
  const { category, itemId, completed } = checklistData;
  
  try {
    // Extract the real item ID from the formatted ID
    const parts = itemId.split('_');
    if (parts.length === 2) {
      const id = parseInt(parts[1]);
      
      if (category === 'equipment' && id) {
        await db('employee_equipment')
          .where({ id, employee_id: employeeId })
          .update({ 
            condition: completed ? 'Good' : 'Pending',
            updated_at: new Date()
          });
      } else if (category === 'documents' && id) {
        // For documents we don't really have a status field to update
        // But we could add notes or status if needed
      } else if (category === 'training' && id) {
        await db('employee_training')
          .where({ id, employee_id: employeeId })
          .update({ 
            status: completed ? 'completed' : 'in progress',
            updated_at: new Date()
          });
      }
    } else if (category === 'integration') {
      // Integration items are currently not stored in the database
      // We would need to add a table for these, for now just return success
    }
    
    return {
      updated: true,
      message: 'Checklist item updated successfully'
    };
  } catch (error) {
    console.error('Error updating checklist item:', error);
    return {
      updated: false,
      message: 'Failed to update checklist item'
    };
  }
};

/**
 * Get equipment
 */
const getEquipment = async (id) => {
  try {
    const equipment = await db('employee_equipment')
      .where({ employee_id: id })
      .select('*')
      .orderBy('issue_date', 'desc');
      
    return {
      employeeId: id,
      equipment
    };
  } catch (error) {
    console.error('Error getting employee equipment:', error);
    return {
      employeeId: id,
      equipment: []
    };
  }
};

/**
 * Save equipment
 */
const saveEquipment = async (id, equipmentData) => {
  try {
    if (equipmentData.id) {
      // Update existing equipment
      await db('employee_equipment')
        .where({ id: equipmentData.id, employee_id: id })
        .update({
          ...equipmentData,
          updated_at: new Date()
        });
        
      return {
        employeeId: id,
        equipment: equipmentData,
        updated: true
      };
    } else {
      // Add new equipment
      const [equipmentId] = await db('employee_equipment').insert({
        employee_id: id,
        equipment_type: equipmentData.equipment_type,
        equipment_name: equipmentData.equipment_name,
        serial_number: equipmentData.serial_number,
        condition: equipmentData.condition,
        issue_date: equipmentData.issue_date || new Date(),
        notes: equipmentData.notes,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      return {
        employeeId: id,
        equipment: { ...equipmentData, id: equipmentId },
        added: true
      };
    }
  } catch (error) {
    console.error('Error saving employee equipment:', error);
    throw error;
  }
};

/**
 * Get documents
 */
const getDocuments = async (id) => {
  try {
    const documents = await db('employee_documents')
      .where({ employee_id: id })
      .select('*')
      .orderBy('upload_date', 'desc');
      
    return {
      employeeId: id,
      documents
    };
  } catch (error) {
    console.error('Error getting employee documents:', error);
    return {
      employeeId: id,
      documents: []
    };
  }
};

/**
 * Save documents
 */
const saveDocuments = async (id, documentData) => {
  try {
    if (documentData.id) {
      // Update existing document
      await db('employee_documents')
        .where({ id: documentData.id, employee_id: id })
        .update({
          ...documentData,
          updated_at: new Date()
        });
        
      return {
        employeeId: id,
        document: documentData,
        updated: true
      };
    } else {
      // Add new document
      const [documentId] = await db('employee_documents').insert({
        employee_id: id,
        document_type: documentData.document_type,
        document_name: documentData.document_name,
        file_path: documentData.file_path,
        description: documentData.description,
        upload_date: documentData.upload_date || new Date(),
        expiry_date: documentData.expiry_date,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      return {
        employeeId: id,
        document: { ...documentData, id: documentId },
        added: true
      };
    }
  } catch (error) {
    console.error('Error saving employee document:', error);
    throw error;
  }
};

/**
 * Get training
 */
const getTraining = async (id) => {
  try {
    const training = await db('employee_training')
      .where({ employee_id: id })
      .select('*')
      .orderBy('start_date', 'desc');
      
    return {
      employeeId: id,
      training
    };
  } catch (error) {
    console.error('Error getting employee training:', error);
    return {
      employeeId: id,
      training: []
    };
  }
};

/**
 * Save training
 */
const saveTraining = async (id, trainingData) => {
  try {
    if (trainingData.id) {
      // Update existing training
      await db('employee_training')
        .where({ id: trainingData.id, employee_id: id })
        .update({
          ...trainingData,
          updated_at: new Date()
        });
        
      return {
        employeeId: id,
        training: trainingData,
        updated: true
      };
    } else {
      // Add new training
      const [trainingId] = await db('employee_training').insert({
        employee_id: id,
        training_name: trainingData.training_name,
        provider: trainingData.provider,
        start_date: trainingData.start_date || new Date(),
        end_date: trainingData.end_date,
        status: trainingData.status || 'scheduled',
        certificate_path: trainingData.certificate_path,
        description: trainingData.description,
        cost: trainingData.cost,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      return {
        employeeId: id,
        training: { ...trainingData, id: trainingId },
        added: true
      };
    }
  } catch (error) {
    console.error('Error saving employee training:', error);
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
  updateProfilePicture,
  getStats,
  getOnboardingProgress,
  updateOnboardingChecklist,
  getEquipment,
  saveEquipment,
  getDocuments,
  saveDocuments,
  getTraining,
  saveTraining
}; 