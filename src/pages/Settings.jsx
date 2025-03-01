import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaUserCircle, FaCheck, FaTimes } from 'react-icons/fa';
import { ThemeContext } from '../ThemeContext';  // Import ThemeContext

const Settings = () => {
    const { isDarkMode } = useContext(ThemeContext);  // Access the dark mode context
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleProfilePictureChange = (e) => {
        setProfilePicture(URL.createObjectURL(e.target.files[0]));
    };

    const handleSaveChanges = () => {
        toast.success('Changes saved');
    };

    const handleEditEmail = () => {
        setIsEditingEmail(true);
    };

    const handleSaveEmail = () => {
        setIsEditingEmail(false);
        toast.success('Email updated');
    };

    const handleCancelEditEmail = () => {
        setIsEditingEmail(false);
    };

    const handleEditUsername = () => {
        setIsEditingUsername(true);
    };

    const handleSaveUsername = () => {
        setIsEditingUsername(false);
        toast.success('Username updated');
    };

    const handleCancelEditUsername = () => {
        setIsEditingUsername(false);
    };

    const handleOpenPasswordModal = () => {
        setIsPasswordModalOpen(true);
    };

    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
        toast.info('Password change canceled');
    };

    const handleSavePassword = () => {
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setIsPasswordModalOpen(false);
        toast.success('Password changed successfully');
    };

    const handleOpenProfileModal = () => {
        setIsProfileModalOpen(true);
    };

    const handleCloseProfileModal = () => {
        setIsProfileModalOpen(false);
        toast.info('Profile picture change canceled');
    };

    const handleSaveProfilePicture = () => {
        setIsProfileModalOpen(false);
        toast.success('Profile picture changed successfully');
    };

    return (
        <div className={`flex justify-center items-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <ToastContainer />
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className={`p-8 rounded-lg shadow-lg w-full max-w-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
            >
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-3xl font-semibold mb-6 text-center"
                >
                    Settings
                </motion.h1>

                {/* Profile Picture Section */}
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex justify-center mb-6 relative"
                >
                    <div className="relative">
                        {profilePicture ? (
                            <img
                                src={profilePicture}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover border-4 border-gray-300"
                            />
                        ) : (
                            <FaUserCircle className="w-32 h-32 text-gray-400" />
                        )}
                        <button
                            onClick={handleOpenProfileModal}
                            className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-lg"
                        >
                            <FaEdit />
                        </button>
                    </div>
                </motion.div>

                {/* Username Section */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-4"
                >
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Change Username:</label>
                    <div className="flex items-center">
                        {isEditingUsername ? (
                            <>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={handleUsernameChange}
                                    placeholder="username"
                                    className={`p-2 border ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-300 bg-gray-100'} rounded flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                />
                                <button
                                    onClick={handleSaveUsername}
                                    className="ml-2 bg-green-500 text-white px-4 py-2 rounded shadow-lg"
                                >
                                    <FaCheck />
                                </button>
                                <button
                                    onClick={handleCancelEditUsername}
                                    className="ml-2 bg-red-500 text-white px-4 py-2 rounded shadow-lg"
                                >
                                    <FaTimes />
                                </button>
                            </>
                        ) : (
                            <>
                                <span className={`flex-grow p-2 border ${isDarkMode ? 'border-transparent text-gray-400' : 'border-transparent text-gray-800'} rounded`}>{username || 'username'}</span>
                                <button
                                    onClick={handleEditUsername}
                                    className="ml-2 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg"
                                >
                                    <FaEdit />
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Email Section */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-4"
                >
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Change Email:</label>
                    <div className="flex items-center">
                        {isEditingEmail ? (
                            <>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    placeholder="example@gmail.com"
                                    className={`p-2 border ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-300 bg-gray-100'} rounded flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                />
                                <button
                                    onClick={handleSaveEmail}
                                    className="ml-2 bg-green-500 text-white px-4 py-2 rounded shadow-lg"
                                >
                                    <FaCheck />
                                </button>
                                <button
                                    onClick={handleCancelEditEmail}
                                    className="ml-2 bg-red-500 text-white px-4 py-2 rounded shadow-lg"
                                >
                                    <FaTimes />
                                </button>
                            </>
                        ) : (
                            <>
                                <span className={`flex-grow p-2 border ${isDarkMode ? 'border-transparent text-gray-400' : 'border-transparent text-gray-800'} rounded`}>{email || 'example@gmail.com'}</span>
                                <button
                                    onClick={handleEditEmail}
                                    className="ml-2 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg"
                                >
                                    <FaEdit />
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Password Section */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mb-4"
                >
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Change Password:</label>
                    <button
                        onClick={handleOpenPasswordModal}
                        className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg"
                    >
                        Change Password
                    </button>
                </motion.div>

                {/* Save Changes Button */}
                <motion.button
                    onClick={handleSaveChanges}
                    className="bg-green-500 text-white px-4 py-2 rounded w-full shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Save Changes
                </motion.button>
            </motion.div>

            {/* Password modal */}
            {isPasswordModalOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50"
                >
                    <div className={`bg-white p-6 rounded-lg w-96 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                        <div className="mb-4">
                            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Current Password:</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className={`p-2 border ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-300 bg-gray-100'} rounded w-full`}
                            />
                        </div>
                        <div className="mb-4">
                            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>New Password:</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={`p-2 border ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-300 bg-gray-100'} rounded w-full`}
                            />
                        </div>
                        <div className="mb-4">
                            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm New Password:</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`p-2 border ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-300 bg-gray-100'} rounded w-full`}
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleClosePasswordModal}
                                className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSavePassword}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Profile picture modal */}
            {isProfileModalOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 flex items-center justify-center bg-opacity-50"
                >
                    <div className={`bg-white p-6 rounded-lg w-96 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                        <h2 className="text-xl font-semibold mb-4">Change Profile Picture</h2>
                        <input
                            type="file"
                            onChange={handleProfilePictureChange}
                            className="mb-4"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleCloseProfileModal}
                                className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfilePicture}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Settings;
