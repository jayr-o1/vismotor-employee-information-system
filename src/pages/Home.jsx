import React, { useState, useEffect, useContext } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Chart from 'chart.js/auto';
import Header from "../components/Layouts/Header";
import Sidebar from "../components/Layouts/Sidebar";
import DashboardCard from "../components/Layouts/DashboardCard";
import DashboardTable from "../components/Layouts/DashboardTable";
import Spinner from "../components/Layouts/Spinner";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import apiService from "../services/api";
import { ThemeContext } from "../ThemeContext";

const Home = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [isLoading, setIsLoading] = useState(false);
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

  // Effect to update chart when trends data changes
  useEffect(() => {
    if (trendsData.labels.length > 0) {
      createChart();
    }
  }, [trendsData, isDarkMode]); // Re-create chart when dark mode changes

  const createChart = () => {
    // Destroy existing chart if it exists
    if (window.myChart) {
      window.myChart.destroy();
    }

    const ctx = document.getElementById('applicantChart');
    if (!ctx) return;

    // Determine chart colors based on theme
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDarkMode ? '#fff' : '#333';

    // Use real data from the API
    const chartData = {
      labels: trendsData.labels,
      datasets: [{
        label: 'New Applicants',
        data: trendsData.data,
        backgroundColor: isDarkMode ? 'rgba(72, 187, 120, 0.2)' : 'rgba(15, 96, 19, 0.2)',
        borderColor: isDarkMode ? 'rgba(72, 187, 120, 1)' : 'rgba(15, 96, 19, 1)',
        borderWidth: 2,
        tension: 0.3
      }]
    };

    window.myChart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
          }
        }
      }
    });
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64">
        <Header />
        <ToastContainer position="top-right" />

        <main className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6 flex-1 mt-16 transition-colors duration-200`}>
          <div className="container mx-auto px-4">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-8`}>Dashboard</h1>

            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <Spinner />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  <DashboardCard
                    title="Total Applicants"
                    value={stats.applicants}
                    icon="fas fa-user-tie"
                    color="text-blue-500"
                    bgColor={isDarkMode ? "bg-blue-900" : "bg-blue-100"}
                  />

                  <DashboardCard
                    title="Employees"
                    value={stats.employees}
                    icon="fas fa-users"
                    color="text-green-500"
                    bgColor={isDarkMode ? "bg-green-900" : "bg-green-100"}
                  />

                  <DashboardCard
                    title="Onboarding"
                    value={stats.onboarding}
                    icon="fas fa-clipboard-check"
                    color="text-yellow-500"
                    bgColor={isDarkMode ? "bg-yellow-900" : "bg-yellow-100"}
                  />
                </div>

                {/* Chart and Table */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Chart Container */}
                  <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 h-96 transition-colors duration-200`}>
                    <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-6`}>
                      Applicant Trends
                    </h2>
                    <div className="h-72">
                      <canvas id="applicantChart"></canvas>
                    </div>
                  </div>

                  {/* Recent Applicants Table */}
                  <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 transition-colors duration-200`}>
                    <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-6`}>
                      Recent Applicants
                    </h2>
                    <DashboardTable data={stats.recentApplicants} />
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
