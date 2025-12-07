import React from 'react'
import ReactDOM from 'react-dom/client'
import TravelPlanner from './TravelPlanner.jsx'
import DayOfTripMode from './components/DayMode/DayOfTripMode.jsx'
import Login from './components/Login.jsx'
import TripSetup from './components/TripSetup.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { useCurrentTrip, useTrips } from './hooks/useFirestore.js'
import './index.css'

// App wrapper component that handles authentication routing
const App = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { currentTrip, loading: tripLoading, saveCurrentTrip } = useCurrentTrip();
  const { saveTrip } = useTrips();
  const [createdTrip, setCreatedTrip] = React.useState(null);
  const [forceSetup, setForceSetup] = React.useState(false);
  const [appMode, setAppMode] = React.useState('planning'); // 'planning' or 'dayMode'

  // Show loading spinner while checking authentication
  if (authLoading || (currentUser && tripLoading)) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4ECDC4]/20 border-t-[#4ECDC4] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show Login
  if (!currentUser) {
    return <Login />;
  }

  // If the user just signed in, prefer to show the TripSetup flow first,
  // but don't block navigation if a trip was already created or loaded.
  if (
    typeof window !== 'undefined' &&
    localStorage.getItem('showSetupOnLogin') === '1' &&
    !createdTrip &&
    (!currentTrip || !currentTrip.id)
  ) {
    try {
      localStorage.removeItem('showSetupOnLogin');
    } catch (err) {
      console.warn('Could not remove showSetupOnLogin flag', err);
    }

    return (
      <TripSetup
        onCreateTrip={async (trip) => {
          try {
            await saveTrip(trip);
            await saveCurrentTrip(trip);
            setCreatedTrip(trip);
            setForceSetup(false);
          } catch (error) {
            console.error('Failed to create trip:', error);
            alert('Failed to create trip. Please try again.');
          }
        }}
      />
    );
  }
  // Authenticated but no trip or trip has no id - show TripSetup
  if (forceSetup || !currentTrip || !currentTrip.id) {
    // If the user just created a trip but the currentTrip hook hasn't
    // reflected it yet, show the TravelPlanner with the createdTrip as
    // an initial value so the app continues immediately.
    if (createdTrip && !forceSetup) {
      return appMode === 'planning' ? (
        <TravelPlanner
          initialTrip={createdTrip}
          onExitTrip={() => {
            setCreatedTrip(null);
            setForceSetup(true);
          }}
          onEnterDayMode={() => setAppMode('dayMode')}
        />
      ) : (
        <DayOfTripMode onExitDayMode={() => setAppMode('planning')} />
      );
    }

    return (
      <TripSetup
        onCreateTrip={async (trip) => {
          try {
            console.log('App: onCreateTrip start', trip);
            await saveTrip(trip);
            console.log('App: saveTrip completed');
            await saveCurrentTrip(trip);
            console.log('App: saveCurrentTrip completed');
            // Keep a local copy so we can navigate immediately while
            // useCurrentTrip synchronizes with Firestore.
            setCreatedTrip(trip);
            console.log('App: setCreatedTrip', trip);
            setForceSetup(false);
          } catch (error) {
            console.error('Failed to create trip:', error);
            alert('Failed to create trip. Please try again.');
          }
        }}
      />
    );
  }

  // Authenticated with trip - show TravelPlanner or DayOfTripMode
  return appMode === 'planning' ? (
    <TravelPlanner
      onExitTrip={() => {
        setCreatedTrip(null);
        setForceSetup(true);
      }}
      onEnterDayMode={() => setAppMode('dayMode')}
    />
  ) : (
    <DayOfTripMode onExitDayMode={() => setAppMode('planning')} />
  );
};

const rootElement = document.getElementById('root');
// Reuse the root if Fast Refresh re-runs this module to avoid duplicate createRoot warnings.
const root = rootElement._reactRoot || ReactDOM.createRoot(rootElement);
rootElement._reactRoot = root;

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
