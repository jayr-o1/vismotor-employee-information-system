import React, { useState, useEffect, useContext } from "react";
import { FaSearch, FaUserCircle, FaUpload, FaEnvelope, FaIdCard, FaEdit, FaCamera } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import apiService from "../services/api";
import { ThemeContext } from "../ThemeContext";

const StaffDirectory = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadingFor, setUploadingFor] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: ""
  });
  
  // Fetch staff on component mount
  useEffect(() => {
    fetchStaff();
  }, []);
  
  // Fetch staff from API
  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.users.getAll();
      setStaff(response.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setError(`Failed to fetch staff: ${error.response?.data?.message || error.message}`);
      toast.error(`Failed to fetch staff: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Filter staff based on search term
  const filteredStaff = staff.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Open edit staff modal
  const handleEditStaff = (member) => {
    setCurrentStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role
    });
    setEditModalOpen(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Update staff member
  const handleUpdateStaff = async () => {
    try {
      await apiService.users.update(currentStaff.id, formData);
      
      // If a new profile picture is selected, upload it after updating the user data
      if (selectedFile) {
        await handleUpload(currentStaff.id);
      }
      
      // Update the local state
      setStaff(staff.map(member => 
        member.id === currentStaff.id ? { ...member, ...formData } : member
      ));
      
      setEditModalOpen(false);
      setSelectedFile(null);
      toast.success("Staff member updated successfully!");
    } catch (error) {
      console.error("Error updating staff:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to update staff member. Please try again.");
    }
  };
  
  // Handle profile picture upload
  const handleUpload = async (userId) => {
    if (!selectedFile) {
      toast.warning("Please select a file first");
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', selectedFile);
      
      const response = await apiService.users.uploadProfilePicture(userId, formData);
      
      // Update staff list with new profile picture
      setStaff(prevStaff => 
        prevStaff.map(member => 
          member.id === userId 
            ? { ...member, profile_picture: response.data.profile_picture } 
            : member
        )
      );
      
      toast.success("Profile picture uploaded successfully");
      setUploadingFor(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error(error.response?.data?.message || "Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };
  
  const getProfilePictureUrl = (filename) => {
    if (!filename) return null;
    return `${import.meta.env.VITE_API_URL || ''}/api/profile-pictures/${filename}`;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center">
        <h2 className={`text-2xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          {error}
        </h2>
        <div className="flex justify-center space-x-3 mt-4">
          <button
            onClick={fetchStaff}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Try Again
          </button>
          {error.includes("Authentication") && (
            <button 
              onClick={() => {
                localStorage.removeItem("userToken");
                localStorage.removeItem("user");
                window.location.href = "/login";
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Login Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Employee Directory</h1>
          <div className="relative">
            <input
              type="text"
              className={`pl-10 pr-4 py-2 ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Search staff..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <div className="absolute left-3 top-2.5">
              <FaSearch className={isDark ? 'text-gray-400' : 'text-gray-500'} />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map(member => (
            <div 
              key={member.id}
              className={`${isDark ? 'bg-[#232f46] border border-slate-700' : 'bg-white border border-gray-200'} rounded-xl shadow-md overflow-hidden`}
            >
              <div className="p-6">
                <div className="flex flex-col items-center mb-4">
                  {/* Profile Picture */}
                  <div className="relative mb-3">
                    {member.profile_picture ? (
                      <img 
                        src={getProfilePictureUrl(member.profile_picture)} 
                        alt={member.name} 
                        className="w-24 h-24 rounded-full object-cover border-2 border-green-500"
                      />
                    ) : (
                      <FaUserCircle className="w-24 h-24 text-gray-400" />
                    )}
                    
                    {/* Upload button */}
                    <button 
                      onClick={() => setUploadingFor(member.id)} 
                      className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                      title="Upload profile picture"
                    >
                      <FaUpload size={14} />
                    </button>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-center">{member.name}</h2>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center`}>{member.role}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaEnvelope className={`mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <a 
                      href={`mailto:${member.email}`} 
                      className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                    >
                      {member.email}
                    </a>
                  </div>
                  
                  <div className="flex items-center">
                    <FaIdCard className={`mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>ID: {member.id}</span>
                  </div>

                  {/* Edit button */}
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleEditStaff(member)}
                      className={`px-3 py-1 rounded-lg ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white flex items-center`}
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>
                  </div>
                </div>
                
                {/* Upload form */}
                {uploadingFor === member.id && (
                  <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h3 className="font-medium mb-2">Upload Profile Picture</h3>
                    <div className="flex">
                      <input 
                        type="file" 
                        onChange={handleFileChange}
                        accept="image/*"
                        className={`flex-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      />
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setUploadingFor(null)}
                          className={`px-3 py-1 rounded ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'} hover:opacity-90`}
                          disabled={uploading}
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleUpload(member.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          disabled={uploading || !selectedFile}
                        >
                          {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {filteredStaff.length === 0 && (
          <div className={`${isDark ? 'bg-[#232f46] border border-slate-700 text-gray-300' : 'bg-white border border-gray-200 text-gray-600'} rounded-xl shadow-md p-10 text-center`}>
            <p className="text-xl font-semibold mb-2">No staff found</p>
            <p>Try a different search term or check back later.</p>
          </div>
        )}
      </div>

      {/* Edit Staff Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className={`${isDark ? 'bg-[#1c2537]' : 'bg-white'} rounded-xl shadow-xl p-6 max-w-md w-full`}>
            <h2 className="text-2xl font-semibold mb-6">Edit Staff Member</h2>

            <div className="flex justify-center mb-6">
              <div className="relative">
                {currentStaff?.profile_picture ? (
                  <img 
                    src={getProfilePictureUrl(currentStaff.profile_picture)} 
                    alt={currentStaff.name} 
                    className="w-32 h-32 rounded-full object-cover border-2 border-green-500"
                  />
                ) : (
                  <FaUserCircle className="w-32 h-32 text-gray-400" />
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Attach profile image (optional)</label>
              <input 
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="block w-full text-sm"
              />
            </div>

            {selectedFile && (
              <div className="mb-4">
                <span className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  New profile picture selected: {selectedFile.name}
                </span>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              
              <div>
                <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              
              <div>
                <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                  <option value="hr">HR</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-8 space-x-3">
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedFile(null);
                }}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStaff}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StaffDirectory; 