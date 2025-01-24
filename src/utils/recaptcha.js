// reCAPTCHA v2 utility functions
export const verifyRecaptcha = () => {
  return new Promise((resolve) => {
    const token = window.grecaptcha?.getResponse();
    if (!token) {
      resolve(false);
      return;
    }
    resolve(true);
  });
};

// Helper function to protect forms
export const protectForm = async (onSuccess, onFailure) => {
  const isVerified = await verifyRecaptcha();
  if (!isVerified) {
    onFailure?.("Please complete the reCAPTCHA verification");
    return false;
  }

  onSuccess?.();
  return true;
};
