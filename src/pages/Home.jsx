import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { motion } from "framer-motion";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const Home = () => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const navigate = useNavigate();

  // New darkMode state with MutationObserver to update on class changes
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const employees = [
    { id: 1, name: 'James Smith', department: 'Cashier', branch: 'Talamban' },
    { id: 2, name: 'Sophia Lee', department: 'Marketing', branch: 'Mandaue' },
    { id: 3, name: 'John Doe', department: 'HR', branch: 'Headoffice' },
    { id: 4, name: 'Olivia Brown', department: 'Cashier', branch: 'Bogo' },
    { id: 5, name: 'Mason Johnson', department: 'Sales', branch: 'Talamban' },
    { id: 6, name: 'Emma Wilson', department: 'IT', branch: 'Mandaue' },
    { id: 7, name: 'Liam Martinez', department: 'Liaison', branch: 'Headoffice' },
    { id: 8, name: 'Noah Davis', department: 'CCA', branch: 'Bogo' },
    { id: 9, name: 'Ava Garcia', department: 'CNC', branch: 'Talamban' },
    { id: 10, name: 'Isabella Rodriguez', department: 'Accounting', branch: 'Mandaue' },
    { id: 11, name: 'Ethan Clark', department: 'Cashier', branch: 'Headoffice' },
    { id: 12, name: 'Mia Turner', department: 'Marketing', branch: 'Bogo' },
    { id: 13, name: 'Lucas Walker', department: 'HR', branch: 'Talamban' },
    { id: 14, name: 'Amelia Harris', department: 'Sales', branch: 'Mandaue' },
    { id: 15, name: 'Henry Young', department: 'IT', branch: 'Headoffice' },
    { id: 16, name: 'Charlotte King', department: 'Liaison', branch: 'Bogo' },
    { id: 17, name: 'Alexander Scott', department: 'CCA', branch: 'Talamban' },
    { id: 18, name: 'Grace Green', department: 'IT', branch: 'Mandaue' },
    { id: 19, name: 'Benjamin Adams', department: 'Accounting', branch: 'Headoffice' },
    { id: 20, name: 'Ella Baker', department: 'Cashier', branch: 'Bogo' },
    { id: 21, name: 'David Johnson', department: 'Sales', branch: 'Talamban' },
    { id: 22, name: 'Sophia Brown', department: 'Marketing', branch: 'Mandaue' },
    { id: 23, name: 'Michael White', department: 'HR', branch: 'Headoffice' },
    { id: 24, name: 'Emily Davis', department: 'Cashier', branch: 'Bogo' },
    { id: 25, name: 'Daniel Wilson', department: 'Sales', branch: 'Talamban' },
    { id: 26, name: 'Emma Moore', department: 'IT', branch: 'Mandaue' },
    { id: 27, name: 'James Taylor', department: 'Liaison', branch: 'Headoffice' },
    { id: 28, name: 'Olivia Anderson', department: 'CCA', branch: 'Bogo' },
    { id: 29, name: 'Liam Thomas', department: 'CNC', branch: 'Talamban' },
    { id: 30, name: 'Sophia Jackson', department: 'Accounting', branch: 'Mandaue' },
    { id: 31, name: 'John Harris', department: 'Cashier', branch: 'Headoffice' },
    { id: 32, name: 'Mia Martin', department: 'Marketing', branch: 'Bogo' },
    { id: 33, name: 'Lucas Thompson', department: 'HR', branch: 'Talamban' },
    { id: 34, name: 'Amelia Garcia', department: 'Sales', branch: 'Mandaue' },
    { id: 35, name: 'Henry Martinez', department: 'IT', branch: 'Headoffice' },
    { id: 36, name: 'Charlotte Robinson', department: 'Liaison', branch: 'Bogo' },
    { id: 37, name: 'Alexander Clark', department: 'CCA', branch: 'Talamban' },
    { id: 38, name: 'Grace Rodriguez', department: 'IT', branch: 'Mandaue' },
    { id: 39, name: 'Benjamin Lewis', department: 'Accounting', branch: 'Headoffice' },
    { id: 40, name: 'Ella Lee', department: 'Cashier', branch: 'Bogo' },
    { id: 41, name: 'David Walker', department: 'Sales', branch: 'Talamban' },
    { id: 42, name: 'Sophia Hall', department: 'Marketing', branch: 'Mandaue' },
    { id: 43, name: 'Michael Allen', department: 'HR', branch: 'Headoffice' },
    { id: 44, name: 'Emily Young', department: 'Cashier', branch: 'Bogo' },
    { id: 45, name: 'Daniel Hernandez', department: 'Sales', branch: 'Talamban' },
    { id: 46, name: 'Emma King', department: 'IT', branch: 'Mandaue' },
    { id: 47, name: 'James Wright', department: 'Liaison', branch: 'Headoffice' },
    { id: 48, name: 'Olivia Lopez', department: 'CCA', branch: 'Bogo' },
    { id: 49, name: 'Liam Hill', department: 'CNC', branch: 'Talamban' },
    { id: 50, name: 'Sophia Scott', department: 'Accounting', branch: 'Mandaue' },
  ];

  const branches = [...new Set(employees.map(employee => employee.branch))];

  const departmentColors = {
    Cashier: 'bg-green-600',
    Marketing: 'bg-yellow-600',
    HR: 'bg-purple-600',
    Sales: 'bg-blue-600',
    IT: 'bg-teal-600',
    Liaison: 'bg-orange-600',
    CCA: 'bg-red-600',
    CNC: 'bg-indigo-600',
    Accounting: 'bg-gray-600',
  };

  const filteredEmployees = selectedBranch
    ? employees.filter(employee => employee.branch === selectedBranch)
    : employees;

  const departmentCounts = filteredEmployees.reduce((acc, employee) => {
    acc[employee.department] = (acc[employee.department] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(departmentCounts),
    datasets: [
      {
        label: 'Number of Employees',
        data: Object.values(departmentCounts),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Employees per Department' },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuad',
    },
  };

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDay = daysOfWeek[currentDateTime.getDay()];

  return (
    <div className="relative p-4">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl font-bold mb-6 text-center"
      >
        Employee Dashboard
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-4 text-sm text-gray-600"
      >
        {currentDay}, {currentDateTime.toLocaleString()}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mb-4"
      >
        <label className="block mb-2">Select Branch:</label>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className={`p-2 border rounded w-48 ${
            darkMode
              ? "border-gray-500 bg-gray-700 text-white"
              : "border-gray-300 bg-white text-gray-900"
          }`}
        >
          <option value="">All Branches</option>
          {branches.map(branch => (
            <option key={branch} value={branch}>{branch}</option>
          ))}
        </select>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {Object.entries(departmentCounts).map(([department, count]) => (
          <motion.div
            key={department}
            className={`${departmentColors[department]} p-6 rounded-lg shadow-lg text-white`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <h2 className="text-xl font-semibold">{department}</h2>
            <p className="text-4xl font-bold">{count}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mb-10"
      >
        <Line data={data} options={options} />
      </motion.div>

      {/* Tooltip Message */}
      <motion.div
        id="dialog-message"
        className={`fixed bottom-10 right-24 bg-gray-50 dark:bg-gray-700 dark:text-white border-2 border-blue-200 text-sm rounded-lg p-3 shadow`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isTooltipVisible ? 1 : 0 }}
      >
        Click me to scan QR!
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => navigate("/scan-qr")}
        onMouseEnter={() => setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
        className="fixed bottom-8 right-8 bg-[#0f6013] text-white w-16 h-16 flex items-center justify-center space-x-2 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <i className="fas fa-qrcode text-3xl"></i>
      </motion.button>
    </div>
  );
};

export default Home;
