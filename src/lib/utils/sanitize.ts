// Basic HTML sanitization
export const sanitizeHTML = (str: string) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Email validation
export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (basic)
export const isValidPhone = (phone: string) => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
};

// Sanitize form data object
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = { ...data } as T;
  (Object.keys(sanitized) as Array<keyof T>).forEach(key => {
    const value = sanitized[key];
    if (typeof value === 'string') {
      (sanitized[key] as any) = sanitizeHTML(value);
    } else if (typeof value === 'object' && value !== null) {
      (sanitized[key] as any) = sanitizeFormData(value);
    }
  });
  return sanitized;
};

// Validate form data
export const validateFormData = (data: {
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  preferredContactMethod?: string;
}) => {
  const errors: string[] = [];

  if (data.contactInfo?.email && !isValidEmail(data.contactInfo.email)) {
    errors.push('Invalid email format');
  }

  if (data.contactInfo?.phone && !isValidPhone(data.contactInfo.phone)) {
    errors.push('Invalid phone number format');
  }

  if (data.preferredContactMethod === 'whatsapp' && !data.contactInfo?.phone) {
    errors.push('Phone number is required for WhatsApp contact method');
  }

  return errors;
};