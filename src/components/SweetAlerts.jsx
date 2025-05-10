import Swal from 'sweetalert2';

// Base styles that match your app's design system
const baseStyle = {
  customClass: {
    confirmButton: 'bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg font-semibold transition duration-200 px-6 mr-3',
    cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 p-3 rounded-lg font-semibold transition duration-200 px-6',
    header: 'border-b pb-3',
    popup: 'rounded-xl shadow-xl',
  },
  buttonsStyling: false,
};

// Confirmation modal with customizable buttons
export const confirmAction = async (options = {}) => {
  const defaultOptions = {
    title: 'Are you sure?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, proceed',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    ...baseStyle
  };

  const result = await Swal.fire({
    ...defaultOptions,
    ...options
  });

  return result.isConfirmed;
};

// Delete confirmation with more prominent warning
export const confirmDelete = async (itemName = 'this item', options = {}) => {
  const result = await Swal.fire({
    title: `Delete ${itemName}?`,
    html: `<p>You are about to delete <strong>${itemName}</strong>.</p><p class="text-red-500 mt-2">This action cannot be undone.</p>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#ef4444',
    reverseButtons: true,
    ...baseStyle,
    ...options
  });

  return result.isConfirmed;
};

// Success notification with animation
export const showSuccess = (title, message) => {
  Swal.fire({
    title: title || 'Success!',
    html: message,
    icon: 'success',
    timer: 2500,
    timerProgressBar: true,
    showConfirmButton: false,
    ...baseStyle
  });
};

// Error notification with details
export const showError = (title, message, showConfirmButton = true) => {
  Swal.fire({
    title: title || 'Error',
    html: message || 'Something went wrong. Please try again.',
    icon: 'error',
    confirmButtonText: 'OK',
    showConfirmButton: showConfirmButton,
    timer: showConfirmButton ? undefined : 3000,
    ...baseStyle
  });
};

// For multi-step processes or wizards
export const showMultiStep = async (steps) => {
  let currentStep = 0;
  let values = {};
  
  while (currentStep < steps.length) {
    const step = steps[currentStep];
    const result = await Swal.fire({
      title: step.title,
      html: step.html,
      input: step.input,
      inputPlaceholder: step.inputPlaceholder,
      inputValue: step.inputValue || values[step.id],
      inputValidator: step.validator,
      showCancelButton: true,
      confirmButtonText: currentStep === steps.length - 1 ? 'Submit' : 'Next',
      cancelButtonText: currentStep === 0 ? 'Cancel' : 'Back',
      ...baseStyle
    });

    // Handle cancellations and back actions
    if (result.isDismissed) {
      if (currentStep === 0 || result.dismiss === Swal.DismissReason.cancel) {
        return null; // User cancelled the whole process
      }
      currentStep--; // Go back one step
    } else {
      if (step.input) {
        values[step.id] = result.value;
      }
      currentStep++;
    }
  }

  return values;
};

// For collecting form data with validation
export const showForm = async (options = {}) => {
  const { title, html, confirmButtonText = 'Submit', preConfirm } = options;
  
  const result = await Swal.fire({
    title,
    html,
    confirmButtonText,
    showCancelButton: true,
    cancelButtonText: 'Cancel',
    focusConfirm: false,
    preConfirm,
    ...baseStyle
  });
  
  if (result.isConfirmed) {
    return result.value;
  }
  
  return null;
};

// For showing loading states
export const showLoading = (message = 'Please wait...') => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    },
    ...baseStyle
  });
};

// For closing loading dialogs
export const closeLoading = () => {
  Swal.close();
}; 