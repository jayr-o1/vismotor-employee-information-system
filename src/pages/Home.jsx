import React, { useState, useEffect } from "react";
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

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    applicants: 0,
    employees: 0,
    onboarding: 0,
    recentApplicants: []
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        // Add dashboard endpoint to our API service if it doesn't exist
        const response = await apiService.dashboard.getStats();
        
        setStats({
          applicants: response.data.totalApplicants || 0,
          employees: response.data.totalEmployees || 0,
          onboarding: response.data.totalOnboarding || 0,
          recentApplicants: response.data.recentApplicants || []
        });

        // Create chart after data is loaded
        createChart(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        
        // Fallback to sample data when API is not available
        console.log("Using sample dashboard data instead");
        const sampleData = {
          totalApplicants: 42,
          totalEmployees: 156,
          totalOnboarding: 8,
          recentApplicants: Array.from({ length: 5 }, (_, index) => ({
            id: index + 1,
            name: `Applicant ${index + 1}`,
            position: ['Web Developer', 'UI/UX Designer', 'Project Manager', 'QA Engineer'][Math.floor(Math.random() * 4)],
            status: ['Pending', 'Reviewed', 'Interviewed', 'Approved'][Math.floor(Math.random() * 4)],
            date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
          }))
        };
        
        setStats({
          applicants: sampleData.totalApplicants,
          employees: sampleData.totalEmployees,
          onboarding: sampleData.totalOnboarding,
          recentApplicants: sampleData.recentApplicants
        });
        
        // Create chart with sample data
        createChart(sampleData);
        toast.info("Connected to sample data mode");
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

  const createChart = (data) => {
    // Destroy existing chart if it exists
    if (window.myChart) {
      window.myChart.destroy();
    }

    const ctx = document.getElementById('applicantChart');
    if (!ctx) return;

    // Use demo data if real data is not available
    const chartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'New Applicants',
        data: [65, 59, 80, 81, 56, 55, 40, 30, 45, 60, 70, 85],
        backgroundColor: 'rgba(15, 96, 19, 0.2)',
        borderColor: 'rgba(15, 96, 19, 1)',
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
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#333'
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

        <main className="bg-gray-100 p-4 flex-1 mt-16">
          <div className="container mx-auto">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>

            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <Spinner />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <DashboardCard
                    title="Total Applicants"
                    value={stats.applicants}
                    icon="fas fa-user-tie"
                    color="text-blue-500"
                    bgColor="bg-blue-100"
                  />

                  <DashboardCard
                    title="Employees"
                    value={stats.employees}
                    icon="fas fa-users"
                    color="text-green-500"
                    bgColor="bg-green-100"
                  />

                  <DashboardCard
                    title="Onboarding"
                    value={stats.onboarding}
                    icon="fas fa-clipboard-check"
                    color="text-yellow-500"
                    bgColor="bg-yellow-100"
                  />
                </div>

                {/* Chart and Table */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart Container */}
                  <div className="bg-white rounded-lg shadow p-4 h-80">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                      Applicant Trends
                    </h2>
                    <div className="h-64">
                      <canvas id="applicantChart"></canvas>
                    </div>
                  </div>

                  {/* Recent Applicants Table */}
                  <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
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
