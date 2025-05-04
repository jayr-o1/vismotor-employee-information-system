import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { confirmDelete, showSuccess, showError } from './SweetAlerts';
import { showToast } from './Alerts';
import apiService from '../services/api';

/**
 * Example component showing how to use SweetAlert for delete confirmations
 * 
 * @param {Object} props 
 * @param {string} props.id - ID of the item to delete
 * @param {string} props.name - Name of the item (displayed in confirmation)
 * @param {string} props.type - Type of item (e.g., 'applicant', 'employee')
 * @param {Function} props.onDeleted - Callback after successful deletion
 */
const DeleteButton = ({ id, name, type = 'item', onDeleted }) => {
  const handleDelete = async () => {
    // First confirm with the user using SweetAlert
    const confirmed = await confirmDelete(name || type);
    
    if (!confirmed) return;
    
    try {
      // Determine which API endpoint to use based on type
      let deleteResponse;
      
      switch (type.toLowerCase()) {
        case 'applicant':
          deleteResponse = await apiService.applicants.delete(id);
          break;
        case 'employee':
          deleteResponse = await apiService.employees.delete(id);
          break;
        case 'note':
          deleteResponse = await apiService.notes.delete(id);
          break;
        default:
          throw new Error('Unknown item type');
      }
      
      // Show success message with SweetAlert (for a prominent notification)
      showSuccess(
        'Deleted Successfully',
        `<p>The ${type} "${name}" has been deleted.</p>`
      );
      
      // Also show a toast notification (less intrusive, visible when navigating away)
      showToast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      
      // Call the callback function if provided
      if (typeof onDeleted === 'function') {
        onDeleted(id);
      }
      
    } catch (error) {
      // Show error with SweetAlert
      showError(
        'Delete Failed',
        error.response?.data?.message || `Failed to delete ${type}. Please try again.`
      );
      
      // Log the error for debugging
      console.error(`Error deleting ${type}:`, error);
    }
  };
  
  return (
    <button
      onClick={handleDelete}
      className="flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition duration-200"
      aria-label={`Delete ${type}`}
    >
      <FaTrash className="w-4 h-4" />
    </button>
  );
};

export default DeleteButton; 