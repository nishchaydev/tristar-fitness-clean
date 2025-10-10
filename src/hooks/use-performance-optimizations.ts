import { useMemo, useCallback } from 'react'

// Define types locally to avoid dependency issues
interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'expired' | 'inactive';
}

interface Invoice {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

interface Activity {
  id: string;
  time: string;
}

export function useMemberFilters() {
  return {
    filterActiveMembers: useCallback((members: Member[]) => {
      return members.filter(member => member.status === 'active')
    }, []),

    filterExpiredMembers: useCallback((members: Member[]) => {
      return members.filter(member => member.status === 'expired')
    }, []),

    searchMembers: useCallback((members: Member[], searchTerm: string) => {
      const lowercaseSearch = searchTerm.toLowerCase()
      return members.filter(member =>
        member.name.toLowerCase().includes(lowercaseSearch) ||
        member.email.toLowerCase().includes(lowercaseSearch) ||
        member.phone.includes(searchTerm)
      )
    }, [])
  }
}

export function useInvoiceCalculations() {
  return {
    calculateTotalRevenue: useCallback((invoices: Invoice[]) => {
      return invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0)
    }, []),

    calculatePendingPayments: useCallback((invoices: Invoice[]) => {
      return invoices
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + inv.amount, 0)
    }, [])
  }
}

export function useActivityFilters() {
  return {
    filterRecentActivities: useCallback((activities: Activity[], days: number = 7) => {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - days)
      return activities.filter(activity => 
        new Date(activity.time) >= cutoff
      )
    }, []),

    groupActivitiesByDate: useCallback((activities: Activity[]) => {
      return activities.reduce((groups, activity) => {
        const date = new Date(activity.time).toLocaleDateString()
        return {
          ...groups,
          [date]: [...(groups[date] || []), activity]
        }
      }, {} as Record<string, Activity[]>)
    }, [])
  }
}

export function useDataStats(members: Member[], invoices: Invoice[]) {
  return useMemo(() => {
    const activeMembers = members.filter(m => m.status === 'active').length
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0)
    const averageRevenuePerMember = activeMembers ? totalRevenue / activeMembers : 0

    return {
      activeMembers,
      totalRevenue,
      averageRevenuePerMember
    }
  }, [members, invoices])
}