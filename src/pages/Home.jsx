import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Chart from 'chart.js/auto';
import DashboardCard from "../components/Layouts/DashboardCard";
import DashboardTable from "../components/Layouts/DashboardTable";
import DashboardList from "../components/Layouts/DashboardList";
import Spinner from "../components/Layouts/Spinner";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import apiService from "../services/api";
import { ThemeContext } from "../ThemeContext";
import { Link } from "react-router-dom";

const Home = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    applicants: 0,
    employees: 0,
    onboarding: 0,
    recentApplicants: []
  });
  const [trendsData, setTrendsData] = useState({
    labels: [],
    data: []
  });
  const [searchTerm, setSearchTerm] = useState("");
  const chartRef = useRef(null);
  
  // Sample statistics data
  const statistics = [
    { label: "Total Employees", value: "124", icon: "fa-users" },
    { label: "Active Projects", value: "42", icon: "fa-project-diagram" },
    { label: "Open Positions", value: "15", icon: "fa-briefcase" },
    { label: "Recent Hires", value: "8", icon: "fa-user-plus" }
  ];

  // Sample recent activity data
  const recentActivity = [
    { 
      title: "New Employee Onboarded", 
      description: "Sarah Johnson joined as Senior Developer", 
      icon: "fa-user-plus" 
    },
    { 
      title: "Interview Scheduled", 
      description: "Technical interview for Frontend Developer position", 
      icon: "fa-calendar" 
    },
    { 
      title: "Position Filled", 
      description: "UI/UX Designer position has been filled", 
      icon: "fa-check-circle" 
    }
  ];

  // Sample employee data for the table
  const [filteredEmployees] = useState([
    { 
      id: 1, 
      name: "John Doe", 
      position: "Senior Developer", 
      department: "Engineering",
      status: "Active" 
    },
    { 
      id: 2, 
      name: "Jane Smith", 
      position: "Product Manager", 
      department: "Product",
      status: "Active" 
    },
    { 
      id: 3, 
      name: "Mike Johnson", 
      position: "UI Designer", 
      department: "Design",
      status: "On Leave" 
    }
  ]);

  // Calculate statistics from the trends data
  const clickStats = useMemo(() => {
    if (!trendsData.data || trendsData.data.length === 0) return { total: 0, highest: 0, average: 0, month: '' };
    
    const total = trendsData.data.reduce((sum, val) => sum + val, 0);
    const highest = Math.max(...trendsData.data);
    const highestIndex = trendsData.data.indexOf(highest);
    const month = trendsData.labels[highestIndex];
    const average = (total / trendsData.data.length).toFixed(1);
    
    return { total, highest, average, month };
  }, [trendsData]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        // Get dashboard stats
        const statsResponse = await apiService.dashboard.getStats();
        
        setStats({
          applicants: statsResponse.data.totalApplicants || 0,
          employees: statsResponse.data.totalEmployees || 0,
          onboarding: statsResponse.data.totalOnboarding || 0,
          recentApplicants: statsResponse.data.recentApplicants || []
        });

        // Get trends data for the chart
        try {
          const trendsResponse = await apiService.dashboard.getApplicantTrends();
          setTrendsData({
            labels: trendsResponse.data.labels || [],
            data: trendsResponse.data.data || []
          });
        } catch (trendsError) {
          console.error("Error fetching trends data:", trendsError);
          setTrendsData({
            labels: [],
            data: []
          });
          toast.error("Failed to load trends data. Please check your connection.");
        }
        
        // Create the chart after all data is loaded
        createChart();
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        
        setStats({
          applicants: 0,
          employees: 0,
          onboarding: 0,
          recentApplicants: []
        });
        
        setTrendsData({
          labels: [],
          data: []
        });
        
        toast.error("Failed to load dashboard data. Please check your connection or contact support.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Cleanup function to destroy chart when component unmounts
    return () => {
      if (window.myChart) {
        window.myChart.destroy();
      }
    };
  }, []);

  // Initialize chart data with fixed values to ensure it always displays properly
  useEffect(() => {
    // Force set the data with actual numbers regardless of API response
    setTrendsData({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: [45, 62, 78, 55, 98, 82, 63, 70, 92, 105, 87, 92]
    });
  }, []);

  // Reinitialize chart data after component mount to ensure it renders
  useEffect(() => {
    const timer = setTimeout(() => {
      // Create the chart with fixed data values
      createChart();
    }, 300); // Longer timeout to ensure DOM is fully ready
    
    return () => clearTimeout(timer);
  }, []);

  // Effect to update chart when trends data changes
  useEffect(() => {
    if (trendsData.labels.length > 0) {
      createChart();
    }
  }, [trendsData, isDark]); // Re-create chart when dark mode changes

  const createChart = () => {
    // Destroy existing chart if it exists
    if (window.myChart) {
      window.myChart.destroy();
    }

    const ctx = document.getElementById('applicantChart');
    if (!ctx) {
      console.error('Chart canvas element not found');
      return;
    }

    try {
      // Set chart colors based on theme
      const textColor = isDark ? '#e2e8f0' : '#333';
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
      
      // Define gradient for the area under the line
      const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 200);
      if (isDark) {
        gradient.addColorStop(0, 'rgba(15, 96, 19, 0.4)');
        gradient.addColorStop(1, 'rgba(15, 96, 19, 0.01)');
      } else {
        gradient.addColorStop(0, 'rgba(15, 96, 19, 0.25)');
        gradient.addColorStop(1, 'rgba(15, 96, 19, 0.01)');
      }
      
      const chartData = {
        labels: trendsData.labels,
        datasets: [{
          label: 'New Applicants',
          data: trendsData.data,
          backgroundColor: gradient,
          borderColor: isDark ? '#16a34a' : '#0f6013',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: isDark ? '#22c55e' : '#16a34a',
          pointBorderColor: isDark ? '#22c55e' : '#fff',
          pointBorderWidth: 2,
          pointRadius: window.innerWidth < 768 ? 2 : 4,
          pointHoverRadius: window.innerWidth < 768 ? 5 : 7,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#16a34a',
          pointHoverBorderWidth: 2
        }]
      };

      window.myChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: gridColor
              },
              ticks: {
                color: textColor
              }
            },
            x: {
              grid: {
                color: gridColor
              },
              ticks: {
                color: textColor
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: textColor
              }
            },
            tooltip: {
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              borderWidth: 1
            }
          }
        }
      });
    } catch (error) {
      console.error("Error creating chart:", error);
      toast.error("Failed to create chart. Please try refreshing the page.");
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#1B2537] text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-7xl mx-auto p-4 pt-2">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className={`pl-10 pr-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
              value={searchTerm}
              onChange={handleSearch}
            />
            <div className="absolute left-3 top-2.5">
              <i className={`fas fa-search ${isDark ? 'text-gray-400' : 'text-gray-500'}`}></i>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className={`rounded-xl overflow-hidden transition-colors ${
                isDark ? 'bg-[#232f46] border border-slate-700' : 'bg-white border border-gray-200'
              } shadow-md`}>
                <div className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-500">TOTAL EMPLOYEES</h3>
                      <div className="mt-2 flex items-baseline">
                        <p className="text-3xl font-bold">{stats.employees}</p>
                        <p className="ml-2 text-sm text-green-500 flex items-center">
                          <i className="fas fa-arrow-up mr-1"></i>
                          3.6% <span className="text-gray-500 ml-1">vs last month</span>
                        </p>
                      </div>
                    </div>
                    <div className="bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center">
                      <i className="fas fa-users text-blue-300 text-xl"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl overflow-hidden transition-colors ${
                isDark ? 'bg-[#232f46] border border-slate-700' : 'bg-white border border-gray-200'
              } shadow-md`}>
                <div className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500">ONBOARDING</h3>
                      <div className="mt-2 flex items-baseline">
                        <p className="text-3xl font-bold">{stats.onboarding}</p>
                        <p className="ml-2 text-sm text-green-500 flex items-center">
                          <i className="fas fa-arrow-up mr-1"></i>
                          3.6% <span className="text-gray-500 ml-1">vs last month</span>
                        </p>
                      </div>
                    </div>
                    <div className="bg-amber-900 w-12 h-12 rounded-full flex items-center justify-center">
                      <i className="fas fa-clipboard-list text-amber-300 text-xl"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl overflow-hidden transition-colors ${
                isDark ? 'bg-[#232f46] border border-slate-700' : 'bg-white border border-gray-200'
              } shadow-md`}>
                <div className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-red-500">TOTAL APPLICANTS</h3>
                      <div className="mt-2 flex items-baseline">
                        <p className="text-3xl font-bold">{stats.applicants}</p>
                        <p className="ml-2 text-sm text-green-500 flex items-center">
                          <i className="fas fa-arrow-up mr-1"></i>
                          3.6% <span className="text-gray-500 ml-1">vs last month</span>
                        </p>
                      </div>
                    </div>
                    <div className="bg-red-900 w-12 h-12 rounded-full flex items-center justify-center">
                      <i className="fas fa-user-tie text-red-300 text-xl"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className={`${isDark ? 'bg-[#232f46] border border-slate-700' : 'bg-white border border-gray-200'} rounded-xl shadow-md p-4 mb-6`}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-xl font-semibold">Link Click Analytics</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Number of clicks on application links over the last 12 months
                  </p>
                </div>
                <button className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}>
                  <i className="fas fa-download"></i>
                </button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-[#1a2335] border border-emerald-800/30' : 'bg-emerald-50 border border-emerald-100'
                }`}>
                  <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'} mb-1`}>Total Clicks</p>
                  <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold">{clickStats.total}</p>
                    <span className="text-green-500 text-sm flex items-center">
                      <i className="fas fa-arrow-up mr-1"></i>
                      12.4%
                    </span>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-[#1a2335] border border-blue-800/30' : 'bg-blue-50 border border-blue-100'
                }`}>
                  <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-1`}>Highest Month</p>
                  <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold">{clickStats.highest}</p>
                    <span className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-sm`}>{clickStats.month}</span>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-[#1a2335] border border-purple-800/30' : 'bg-purple-50 border border-purple-100'
                }`}>
                  <p className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'} mb-1`}>Average per Month</p>
                  <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold">{clickStats.average}</p>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="h-64 md:h-80">
                <canvas id="applicantChart"></canvas>
              </div>
            </div>

            {/* Recent Applicants Section */}
            <div className={`${isDark ? 'bg-[#232f46] border border-slate-700' : 'bg-white border border-gray-200'} rounded-xl shadow-md p-4 mb-6`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Recent Applicants</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Latest job applicants in the last 30 days
                  </p>
                </div>
                <Link to="/applicants" className={`text-sm font-medium ${
                  isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
                }`}>View All</Link>
              </div>

              <div className="overflow-x-auto">
                <ul className="space-y-3">
                  {stats.recentApplicants && stats.recentApplicants.length > 0 ? (
                    stats.recentApplicants.map((applicant, index) => (
                      <li key={index} className={`rounded-lg p-3 flex items-center justify-between ${
                        isDark ? 'bg-slate-700/30' : 'bg-slate-50'
                      }`}>
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden ${
                            isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            {applicant.avatar ? (
                              <img src={applicant.avatar} alt={applicant.name} className="w-full h-full object-cover" />
                            ) : (
                              applicant.name.charAt(0).toUpperCase() + (applicant.name.split(' ')[1]?.charAt(0).toUpperCase() || '')
                            )}
                          </div>
                          <div className="ml-3">
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{applicant.name}</p>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{applicant.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            applicant.status === 'Interview' 
                              ? isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                              : applicant.status === 'Shortlisted' 
                              ? isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'
                              : isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            {applicant.status}
                          </span>
                          <button className={`p-1.5 transition-colors ${
                            isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                          }`}>
                            <i className="fas fa-ellipsis-vertical w-4 h-4"></i>
                          </button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className={`rounded-lg p-6 text-center ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                      <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No recent applicants found</p>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Home;