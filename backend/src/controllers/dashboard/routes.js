const express = require('express');
const router = express.Router();
const db = require('../../configs/database');

// Get dashboard statistics
router.get("/api/dashboard", async (req, res) => {
  try {
    // Get database connection
    const connection = await db.getConnection();
    
    // Initialize counters
    let totalEmployees = 0;
    let totalApplicants = 0;
    let totalInterviews = 0;
    let totalOnboarding = 0; // This will remain 0 since onboarding is removed
    
    // Get employee count
    const [employeeResult] = await connection.query("SELECT COUNT(*) as total FROM employees");
    totalEmployees = employeeResult[0].total || 0;
    console.log("Total employees:", totalEmployees);
    
    // Get applicant count
    const [applicantResult] = await connection.query("SELECT COUNT(*) as total FROM applicants");
    totalApplicants = applicantResult[0].total || 0;
    console.log("Total applicants:", totalApplicants);
    
    // Get interview count
    const [interviewResult] = await connection.query("SELECT COUNT(*) as total FROM interviews");
    totalInterviews = interviewResult[0].total || 0;
    console.log("Total interviews:", totalInterviews);
    
    // Onboarding count removed - set to 0
    totalOnboarding = 0;
    
    // Release the connection
    connection.release();
    
    // Send response
    res.json({
      totalEmployees,
      totalApplicants,
      totalInterviews,
      totalOnboarding
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
});

// Get applicant trends data
router.get("/api/dashboard/applicant-trends", async (req, res) => {
  try {
    const connection = await db.getConnection();
    let monthlyResult = [];
    let statusResult = [];
    
    try {
      // First check a single applicant to determine fields
      const [sampleApplicant] = await connection.query("SELECT * FROM applicants LIMIT 1");
      
      if (sampleApplicant.length > 0) {
        const applicant = sampleApplicant[0];
        const fields = Object.keys(applicant);
        
        // Determine date field to use
        const dateField = fields.includes('applied_date') ? 'applied_date' : 
                        (fields.includes('created_at') ? 'created_at' : null);
        
        if (dateField) {
          // Get applicant counts by month for the current year
          const [monthly] = await connection.query(`
            SELECT 
              MONTH(${dateField}) as month,
              COUNT(*) as count
            FROM applicants
            WHERE YEAR(${dateField}) = YEAR(CURRENT_DATE())
            GROUP BY MONTH(${dateField})
            ORDER BY month ASC
          `);
          monthlyResult = monthly;
          
          // Get applicant counts by status
          if (fields.includes('status')) {
            const [status] = await connection.query(`
              SELECT 
                status,
                COUNT(*) as count
              FROM applicants
              GROUP BY status
              ORDER BY count DESC
            `);
            statusResult = status;
          }
        }
      }
    } catch (err) {
      console.error("Error getting applicant trends:", err);
    }
    
    connection.release();
    
    // Format data for chart.js
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = Array(12).fill(0);
    
    monthlyResult.forEach(item => {
      if (item.month > 0 && item.month <= 12) {
        monthlyData[item.month - 1] = item.count;
      }
    });
    
    // Return formatted data
    res.json({
      labels: months,
      data: monthlyData,
      statusCounts: statusResult
    });
    
  } catch (error) {
    console.error("Error fetching applicant trends:", error);
    res.status(500).json({ message: "Failed to fetch applicant trends" });
  }
});

module.exports = router; 