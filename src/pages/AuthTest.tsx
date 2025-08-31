import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AuthTest = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const checkLocalStorage = () => {
    const savedUser = localStorage.getItem('tristar_fitness_user');
    const savedToken = localStorage.getItem('auth_token');
    
    alert(`LocalStorage Check:\nUser: ${savedUser ? 'Found' : 'Not Found'}\nToken: ${savedToken ? 'Found' : 'Not Found'}\n\nUser Data: ${savedUser || 'None'}\nToken: ${savedToken || 'None'}`);
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('tristar_fitness_user');
    localStorage.removeItem('auth_token');
    alert('LocalStorage cleared! Refresh the page to see the effect.');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Current State:</h3>
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong> {user ? user.name : 'None'}</p>
              <p><strong>Role:</strong> {user ? user.role : 'None'}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Actions:</h3>
              <div className="space-y-2">
                <Button onClick={checkLocalStorage} variant="outline" className="w-full">
                  Check LocalStorage
                </Button>
                <Button onClick={clearLocalStorage} variant="outline" className="w-full">
                  Clear LocalStorage
                </Button>
                <Button onClick={logout} variant="destructive" className="w-full">
                  Logout
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Login with any demo account</li>
              <li>Check that you're authenticated</li>
              <li>Refresh the page (F5)</li>
              <li>Verify you're still logged in</li>
              <li>Use "Check LocalStorage" to see stored data</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthTest;
