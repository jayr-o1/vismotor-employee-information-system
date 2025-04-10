const pool = require("../../configs/database");

const getNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const [notes] = await pool.query(
      "SELECT * FROM applicant_notes WHERE applicant_id = ? ORDER BY created_at DESC",
      [id]
    );
    res.json(notes);
  } catch (error) {
    console.error("Error fetching applicant notes:", error);
    res.status(500).json({ message: "Error fetching applicant notes" });
  }
};

const addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback_text, created_by } = req.body;

    if (!feedback_text || !created_by) {
      return res.status(400).json({ message: "Feedback text and creator are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO applicant_notes (applicant_id, feedback_text, created_by) VALUES (?, ?, ?)",
      [id, feedback_text, created_by]
    );

    res.status(201).json({
      id: result.insertId,
      applicant_id: id,
      feedback_text,
      created_by,
      created_at: new Date()
    });
  } catch (error) {
    console.error("Error adding applicant note:", error);
    res.status(500).json({ message: "Error adding applicant note" });
  }
};

module.exports = {
  getNotes,
  addNote
}; 