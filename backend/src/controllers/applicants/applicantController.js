const pool = require("../../configs/database");

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM applicants ORDER BY applied_date DESC");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ message: "Failed to fetch applicants" });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching applicant with ID:", id);
    
    // Get a connection from the pool
    const connection = await pool.getConnection();
    console.log("Database connection established");
    
    try {
      const [rows] = await connection.query("SELECT * FROM applicants WHERE id = ?", [id]);
      console.log("Query executed, rows found:", rows.length);
      
      if (rows.length === 0) {
        console.log("No applicant found with ID:", id);
        return res.status(404).json({ message: "Applicant not found" });
      }
      
      console.log("Applicant data:", rows[0]);
      res.json(rows[0]);
    } finally {
      connection.release();
      console.log("Database connection released");
    }
  } catch (error) {
    console.error("Error in getById:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Failed to fetch applicant" });
  }
};

const create = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      position, 
      education, 
      experience, 
      skills 
    } = req.body;
    
    if (!name || !email || !position) {
      return res.status(400).json({ message: "Name, email and position are required" });
    }
    
    const [result] = await pool.query(
      "INSERT INTO applicants (name, email, phone, position, education, experience, skills, status, applied_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [name, email, phone, position, education, experience, skills, "Pending"]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      message: "Applicant added successfully" 
    });
  } catch (error) {
    console.error("Error adding applicant:", error);
    res.status(500).json({ message: "Failed to add applicant" });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      phone, 
      position, 
      education, 
      experience, 
      skills, 
      status 
    } = req.body;
    
    if (!name || !email || !position) {
      return res.status(400).json({ message: "Name, email and position are required" });
    }
    
    const [result] = await pool.query(
      "UPDATE applicants SET name = ?, email = ?, phone = ?, position = ?, education = ?, experience = ?, skills = ?, status = ? WHERE id = ?",
      [name, email, phone, position, education, experience, skills, status || "Pending", id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    res.json({ message: "Applicant updated successfully" });
  } catch (error) {
    console.error("Error updating applicant:", error);
    res.status(500).json({ message: "Failed to update applicant" });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    const [result] = await pool.query(
      "UPDATE applicants SET status = ? WHERE id = ?",
      [status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    res.json({ message: "Applicant status updated successfully" });
  } catch (error) {
    console.error("Error updating applicant status:", error);
    res.status(500).json({ message: "Failed to update applicant status" });
  }
};

const deleteApplicant = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Start a transaction to delete related records
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Delete related notes
      await connection.query("DELETE FROM applicant_notes WHERE applicant_id = ?", [id]);
      
      // Delete related interviews
      await connection.query("DELETE FROM interviews WHERE applicant_id = ?", [id]);
      
      // Delete the applicant
      const [result] = await connection.query("DELETE FROM applicants WHERE id = ?", [id]);
      
      if (result.affectedRows === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: "Applicant not found" });
      }
      
      await connection.commit();
      connection.release();
      
      res.json({ message: "Applicant and related records deleted successfully" });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error deleting applicant:", error);
    res.status(500).json({ message: "Failed to delete applicant" });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  updateStatus,
  delete: deleteApplicant
}; 