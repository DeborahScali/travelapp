import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

// Custom hook for loading and managing trips
export const useTrips = () => {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setTrips([]);
      setLoading(false);
      return;
    }

    loadTrips();
  }, [currentUser]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const tripsRef = collection(db, 'users', currentUser.uid, 'trips');
      const querySnapshot = await getDocs(tripsRef);
      const tripsData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: parseInt(doc.id)
      }));
      setTrips(tripsData);
      setError(null);
    } catch (err) {
      console.error('Error loading trips:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveTrip = async (trip) => {
    try {
      await setDoc(
        doc(db, 'users', currentUser.uid, 'trips', trip.id.toString()),
        {
          ...trip,
          updatedAt: serverTimestamp()
        }
      );
      await loadTrips();
    } catch (err) {
      console.error('Error saving trip:', err);
      throw err;
    }
  };

  const deleteTrip = async (tripId) => {
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'trips', tripId.toString()));
      await loadTrips();
    } catch (err) {
      console.error('Error deleting trip:', err);
      throw err;
    }
  };

  return { trips, loading, error, saveTrip, deleteTrip, reloadTrips: loadTrips };
};

// Custom hook for managing current trip
export const useCurrentTrip = () => {
  const { currentUser } = useAuth();
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setCurrentTrip(null);
      setLoading(false);
      return;
    }

    loadCurrentTrip();
  }, [currentUser]);

  const loadCurrentTrip = async () => {
    try {
      setLoading(true);
      const currentTripRef = doc(db, 'users', currentUser.uid, 'profile', 'currentTrip');
      const currentTripDoc = await getDoc(currentTripRef);

      if (currentTripDoc.exists()) {
        const tripId = currentTripDoc.data().tripId;

        // If tripId is null or undefined, clear the current trip
        if (!tripId) {
          setCurrentTrip(null);
          return;
        }

        const tripRef = doc(db, 'users', currentUser.uid, 'trips', tripId.toString());
        const tripDoc = await getDoc(tripRef);

        if (tripDoc.exists()) {
          setCurrentTrip({ ...tripDoc.data(), id: parseInt(tripDoc.id) });
        } else {
          // Trip document doesn't exist, clear current trip
          setCurrentTrip(null);
        }
      } else {
        // No current trip document, clear current trip
        setCurrentTrip(null);
      }
    } catch (err) {
      console.error('Error loading current trip:', err);
      setCurrentTrip(null);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentTrip = async (trip) => {
    try {
      await setDoc(
        doc(db, 'users', currentUser.uid, 'profile', 'currentTrip'),
        {
          tripId: trip.id,
          updatedAt: serverTimestamp()
        }
      );
      setCurrentTrip(trip);
    } catch (err) {
      console.error('Error saving current trip:', err);
      throw err;
    }
  };

  return { currentTrip, loading, saveCurrentTrip, reloadCurrentTrip: loadCurrentTrip };
};

// Custom hook for flights
export const useFlights = () => {
  const { currentUser } = useAuth();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setFlights([]);
      setLoading(false);
      return;
    }

    loadFlights();
  }, [currentUser]);

  const loadFlights = async () => {
    try {
      setLoading(true);
      const flightsRef = collection(db, 'users', currentUser.uid, 'flights');
      const querySnapshot = await getDocs(flightsRef);
      const flightsData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: parseInt(doc.id)
      }));
      setFlights(flightsData);
    } catch (err) {
      console.error('Error loading flights:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveFlight = async (flight) => {
    try {
      await setDoc(
        doc(db, 'users', currentUser.uid, 'flights', flight.id.toString()),
        {
          ...flight,
          updatedAt: serverTimestamp()
        }
      );
      await loadFlights();
    } catch (err) {
      console.error('Error saving flight:', err);
      throw err;
    }
  };

  const deleteFlight = async (flightId) => {
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'flights', flightId.toString()));
      await loadFlights();
    } catch (err) {
      console.error('Error deleting flight:', err);
      throw err;
    }
  };

  return { flights, loading, saveFlight, deleteFlight, setFlights, reloadFlights: loadFlights };
};

// Custom hook for hotels
export const useHotels = () => {
  const { currentUser } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setHotels([]);
      setLoading(false);
      return;
    }

    loadHotels();
  }, [currentUser]);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const hotelsRef = collection(db, 'users', currentUser.uid, 'hotels');
      const querySnapshot = await getDocs(hotelsRef);
      const hotelsData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: parseInt(doc.id)
      }));
      setHotels(hotelsData);
    } catch (err) {
      console.error('Error loading hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveHotel = async (hotel) => {
    try {
      await setDoc(
        doc(db, 'users', currentUser.uid, 'hotels', hotel.id.toString()),
        {
          ...hotel,
          updatedAt: serverTimestamp()
        }
      );
      await loadHotels();
    } catch (err) {
      console.error('Error saving hotel:', err);
      throw err;
    }
  };

  const deleteHotel = async (hotelId) => {
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'hotels', hotelId.toString()));
      await loadHotels();
    } catch (err) {
      console.error('Error deleting hotel:', err);
      throw err;
    }
  };

  return { hotels, loading, saveHotel, deleteHotel, setHotels, reloadHotels: loadHotels };
};

// Custom hook for daily plans
export const useDailyPlans = () => {
  const { currentUser } = useAuth();
  const [dailyPlans, setDailyPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setDailyPlans([]);
      setLoading(false);
      return;
    }

    loadDailyPlans();
  }, [currentUser]);

  const loadDailyPlans = async () => {
    try {
      setLoading(true);
      const plansRef = collection(db, 'users', currentUser.uid, 'dailyPlans');
      const querySnapshot = await getDocs(plansRef);
      const plansData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: parseInt(doc.id)
      }));
      // Sort by date
      plansData.sort((a, b) => new Date(a.date) - new Date(b.date));
      setDailyPlans(plansData);
    } catch (err) {
      console.error('Error loading daily plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveDailyPlan = async (plan) => {
    try {
      await setDoc(
        doc(db, 'users', currentUser.uid, 'dailyPlans', plan.id.toString()),
        {
          ...plan,
          updatedAt: serverTimestamp()
        }
      );
      // Don't reload - local state is already updated
    } catch (err) {
      console.error('Error saving daily plan:', err);
      throw err;
    }
  };

  const saveDailyPlans = async (plans) => {
    try {
      const promises = plans.map(plan =>
        setDoc(
          doc(db, 'users', currentUser.uid, 'dailyPlans', plan.id.toString()),
          {
            ...plan,
            updatedAt: serverTimestamp()
          }
        )
      );
      await Promise.all(promises);
      // Don't reload - local state is already updated
    } catch (err) {
      console.error('Error saving daily plans:', err);
      throw err;
    }
  };

  const replaceDailyPlans = async (plans) => {
    try {
      const plansRef = collection(db, 'users', currentUser.uid, 'dailyPlans');
      const existingSnap = await getDocs(plansRef);
      const idsToKeep = new Set(plans.map(p => p.id.toString()));

      const deletePromises = existingSnap.docs
        .filter(docSnap => !idsToKeep.has(docSnap.id))
        .map(docSnap => deleteDoc(docSnap.ref));

      const writePromises = plans.map(plan =>
        setDoc(
          doc(db, 'users', currentUser.uid, 'dailyPlans', plan.id.toString()),
          {
            ...plan,
            updatedAt: serverTimestamp()
          }
        )
      );

      await Promise.all([...deletePromises, ...writePromises]);
      await loadDailyPlans();
    } catch (err) {
      console.error('Error replacing daily plans:', err);
      throw err;
    }
  };

  return { dailyPlans, loading, saveDailyPlan, saveDailyPlans, replaceDailyPlans, setDailyPlans, reloadDailyPlans: loadDailyPlans };
};

// Custom hook for expenses
export const useExpenses = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    loadExpenses();
  }, [currentUser]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const expensesRef = collection(db, 'users', currentUser.uid, 'expenses');
      const querySnapshot = await getDocs(expensesRef);
      const expensesData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: parseInt(doc.id)
      }));
      setExpenses(expensesData);
    } catch (err) {
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveExpense = async (expense) => {
    try {
      await setDoc(
        doc(db, 'users', currentUser.uid, 'expenses', expense.id.toString()),
        {
          ...expense,
          updatedAt: serverTimestamp()
        }
      );
      await loadExpenses();
    } catch (err) {
      console.error('Error saving expense:', err);
      throw err;
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'expenses', expenseId.toString()));
      await loadExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
      throw err;
    }
  };

  return { expenses, loading, saveExpense, deleteExpense, setExpenses, reloadExpenses: loadExpenses };
};
