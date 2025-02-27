import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaUserCircle, FaCheck, FaTimes } from 'react-icons/fa';

const Settings = () => {
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
        // Handle save password logic here
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
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <ToastContainer />
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
            >
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-3xl font-semibold mb-6 text-center text-gray-800"
                >
                    Settings
                </motion.h1>

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

                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-4"
                >
                    <label className="block mb-2 text-gray-700">Change Username:</label>
                    <div className="flex items-center">
                        {isEditingUsername ? (
                            <>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={handleUsernameChange}
                                    placeholder="username"
                                    className="p-2 border border-gray-300 rounded flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                <span className="flex-grow p-2 border border-transparent rounded">{username || 'username'}</span>
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

                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-4"
                >
                    <label className="block mb-2 text-gray-700">Change Email:</label>
                    <div className="flex items-center">
                        {isEditingEmail ? (
                            <>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    placeholder="example@gmail.com"
                                    className="p-2 border border-gray-300 rounded flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                <span className="flex-grow p-2 border border-transparent rounded">{email || 'example@gmail.com'}</span>
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

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mb-4"
                >
                    <label className="block mb-2 text-gray-700">Change Password:</label>
                    <button
                        onClick={handleOpenPasswordModal}
                        className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg"
                    >
                        Change Password
                    </button>
                </motion.div>

                <motion.button
                    onClick={handleSaveChanges}
                    className="bg-green-500 text-white px-4 py-2 rounded w-full shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Save Changes
                </motion.button>
            </motion.div>

            {isPasswordModalOpen && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Change Password</h2>
                        <label className="block mb-2 text-gray-700">Current Password:</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="mb-4 p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <label className="block mb-2 text-gray-700">New Password:</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mb-4 p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <label className="block mb-2 text-gray-700">Confirm New Password:</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mb-4 p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleClosePasswordModal}
                                className="bg-gray-500 text-white px-4 py-2 rounded mr-2 shadow-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSavePassword}
                                className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {isProfileModalOpen && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Change Profile Picture</h2>
                        <input
                            type="file"
                            onChange={handleProfilePictureChange}
                            className="mb-4 p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleCloseProfileModal}
                                className="bg-gray-500 text-white px-4 py-2 rounded mr-2 shadow-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfilePicture}
                                className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg"
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