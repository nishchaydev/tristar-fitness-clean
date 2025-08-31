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
import Trainers from '@/pages/Trainers'
import Profile from '@/pages/Profile'
import Invoices from '@/pages/Invoices'
import DataManagement from '@/components/admin/DataManagement'
import FollowUp from '@/pages/FollowUp'
import AuthTest from '@/pages/AuthTest'
import Debug from '@/pages/Debug'
import NotFound from '@/pages/NotFound'
import './App.css'
import { useInitializeDemoData } from '@/hooks/useInitializeDemoData'

function App() {
  console.log('App component rendering...');
  
  // Initialize demo data if store is empty
  useInitializeDemoData();
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <main className="container mx-auto px-4 py-8">
                    <Dashboard />
                  </main>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <main className="container mx-auto px-4 py-8">
                    <Dashboard />
                  </main>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/members" element={
              <ProtectedRoute requiredRole="owner">
                <>
                  <Navigation />
                  <main className="container mx-auto px-4 py-8">
                    <Members />
                  </main>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/add-member" element={
              <ProtectedRoute requiredRole="owner">
                <>
                  <Navigation />
                  <main className="container mx-auto px-4 py-8">
                    <AddMember />
                  </main>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/edit-member/:id" element={
              <ProtectedRoute requiredRole="owner">
                <>
                  <Navigation />
                  <main className="container mx-auto px-4 py-8">
                    <EditMember />
                  </main>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/visitors" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <main className="container mx-auto px-4 py-8">
                    <Visitors />
                  </main>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/trainers" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <main className="container mx-auto px-4 py-8">
                    <Trainers />
                  </main>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <main className="container mx-auto px-4 py-8">
                    <Profile />
                  </main>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/invoices" element={
              <ProtectedRoute requiredRole="owner">
                <>
                  <Navigation />
                  <main className="container mx-auto px-4 py-8">
                    <Invoices />
                  </main>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/data-management" element={
              <ProtectedRoute requiredRole="owner">
                <>
                  <Navigation />
                  <main className="container mx-auto px-4 py-8">
                    <DataManagement />
                  </main>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/followup" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <main className="container mx-auto px-8">
                    <FollowUp />
                  </main>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/auth-test" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <main>
                    <AuthTest />
                  </main>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/debug" element={
              <>
                <Debug />
              </>
            } />
            
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
