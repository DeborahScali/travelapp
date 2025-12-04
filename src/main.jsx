import React from 'react'
import ReactDOM from 'react-dom/client'
import TravelPlanner from './TravelPlanner.jsx'
import Login from './components/Login.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import './index.css'

// App wrapper component that handles authentication routing
const App = () => {
  const { currentUser, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show Login if not authenticated, TravelPlanner if authenticated
  return currentUser ? <TravelPlanner /> : <Login />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
