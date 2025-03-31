import React, { useState } from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaHome, FaUsers, FaUserTie, FaChartBar, FaCogs, FaBook, FaCheck, FaUserPlus } from "react-icons/fa";
import FooterLogo from "../assets/vismotor-logo.jpg";

const Documentation = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Overview", icon: <FaHome /> },
    { id: "auth", title: "Authentication", icon: <FaUserPlus /> },
    { id: "employees", title: "Employees Management", icon: <FaUserTie /> },
    { id: "applicants", title: "Applicants Tracking", icon: <FaUsers /> },
    { id: "dashboard", title: "Dashboard & Reports", icon: <FaChartBar /> },
    { id: "api", title: "API Reference", icon: <FaBook /> },
    { id: "technical", title: "Technical Details", icon: <FaCogs /> }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Vismotor Employee Information System</h2>
            <p className="mb-4">
              The Vismotor Employee Information System is a comprehensive solution for managing employees, tracking applicants, and streamlining HR processes. 
              This documentation provides information about how to use the system and its various features.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Main Features</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Employee database management</li>
              <li>Applicant tracking and hiring workflow</li>
              <li>User authentication and role-based access control</li>
              <li>Interview scheduling and feedback</li>
              <li>Dashboard with key metrics and reports</li>
              <li>Email notifications for important events</li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">System Requirements</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Web browser: Chrome, Firefox, Safari, or Edge (latest versions)</li>
              <li>Internet connection</li>
              <li>User account with appropriate permissions</li>
            </ul>
          </div>
        );
      
      case "auth":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Authentication</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">Login</h3>
            <p className="mb-4">
              Users can log in to the system using their email address and password. The system provides a "Remember Me" option
              to save the email address for future logins.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Login Process:</h4>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Navigate to the login page at <code>/login</code></li>
                <li>Enter your email address and password</li>
                <li>Click the "Login" button</li>
                <li>If successful, you will be redirected to the Home Dashboard</li>
              </ol>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Registration</h3>
            <p className="mb-4">
              New users can create an account by providing their personal information.
              After registration, users need to verify their email before they can log in.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Signup Process:</h4>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Navigate to the signup page at <code>/signup</code></li>
                <li>Fill in your first name, last name, email, and password</li>
                <li>Confirm your password</li>
                <li>Click the "Sign Up" button</li>
                <li>Check your email for a verification link</li>
                <li>Click the verification link to activate your account</li>
              </ol>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Email Verification</h3>
            <p className="mb-4">
              To ensure the security of our system, all users must verify their email addresses before logging in.
              If you attempt to log in before verifying your email, you will be prompted to verify it first.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Resending Verification Email:</h4>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Attempt to log in with your email and password</li>
                <li>If your email is not verified, you will see a notification</li>
                <li>Click the "Resend verification email" button</li>
                <li>Check your inbox for the new verification link</li>
                <li>Click the verification link to activate your account</li>
                <li>Once verified, you can log in to the system</li>
              </ol>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Password Recovery</h3>
            <p className="mb-4">
              If you forget your password, you can reset it using the "Forgot Password" feature.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Password Reset Process:</h4>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Click "Forgot Password?" on the login page</li>
                <li>Enter your email address</li>
                <li>Check your email for a password reset link</li>
                <li>Click the link and set a new password</li>
              </ol>
            </div>
          </div>
        );
      
      case "employees":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Employees Management</h2>
            
            <p className="mb-4">
              The Employees Management section allows HR personnel to manage employee records, including personal information,
              employment history, and performance data.
            </p>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">Employee List</h3>
            <p className="mb-4">
              The employee list provides a paginated view of all employees in the system. You can search, filter, and sort
              employees based on various criteria.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Features:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Search employees by name, department, or position</li>
                <li>Filter by department, status, or hire date</li>
                <li>Sort by name, department, position, or hire date</li>
                <li>View detailed employee information</li>
                <li>Export employee data to CSV</li>
              </ul>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Adding a New Employee</h3>
            <p className="mb-4">
              HR personnel can add new employees to the system by filling out the employee form.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Required Information:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Personal information (name, contact details)</li>
                <li>Employment details (department, position, hire date)</li>
                <li>Compensation information</li>
                <li>Emergency contacts</li>
              </ul>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Editing Employee Information</h3>
            <p className="mb-4">
              Employee information can be updated as needed. All changes are logged for audit purposes.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Employee Onboarding</h3>
            <p className="mb-4">
              The system provides an onboarding workflow for new employees, which includes document requirements,
              training sessions, and equipment assignments.
            </p>
          </div>
        );
      
      case "applicants":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Applicants Tracking</h2>
            
            <p className="mb-4">
              The Applicants Tracking System (ATS) helps manage the recruitment process from application to hire.
            </p>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">Applicant Listing</h3>
            <p className="mb-4">
              View all applicants in the system with their current status in the hiring process.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Applicant Statuses:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><span className="text-blue-600 font-semibold">Pending</span> - New application, not yet reviewed</li>
                <li><span className="text-yellow-600 font-semibold">Reviewed</span> - Application has been reviewed</li>
                <li><span className="text-purple-600 font-semibold">Interview</span> - Applicant has been scheduled for an interview</li>
                <li><span className="text-green-600 font-semibold">Hired</span> - Applicant has been hired</li>
                <li><span className="text-red-600 font-semibold">Rejected</span> - Application has been rejected</li>
              </ul>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Adding New Applicants</h3>
            <p className="mb-4">
              HR personnel can manually add new applicants to the system or applicants can apply through the public job portal.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Required Information:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Personal information (name, contact details)</li>
                <li>Position applied for</li>
                <li>Education and work experience</li>
                <li>Skills and qualifications</li>
              </ul>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Interview Management</h3>
            <p className="mb-4">
              Schedule and manage interviews with applicants. Record feedback and evaluate candidates.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Interview Process:</h4>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Select an applicant and schedule an interview</li>
                <li>Assign interviewers and set location</li>
                <li>Conduct the interview</li>
                <li>Record feedback and evaluation</li>
                <li>Make hiring decision</li>
              </ol>
            </div>
          </div>
        );
      
      case "dashboard":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Dashboard & Reports</h2>
            
            <p className="mb-4">
              The Dashboard provides a visual overview of key metrics and statistics related to employees and recruitment.
            </p>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">Key Metrics</h3>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Available Metrics:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Total employee count by department</li>
                <li>New hires in the current month/quarter/year</li>
                <li>Employee turnover rate</li>
                <li>Open positions and applications received</li>
                <li>Interview schedule for the week</li>
              </ul>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Charts and Visualizations</h3>
            <p className="mb-4">
              The Dashboard includes various charts and visualizations to help understand the data at a glance.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Available Charts:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Employee distribution by department (pie chart)</li>
                <li>Applications received over time (line chart)</li>
                <li>Hiring trends (bar chart)</li>
                <li>Applicant source analysis (bar chart)</li>
              </ul>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Reports</h3>
            <p className="mb-4">
              Generate and export various reports for HR analysis and decision-making.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Available Reports:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Employee directory</li>
                <li>New hires report</li>
                <li>Applicant tracking report</li>
                <li>Interview schedule</li>
                <li>Department headcount report</li>
              </ul>
            </div>
          </div>
        );
      
      case "api":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">API Reference</h2>
            
            <p className="mb-4">
              The Vismotor Employee Information System provides a RESTful API for programmatic access to the system.
              This section documents the available endpoints and their usage.
            </p>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">Authentication Endpoints</h3>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">POST /api/login</h4>
              <p className="mb-2">Authenticates a user and returns a JWT token.</p>
              <p className="font-medium">Request Body:</p>
              <pre className="bg-gray-800 text-white p-2 rounded text-sm mb-2">
{`{
  "email": "user@example.com",
  "password": "securepassword"
}`}
              </pre>
              <p className="font-medium">Response:</p>
              <pre className="bg-gray-800 text-white p-2 rounded text-sm">
{`{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user"
  }
}`}
              </pre>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">POST /api/signup</h4>
              <p className="mb-2">Registers a new user.</p>
              <p className="font-medium">Request Body:</p>
              <pre className="bg-gray-800 text-white p-2 rounded text-sm mb-2">
{`{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "securepassword"
}`}
              </pre>
              <p className="font-medium">Response:</p>
              <pre className="bg-gray-800 text-white p-2 rounded text-sm">
{`{
  "message": "User registered successfully. Please check your email to verify your account.",
  "userId": 1
}`}
              </pre>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">POST /api/resend-verification</h4>
              <p className="mb-2">Resends a verification email to the user.</p>
              <p className="font-medium">Request Body:</p>
              <pre className="bg-gray-800 text-white p-2 rounded text-sm mb-2">
{`{
  "email": "user@example.com"
}`}
              </pre>
              <p className="font-medium">Response:</p>
              <pre className="bg-gray-800 text-white p-2 rounded text-sm">
{`{
  "message": "Verification email has been resent. Please check your inbox."
}`}
              </pre>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Employee Endpoints</h3>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">GET /api/employees</h4>
              <p className="mb-2">Retrieves a list of all employees.</p>
              <p className="font-medium">Response:</p>
              <pre className="bg-gray-800 text-white p-2 rounded text-sm">
{`[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@company.com",
    "position": "Software Developer",
    "department": "Engineering"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane.smith@company.com",
    "position": "Product Manager",
    "department": "Product"
  }
]`}
              </pre>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Applicant Endpoints</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">GET /api/applicants</h4>
              <p className="mb-2">Retrieves a list of all applicants.</p>
              <p className="font-medium">Response:</p>
              <pre className="bg-gray-800 text-white p-2 rounded text-sm">
{`[
  {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "position": "UX Designer",
    "status": "Interview",
    "applied_date": "2023-06-15T00:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Bob Williams",
    "email": "bob@example.com",
    "position": "Software Developer",
    "status": "Pending",
    "applied_date": "2023-06-20T00:00:00.000Z"
  }
]`}
              </pre>
            </div>
          </div>
        );
      
      case "technical":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Technical Details</h2>
            
            <p className="mb-4">
              This section provides technical information about the system architecture, technologies used, and implementation details.
            </p>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">System Architecture</h3>
            <p className="mb-4">
              The Vismotor Employee Information System follows a client-server architecture with a React frontend and Node.js backend.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Frontend:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>React 19.0.0</li>
                <li>React Router for navigation</li>
                <li>TailwindCSS for styling</li>
                <li>Axios for API requests</li>
                <li>Chart.js for data visualization</li>
                <li>React Icons for icons</li>
              </ul>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Backend:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Node.js with Express.js</li>
                <li>MySQL database</li>
                <li>JWT for authentication</li>
                <li>Bcrypt for password hashing</li>
                <li>Nodemailer for email notifications</li>
              </ul>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Database Schema</h3>
            <p className="mb-4">
              The system uses a MySQL database with the following main tables:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Main Tables:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>users</strong> - User accounts and authentication</li>
                <li><strong>employees</strong> - Employee information</li>
                <li><strong>applicants</strong> - Job applicant information</li>
                <li><strong>interviews</strong> - Interview schedules and details</li>
                <li><strong>feedback</strong> - Interview feedback and evaluation</li>
              </ul>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Security Measures</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Security Implementation:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Password hashing using bcrypt</li>
                <li>JWT-based authentication</li>
                <li>Email verification for new accounts</li>
                <li>HTTPS for secure communication</li>
                <li>Input validation and sanitization</li>
                <li>Role-based access control</li>
              </ul>
            </div>
          </div>
        );
      
      default:
        return <div>Select a section from the sidebar</div>;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto py-4 px-6">
            <h1 className="text-3xl font-bold text-gray-800">
              <FaBook className="inline-block mr-2 mb-1" />
              Vismotor Documentation
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-1/4">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4">Documentation Sections</h2>
                <nav>
                  <ul className="space-y-2">
                    {sections.map(section => (
                      <li key={section.id}>
                        <button
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                            activeSection === section.id 
                              ? "bg-orange-500 text-white"
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          <span className="mr-3">{section.icon}</span>
                          {section.title}
                          {activeSection === section.id && (
                            <FaCheck className="ml-auto" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="md:w-3/4">
              <div className="bg-white rounded-lg shadow p-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 md:py-6 bg-orange-500 flex flex-col md:flex-row items-center justify-between px-6 md:px-10 text-white">
        {/* Left - Logo & Address */}
        <div className="flex flex-col md:flex-row items-center md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <img
            src={FooterLogo}
            alt="Vismotor Logo"
            className="h-16 md:h-20 rounded-full shadow-lg"
          />
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1">
            <p className="text-sm">
              9W68+643, Carmel Drive cor, Gov. M. Cuenco Ave, Cebu City, Cebu
            </p>
            <p className="text-sm">
              contact@vismotor.com | +123 456 7890
            </p>
          </div>
        </div>

        {/* Center - Copyright */}
        <p className="text-md font-semibold text-center w-full md:w-auto my-4 md:my-0">
          &copy; {new Date().getFullYear()} Vismotor Employee Information System
        </p>

        {/* Right - Social Media & Links */}
        <div className="flex flex-col items-center md:items-end space-y-2">
          <div className="flex space-x-4">
            <a href="#" className="text-white hover:text-gray-200 transition">
              <FaFacebook size={20} />
            </a>
            <a href="#" className="text-white hover:text-gray-200 transition">
              <FaTwitter size={20} />
            </a>
            <a href="#" className="text-white hover:text-gray-200 transition">
              <FaInstagram size={20} />
            </a>
            <a href="#" className="text-white hover:text-gray-200 transition">
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Documentation; 