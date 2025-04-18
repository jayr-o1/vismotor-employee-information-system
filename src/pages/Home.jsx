import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Chart from 'chart.js/auto';
import { Link } from "react-router-dom";
import DashboardCard from "../components/Layouts/DashboardCard";
import DashboardTable from "../components/Layouts/DashboardTable";
import DashboardList from "../components/Layouts/DashboardList";
import Spinner from "../components/Layouts/Spinner";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import apiService from "../services/api";
import { ThemeContext } from "../ThemeContext";

// Define default data for when API call fails
const defaultTrendsData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  data: [12, 19, 15, 28, 22, 25, 27, 24, 30, 32, 35, 25]
};

// Sample data for mock API responses when backend is unavailable
const mockApiData = {
  monthlyTrends: [
    { month: 'Jan', count: 12 },
    { month: 'Feb', count: 19 },
    { month: 'Mar', count: 15 },
    { month: 'Apr', count: 28 },
    { month: 'May', count: 22 },
    { month: 'Jun', count: 25 },
    { month: 'Jul', count: 27 },
    { month: 'Aug', count: 24 },
    { month: 'Sep', count: 30 },
    { month: 'Oct', count: 32 },
    { month: 'Nov', count: 35 },
    { month: 'Dec', count: 25 }
  ],
  statusCounts: [
    { status: 'Pending', count: 45 },
    { status: 'Interviewed', count: 32 },
    { status: 'Hired', count: 18 },
    { status: 'Rejected', count: 27 }
  ]
};

// Function to simulate API response with delay
const mockFetch = (endpoint, delay = 800) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (endpoint.includes('applicant-trends')) {
        resolve({
          ok: true,
          json: () => Promise.resolve(mockApiData)
        });
      } else {
        resolve({
          ok: true,
          json: () => Promise.resolve({
            totalApplicants: 122,
            totalEmployees: 78,
            totalOnboarding: 12,
            recentApplicants: [
              { id: 1, name: 'John Doe', position: 'Software Engineer', status: 'Interview' },
              { id: 2, name: 'Jane Smith', position: 'UI/UX Designer', status: 'Shortlisted' },
              { id: 3, name: 'Robert Johnson', position: 'Project Manager', status: 'New' }
            ]
          })
        });
      }
    }, delay);
  });
};

const Home = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    applicants: 0,
    employees: 0,
    onboarding: 0,
    recentApplicants: []
  });
  const [trendsData, setTrendsData] = useState(defaultTrendsData);

  // Calculate statistics from the trends data
  const applicantStats = useMemo(() => {
    if (!trendsData.data || trendsData.data.length === 0) return { total: 0, highest: 0, average: 0, month: '' };
    
    const total = trendsData.data.reduce((sum, val) => sum + val, 0);
    const highest = Math.max(...trendsData.data);
    const highestIndex = trendsData.data.indexOf(highest);
    const month = trendsData.labels[highestIndex];
    const average = (total / trendsData.data.length).toFixed(1);
    
    return { total, highest, average, month };
  }, [trendsData]);

  // Function to fetch applicant trends from the backend
  const fetchTrendsData = useCallback(async () => {
    try {
      console.log('Fetching trends data...');
      setIsLoading(true);
      setIsRefreshing(true);
      
      let response;
      try {
        // Attempt to fetch from real API with a short timeout
        response = await Promise.race([
          fetch('http://localhost:8081/api/dashboard/applicant-trends', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 2000)
          )
        ]);
      } catch (connectionError) {
        console.log('Connection to backend failed, using mock data instead');
        // Use mock data if real API fails
        response = await mockFetch('http://localhost:8081/api/dashboard/applicant-trends');
        toast.info("Using demo data - backend server not available", {
          autoClose: 3000,
          position: "bottom-right"
        });
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response for trends data:', data);
      
      // Check if the expected property exists
      if (!data.monthlyTrends || !Array.isArray(data.monthlyTrends)) {
        console.error('Could not locate monthlyTrends array in API response', data);
        // Use default data instead of referencing undefined variable
        setTrendsData(defaultTrendsData);
        return;
      }
      
      // Process the monthlyTrends data for the chart
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const processedMonthlyTrends = data.monthlyTrends.map(item => {
        // If the month is already in 'YYYY-MM' format
        if (typeof item.month === 'string' && item.month.includes('-')) {
          const [year, monthNum] = item.month.split('-');
          const monthIndex = parseInt(monthNum, 10) - 1; // Convert 1-based to 0-based
          return {
            month: monthNames[monthIndex],
            count: item.count
          };
        }
        
        // If it's already in the expected format
        return item;
      });
      
      console.log('Processed monthly trends data:', processedMonthlyTrends);
      
      // Calculate totals for the statistics
      const totalApplicants = processedMonthlyTrends.reduce((sum, item) => sum + item.count, 0);
      const totalApril = processedMonthlyTrends.find(item => item.month === 'Apr')?.count || 0;
      
      console.log(`Total applicants: ${totalApplicants}, April total: ${totalApril}`);
      
      // Extract data properly for the chart
      const labels = processedMonthlyTrends.map(item => item.month);
      const counts = processedMonthlyTrends.map(item => item.count);
      
      setTrendsData({
        labels: labels,
        data: counts,
        statusCounts: data.statusCounts || []
      });
      
    } catch (error) {
      console.error('Error fetching trends data:', error);
      
      // Use default data as fallback
      setTrendsData(defaultTrendsData);
      toast.error("Error loading data. Using default values instead.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Function to fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);

    try {
      let statsResponse;
      
      try {
        // Try to get actual stats from the API
        statsResponse = await apiService.dashboard.getStats();
      } catch (error) {
        console.log('Error fetching from real API, using mock data');
        // If the real API fails, use our mock data
        const mockResponse = await mockFetch('/api/dashboard/stats');
        statsResponse = { data: await mockResponse.json() };
      }
      
      setStats({
        applicants: statsResponse.data.totalApplicants || 0,
        employees: statsResponse.data.totalEmployees || 0,
        onboarding: statsResponse.data.totalOnboarding || 0,
        recentApplicants: statsResponse.data.recentApplicants || []
      });

      // Fetch trends data
      await fetchTrendsData();
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      
      setStats({
        applicants: 0,
        employees: 0,
        onboarding: 0,
        recentApplicants: []
      });
      
      toast.error("Failed to load dashboard data. Please check your connection or contact support.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchTrendsData]);

  // Initial data fetch on component mount
  useEffect(() => {
    fetchDashboardData();

    // Cleanup function to destroy chart when component unmounts
    return () => {
      if (window.myChart) {
        window.myChart.destroy();
      }
    };
  }, [fetchDashboardData]);

  // Set up auto-refresh interval (every 30 seconds)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchTrendsData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [fetchTrendsData]);

  // Effect to update chart when trends data changes
  useEffect(() => {
    if (trendsData.labels && trendsData.labels.length > 0 && trendsData.data && trendsData.data.length > 0) {
      createChart();
    }
  }, [trendsData, theme]); // Re-create chart when theme changes or trends data updates

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
      
      // Only proceed if we have valid data
      if (!trendsData.labels || !trendsData.labels.length || !trendsData.data || !trendsData.data.length) {
        console.error('No valid chart data available');
        return;
      }
      
      // Use actual data from the API without fallbacks
      const chartData = {
        labels: trendsData.labels,
        datasets: [{
          label: 'Applicants',
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
            intersect: false,
          },
          scales: {
            y: {
              beginAtZero: true,
              border: {
                display: false
              },
              grid: {
                color: gridColor,
                drawBorder: false,
                lineWidth: 1
              },
              ticks: {
                color: textColor,
                font: {
                  size: 10
                },
                padding: 6,
                maxTicksLimit: 6,
                callback: function(value) {
                  return value % 1 === 0 ? value : '';  // Only show integer values
                }
              }
            },
            x: {
              border: {
                display: false
              },
              grid: {
                display: false,
                drawBorder: false
              },
              ticks: {
                color: textColor,
                font: {
                  size: 10
                },
                padding: 6,
                maxTicksLimit: window.innerWidth < 768 ? 6 : 12, // Show fewer labels on small screens
                callback: function(val, index) {
                  // On small screens, only show every other month
                  return window.innerWidth < 768 ? (index % 2 === 0 ? this.getLabelForValue(val) : '') : this.getLabelForValue(val);
                }
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: false
            },
            tooltip: {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)',
              titleColor: isDark ? '#fff' : '#0f6013',
              bodyColor: isDark ? '#e2e8f0' : '#333',
              titleFont: {
                size: 12,
                weight: 'bold'
              },
              bodyFont: {
                size: 11
              },
              borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#0f6013',
              borderWidth: 1,
              padding: 8,
              cornerRadius: 6,
              boxPadding: 4,
              displayColors: false,
              callbacks: {
                title: function(tooltipItems) {
                  return tooltipItems[0].label;
                },
                label: function(context) {
                  return `Applicants: ${context.raw}`;
                }
              }
            }
          },
          elements: {
            line: {
              tension: 0.3
            }
          },
          animation: {
            duration: 800,
            easing: 'easeOutQuad'
          },
          layout: {
            padding: {
              left: 10,
              right: 10,
              top: 15,
              bottom: 10
            }
          }
        }
      });
      
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  };

  // Render the analytics header with a refresh button
  const renderAnalyticsHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className={`text-lg sm:text-xl font-bold ${
          isDark ? 'text-white' : 'text-slate-800'
        }`}>Applicant Analytics</h2>
        <p className={`text-xs sm:text-sm ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>Number of applicants over the last 12 months</p>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => {
            // Prevent multiple clicks while refreshing
            if (!isRefreshing) {
              fetchTrendsData();
            }
          }} 
          disabled={isRefreshing}
          className={`p-1.5 rounded-md transition-all flex items-center ${
            isDark 
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          } ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <i className={`fas ${isRefreshing ? 'fa-spinner fa-spin' : 'fa-sync-alt'} w-4 h-4 mr-1`}></i>
          <span className="text-xs">Refresh</span>
        </button>
        <button className={`p-1.5 rounded-md transition-all ${
          isDark 
            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}>
          <i className="fas fa-download w-4 h-4"></i>
        </button>
      </div>
    </div>
  );

  // Filter tabs
  const renderTabContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="flex flex-col gap-6 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DashboardCard
                value={stats.employees}
                title="Total Employees"
                icon="fas fa-users"
                color="blue"
                trend={{
                  value: 3.6,
                  isUpward: true,
                }}
              />
              <DashboardCard
                value={stats.onboarding}
                title="Onboarding"
                icon="fas fa-clipboard-check"
                color="yellow"
                trend={{
                  value: 3.6,
                  isUpward: true,
                }}
              />
              <DashboardCard
                value={stats.applicants}
                title="Total Applicants"
                icon="fas fa-user-tie"
                color="red"
                trend={{
                  value: 3.6,
                  isUpward: true,
                }}
              />
            </div>

            {/* Link Click Analytics Section */}
            <div className={`rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out border ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-4 sm:p-6">
                {renderAnalyticsHeader()}

                {/* Link Click Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                  <div className={`p-3 rounded-lg border ${
                    isDark 
                      ? 'bg-emerald-900/20 border-emerald-800/30' 
                      : 'bg-emerald-50 border-emerald-100'
                  }`}>
                    <p className={`text-xs font-medium mb-1 ${
                      isDark ? 'text-emerald-400' : 'text-emerald-600'
                    }`}>Total Applicants</p>
                    <div className="flex justify-between items-center">
                      <p className={`text-lg font-bold ${
                        isDark ? 'text-white' : 'text-slate-800'
                      }`}>{applicantStats.total}</p>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded flex items-center ${
                        isDark 
                          ? 'bg-emerald-800/30 text-emerald-400' 
                          : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        <i className="fas fa-arrow-up w-3 h-3 mr-0.5"></i>12.4%
                      </span>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg border ${
                    isDark 
                      ? 'bg-blue-900/20 border-blue-800/30' 
                      : 'bg-blue-50 border-blue-100'
                  }`}>
                    <p className={`text-xs font-medium mb-1 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}>Highest Month</p>
                    <div className="flex justify-between items-center">
                      <p className={`text-lg font-bold ${
                        isDark ? 'text-white' : 'text-slate-800'
                      }`}>{applicantStats.highest}</p>
                      <span className={`text-xs ${
                        isDark ? 'text-blue-400' : 'text-blue-600'
                      }`}>{applicantStats.month}</span>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg border ${
                    isDark 
                      ? 'bg-purple-900/20 border-purple-800/30' 
                      : 'bg-purple-50 border-purple-100'
                  }`}>
                    <p className={`text-xs font-medium mb-1 ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`}>Average per Month</p>
                    <div className="flex justify-between items-center">
                      <p className={`text-lg font-bold ${
                        isDark ? 'text-white' : 'text-slate-800'
                      }`}>{applicantStats.average}</p>
                    </div>
                  </div>
                </div>

                {/* Chart Container */}
                <div className={`h-48 sm:h-56 md:h-64 w-full overflow-hidden px-4 pt-2 pb-4 ${
                  isDark ? 'bg-slate-800' : 'bg-white'
                }`}>
                  <canvas id="applicantChart" width="400" height="200"></canvas>
                </div>
              </div>
            </div>

            {/* Recent Applicants */}
            <div className={`rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out border ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className={`text-lg sm:text-xl font-bold ${
                      isDark ? 'text-white' : 'text-slate-800'
                    }`}>Recent Applicants</h2>
                    <p className={`text-xs sm:text-sm ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>Latest job applicants in the last 30 days</p>
                  </div>
                  <Link to="/applicants" className={`text-sm font-medium ${
                    isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
                  }`}>View All</Link>
                </div>
                <div className="overflow-x-auto">
                  <ul className="space-y-3">
                    {stats.recentApplicants.length > 0 ? (
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
                      <div className="text-center py-8">
                        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No recent applicants found</p>
                      </div>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <p>No content available for this tab.</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-2 rounded-lg transition-colors text-sm ${
              activeTab === 'dashboard' 
                ? 'bg-green-600 text-white' 
                : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <i className="fas fa-th-large mr-2"></i> Overview
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <Spinner />
        </div>
      ) : renderTabContent()}
    </div>
  );
};

export default Home;