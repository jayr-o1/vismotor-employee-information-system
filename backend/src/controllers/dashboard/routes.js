const express = require('express');
const router = express.Router();
const db = require('../../configs/database');

// Get dashboard statistics
router.get("/api/dashboard", async (req, res) => {
  try {
    const connection = await db.getConnection();
    
    let totalApplicants = 0;
    let totalEmployees = 0;
    let totalOnboarding = 0;
    let recentApplicants = [];
    
    try {
      // Get total applicants count
      const [applicantsResult] = await connection.query(
        "SELECT COUNT(*) as total FROM applicants"
      );
      totalApplicants = applicantsResult[0].total || 0;
      console.log("Total applicants:", totalApplicants);
      
      // Get total employees count
      const [employeesResult] = await connection.query(
        "SELECT COUNT(*) as total FROM employees"
      );
      totalEmployees = employeesResult[0].total || 0;
      console.log("Total employees:", totalEmployees);
      
      // Check if onboarding_checklists table exists
      try {
        const [checklistTableExists] = await connection.query(
          "SHOW TABLES LIKE 'onboarding_checklists'"
        );
        
        if (checklistTableExists.length > 0) {
          // Get total onboarding count (employees with incomplete checklist items)
          const [onboardingResult] = await connection.query(`
            SELECT COUNT(DISTINCT employee_id) as total 
            FROM onboarding_checklists 
            WHERE is_completed = FALSE
          `);
          totalOnboarding = onboardingResult[0].total || 0;
          console.log("Total onboarding:", totalOnboarding);
        } else {
          console.log("onboarding_checklists table does not exist");
        }
      } catch (err) {
        console.error("Error checking onboarding:", err);
      }
      
      // Get recent applicants (with field detection)
      try {
        // First check a single applicant to determine fields
        const [sampleApplicant] = await connection.query("SELECT * FROM applicants LIMIT 1");
        
        if (sampleApplicant.length > 0) {
          const applicant = sampleApplicant[0];
          const fields = Object.keys(applicant);
          console.log("Applicant fields:", fields);
          
          // Determine correct fields to use
          const idField = fields.includes('id') ? 'id' : 'applicant_id';
          const nameFields = [];
          if (fields.includes('name')) nameFields.push('name');
          else if (fields.includes('first_name') && fields.includes('last_name')) {
            nameFields.push("CONCAT(first_name, ' ', last_name) AS name");
          } else {
            nameFields.push("'Unknown' AS name");
          }
          
          const positionField = fields.includes('position') ? 'position' : "'Not specified' AS position";
          const statusField = fields.includes('status') ? 'status' : "'Pending' AS status";
          const dateField = fields.includes('applied_date') ? 'applied_date' : 
                           (fields.includes('created_at') ? 'created_at' : 'NOW()');
          
          // Build query based on detected fields
          const query = `
            SELECT ${idField} AS id, ${nameFields.join(', ')}, ${positionField}, ${statusField}
            FROM applicants
            ORDER BY ${dateField} DESC
            LIMIT 5
          `;
          
          const [result] = await connection.query(query);
          recentApplicants = result;
          console.log("Recent applicants query:", query);
          console.log("Recent applicants count:", recentApplicants.length);
        }
      } catch (err) {
        console.error("Error getting recent applicants:", err);
      }
      
    } catch (err) {
      console.error("Error getting dashboard stats:", err);
    }
    
    connection.release();
    
    // Return dashboard data
    res.json({
      totalApplicants,
      totalEmployees,
      totalOnboarding,
      recentApplicants
    });
    
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
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