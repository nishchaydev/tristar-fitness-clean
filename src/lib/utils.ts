import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency formatting for INR
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Phone number formatting for Indian numbers
export function formatIndianPhone(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // If it starts with 91, format as +91 XXXXX XXXXX
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`
  }
  
  // If it's 10 digits, assume it's Indian number
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  
  return phone
}
