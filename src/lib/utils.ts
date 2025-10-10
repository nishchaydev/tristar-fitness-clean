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

export async function loadSyncedJSON(section: 'members' | 'invoices' | 'followups' | 'proteins' | 'activities' | 'visitors' | 'trainers'): Promise<any[]> {
  try {
    const resp = await fetch(`/api/static/${section}.json`, { cache: 'no-store' })
    if (!resp.ok) throw new Error('not ok')
    const json = await resp.json()
    return json.data || []
  } catch {
    try {
      const resp = await fetch(`/backend/data/${section}.json`, { cache: 'no-store' })
      if (!resp.ok) throw new Error('not ok')
      const json = await resp.json()
      return json.data || []
    } catch {
      return []
    }
  }
}

export function toCSV(rows: any[]): string {
  if (!rows || rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map(h => {
      const v = (row as any)[h]
      if (v == null) return ''
      const s = String(v)
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
    }).join(','))
  }
  return lines.join('\n')
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
