import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDataStore } from '@/lib/dataSync'
import { useToast } from '@/hooks/use-toast'

const Debug = () => {
  const { user, isAuthenticated, isLoading, isBackendAvailable } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const { 
    members, 
    addMember, 
    clearAllData, 
    debugStore 
  } = useDataStore()
  const { toast } = useToast()

  useEffect(() => {
    const checkLocalStorage = () => {
      const savedUser = localStorage.getItem('tristar_fitness_user');
      const savedToken = localStorage.getItem('auth_token');
      
      setLocalStorageData({
        savedUser: savedUser ? JSON.parse(savedUser) : null,
        savedToken: savedToken,
        hasUser: !!savedUser,
        hasToken: !!savedToken
      });
    };

    checkLocalStorage();
    
    // Check every second
    const interval = setInterval(checkLocalStorage, 1000);
    return () => clearInterval(interval);
  }, []);

  const clearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  const simulateLogin = () => {
    const demoUser = {
      id: '1',
      username: 'owner',
      email: 'owner@tristarfitness.com',
      role: 'owner',
      name: 'Nikhil Verma',
      phone: '+1 555 0123',
      createdAt: '2024-01-01T00:00:00.000Z',
      lastLogin: new Date().toISOString(),
    };
    
    const demoToken = `demo-token-${Date.now()}`;
    
    localStorage.setItem('tristar_fitness_user', JSON.stringify(demoUser));
    localStorage.setItem('auth_token', demoToken);
    
    window.location.reload();
  };

  const testAddMember = () => {
    const testMember = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+91 98765 43210',
      membershipType: 'monthly' as const,
      startDate: '2024-01-01',
      expiryDate: '2024-02-01',
      status: 'active' as const,
      lastVisit: undefined,
      totalVisits: 0
    }
    
    addMember(testMember)
    toast({
      title: "Test Member Added",
      description: "Test member has been added to the store.",
    })
  }

  const testClearData = () => {
    clearAllData()
    // Also clear localStorage to test demo data loading
    localStorage.removeItem('tristar-fitness-data')
    toast({
      title: "Data Cleared",
      description: "All data has been cleared from the store and localStorage.",
    })
  }

  const testDebugStore = () => {
    const storeState = debugStore()
    console.log('Current Store State:', storeState)
    toast({
      title: "Store Debugged",
      description: "Check console for store state details.",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Debug & Testing Panel
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test data store functionality and debug issues
          </p>
        </div>

        {/* Current State */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Authentication Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Current State */}
            <div>
              <h3 className="font-semibold mb-2">Current Auth State:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Loading:</strong> {isLoading ? '🔄 Yes' : '✅ No'}</div>
                <div><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
                <div><strong>Backend Available:</strong> {isBackendAvailable ? '✅ Yes' : '❌ No'}</div>
                <div><strong>User:</strong> {user ? user.name : '❌ None'}</div>
                <div><strong>Role:</strong> {user ? user.role : '❌ None'}</div>
                <div><strong>Username:</strong> {user ? user.username : '❌ None'}</div>
              </div>
            </div>

            {/* LocalStorage Data */}
            <div>
              <h3 className="font-semibold mb-2">LocalStorage Data:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Has User:</strong> {localStorageData.hasUser ? '✅ Yes' : '❌ No'}</div>
                <div><strong>Has Token:</strong> {localStorageData.hasToken ? '✅ Yes' : '❌ No'}</div>
              </div>
              
              {localStorageData.savedUser && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                  <strong>User Data:</strong>
                  <pre>{JSON.stringify(localStorageData.savedUser, null, 2)}</pre>
                </div>
              )}
              
              {localStorageData.savedToken && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                  <strong>Token:</strong> {localStorageData.savedToken}
                </div>
              )}
            </div>

            {/* Actions */}
            <div>
              <h3 className="font-semibold mb-2">Actions:</h3>
              <div className="flex gap-2">
                <Button onClick={simulateLogin} variant="outline">
                  Simulate Login
                </Button>
                <Button onClick={clearStorage} variant="destructive">
                  Clear Storage
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Refresh Page
                </Button>
              </div>
            </div>

            {/* Data Store Status */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Data Store Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{members.length}</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Members</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {members.filter(m => m.status === 'active').length}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">Active</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {members.filter(m => m.status === 'expired').length}
                    </div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-400">Expired</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {members.filter(m => m.status === 'pending').length}
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-400">Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Actions */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Test Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={testAddMember}
                    className="bg-green-600 hover:bg-green-700 hover:scale-105 transition-transform duration-200"
                  >
                    Add Test Member
                  </Button>
                  <Button 
                    onClick={testDebugStore}
                    variant="outline"
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    Debug Store
                  </Button>
                  <Button 
                    onClick={testClearData}
                    variant="destructive"
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    Clear All Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Members List */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Current Members ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {members.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No members found. Add some test data to see them here.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div 
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {member.email} • {member.phone}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.membershipType}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            member.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            member.status === 'expired' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {member.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">Testing Instructions</CardTitle>
              </CardHeader>
              <CardContent className="text-blue-800 dark:text-blue-200">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Click "Simulate Login" to set demo data</li>
                  <li>Check if authentication state updates</li>
                  <li>Refresh the page (F5)</li>
                  <li>See if authentication persists</li>
                  <li>Check console for debug logs</li>
                  <li>Click "Add Test Member" to add a sample member to the store</li>
                  <li>Check the member count increases in the status section</li>
                  <li>Verify the new member appears in the members list</li>
                  <li>Go to Dashboard to see if the member count updates there</li>
                  <li>Go to Members page to see if the member appears there</li>
                  <li>Use "Debug Store" to see detailed store state in console</li>
                </ol>
              </CardContent>
            </Card>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Debug;

