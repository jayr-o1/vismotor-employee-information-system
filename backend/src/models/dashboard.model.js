const db = require("../database");

/**
 * Get dashboard statistics
 */
const getStats = async () => {
  try {
    // Get employee stats
    const [{ count: totalEmployees }] = await db('employees').count('* as count');
    
    // Get applicant stats
    const [{ count: totalApplicants }] = await db('applicants').count('* as count');
    
    // Get pending applications
    const [{ count: pendingApplications }] = await db('applicants')
      .where({ status: 'new' })
      .count('* as count');
    
    // Get scheduled interviews
    const [{ count: scheduledInterviews }] = await db('interviews')
      .where({ status: 'scheduled' })
      .count('* as count');

    // Get recent applicants
    const recentApplicants = await db('applicants')
      .select('id', 'first_name', 'last_name', 'email', 'position_applied', 'status', 'application_date')
      .orderBy('application_date', 'desc')
      .limit(5);

    // Get application statuses
    const applicationStatuses = await db('applicants')
      .select('status')
      .count('* as count')
      .groupBy('status');
      
    // Get upcoming interviews
    const upcomingInterviews = await db('interviews')
      .join('applicants', 'interviews.applicant_id', 'applicants.id')
      .select(
        'interviews.id', 
        'interviews.interview_date', 
        'interviews.status as interview_status',
        'applicants.id as applicant_id',
        'applicants.first_name',
        'applicants.last_name',
        'applicants.position_applied'
      )
      .where('interviews.interview_date', '>=', new Date())
      .orderBy('interviews.interview_date', 'asc')
      .limit(5);

    return {
      totalEmployees,
      totalApplicants,
      pendingApplications,
      scheduledInterviews,
      recentApplicants,
      applicationStatuses,
      upcomingInterviews
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
};

/**
 * Get applicant trends for dashboard charts
 */
const getApplicantTrends = async () => {
  try {
    // Get monthly application counts for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrends = await db('applicants')
      .select(db.raw('YEAR(application_date) as year, MONTH(application_date) as month'))
      .count('* as count')
      .where('application_date', '>=', sixMonthsAgo)
      .groupByRaw('YEAR(application_date), MONTH(application_date)')
      .orderByRaw('YEAR(application_date), MONTH(application_date)');
    
    // Get application counts by position
    const positionTrends = await db('applicants')
      .select('position_applied')
      .count('* as count')
      .groupBy('position_applied')
      .orderBy('count', 'desc')
      .limit(5);
    
    // Get application counts by status
    const statusTrends = await db('applicants')
      .select('status')
      .count('* as count')
      .groupBy('status');
    
    return {
      monthlyTrends,
      positionTrends,
      statusTrends
    };
  } catch (error) {
    console.error('Error getting applicant trends:', error);
    throw error;
  }
};

module.exports = {
  getStats,
  getApplicantTrends
}; 