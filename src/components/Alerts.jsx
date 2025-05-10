import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Default configuration for toasts
const defaultOptions = {
  position: "top-center",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Enhanced toast styles with icons and better messages
export const showToast = {
  success: (message, options = {}) => {
    return toast.success(message, {
      ...defaultOptions,
      icon: "🎉",
      className: "toast-success-container",
      ...options,
    });
  },
  
  error: (message, options = {}) => {
    return toast.error(message, {
      ...defaultOptions,
      icon: "❌",
      className: "toast-error-container",
      ...options,
    });
  },
  
  warning: (message, options = {}) => {
    return toast.warning(message, {
      ...defaultOptions,
      icon: "⚠️",
      className: "toast-warning-container",
      ...options,
    });
  },
  
  info: (message, options = {}) => {
    return toast.info(message, {
      ...defaultOptions,
      icon: "ℹ️",
      className: "toast-info-container",
      ...options,
    });
  },
};

// For important messages that require attention
export const showImportantToast = (message, type = 'info') => {
  const toastFunction = toast[type] || toast.info;
  
  return toastFunction(message, {
    position: "top-center",
    autoClose: false, // Stays until dismissed
    hideProgressBar: false,
    closeOnClick: false, // Must click the X to close
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    className: `toast-important-container toast-${type}-container`,
  });
};

// For system notifications that should be less intrusive
export const showSystemToast = (message) => {
  return toast(message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    className: "toast-system-container",
  });
};

// For validation errors (collects all errors in one toast)
export const showValidationErrors = (errors) => {
  const errorMessages = Array.isArray(errors) ? errors : [errors];
  
  return toast.error(
    <div>
      <strong>Please fix the following errors:</strong>
      <ul className="mt-2 pl-4 list-disc">
        {errorMessages.map((error, index) => (
          <li key={index} className="text-sm">{error}</li>
        ))}
      </ul>
    </div>,
    {
      position: "top-center",
      autoClose: 8000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: "toast-validation-container",
    }
  );
}; 