import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Migrate localStorage data to Firestore for a new user
  const migrateLocalStorageData = async (userId) => {
    try {
      // Check if we've already migrated for this user
      const migrationDoc = await getDoc(doc(db, 'users', userId, 'profile', 'migration'));
      if (migrationDoc.exists() && migrationDoc.data().completed) {
        console.log('Data already migrated for this user');
        return;
      }

      console.log('Starting localStorage migration...');

      // Get all localStorage data
      const trips = localStorage.getItem('travelPlanner_trips');
      const currentTrip = localStorage.getItem('travelPlanner_currentTrip');
      const dailyPlans = localStorage.getItem('travelPlanner_dailyPlans');
      const flights = localStorage.getItem('travelPlanner_flights');
      const expenses = localStorage.getItem('travelPlanner_expenses');

      // Only migrate if there's data to migrate
      if (trips || dailyPlans || flights || expenses) {
        // Parse the data
        const tripsData = trips ? JSON.parse(trips) : [];
        const dailyPlansData = dailyPlans ? JSON.parse(dailyPlans) : [];
        const flightsData = flights ? JSON.parse(flights) : [];
        const expensesData = expenses ? JSON.parse(expenses) : [];
        const currentTripData = currentTrip ? JSON.parse(currentTrip) : null;

        // Migrate trips
        for (const trip of tripsData) {
          await setDoc(doc(db, 'users', userId, 'trips', trip.id.toString()), {
            ...trip,
            createdAt: serverTimestamp()
          });
        }

        // Migrate current trip reference
        if (currentTripData) {
          await setDoc(doc(db, 'users', userId, 'profile', 'currentTrip'), {
            tripId: currentTripData.id,
            updatedAt: serverTimestamp()
          });
        }

        // Migrate daily plans
        for (const plan of dailyPlansData) {
          await setDoc(doc(db, 'users', userId, 'dailyPlans', plan.id.toString()), {
            ...plan,
            createdAt: serverTimestamp()
          });
        }

        // Migrate flights
        for (const flight of flightsData) {
          await setDoc(doc(db, 'users', userId, 'flights', flight.id.toString()), {
            ...flight,
            createdAt: serverTimestamp()
          });
        }

        // Migrate expenses
        for (const expense of expensesData) {
          await setDoc(doc(db, 'users', userId, 'expenses', expense.id.toString()), {
            ...expense,
            createdAt: serverTimestamp()
          });
        }

        console.log('Migration completed successfully!');
      }

      // Mark migration as completed
      await setDoc(doc(db, 'users', userId, 'profile', 'migration'), {
        completed: true,
        migratedAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Error migrating localStorage data:', error);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Create or update user profile in Firestore
      const userProfileRef = doc(db, 'users', user.uid, 'profile', 'info');
      const userProfile = await getDoc(userProfileRef);

      if (!userProfile.exists()) {
        // New user - create profile
        await setDoc(userProfileRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp()
        });

        // Migrate localStorage data for new user
        await migrateLocalStorageData(user.uid);
      } else {
        // Existing user - update last login
        await setDoc(userProfileRef, {
          lastLoginAt: serverTimestamp()
        }, { merge: true });
      }

      // Mark that user just logged in so the app can show the setup flow
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('showSetupOnLogin', '1');
        }
      } catch (err) {
        console.warn('Could not set showSetupOnLogin flag in localStorage', err);
      }

      return result;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error.message);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
