import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Navigation from '@/components/shared/Navigation'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Members from '@/pages/Members'
import AddMember from '@/pages/AddMember'
import EditMember from '@/pages/EditMember'
import Visitors from '@/pages/Visitors'
import Profile from '@/pages/Profile'
import Invoices from '@/pages/Invoices'
import DataManagement from '@/components/admin/DataManagement'
import FollowUp from '@/pages/FollowUp'
import AuthTest from '@/pages/AuthTest'
import Debug from '@/pages/Debug'
import NotFound from '@/pages/NotFound'
import MemberCheckIn from '@/pages/MemberCheckIn'
import Analytics from '@/pages/Analytics'
import FollowUpManagement from '@/pages/FollowUpManagement'
import Settings from '@/pages/Settings'
import ProteinStore from '@/pages/ProteinStore'
import './App.css'
import { useInitializeDemoData } from '@/hooks/useInitializeDemoData'
import { useEffect } from 'react'
import { useDataStore } from '@/lib/dataSync'

function App() {
  // Initialize demo data if store is empty
  useInitializeDemoData();
  const autoExpire = useDataStore()?.autoExpireMembers
  useEffect(() => { try { autoExpire && autoExpire() } catch {} }, [autoExpire])
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Navigation>
                  <Dashboard />
                </Navigation>
              </ProtectedRoute>
            } />
            
            <Route path="/members" element={
              <ProtectedRoute>
                <Navigation>
                  <Members />
                </Navigation>
              </ProtectedRoute>
            } />
            
            <Route path="/add-member" element={
              <ProtectedRoute requiredRole="semi-admin">
                <Navigation>
                  <AddMember />
                </Navigation>
              </ProtectedRoute>
            } />
            
            <Route path="/edit-member/:id" element={
              <ProtectedRoute requiredRole="semi-admin">
                <Navigation>
                  <EditMember />
                </Navigation>
              </ProtectedRoute>
            } />
            
            <Route path="/visitors" element={
              <ProtectedRoute>
                <Navigation>
                  <Visitors />
                </Navigation>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Navigation>
                  <Profile />
                </Navigation>
              </ProtectedRoute>
            } />
            
            <Route path="/invoices" element={
              <ProtectedRoute>
                <Navigation>
                  <Invoices />
                </Navigation>
              </ProtectedRoute>
            } />
            
            <Route path="/data-management" element={
              <ProtectedRoute requiredRole="owner">
                <Navigation>
                  <DataManagement />
                </Navigation>
              </ProtectedRoute>
            } />
            
            <Route path="/followup" element={
              <ProtectedRoute>
                <Navigation>
                  <FollowUp />
                </Navigation>
              </ProtectedRoute>
            } />
            
            <Route path="/debug" element={
              <ProtectedRoute requiredRole="owner">
                <Navigation>
                  <Debug />
                </Navigation>
              </ProtectedRoute>
            } />
            
            <Route path="/auth-test" element={
              <ProtectedRoute>
                <Navigation>
                  <AuthTest />
                </Navigation>
              </ProtectedRoute>
            } />
            
            {/* New Feature Routes */}
            <Route path="/member-checkin" element={
              <ProtectedRoute>
                <Navigation>
                  <MemberCheckIn />
                </Navigation>
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute requiredRole="owner">
                <Navigation>
                  <Analytics />
                </Navigation>
              </ProtectedRoute>
            } />
            
            <Route path="/followups" element={
              <ProtectedRoute>
                <Navigation>
                  <FollowUpManagement />
                </Navigation>
              </ProtectedRoute>
            } />
            
            <Route path="/protein-store" element={
              <ProtectedRoute>
                <Navigation>
                  <ProteinStore />
                </Navigation>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Navigation>
                  <Settings />
                </Navigation>
              </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
