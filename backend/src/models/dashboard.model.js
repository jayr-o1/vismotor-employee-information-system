const db = require("../config/database");

/**
 * Get dashboard statistics
 */
const getStats = async () => {
  const connection = await db.getConnection();
  try {
    // Get applicant statistics
    const [applicantStats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Reviewed' THEN 1 ELSE 0 END) as reviewed,
        SUM(CASE WHEN status = 'Interviewed' THEN 1 ELSE 0 END) as interviewed,
        SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
      FROM applicants
    `);

    // Get employee statistics
    const [employeeStats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'On Leave' THEN 1 ELSE 0 END) as onLeave,
        SUM(CASE WHEN status = 'Terminated' THEN 1 ELSE 0 END) as \`terminated\`
      FROM employees
    `);

    // Get recent applicants
    const [recentApplicants] = await connection.query(`
      SELECT id, first_name, last_name, position, status, applied_date
      FROM applicants
      ORDER BY applied_date DESC
      LIMIT 5
    `);

    // Get recent employees
    const [recentEmployees] = await connection.query(`
      SELECT id, name, position, department, hire_date
      FROM employees
      ORDER BY hire_date DESC
      LIMIT 5
    `);

    // Get onboarding count
    const [onboardingCount] = await connection.query(`
      SELECT COUNT(*) as count
      FROM employees
      WHERE DATE(hire_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);

    return {
      applicants: {
        total: applicantStats[0].total || 0,
        pending: applicantStats[0].pending || 0,
        reviewed: applicantStats[0].reviewed || 0,
        interviewed: applicantStats[0].interviewed || 0,
        accepted: applicantStats[0].accepted || 0,
        rejected: applicantStats[0].rejected || 0
      },
      employees: {
        total: employeeStats[0].total || 0,
        active: employeeStats[0].active || 0,
        onLeave: employeeStats[0].onLeave || 0,
        terminated: employeeStats[0].terminated || 0
      },
      recentApplicants: recentApplicants,
      recentEmployees: recentEmployees,
      totalOnboarding: onboardingCount[0].count || 0
    };
  } catch (error) {
    console.error("Error in dashboard getStats:", error);
    // Return default values if there's an error
    return {
      applicants: {
        total: 0,
        pending: 0,
        reviewed: 0,
        interviewed: 0,
        accepted: 0,
        rejected: 0
      },
      employees: {
        total: 0,
        active: 0,
        onLeave: 0,
        terminated: 0
      },
      recentApplicants: [],
      recentEmployees: [],
      totalOnboarding: 0
    };
  } finally {
    connection.release();
  }
};

/**
 * Get applicant trends by month
 */
const getApplicantTrends = async () => {
  const connection = await db.getConnection();
  try {
    // Get applicant counts by month for the past 12 months
    const [trendData] = await connection.query(`
      SELECT 
        DATE_FORMAT(applied_date, '%Y-%m') as month,
        COUNT(*) as count
      FROM applicants
      WHERE applied_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(applied_date, '%Y-%m')
      ORDER BY month ASC
    `);

    // If no data, return demo data
    if (trendData.length === 0) {
      // Generate last 12 months as labels
      const labels = [];
      const data = [];
      const currentDate = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() - i);
        const monthName = d.toLocaleString('default', { month: 'short' });
        labels.push(monthName);
        
        // Generate random data between 0 and 20
        data.push(Math.floor(Math.random() * 20));
      }
      
      return {
        labels,
        data,
        isDemo: true
      };
    }

    // Process the results to get arrays for labels and data
    const months = [];
    const counts = [];
    
    trendData.forEach(item => {
      // Convert YYYY-MM to abbreviated month name
      const [year, month] = item.month.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      months.push(monthName);
      counts.push(item.count);
    });

    return {
      labels: months,
      data: counts,
      isDemo: false
    };
  } catch (error) {
    console.error("Error in dashboard getApplicantTrends:", error);
    // Return default values if there's an error
    return {
      labels: [],
      data: [],
      isDemo: false
    };
  } finally {
    connection.release();
  }
};

module.exports = {
  getStats,
  getApplicantTrends
}; 