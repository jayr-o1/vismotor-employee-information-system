import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const Home = () => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const navigate = useNavigate();

  const employees = [
    { id: 1, name: 'James Smith', department: 'Cashier' },
    { id: 2, name: 'Sophia Lee', department: 'Marketing' },
    { id: 3, name: 'John Doe', department: 'HR' },
    { id: 4, name: 'Olivia Brown', department: 'Cashier' },
    { id: 5, name: 'Mason Johnson', department: 'Sales' },
    { id: 6, name: 'Emma Wilson', department: 'IT' },
    { id: 7, name: 'Liam Martinez', department: 'Liaison' },
    { id: 8, name: 'Noah Davis', department: 'CCA' },
    { id: 9, name: 'Ava Garcia', department: 'CNC' },
    { id: 10, name: 'Isabella Rodriguez', department: 'Accounting' },
    { id: 11, name: 'Ethan Clark', department: 'Cashier' },
    { id: 12, name: 'Mia Turner', department: 'Marketing' },
    { id: 13, name: 'Lucas Walker', department: 'HR' },
    { id: 14, name: 'Amelia Harris', department: 'Sales' },
    { id: 15, name: 'Henry Young', department: 'IT' },
    { id: 16, name: 'Charlotte King', department: 'Liaison' },
    { id: 17, name: 'Alexander Scott', department: 'CCA' },
    { id: 18, name: 'Grace Green', department: 'IT' },
    { id: 19, name: 'Benjamin Adams', department: 'Accounting' },
    { id: 20, name: 'Ella Baker', department: 'Cashier' },
  ];

  const departmentColors = {
    Cashier: 'bg-green-500',
    Marketing: 'bg-yellow-500',
    HR: 'bg-purple-500',
    Sales: 'bg-blue-500',
    IT: 'bg-teal-500',
    Liaison: 'bg-orange-500',
    CCA: 'bg-red-500',
    CNC: 'bg-indigo-500',
    Accounting: 'bg-gray-500',
  };

  const departmentCounts = employees.reduce((acc, employee) => {
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

  return (
    <div className="relative p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Employee Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {Object.entries(departmentCounts).map(([department, count]) => (
          <div key={department} className={`${departmentColors[department]} p-6 rounded-lg shadow-lg text-white transform transition-transform duration-500 hover:scale-105`}>
            <h2 className="text-xl font-semibold">{department}</h2>
            <p className="text-4xl font-bold">{count}</p>
          </div>
        ))}
      </div>

      <div className="mb-10">
        <Line data={data} options={options} />
      </div>

      {/* Tooltip Message */}
      <div
        id="dialog-message"
        className={`fixed bottom-10 right-24 bg-gray-50 dark:bg-gray-700 dark:text-white border-2 border-blue-200 text-sm rounded-lg p-3 shadow transition-opacity duration-300 ${
          isTooltipVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        Click me scan QR!
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate("/scan-qr")}
        onMouseEnter={() => setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
        className="fixed bottom-8 right-8 bg-[#0f6013] text-white w-16 h-16 flex items-center justify-center space-x-2 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform duration-500 hover:scale-110"
      >
        <i className="fas fa-qrcode text-3xl"></i>
      </button>
    </div>
  );
};

export default Home;
