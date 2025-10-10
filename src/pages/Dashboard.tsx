import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import OwnerDashboard from './OwnerDashboard'
import ManagerDashboard from './ManagerDashboard'

const Dashboard = () => {
  const { user } = useAuth()

  // Route to appropriate dashboard based on user role
  if (user?.role === 'owner') {
    return <OwnerDashboard />
  } else if (user?.role === 'semi-admin') {
    return <ManagerDashboard />
  }

  // Default fallback
  return <ManagerDashboard />
}

export default Dashboard

