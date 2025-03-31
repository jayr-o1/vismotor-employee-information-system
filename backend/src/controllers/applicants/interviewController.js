const pool = require("../../configs/database");

const scheduleInterview = async (req, res) => {
  try {
    const { applicant_id, interview_date, interview_time, location, interviewer } = req.body;

    if (!applicant_id || !interview_date || !interview_time || !location || !interviewer) {
      return res.status(400).json({ message: "All interview details are required" });
    }

    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert interview record
      const [result] = await connection.query(
        "INSERT INTO interviews (applicant_id, interview_date, interview_time, location, interviewer) VALUES (?, ?, ?, ?, ?)",
        [applicant_id, interview_date, interview_time, location, interviewer]
      );

      // Update applicant status
      await connection.query(
        "UPDATE applicants SET status = 'Scheduled' WHERE id = ?",
        [applicant_id]
      );

      await connection.commit();

      res.status(201).json({
        id: result.insertId,
        applicant_id,
        interview_date,
        interview_time,
        location,
        interviewer,
        status: 'Scheduled',
        created_at: new Date()
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error scheduling interview:", error);
    res.status(500).json({ message: "Error scheduling interview" });
  }
};

const getInterviews = async (req, res) => {
  try {
    const { id } = req.params;
    const [interviews] = await pool.query(
      "SELECT * FROM interviews WHERE applicant_id = ? ORDER BY interview_date DESC",
      [id]
    );
    res.json(interviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({ message: "Error fetching interviews" });
  }
};

const updateInterviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid interview status" });
    }

    const [result] = await pool.query(
      "UPDATE interviews SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json({ message: "Interview status updated successfully" });
  } catch (error) {
    console.error("Error updating interview status:", error);
    res.status(500).json({ message: "Error updating interview status" });
  }
};

module.exports = {
  scheduleInterview,
  getInterviews,
  updateInterviewStatus
}; 