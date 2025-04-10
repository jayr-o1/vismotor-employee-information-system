const pool = require('../../configs/database');

const getStats = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Get total applicants
      const [applicantCount] = await connection.query('SELECT COUNT(*) as total FROM applicants');
      
      // Get total employees
      const [employeeCount] = await connection.query('SELECT COUNT(*) as total FROM employees');
      
      // Get total users
      const [userCount] = await connection.query('SELECT COUNT(*) as total FROM users');
      
      // Get recent applicants
      const [recentApplicants] = await connection.query(
        'SELECT * FROM applicants ORDER BY applied_date DESC LIMIT 5'
      );
      
      res.json({
        stats: {
          totalApplicants: applicantCount[0].total,
          totalEmployees: employeeCount[0].total,
          totalUsers: userCount[0].total
        },
        recentApplicants
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
};

const getApplicantTrends = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Get applicants by status
      const [statusCounts] = await connection.query(
        'SELECT status, COUNT(*) as count FROM applicants GROUP BY status'
      );
      
      // Get applicants by month for the last 6 months
      const [monthlyTrends] = await connection.query(
        `SELECT 
          DATE_FORMAT(applied_date, '%Y-%m') as month,
          COUNT(*) as count
        FROM applicants
        WHERE applied_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(applied_date, '%Y-%m')
        ORDER BY month ASC`
      );
      
      res.json({
        statusCounts,
        monthlyTrends
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching applicant trends:', error);
    res.status(500).json({ message: 'Failed to fetch applicant trends' });
  }
};

module.exports = {
  getStats,
  getApplicantTrends
}; 