import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeContext } from "../ThemeContext";
import apiService from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaArrowLeft, 
  FaLaptop, 
  FaFileAlt, 
  FaGraduationCap, 
  FaUserTie,
  FaTasks,
  FaCheckCircle,
  FaRegCircle,
  FaChevronDown,
  FaChevronUp,
  FaCheck,
  FaTimes
} from "react-icons/fa";

const OnboardingDetails = () => {
  const { id } = useParams();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('checklist');
  
  // Onboarding checklist items
  const [checklist, setChecklist] = useState({
    equipment: {
      title: "Equipment Setup",
      expanded: true,
      items: [
        { id: "laptop", label: "Laptop/Desktop Setup", completed: false },
        { id: "email", label: "Email Account", completed: false },
        { id: "access", label: "System Access", completed: false },
        { id: "phone", label: "Phone Setup", completed: false },
        { id: "software", label: "Required Software", completed: false }
      ]
    },
    documents: {
      title: "Documentation",
      expanded: true,
      items: [
        { id: "employee_form", label: "Employee Information Form", completed: false },
        { id: "tax_forms", label: "Tax Forms", completed: false },
        { id: "id_badge", label: "ID Badge", completed: false },
        { id: "benefits", label: "Benefits Enrollment", completed: false },
        { id: "handbook", label: "Employee Handbook", completed: false }
      ]
    },
    training: {
      title: "Training & Orientation",
      expanded: true,
      items: [
        { id: "orientation", label: "Company Orientation", completed: false },
        { id: "department", label: "Department Training", completed: false },
        { id: "safety", label: "Safety Procedures", completed: false },
        { id: "compliance", label: "Compliance Training", completed: false },
        { id: "job_specific", label: "Job-Specific Training", completed: false }
      ]
    },
    integration: {
      title: "Team Integration",
      expanded: true,
      items: [
        { id: "introduction", label: "Team Introduction", completed: false },
        { id: "mentor", label: "Mentor Assignment", completed: false },
        { id: "first_project", label: "First Project Assignment", completed: false },
        { id: "team_meeting", label: "First Team Meeting", completed: false }
      ]
    }
  });
  
  // Progress calculation
  const [progress, setProgress] = useState({
    equipment: 0,
    documents: 0,
    training: 0,
    integration: 0,
    overall: 0
  });

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  // Fetch employee details from the API
  const fetchEmployeeDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.employees.getById(id);
      
      if (!response || !response.data) {
        throw new Error("Employee data not found or API returned invalid response");
      }
      
      setEmployee(response.data);
      
      // Fetch onboarding progress
      try {
        const progressResponse = await apiService.employees.getOnboardingProgress(id);
        
        if (progressResponse && progressResponse.data) {
          const progressData = progressResponse.data;
          setProgress(progressData);
          
          // Update checklist items based on progress data
          if (progressData.checklistItems) {
            updateChecklistFromProgress(progressData.checklistItems);
          }
        }
      } catch (progressError) {
        console.error("Error fetching onboarding progress:", progressError);
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      setError("Failed to load employee details. Please try again later.");
      toast.error("Failed to load employee details");
    } finally {
      setLoading(false);
    }
  };

  // Update checklist based on progress data
  const updateChecklistFromProgress = (checklistItems) => {
    if (!checklistItems || !Array.isArray(checklistItems)) {
      console.error("Invalid checklist items format:", checklistItems);
      return;
    }
    
    const updatedChecklist = { ...checklist };
    
    checklistItems.forEach(item => {
      if (updatedChecklist[item.category]) {
        const foundItem = updatedChecklist[item.category].items.find(i => i.id === item.id);
        if (foundItem) {
          foundItem.completed = item.completed;
        }
      }
    });
    
    setChecklist(updatedChecklist);
  };

  // Toggle checklist item completion
  const handleToggleChecklistItem = async (category, itemId) => {
    // Create a deep copy of the checklist
    const updatedChecklist = JSON.parse(JSON.stringify(checklist));
    
    // Find and toggle the item
    const item = updatedChecklist[category].items.find(i => i.id === itemId);
    if (item) {
      item.completed = !item.completed;
      
      // Update the checklist state
      setChecklist(updatedChecklist);
      
      // Calculate new progress
      calculateProgress(updatedChecklist);
      
      // Update the backend
      try {
        await apiService.employees.updateOnboardingChecklist(id, {
          category,
          itemId,
          completed: item.completed
        });
        
        toast.success(`${item.label} marked as ${item.completed ? 'completed' : 'incomplete'}`);
      } catch (error) {
        console.error("Error updating checklist item:", error);
        toast.error("Failed to update checklist item");
        
        // Revert the change if the API call fails
        item.completed = !item.completed;
        setChecklist(updatedChecklist);
      }
    }
  };

  // Toggle category expansion
  const handleToggleCategory = (category) => {
    const updatedChecklist = { ...checklist };
    updatedChecklist[category].expanded = !updatedChecklist[category].expanded;
    setChecklist(updatedChecklist);
  };

  // Calculate progress percentages
  const calculateProgress = (checklistData) => {
    const newProgress = { ...progress };
    
    Object.keys(checklistData).forEach(category => {
      const items = checklistData[category].items;
      const completed = items.filter(item => item.completed).length;
      const total = items.length;
      
      newProgress[category] = total > 0 ? Math.round((completed / total) * 100) : 0;
    });
    
    // Calculate overall progress
    const totalItems = Object.values(checklistData).reduce((acc, category) => acc + category.items.length, 0);
    const totalCompleted = Object.values(checklistData).reduce((acc, category) => 
      acc + category.items.filter(item => item.completed).length, 0);
    
    newProgress.overall = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
    
    setProgress(newProgress);
  };

  // Function to determine status style based on completion status
  const getStatusStyle = (completed) => {
    if (completed) {
      return isDark 
        ? "bg-green-900/30 text-green-400" 
        : "bg-green-100 text-green-800";
    } else {
      return isDark 
        ? "bg-yellow-900/30 text-yellow-400" 
        : "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <div className={`${isDark ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'} p-4 rounded-lg`}>
          <p className="text-center">{error}</p>
          <div className="flex justify-center mt-4">
            <button
              onClick={fetchEmployeeDetails}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" />
      <div className={`w-full min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
        {/* Header section with back button */}
        <div className={`w-full ${isDark ? 'bg-[#1a2234] border-b border-slate-700' : 'bg-white border-b'} sticky top-0 z-10 shadow-sm`}>
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate('/onboarding')}
              className={`flex items-center ${
                isDark ? 'text-white hover:text-green-400' : 'text-gray-700 hover:text-green-600'
              } transition-colors duration-200`}
            >
              <FaArrowLeft className="mr-2" />
              <span>Back to Onboarding</span>
            </button>
            
            <div className="flex space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                progress.overall === 100 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {progress.overall === 100 ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto py-6 px-4">
          {/* Employee basic info */}
          <div className={`mb-6 p-6 rounded-xl shadow-lg ${isDark ? 'bg-[#1a2234] border border-slate-700' : 'bg-white'}`}>
            <h2 className="text-xl font-semibold mb-4">{employee?.name || 'Employee'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Position</p>
                <p className="font-medium">{employee?.position || 'N/A'}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Department</p>
                <p className="font-medium">{employee?.department || 'N/A'}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Hire Date</p>
                <p className="font-medium">
                  {employee?.hire_date 
                    ? new Date(employee.hire_date).toLocaleDateString() 
                    : 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Overall progress bar */}
            <div className="mt-6">
              <div className="flex justify-between mb-1">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Overall Progress</span>
                <span className="text-sm font-medium">{progress.overall}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${progress.overall}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-4 text-sm">
                <div className="flex items-center text-blue-500">
                  <FaLaptop className="mr-1" />
                  <span className="text-xs">Equipment: {progress.equipment}%</span>
                </div>
                <div className="flex items-center text-green-500">
                  <FaFileAlt className="mr-1" />
                  <span className="text-xs">Documents: {progress.documents}%</span>
                </div>
                <div className="flex items-center text-purple-500">
                  <FaGraduationCap className="mr-1" />
                  <span className="text-xs">Training: {progress.training}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Content */}
          <div className={`rounded-xl overflow-hidden shadow-lg ${isDark ? 'bg-[#1a2234] border border-slate-700' : 'bg-white'}`}>
            {/* Tab Navigation */}
            <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button 
                onClick={() => setActiveTab('checklist')}
                className={`px-4 py-3 text-sm font-medium flex items-center ${
                  activeTab === 'checklist' 
                    ? isDark 
                      ? 'text-blue-400 border-b-2 border-blue-400' 
                      : 'text-blue-600 border-b-2 border-blue-600'
                    : isDark 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaTasks className="mr-2" />
                Onboarding Checklist
              </button>
              <button 
                onClick={() => setActiveTab('details')}
                className={`px-4 py-3 text-sm font-medium flex items-center ${
                  activeTab === 'details' 
                    ? isDark 
                      ? 'text-blue-400 border-b-2 border-blue-400' 
                      : 'text-blue-600 border-b-2 border-blue-600'
                    : isDark 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaUserTie className="mr-2" />
                Employee Details
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'checklist' && (
                <div className="space-y-6">
                  {/* Table-based checklist */}
                  {Object.keys(checklist).map((category) => (
                    <div key={category} className="mb-6">
                      <div 
                        className={`flex justify-between items-center p-4 cursor-pointer ${
                          isDark ? 'bg-[#1a2234] hover:bg-[#232f46]' : 'bg-gray-50 hover:bg-gray-100'
                        } rounded-t-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                        onClick={() => handleToggleCategory(category)}
                      >
                        <div className="flex items-center">
                          {category === 'equipment' && <FaLaptop className="mr-3 text-blue-500" />}
                          {category === 'documents' && <FaFileAlt className="mr-3 text-green-500" />}
                          {category === 'training' && <FaGraduationCap className="mr-3 text-purple-500" />}
                          {category === 'integration' && <FaUserTie className="mr-3 text-orange-500" />}
                          <h3 className="font-medium">{checklist[category].title}</h3>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-3 text-sm">
                            {checklist[category].items.filter(item => item.completed).length} of {checklist[category].items.length}
                          </span>
                          {checklist[category].expanded ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                      </div>
                      
                      {checklist[category].expanded && (
                        <div className={`overflow-x-auto rounded-b-lg border-x border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            <thead className={isDark ? 'bg-slate-800' : 'bg-gray-50'}>
                              <tr>
                                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Task</th>
                                <th className={`px-6 py-3 text-center text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                                <th className={`px-6 py-3 text-right text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Action</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                              {checklist[category].items.map((item) => (
                                <tr 
                                  key={item.id} 
                                  className={isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'}
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div>
                                        <div className={`font-medium ${item.completed ? 'line-through' : ''} ${
                                          item.completed 
                                            ? isDark ? 'text-green-400' : 'text-green-700'
                                            : ''
                                        }`}>
                                          {item.label}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(item.completed)}`}>
                                      {item.completed ? 'Completed' : 'Pending'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                      onClick={() => handleToggleChecklistItem(category, item.id)}
                                      className={`${
                                        item.completed 
                                          ? isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-800/40' : 'bg-red-100 text-red-700 hover:bg-red-200' 
                                          : isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-800/40' : 'bg-green-100 text-green-700 hover:bg-green-200'
                                      } px-3 py-1 rounded-md inline-flex items-center`}
                                    >
                                      {item.completed ? (
                                        <>
                                          <FaTimes className="mr-1" />
                                          <span>Mark Incomplete</span>
                                        </>
                                      ) : (
                                        <>
                                          <FaCheck className="mr-1" />
                                          <span>Mark Complete</span>
                                        </>
                                      )}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-6">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Employee Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</h4>
                      <p className={`mt-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {employee?.name || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</h4>
                      <p className={`mt-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{employee?.email || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Phone</h4>
                      <p className={`mt-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {employee?.phone || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Position</h4>
                      <p className={`mt-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {employee?.position || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Department</h4>
                      <p className={`mt-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{employee?.department || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Hire Date</h4>
                      <p className={`mt-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {employee?.hire_date 
                          ? new Date(employee.hire_date).toLocaleDateString() 
                          : 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Salary</h4>
                      <p className={`mt-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {employee?.salary ? `$${employee.salary}` : 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</h4>
                      <p className={`mt-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {employee?.status || 'Active'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Mentor</h4>
                      <p className={`mt-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {employee?.mentor || 'Not Assigned'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingDetails; 