import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { Plus, Trash2, MapPin, Plane, DollarSign, TrendingUp, Calendar, Map as MapIcon, LogOut, User, ArrowLeft, X, ChevronDown, Coffee, StickyNote, Camera, Building } from 'lucide-react';
import { FaWalking, FaSubway, FaCar, FaUtensils, FaMapMarkerAlt, FaMapMarkedAlt } from 'react-icons/fa';
import { FaStar, FaLocationPin } from 'react-icons/fa6';
import { TbTimeDuration30 } from 'react-icons/tb';
import { MdAttachMoney, MdDragIndicator } from 'react-icons/md';
import { IoIosAddCircle, IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { useAuth } from './contexts/AuthContext';
import { useTrips, useCurrentTrip, useFlights, useDailyPlans, useExpenses } from './hooks/useFirestore';

// Cities database for Switzerland, Italy, and France
const CITIES_DATABASE = {
  Switzerland: [
    'Zurich', 'Geneva', 'Basel', 'Lausanne', 'Bern', 'Winterthur', 'Lucerne', 'St. Gallen',
    'Lugano', 'Biel/Bienne', 'Thun', 'Köniz', 'La Chaux-de-Fonds', 'Schaffhausen', 'Fribourg',
    'Vernier', 'Chur', 'Neuchâtel', 'Uster', 'Sion', 'Emmen', 'Zug', 'Yverdon-les-Bains',
    'Kriens', 'Rapperswil-Jona', 'Dübendorf', 'Montreux', 'Frauenfeld', 'Dietikon', 'Wetzikon',
    'Interlaken', 'Zermatt', 'Grindelwald', 'Lauterbrunnen', 'Wengen', 'Murren', 'Locarno',
    'Ascona', 'Bellinzona', 'Davos', 'St. Moritz', 'Arosa', 'Engelberg', 'Andermatt'
  ],
  Italy: [
    'Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari',
    'Catania', 'Venice', 'Verona', 'Messina', 'Padua', 'Trieste', 'Brescia', 'Taranto',
    'Prato', 'Parma', 'Modena', 'Reggio Calabria', 'Reggio Emilia', 'Perugia', 'Livorno',
    'Ravenna', 'Cagliari', 'Foggia', 'Rimini', 'Salerno', 'Ferrara', 'Sassari', 'Latina',
    'Giugliano in Campania', 'Monza', 'Syracuse', 'Pescara', 'Bergamo', 'Forlì', 'Trento',
    'Vicenza', 'Terni', 'Bolzano', 'Novara', 'Piacenza', 'Ancona', 'Andria', 'Arezzo',
    'Udine', 'Cesena', 'Lecce', 'Pisa', 'Siena', 'Lucca', 'Como', 'La Spezia', 'Varese',
    'Sorrento', 'Amalfi', 'Positano', 'Capri', 'Portofino', 'Cinque Terre', 'Matera',
    'Assisi', 'Siracusa', 'Taormina', 'Pompeii', 'Pienza', 'San Gimignano', 'Orvieto'
  ],
  France: [
    'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier',
    'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Grenoble',
    'Dijon', 'Angers', 'Nîmes', 'Villeurbanne', 'Saint-Denis', 'Le Mans', 'Aix-en-Provence',
    'Clermont-Ferrand', 'Brest', 'Tours', 'Amiens', 'Limoges', 'Annecy', 'Perpignan', 'Boulogne-Billancourt',
    'Metz', 'Besançon', 'Orléans', 'Saint-Denis', 'Argenteuil', 'Rouen', 'Mulhouse', 'Montreuil',
    'Caen', 'Nancy', 'Avignon', 'Cannes', 'Antibes', 'Saint-Tropez', 'Monaco', 'Versailles',
    'Colmar', 'Chamonix', 'Annecy', 'Carcassonne', 'Arles', 'Aix-les-Bains', 'Menton',
    'Grasse', 'Saint-Malo', 'La Rochelle', 'Biarritz', 'Lourdes', 'Mont-Saint-Michel',
    'Giverny', 'Fontainebleau', 'Chartres', 'Beaune', 'Épernay', 'Reims', 'Troyes'
  ]
};

// Helper to create city list (can be filtered by countries)
const getCitiesList = (countries = null) => {
  if (!countries || countries.length === 0) {
    return Object.entries(CITIES_DATABASE).flatMap(([country, cities]) =>
      cities.map(city => ({ city, country }))
    );
  }

  return Object.entries(CITIES_DATABASE)
    .filter(([country]) => countries.includes(country))
    .flatMap(([country, cities]) =>
      cities.map(city => ({ city, country }))
    );
};

// Get a usable photo URL from the Google Place photos array (supports new/legacy helpers)
const getPhotoUrl = (photos, size = 400) => {
  if (!photos || photos.length === 0) return null;
  const firstPhoto = photos[0];

  if (firstPhoto.createMediaUrl) {
    return firstPhoto.createMediaUrl({ maxHeight: size, maxWidth: size });
  }

  if (firstPhoto.getURI) {
    return firstPhoto.getURI({ maxHeight: size, maxWidth: size });
  }

  if (firstPhoto.getUrl) {
    return firstPhoto.getUrl({ maxWidth: size, maxHeight: size });
  }

  return null;
};

const getCurrencySymbol = (curr) => {
  const symbols = { 'EUR': '€', 'USD': '$', 'GBP': '£', 'CHF': 'CHF', 'BRL': 'R$' };
  return symbols[curr] || '€';
};

const renderTypeIcon = (type, size = 16, className = '') => {
  switch (type) {
    case 'restaurant':
      return <FaUtensils size={size} className={className} />;
    case 'cafe':
      return <Coffee size={size} className={className} />;
    case 'activity':
      return <Camera size={size} className={className} />;
    case 'note':
      return <StickyNote size={size} className={className} />;
    default:
      return <Building size={size} className={className} />;
  }
};

const isCompactType = (type) => type && type !== 'place';

const TravelPlanner = ({ initialTrip = null, onExitTrip = () => {}, onEnterDayMode = () => {} }) => {
  // Authentication
  const { currentUser, signOut } = useAuth();

  // Firestore hooks
  const { trips, loading: tripsLoading, saveTrip, deleteTrip: deleteTripFromFirestore } = useTrips();
  const { currentTrip, loading: currentTripLoading, saveCurrentTrip } = useCurrentTrip();
  const { flights, loading: flightsLoading, saveFlight, deleteFlight: deleteFlightFromFirestore, setFlights } = useFlights();
  const { dailyPlans, loading: plansLoading, saveDailyPlan, saveDailyPlans, replaceDailyPlans, setDailyPlans } = useDailyPlans();
  const { expenses, loading: expensesLoading, saveExpense, deleteExpense: deleteExpenseFromFirestore, setExpenses } = useExpenses();

  const [activeTab, setActiveTab] = useState('itinerary');
  const [showAddFlight, setShowAddFlight] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedAddType, setSelectedAddType] = useState(null);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(null); // Store place ID
  const [currencyPickerPosition, setCurrencyPickerPosition] = useState({ top: 0, left: 0 });
  const [focusedNotesEditor, setFocusedNotesEditor] = useState(null); // Store place ID of focused notes editor
  const [showEmojiPicker, setShowEmojiPicker] = useState(null); // Store place ID for emoji picker
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [calculatingDistance, setCalculatingDistance] = useState(false);
  const [placeSearchTerm, setPlaceSearchTerm] = useState('');
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [placeSearchLoading, setPlaceSearchLoading] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null); // Store dragged place info
  const [isDragging, setIsDragging] = useState(false); // Track if currently dragging
  const [insertingAtIndex, setInsertingAtIndex] = useState(null); // Track where to insert new place
  const [daySummaries, setDaySummaries] = useState({}); // Debounced summaries per day
  const [expenseCitySearch, setExpenseCitySearch] = useState('');
  const [expenseCountrySearch, setExpenseCountrySearch] = useState('');
  const [showExpenseCitySuggestions, setShowExpenseCitySuggestions] = useState(false);
  const [showExpenseCountrySuggestions, setShowExpenseCountrySuggestions] = useState(false);
  const [showEditTripModal, setShowEditTripModal] = useState(false);
  const [editingTripName, setEditingTripName] = useState(false);
  const [editingTripDates, setEditingTripDates] = useState(false);
  const [dateRange, setDateRange] = useState([{
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  }]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const userMenuRef = useRef(null);
  const addMenuRef = useRef(null);
  const insertMenuRef = useRef(null);
  const dayChipsRef = useRef(null);
  const [editingDayTitle, setEditingDayTitle] = useState(false);
  const [dayTitleValue, setDayTitleValue] = useState('');
  const [tripForm, setTripForm] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });
  const mapsApiKey = (googleMapsApiKey || (import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY || '')).trim();

  // Memoize selectedDayData to prevent unnecessary map re-renders
  const selectedDayData = useMemo(() => {
    return dailyPlans.find(d => d.id === selectedDay);
  }, [dailyPlans, selectedDay]);

  const scrollDayChips = (direction) => {
    const container = dayChipsRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  // Create a stable reference for map dependencies
  const mapDependencyKey = useMemo(() => {
    if (!selectedDayData?.places) return '';
    return JSON.stringify(
      selectedDayData.places.map(p => ({
        id: p.id,
        address: p.address,
        // Ensure consistent property order for location
        location: p.location ? { lat: p.location.lat, lng: p.location.lng } : null,
        transportMode: p.transportMode
      }))
    );
  }, [selectedDayData]);

  // If an initialTrip was provided (created just now) and the
  // useCurrentTrip hook hasn't reflected it yet, save it so that
  // the rest of the app can use the currentTrip state normally.
  useEffect(() => {
    if (!currentTrip && initialTrip) {
      saveCurrentTrip(initialTrip).catch(err => {
        console.error('Failed to save initial trip from TravelPlanner:', err);
      });
    }
  }, [initialTrip, currentTrip, saveCurrentTrip]);

  // Keep googleMapsApiKey in sync if env changes during HMR
  useEffect(() => {
    const envApiKey = (import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY || '').trim();
    if (envApiKey && envApiKey !== googleMapsApiKey) {
      setGoogleMapsApiKey(envApiKey);
    }
  }, [googleMapsApiKey]);

  // Close add menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target)) {
        setShowAddMenu(false);
      }
    };

    if (showAddMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddMenu]);

  // Close insert menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (insertMenuRef.current && !insertMenuRef.current.contains(event.target)) {
        setInsertingAtIndex(null);
      }
    };

    if (insertingAtIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [insertingAtIndex]);

  // Initialize day summaries immediately when day is selected
  useEffect(() => {
    if (selectedDay && selectedDayData && !daySummaries[selectedDay]) {
      const totalStops = selectedDayData.places?.length || 0;
      const totalDistance = selectedDayData.places?.reduce((sum, p) => sum + parseFloat(p.distance || 0), 0) || 0;
      const totalTime = selectedDayData.places?.reduce((sum, p) => sum + parseFloat(p.transportTime || 0), 0) || 0;
      const totalCost = expenses.filter(e => e.dayId === selectedDay).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;

      setDaySummaries(prev => ({
        ...prev,
        [selectedDay]: {
          totalStops,
          totalDistance,
          totalTime,
          totalCost
        }
      }));
    }
  }, [selectedDay, selectedDayData, daySummaries, expenses]);

  // Immediate update of cost when expenses change
  useEffect(() => {
    if (selectedDay && daySummaries[selectedDay]) {
      const totalCost = expenses.filter(e => e.dayId === selectedDay).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;

      setDaySummaries(prev => ({
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          totalCost
        }
      }));
    }
  }, [expenses, selectedDay, daySummaries]);

  // Debounced update of day summaries for places (3 seconds after changes)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedDay && selectedDayData) {
        const totalStops = selectedDayData.places?.length || 0;
        const totalDistance = selectedDayData.places?.reduce((sum, p) => sum + parseFloat(p.distance || 0), 0) || 0;
        const totalTime = selectedDayData.places?.reduce((sum, p) => sum + parseFloat(p.transportTime || 0), 0) || 0;

        setDaySummaries(prev => ({
          ...prev,
          [selectedDay]: {
            ...prev[selectedDay],
            totalStops,
            totalDistance,
            totalTime
          }
        }));
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [selectedDay, selectedDayData, selectedDayData?.places]);

  // Generate daily plans when trip is created
  useEffect(() => {
    if (currentTrip && dailyPlans.length === 0 && !plansLoading) {
      const generateDailyPlans = async () => {
        const days = [];
        const start = parseLocalDate(currentTrip.startDate);
        const end = parseLocalDate(currentTrip.endDate);
        let current = new Date(start);
        let dayId = 1;

        while (current <= end) {
          const dateStr = formatDateLocal(current);
          days.push({
            id: dayId++,
            date: dateStr,
            title: '',
            city: '',
            country: '',
            places: []
          });
          current.setDate(current.getDate() + 1);
        }

        try {
          await replaceDailyPlans(days);
          if (days.length > 0) {
            setSelectedDay(days[0].id);
          }
        } catch (error) {
          console.error('Failed to generate daily plans:', error);
        }
      };

      generateDailyPlans();
    }
  }, [currentTrip, dailyPlans.length, plansLoading]);

  // Set selected day when daily plans are loaded
  useEffect(() => {
    if (dailyPlans && dailyPlans.length > 0 && !selectedDay) {
      setSelectedDay(dailyPlans[0].id);
    }
  }, [dailyPlans, selectedDay]);

  // Ensure daily plans align with the current trip date range even if older data exists.
  useEffect(() => {
    if (!currentTrip || plansLoading || dailyPlans.length === 0) return;

    const start = parseLocalDate(currentTrip.startDate);
    const end = parseLocalDate(currentTrip.endDate);
    const expectedStart = formatDateLocal(start);
    const expectedEnd = formatDateLocal(end);
    const dayCount = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // dailyPlans is sorted by date in the hook
    const actualStart = dailyPlans[0]?.date;
    const actualEnd = dailyPlans[dailyPlans.length - 1]?.date;

    if (actualStart !== expectedStart || actualEnd !== expectedEnd || dailyPlans.length !== dayCount) {
      const mapByDate = new Map(dailyPlans.map(d => [d.date, d]));
      const regenerated = [];
      let current = new Date(start);
      let id = 1;
      while (current <= end) {
        const dateStr = formatDateLocal(current);
        const existing = mapByDate.get(dateStr);
        regenerated.push({
          id: id++,
          date: dateStr,
          title: existing?.title || '',
          city: existing?.city || '',
          country: existing?.country || '',
          places: existing?.places || []
        });
        current.setDate(current.getDate() + 1);
      }

      replaceDailyPlans(regenerated).then(() => {
        if (regenerated.length > 0) {
          setSelectedDay(regenerated[0].id);
        }
      }).catch(err => {
        console.error('Failed to realign daily plans with trip dates:', err);
      });
    }
  }, [currentTrip, plansLoading, dailyPlans]);

  // Flight form state
  const [flightForm, setFlightForm] = useState({
    airline: '',
    flightNumber: '',
    from: '',
    to: '',
    date: '',
    departureTime: '',
    arrivalTime: '',
    bookingRef: ''
  });

  // Place form state
  const [placeForm, setPlaceForm] = useState({
    name: '',
    address: '',
    placeId: '',
    location: null,
    photoUrl: '',
    notes: '',
    transportMode: 'walking',
    transportTime: '',
    distance: '',
    priority: 0,
    metroStation: '',
    metroLine: '',
    visited: false
  });

  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'food',
    date: '',
    city: '',
    country: '',
    currency: 'USD'
  });

  const handleAddFlight = async () => {
    const newFlight = {
      id: Date.now(),
      ...flightForm
    };
    try {
      await saveFlight(newFlight);
      setFlightForm({
        airline: '',
        flightNumber: '',
        from: '',
        to: '',
        date: '',
        departureTime: '',
        arrivalTime: '',
        bookingRef: ''
      });
      setShowAddFlight(false);
    } catch (error) {
      console.error('Failed to add flight:', error);
      alert('Failed to add flight. Please try again.');
    }
  };

  const handleAddPlace = async () => {
    const selectedDayData = dailyPlans.find(d => d.id === selectedDay);
    let finalPlaceForm = { ...placeForm };

    // If there's a previous place and we have an API key, calculate distance and time
    if (selectedDayData && selectedDayData.places.length > 0 && mapsApiKey) {
      const previousPlace = selectedDayData.places[selectedDayData.places.length - 1];

      // First, calculate distance to determine the best default transport mode
      const distanceResult = await calculateDistanceAndTime(
        previousPlace.location || previousPlace.address,
        placeForm.location || placeForm.address,
        'walking' // Get walking distance first to determine mode
      );

      // Determine default transport mode based on distance
      let defaultMode = 'walking';
      if (!distanceResult.error && distanceResult.distance) {
        const distanceKm = parseFloat(distanceResult.distance);
        if (distanceKm >= 1) {
          defaultMode = 'transit';
        }
      }

      // Now calculate with the determined transport mode
      const result = await calculateDistanceAndTime(
        previousPlace.location || previousPlace.address,
        placeForm.location || placeForm.address,
        defaultMode
      );

      if (!result.error) {
        finalPlaceForm = {
          ...placeForm,
          transportMode: defaultMode,
          distance: result.distance,
          transportTime: result.time,
          isAutoCalculated: result.isAutoCalculated || false
        };
      }
    }
    
    const updatedPlans = dailyPlans.map(day => {
      if (day.id === selectedDay) {
        return {
          ...day,
        places: [...day.places, { id: Date.now(), ...finalPlaceForm }]
      };
      }
      return day;
    });
    setDailyPlans(updatedPlans);
    setPlaceForm({
      name: '',
      address: '',
      placeId: '',
      location: null,
      photoUrl: '',
      notes: '',
      transportMode: 'walking',
      priority: 0,
      transportTime: '',
      distance: '',
      metroStation: '',
      metroLine: '',
      visited: false
    });
    setShowAddPlace(false);
  };

  const handleAddExpense = async () => {
    const newExpense = {
      id: Date.now(),
      ...expenseForm
    };
    try {
      await saveExpense(newExpense);
      setExpenseForm({
        description: '',
        amount: '',
        category: 'food',
        date: '',
        city: '',
        country: '',
        currency: 'USD'
      });
      setExpenseCitySearch('');
      setExpenseCountrySearch('');
      setShowAddExpense(false);
    } catch (error) {
      console.error('Failed to add expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  const handleDeletePlace = (dayId, placeId) => {
    const updatedPlans = dailyPlans.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          places: day.places.filter(p => p.id !== placeId)
        };
      }
      return day;
    });
    setDailyPlans(updatedPlans);
  };

  const handleDragStart = (e, dayId, placeId) => {
    setDraggedItem({ dayId, placeId });
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setTimeout(() => setIsDragging(false), 100);
  };

  const handleDrop = async (e, dayId, targetPlaceId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem || draggedItem.placeId === targetPlaceId) {
      setDraggedItem(null);
      setTimeout(() => setIsDragging(false), 100);
      return;
    }

    const updatedPlans = dailyPlans.map(day => {
      if (day.id === dayId) {
        const places = [...day.places];
        const draggedIndex = places.findIndex(p => p.id === draggedItem.placeId);
        const targetIndex = places.findIndex(p => p.id === targetPlaceId);

        if (draggedIndex !== -1 && targetIndex !== -1) {
          const [removed] = places.splice(draggedIndex, 1);
          places.splice(targetIndex, 0, removed);
        }

        return { ...day, places };
      }
      return day;
    });

    setDailyPlans(updatedPlans);
    setDraggedItem(null);
    setTimeout(() => setIsDragging(false), 100);

    // Recalculate distances between places after reordering
    const dayToUpdate = updatedPlans.find(d => d.id === dayId);
    if (dayToUpdate && dayToUpdate.places.length > 1) {
      const recalculatedPlans = await Promise.all(
        updatedPlans.map(async (day) => {
          if (day.id === dayId) {
            const updatedPlaces = await Promise.all(
              day.places.map(async (place, index) => {
                if (index === 0) {
                  return place; // First place has no previous place
                }
                const prevPlace = day.places[index - 1];
                if (prevPlace.coordinates && place.coordinates) {
                  try {
                    const distanceData = await calculateDistanceAndTime(
                      prevPlace.coordinates,
                      place.coordinates,
                      place.transportMode || 'walking'
                    );
                    return {
                      ...place,
                      distance: distanceData.distance,
                      transportTime: distanceData.time
                    };
                  } catch (error) {
                    console.error('Error recalculating distance:', error);
                    return place;
                  }
                }
                return place;
              })
            );
            return { ...day, places: updatedPlaces };
          }
          return day;
        })
      );
      setDailyPlans(recalculatedPlans);
    }
  };

  const handleChangePriority = (dayId, placeId, newPriority) => {
    const updatedPlans = dailyPlans.map(day => {
      if (day.id === dayId) {
        const updatedPlaces = day.places.map(place => {
          if (place.id === placeId) {
            return { ...place, priority: newPriority };
          }
          return place;
        });
        return { ...day, places: updatedPlaces };
      }
      return day;
    });
    setDailyPlans(updatedPlans);
  };

  const handleChangeTransportMode = async (dayId, placeId, newMode) => {
    // Find the day and place
    const day = dailyPlans.find(d => d.id === dayId);
    if (!day) return;

    const placeIndex = day.places.findIndex(p => p.id === placeId);
    if (placeIndex <= 0) return; // Can't change transport mode for first place

    const place = day.places[placeIndex];
    const previousPlace = day.places[placeIndex - 1];

    // Close dropdown immediately for better UX
    setChangingTransportMode(null);

    // Update transport mode and clear old distance/time data
    let updatedPlans = dailyPlans.map(d => {
      if (d.id === dayId) {
        return {
          ...d,
          places: d.places.map(p =>
            p.id === placeId
              ? { ...p, transportMode: newMode, distance: '', transportTime: '', isAutoCalculated: false }
              : p
          )
        };
      }
      return d;
    });

    // Try to calculate distance and time with new mode
    let distanceData = { distance: '', time: '', error: null };
    if (mapsApiKey && previousPlace.address && place.address) {

      // Plane mode is always manual - no Google calculation
      if (newMode === 'plane') {
        // Leave empty for manual entry
        distanceData = { distance: '', time: '', error: null, isAutoCalculated: false };
      }
      // For transit (and legacy bus), try TRANSIT first, then fallback to DRIVING
      else if (newMode === 'transit' || newMode === 'bus') {
        // Try TRANSIT first
        distanceData = await calculateDistanceAndTime(
          previousPlace.address,
          place.address,
          'transit' // Uses TRANSIT mode
        );

        // If TRANSIT failed, try DRIVING as fallback
        if (distanceData.error || (!distanceData.distance && !distanceData.time)) {
          distanceData = await calculateDistanceAndTime(
            previousPlace.address,
            place.address,
            'car' // Uses DRIVING mode
          );
        }
      } else {
        distanceData = await calculateDistanceAndTime(
          previousPlace.address,
          place.address,
          newMode
        );
      }
    }

    // Update with calculated data (or leave empty for manual modes if calculation failed)
    if (distanceData.distance || distanceData.time) {
      updatedPlans = updatedPlans.map(d => {
        if (d.id === dayId) {
          return {
            ...d,
            places: d.places.map(p =>
              p.id === placeId
                ? {
                    ...p,
                    distance: distanceData.distance,
                    transportTime: distanceData.time,
                    isAutoCalculated: distanceData.isAutoCalculated || false
                  }
                : p
            )
          };
        }
        return d;
      });
    }

    // Only call setDailyPlans ONCE at the very end
    setDailyPlans(updatedPlans);
  };

  const handleDeleteFlight = async (flightId) => {
    try {
      await deleteFlightFromFirestore(flightId);
    } catch (error) {
      console.error('Failed to delete flight:', error);
      alert('Failed to delete flight. Please try again.');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await deleteExpenseFromFirestore(expenseId);
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const toggleVisited = (dayId, placeId) => {
    const updatedPlans = dailyPlans.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          places: day.places.map(p => 
            p.id === placeId ? { ...p, visited: !p.visited } : p
          )
        };
      }
      return day;
    });
    setDailyPlans(updatedPlans);
  };

  const normalizeLatLng = (value) => {
    if (value && typeof value === 'object' && typeof value.lat === 'number' && typeof value.lng === 'number') {
      return new window.google.maps.LatLng(value.lat, value.lng);
    }
    return value;
  };

  const calculateDistanceAndTime = async (origin, destination, mode) => {
    if (!mapsApiKey) {
      return { distance: '', time: '', error: 'API key not set' };
    }

    setCalculatingDistance(true);

    try {
      await waitForGoogleMaps();

      // Map our transport modes to Google Maps travel modes
      const travelModeMap = {
        walking: 'WALKING',
        transit: 'TRANSIT',
        car: 'DRIVING',
        plane: 'DRIVING', // Plane uses DRIVING as fallback but is handled separately
        // Legacy support for old data
        metro: 'TRANSIT',
        bus: 'TRANSIT',
        train: 'TRANSIT',
        other: 'DRIVING'
      };
      const travelMode = travelModeMap[mode] || 'WALKING';
      console.log('Travel mode mapping:', mode, '->', travelMode);

      const matrixResult = await new Promise((resolve, reject) => {
        if (!window.google?.maps) {
          return reject(new Error('Google Maps not loaded'));
        }

        const service = new window.google.maps.DistanceMatrixService();
        const normalizedOrigin = normalizeLatLng(origin);
        const normalizedDestination = normalizeLatLng(destination);
        service.getDistanceMatrix(
          {
            origins: [normalizedOrigin],
            destinations: [normalizedDestination],
            travelMode: travelMode,
          },
          (response, status) => {
            if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
              const element = response.rows[0].elements[0];
              const distanceKm = (element.distance.value / 1000).toFixed(1);
              const timeMin = Math.round(element.duration.value / 60);
              resolve({ distance: distanceKm, time: timeMin, error: null, isAutoCalculated: true });
            } else {
              reject(new Error('Could not calculate route'));
            }
          }
        );
      });

      setCalculatingDistance(false);
      return matrixResult;
    } catch (error) {
      setCalculatingDistance(false);
      return { distance: '', time: '', error: error.message };
    }
  };

  // Google Maps setup
  const [mapsReady, setMapsReady] = useState(typeof window !== 'undefined' && !!window.google?.maps);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const directionsRenderersRef = useRef([]);
  const currentInfoWindowRef = useRef(null);
  const lastSavedDailyPlansRef = useRef(null); // Track last saved state to prevent loops
  const isSavingRef = useRef(false); // Track if we're currently saving
  const [showMapPanel, setShowMapPanel] = useState(true);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapPlaceholderDismissed, setMapPlaceholderDismissed] = useState(false);
  const [changingTransportMode, setChangingTransportMode] = useState(null); // {dayId, placeId}
  const [editingManualDistance, setEditingManualDistance] = useState(null); // {dayId, placeId, distance, time}

  const waitForGoogleMaps = () => {
    if (mapsReady && window.google?.maps) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      let attempts = 0;
      const poll = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(poll);
          setMapsReady(true);
          resolve();
        } else if (attempts++ > 30) {
          clearInterval(poll);
          reject(new Error('Google Maps failed to load'));
        }
      }, 200);
    });
  };

  const fetchPlaceSuggestions = async (query) => {
    if (!mapsApiKey || !query || query.length < 3) {
      setPlaceSuggestions([]);
      return;
    }

    setPlaceSearchLoading(true);
    try {
      await waitForGoogleMaps();

      const hasNewAutocomplete = !!window.google.maps.places?.AutocompleteSuggestion?.fetchAutocompleteSuggestions;
      let predictions = [];

      if (hasNewAutocomplete) {
        // New AutocompleteSuggestion API
        const { suggestions } = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: query,
          includedPrimaryTypes: ['tourist_attraction', 'museum', 'restaurant', 'park', 'point_of_interest'],
        });

        predictions = await Promise.all(suggestions.map(async (s) => {
          const pred = s.placePrediction;
          const base = {
            place_id: pred.placeId,
            description: pred.text?.toString() || '',
            structured_formatting: {
              main_text: pred.structuredFormat?.mainText?.toString() || pred.text?.toString() || '',
              secondary_text: pred.structuredFormat?.secondaryText?.toString() || ''
            }
          };

          // Try to attach a small preview photo for the suggestion
          try {
            const place = new window.google.maps.places.Place({ id: pred.placeId });
            await place.fetchFields({ fields: ['photos'] });
            const photoUrl = getPhotoUrl(place.photos, 160);
            return { ...base, photoUrl };
          } catch (err) {
            console.warn('Failed to fetch photo for suggestion', pred.placeId, err);
            return base;
          }
        }));
      } else {
        // Legacy AutocompleteService fallback
        const service = new window.google.maps.places.AutocompleteService();
        const legacyPredictions = await new Promise((resolve, reject) => {
          service.getPlacePredictions(
            {
              input: query,
              types: ['tourist_attraction', 'restaurant', 'park', 'point_of_interest']
            },
            (results, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                resolve(results);
              } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                resolve([]);
              } else {
                reject(new Error(status));
              }
            }
          );
        });

        predictions = legacyPredictions.map(pred => ({
          place_id: pred.place_id,
          description: pred.description || '',
          structured_formatting: {
            main_text: pred.structured_formatting?.main_text || pred.description || '',
            secondary_text: pred.structured_formatting?.secondary_text || ''
          }
        }));
      }

      setPlaceSuggestions(predictions);
      setPlaceSearchLoading(false);
    } catch (error) {
      console.error('Place autocomplete failed:', error);
      setPlaceSuggestions([]);
      setPlaceSearchLoading(false);
    }
  };

  const handlePlaceSuggestionSelect = async (suggestion) => {
    try {
      await waitForGoogleMaps();

      const useNewPlaceApi = !!window.google.maps.places?.Place;
      let placeData = null;

      if (useNewPlaceApi) {
        // Use new Place API
        const place = new window.google.maps.places.Place({
          id: suggestion.place_id,
        });

        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location', 'photos']
        });

        const photoUrl = getPhotoUrl(place.photos, 600);

        placeData = {
          name: place.displayName || placeSearchTerm,
          address: place.formattedAddress || placeSearchTerm,
          placeId: suggestion.place_id,
          location: place.location ? { lat: place.location.lat(), lng: place.location.lng() } : null,
          photoUrl: photoUrl || '',
          notes: '',
          transportMode: 'walking',
          transportTime: '',
          distance: '',
          type: selectedAddType || 'place'
        };
      } else {
        // Legacy Place Details fallback
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        const result = await new Promise((resolve, reject) => {
          service.getDetails(
            { placeId: suggestion.place_id, fields: ['name', 'formatted_address', 'geometry', 'photos'] },
            (res, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && res) {
                resolve(res);
              } else {
                reject(new Error(status));
              }
            }
          );
        });

        const photoUrl = result.photos && result.photos.length > 0 ? result.photos[0].getUrl({ maxWidth: 600, maxHeight: 600 }) : '';

        placeData = {
          name: result.name || placeSearchTerm,
          address: result.formatted_address || placeSearchTerm,
          placeId: suggestion.place_id,
          location: result.geometry?.location
            ? { lat: result.geometry.location.lat(), lng: result.geometry.location.lng() }
            : null,
          photoUrl,
          notes: '',
          transportMode: 'walking',
          transportTime: '',
          distance: '',
          type: selectedAddType || 'place'
        };
      }

      // Auto-add the place immediately
      const selectedDayData = dailyPlans.find(d => d.id === selectedDay);
      let finalPlaceForm = { ...placeData };

      // If there's a previous place and we have an API key, calculate distance and time
      if (selectedDayData && selectedDayData.places.length > 0 && mapsApiKey) {
        const previousPlace = selectedDayData.places[selectedDayData.places.length - 1];

        // First, calculate distance to determine the best default transport mode
        const distanceResult = await calculateDistanceAndTime(
          previousPlace.location || previousPlace.address,
          placeData.location || placeData.address,
          'walking'
        );

        // Determine default transport mode based on distance
        let defaultMode = 'walking';
        if (!distanceResult.error && distanceResult.distance) {
          const distanceKm = parseFloat(distanceResult.distance);
          if (distanceKm >= 1) {
            defaultMode = 'transit';
          }
        }

        // Calculate with the determined transport mode
        const result = await calculateDistanceAndTime(
          previousPlace.location || previousPlace.address,
          placeData.location || placeData.address,
          defaultMode
        );

        if (!result.error) {
          finalPlaceForm = {
            ...placeData,
            transportMode: defaultMode,
            distance: result.distance,
            transportTime: result.time,
            isAutoCalculated: result.isAutoCalculated || false
          };
        }
      }

      // Add to daily plans
      const updatedPlans = dailyPlans.map(day => {
        if (day.id === selectedDay) {
          return {
            ...day,
            places: [...day.places, { id: Date.now(), ...finalPlaceForm }]
          };
        }
        return day;
      });
      setDailyPlans(updatedPlans);

      // Reset form
      setPlaceForm({
        name: '',
        address: '',
        placeId: '',
        location: null,
        photoUrl: '',
        notes: '',
        transportMode: 'walking',
        transportTime: '',
        distance: ''
      });
      setPlaceSearchTerm('');
      setPlaceSuggestions([]);
      setSelectedAddType(null); // Reset to show menu again
    } catch (error) {
      console.error('Failed to get place details:', error);
    }
  };

  // Load Google Maps API
  useEffect(() => {
    if (!mapsApiKey) return;
    if (window.google && window.google.maps) {
      setMapsReady(true);
      return;
    }

    const scriptId = 'google-maps-js';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsReady(true);
    script.onerror = () => console.error('Failed to load Google Maps script');
    document.head.appendChild(script);
  }, [mapsApiKey]);

  // Hide the default close button on InfoWindows
  useEffect(() => {
    if (!mapsReady) return;
    const styleId = 'hide-gm-close-button';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = '.gm-ui-hover-effect { display: none !important; }';
    document.head.appendChild(style);
  }, [mapsReady]);

  // Initialize map instance when panel is shown and Maps is ready
  useEffect(() => {
    if (!showMapPanel || !mapsReady || !mapRef.current) return;

    // Always recreate the map when showing the panel since the DOM element is recreated
    try {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 46.8182, lng: 8.2275 }, // Center of Switzerland
        zoom: 7,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Close info window when clicking on the map (not on a marker)
      mapInstanceRef.current.addListener('click', () => {
        if (currentInfoWindowRef.current) {
          currentInfoWindowRef.current.close();
          currentInfoWindowRef.current = null;
        }
      });
    } catch (error) {
      console.error('Error creating map instance:', error);
    }
  }, [showMapPanel, mapsReady]);

  // Clear markers and routes when hiding the map
  useEffect(() => {
    if (showMapPanel) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    directionsRenderersRef.current.forEach(r => r.setMap(null));
    directionsRenderersRef.current = [];
  }, [showMapPanel]);

  // Plot markers and routes for places on the selected day
  useEffect(() => {
    if (!showMapPanel || !mapsReady || !mapInstanceRef.current) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    directionsRenderersRef.current.forEach(r => r.setMap(null));
    directionsRenderersRef.current = [];

    if (!selectedDayData || !selectedDayData.places?.length) return;

    const bounds = new window.google.maps.LatLngBounds();
    let cancelled = false;
    setMapLoading(true);

    const plotPlace = (place, index) => new Promise(resolve => {
      const position = place.location && typeof place.location.lat === 'number' && typeof place.location.lng === 'number'
        ? new window.google.maps.LatLng(place.location.lat, place.location.lng)
        : null;

      const handleMarker = (pos) => {
        const marker = new window.google.maps.Marker({
          map: mapInstanceRef.current,
          position: pos,
          title: place.name || place.address || 'Place',
          label: {
            text: `${index + 1}`,
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }
        });
        const getTypeIcon = (type) => {
          const icons = {
            'place': '🏛️',
            'restaurant': '🍽️',
            'cafe': '☕',
            'activity': '📸',
            'note': '📝'
          };
          return icons[type] || '📍';
        };

        const transportIcons = { walking: '🚶', transit: '🚊', car: '🚗', plane: '✈️' };
        const priorityStars = place.priority ? '★'.repeat(Math.min(5, place.priority)) : '';
        const mapsLink = place.address || place.name
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address || place.name)}`
          : '';

        const infoContent = `
          <div style="max-width:300px;font-family:system-ui,-apple-system,sans-serif;color:#1f2937;">
            ${place.photoUrl ? `
              <div style="overflow:hidden;border-radius:12px;margin-bottom:10px;box-shadow:0 8px 20px rgba(0,0,0,0.08);position:relative;">
                <img src="${place.photoUrl}" alt="${place.name || 'Place photo'}" style="width:100%;height:170px;object-fit:cover;display:block;" />
                ${place.type ? `<span style="position:absolute;left:10px;top:10px;padding:4px 10px;border-radius:999px;background:rgba(0,0,0,0.55);color:#fff;font-size:11px;display:inline-flex;align-items:center;gap:6px;">${getTypeIcon(place.type)} ${place.type.charAt(0).toUpperCase() + place.type.slice(1)}</span>` : ''}
              </div>
            ` : ''}
            <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;">
              <span style="font-size:18px;">${getTypeIcon(place.type)}</span>
              <div style="flex:1;">
                <strong style="font-size:15px;color:#111827;display:block;">${place.name || 'Place'}</strong>
                ${place.address ? `<div style="color:#6b7280;font-size:12px;margin-top:2px;line-height:1.4;">${place.address}</div>` : ''}
              </div>
              ${priorityStars ? `<div style="background:#fff4e5;border:1px solid #fde68a;padding:4px 8px;border-radius:8px;font-size:11px;white-space:nowrap;">${priorityStars}</div>` : ''}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;font-size:11px;">
              ${place.visitTime ? `<div style="background:#f3f4f6;padding:4px 8px;border-radius:6px;">🕐 ${place.visitTime}</div>` : ''}
              ${place.duration ? `<div style="background:#f3f4f6;padding:4px 8px;border-radius:6px;">⏱️ ${place.duration}h</div>` : ''}
              ${place.cost ? `<div style="background:#f3f4f6;padding:4px 8px;border-radius:6px;">💰 ${place.cost} ${getCurrencySymbol(place.currency)}</div>` : ''}
              ${place.transportMode || place.distance || place.transportTime ? `
                <div style="background:#e0f2fe;padding:4px 8px;border-radius:6px;display:flex;align-items:center;gap:6px;">
                  <span>${transportIcons[place.transportMode] || '🧭'}</span>
                  <span style="color:#0f172a;">
                    ${place.transportMode ? place.transportMode.charAt(0).toUpperCase() + place.transportMode.slice(1) : 'Route'}
                    ${place.distance ? ` • ${place.distance} km` : ''}${place.transportTime ? ` • ${place.transportTime} min` : ''}
                  </span>
                </div>
              ` : ''}
            </div>
            ${place.notes ? `<div style="margin-top:10px;padding:10px;background:#f9fafb;border-radius:10px;font-size:12px;color:#4b5563;line-height:1.4;">${place.notes}</div>` : ''}
            ${mapsLink ? `<a href="${mapsLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:10px;font-size:12px;color:#2563eb;text-decoration:none;">Open in Google Maps →</a>` : ''}
          </div>
        `;

        const info = new window.google.maps.InfoWindow({
          content: infoContent
        });
        marker.addListener('click', () => {
          // Close currently open info window
          if (currentInfoWindowRef.current) {
            currentInfoWindowRef.current.close();
          }
          // Open new info window
          info.open({ anchor: marker, map: mapInstanceRef.current });
          currentInfoWindowRef.current = info;
        });
        markersRef.current.push(marker);
        bounds.extend(pos);
        resolve(pos);
      };

      if (position) {
        handleMarker(position);
        return;
      }

      const target = place.address || place.name;
      if (!target) return resolve(null);
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: target }, (results, status) => {
        if (cancelled) return resolve(null);
        if (status === 'OK' && results[0]) {
          handleMarker(results[0].geometry.location);
        } else {
          resolve(null);
        }
      });
    });

    Promise.all(selectedDayData.places.map((place, index) => plotPlace(place, index))).then((positions) => {
      if (cancelled) return;

      // Draw routes between consecutive places
      const validPositions = positions.filter(p => p !== null);
      if (validPositions.length > 1) {
        for (let i = 0; i < validPositions.length - 1; i++) {
          const place = selectedDayData.places[i + 1];
          const travelModeMap = {
            walking: 'WALKING',
            transit: 'TRANSIT',
            car: 'DRIVING',
            plane: 'DRIVING', // Plane uses DRIVING as fallback but is handled separately
            // Legacy support for old data
            metro: 'TRANSIT',
            bus: 'TRANSIT',
            train: 'TRANSIT',
            other: 'DRIVING'
          };
          const travelMode = travelModeMap[place.transportMode] || 'WALKING';

          const directionsService = new window.google.maps.DirectionsService();
          const directionsRenderer = new window.google.maps.DirectionsRenderer({
            map: mapInstanceRef.current,
            suppressMarkers: true, // We're using our own markers
            polylineOptions: {
              strokeColor: '#4ECDC4',
              strokeWeight: 3,
              strokeOpacity: 0.7
            }
          });

          directionsService.route({
            origin: validPositions[i],
            destination: validPositions[i + 1],
            travelMode: travelMode
          }, (result, status) => {
            if (status === 'OK' && !cancelled) {
              directionsRenderer.setDirections(result);
              directionsRenderersRef.current.push(directionsRenderer);
            }
          });
        }
      }

      setMapLoading(false);
      if (!bounds.isEmpty()) {
        mapInstanceRef.current.fitBounds(bounds);
      }
    }).catch(() => setMapLoading(false));

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMapPanel, mapsReady, mapDependencyKey]);

  // Close transport mode dropdown when clicking outside
  useEffect(() => {
    if (!changingTransportMode) return;

    const handleClickOutside = () => {
      setChangingTransportMode(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [changingTransportMode]);

  // Auto-save to Firestore whenever data changes (with debouncing)
  useEffect(() => {
    if (dailyPlans.length > 0 && currentUser && !plansLoading) {
      // Check if dailyPlans actually changed from what we last saved
      const currentState = JSON.stringify(dailyPlans);
      if (lastSavedDailyPlansRef.current === currentState) {
        return;
      }

      const timer = setTimeout(async () => {
        isSavingRef.current = true;
        lastSavedDailyPlansRef.current = currentState; // Store what we're saving
        try {
          await saveDailyPlans(dailyPlans);
        } catch (err) {
          console.error('Failed to save daily plans:', err);
        } finally {
          // Wait a bit before allowing updates again to prevent race conditions
          setTimeout(() => {
            isSavingRef.current = false;
          }, 100);
        }
      }, 3000); // Increased debounce to 3 seconds to dramatically reduce saves
      return () => clearTimeout(timer);
    }
  }, [dailyPlans, currentUser, plansLoading]);

  useEffect(() => {
    if (flights.length >= 0 && currentUser && !flightsLoading) {
      // Individual flights are saved through saveFlight, we just need this for bulk operations
    }
  }, [flights]);

  useEffect(() => {
    if (expenses.length >= 0 && currentUser && !expensesLoading) {
      // Individual expenses are saved through saveExpense, we just need this for bulk operations
    }
  }, [expenses]);

  // Filter cities based on search term and trip countries
  const getFilteredCities = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 1) return [];
    const term = searchTerm.toLowerCase();
    const citiesList = getCitiesList(currentTrip?.countries);
    return citiesList
      .filter(({ city }) => city.toLowerCase().includes(term))
      .slice(0, 10);
  };

  // Get unique countries (filtered by trip countries if available)
  const getFilteredCountries = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 1) return [];
    const term = searchTerm.toLowerCase();
    const availableCountries = currentTrip?.countries && currentTrip.countries.length > 0
      ? currentTrip.countries
      : Object.keys(CITIES_DATABASE);

    return availableCountries
      .filter(country => country.toLowerCase().includes(term));
  };

  // Handle trip edit
  const handleEditTrip = () => {
    setTripForm({
      name: currentTrip.name,
      startDate: currentTrip.startDate,
      endDate: currentTrip.endDate
    });
    setShowEditTripModal(true);
  };

  const handleStartEditingTripName = () => {
    setTripForm({ ...tripForm, name: currentTrip.name });
    setEditingTripName(true);
  };

  const handleStartEditingTripDates = () => {
    setTripForm({ 
      ...tripForm, 
      startDate: currentTrip.startDate,
      endDate: currentTrip.endDate 
    });
    // initialize dateRange from currentTrip using local dates to avoid timezone shifts
    const start = currentTrip?.startDate ? parseLocalDate(currentTrip.startDate) : new Date();
    const end = currentTrip?.endDate ? parseLocalDate(currentTrip.endDate) : new Date();
    setDateRange([{ startDate: start, endDate: end, key: 'selection' }]);
    setEditingTripDates(true);
  };

// helper: format a Date into local YYYY-MM-DD without timezone shifting
const formatDateLocal = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// helper: parse a stored YYYY-MM-DD string into a local Date (avoids UTC shift)
const parseLocalDate = (value) => {
  if (!value) return new Date();
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  if (typeof value === 'string') {
    const [y, m, d] = value.split('-').map(Number);
    if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
      return new Date(y, m - 1, d);
    }
  }
  return new Date(value);
};

  const handleSaveTripName = async () => {
    if (tripForm.name.trim() && currentTrip) {
      try {
        const updatedTrip = { ...currentTrip, name: tripForm.name };
        await saveTrip(updatedTrip);
        await saveCurrentTrip(updatedTrip);
      } catch (error) {
        console.error('Failed to save trip name:', error);
        alert('Failed to save trip name. Please try again.');
      }
    }
    setEditingTripName(false);
  };

  const handleSaveTripDates = async () => {
    // Close the date editor immediately (optimistic UI), then persist changes.
    setEditingTripDates(false);

    // Prefer explicit values from the DateRange selection to avoid relying on
    // possibly-stale `tripForm` state when the user clicks Save quickly.
    const sel = dateRange && dateRange[0] ? dateRange[0] : null;
    const startDateToSave = sel && sel.startDate ? formatDateLocal(new Date(sel.startDate)) : tripForm.startDate;
    const endDateToSave = sel && sel.endDate ? formatDateLocal(new Date(sel.endDate)) : tripForm.endDate;

    if (startDateToSave && endDateToSave && currentTrip) {
      try {
        const updatedTrip = {
          ...currentTrip,
          startDate: startDateToSave,
          endDate: endDateToSave
        };
        await saveTrip(updatedTrip);
        await saveCurrentTrip(updatedTrip);

        // Regenerate daily plans if dates changed
        if (startDateToSave !== currentTrip.startDate || endDateToSave !== currentTrip.endDate) {
          const days = [];
          const start = parseLocalDate(startDateToSave);
          const end = parseLocalDate(endDateToSave);
          let current = new Date(start);
          let dayId = 1;

          while (current <= end) {
            const dateStr = formatDateLocal(current);
            const existingDay = dailyPlans.find(d => d.date === dateStr);

            days.push({
              id: dayId++,
              date: dateStr,
              title: existingDay?.title || '',
              city: existingDay?.city || '',
              country: existingDay?.country || '',
              places: existingDay?.places || []
            });
            current.setDate(current.getDate() + 1);
          }

          await replaceDailyPlans(days);
          setSelectedDay(days[0]?.id);
        }
      } catch (error) {
        console.error('Failed to save trip dates:', error);
        alert('Failed to save trip dates. Please try again.');
      }
    }
  };

  const handleStartEditingDayTitle = (currentTitle) => {
    setDayTitleValue(currentTitle);
    setEditingDayTitle(true);
  };

  const handleSaveDayTitle = () => {
    const updated = dailyPlans.map(d => 
      d.id === selectedDay ? { ...d, title: dayTitleValue } : d
    );
    setDailyPlans(updated);
    setEditingDayTitle(false);
  };

  const handleSaveTripEdit = async () => {
    if (!currentTrip) return;

    try {
      // Update current trip
      const updatedTrip = {
        ...currentTrip,
        name: tripForm.name,
        startDate: tripForm.startDate,
        endDate: tripForm.endDate
      };
      await saveTrip(updatedTrip);
      await saveCurrentTrip(updatedTrip);

      // Regenerate daily plans if dates changed
      if (tripForm.startDate !== currentTrip.startDate || tripForm.endDate !== currentTrip.endDate) {
        const days = [];
        const start = parseLocalDate(tripForm.startDate);
        const end = parseLocalDate(tripForm.endDate);
        let current = new Date(start);
        let dayId = 1;

        while (current <= end) {
          const dateStr = formatDateLocal(current);
          // Try to find existing day data
          const existingDay = dailyPlans.find(d => d.date === dateStr);

          days.push({
            id: dayId++,
            date: dateStr,
            title: existingDay?.title || '',
            city: existingDay?.city || '',
            country: existingDay?.country || '',
            places: existingDay?.places || []
          });
          current.setDate(current.getDate() + 1);
        }

        await replaceDailyPlans(days);
        setSelectedDay(days[0]?.id);
      }

      setShowEditTripModal(false);
    } catch (error) {
      console.error('Failed to save trip:', error);
      alert('Failed to save trip. Please try again.');
    }
  };

  const openInGoogleMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const getRouteInGoogleMaps = (origin, destination) => {
    const encodeLocation = (loc) => {
      if (loc && typeof loc === 'object' && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
        return `${loc.lat},${loc.lng}`;
      }
      return encodeURIComponent(loc || '');
    };

    const encodedOrigin = encodeLocation(origin);
    const encodedDest = encodeLocation(destination);
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDest}`, '_blank');
  };

  // close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Analytics calculations
  const getTotalExpensesByCategory = () => {
    const byCategory = {};
    expenses.forEach(exp => {
      byCategory[exp.category] = (byCategory[exp.category] || 0) + parseFloat(exp.amount || 0);
    });
    return byCategory;
  };

  const getTotalExpensesByCity = () => {
    const byCity = {};
    expenses.forEach(exp => {
      if (exp.city) {
        byCity[exp.city] = (byCity[exp.city] || 0) + parseFloat(exp.amount || 0);
      }
    });
    return byCity;
  };

  const getTotalExpensesByCountry = () => {
    const byCountry = {};
    expenses.forEach(exp => {
      if (exp.country) {
        byCountry[exp.country] = (byCountry[exp.country] || 0) + parseFloat(exp.amount || 0);
      }
    });
    return byCountry;
  };

  const getTotalDistanceByMode = () => {
    const distances = { walking: 0, metro: 0, bus: 0, train: 0, car: 0, other: 0 };
    dailyPlans.forEach(day => {
      day.places.forEach(place => {
        const dist = parseFloat(place.distance || 0);
        distances[place.transportMode] = (distances[place.transportMode] || 0) + dist;
      });
    });
    return distances;
  };

  const getTotalDistanceByCity = () => {
    const byCity = {};
    dailyPlans.forEach(day => {
      if (day.city) {
        const cityTotal = day.places.reduce((sum, place) => 
          sum + parseFloat(place.distance || 0), 0
        );
        byCity[day.city] = (byCity[day.city] || 0) + cityTotal;
      }
    });
    return byCity;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                <span className="h-10 w-10 rounded-full bg-[#FF6B6B] flex items-center justify-center text-white shadow-sm">
                  <MapPin className="text-white" size={20} />
                </span>
                <span>Travel Planner</span>
              </h1>
              
              {currentTrip && (
                <div className="space-y-2">
                  {/* Trip Name - Inline Edit */}
                  {editingTripName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tripForm.name}
                        onChange={(e) => setTripForm({ ...tripForm, name: e.target.value })}
                        onBlur={handleSaveTripName}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTripName();
                          if (e.key === 'Escape') setEditingTripName(false);
                        }}
                        autoFocus
                        className="px-3 py-1 rounded border border-gray-200 bg-white text-lg font-medium flex-1 outline-none focus:border-[#FF6B6B]"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={handleStartEditingTripName}
                      className="cursor-pointer hover:bg-gray-50 px-3 py-1 rounded transition-colors inline-block"
                    >
                      <span className="text-lg font-medium text-gray-900">{currentTrip.name}</span>
                    </div>
                  )}

                  {/* Trip Dates - Inline Edit */}
                  <div className="hidden sm:block">
                    {editingTripDates ? (
                      <div className="mt-2 flex justify-start">
                        <div className="inline-block bg-white border-2 border-gray-200 rounded-xl shadow-lg p-4">
                          <DateRange
                            ranges={dateRange}
                            onChange={ranges => {
                              const sel = ranges.selection;
                              setDateRange([sel]);
                              setTripForm({
                                ...tripForm,
                                startDate: formatDateLocal(new Date(sel.startDate)),
                                endDate: formatDateLocal(new Date(sel.endDate)),
                              });
                            }}
                            months={2}
                            direction="horizontal"
                            showDateDisplay={false}
                            rangeColors={["#FF6B6B"]}
                            className="rounded-xl"
                          />
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={handleSaveTripDates}
                              className="px-3 py-2 bg-[#FF6B6B] text-white rounded-lg text-sm hover:bg-[#E85555] transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingTripDates(false)}
                              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={handleStartEditingTripDates}
                        className="cursor-pointer hover:bg-white/20 px-3 py-1 rounded transition-colors inline-block"
                      >
                        <span className="text-sm text-gray-600">
                          {parseLocalDate(currentTrip.startDate).toLocaleDateString()} - {parseLocalDate(currentTrip.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 items-center relative">
              {/* Back button */}
              <button
                onClick={async () => {
                  try {
                    await saveCurrentTrip({ id: null, name: null, startDate: null, endDate: null, countries: [] });
                    onExitTrip();
                  } catch (error) {
                    console.error('Failed to go back to trip setup:', error);
                  }
                }}
                className="w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-[#FF6B6B] hover:border-[#FF6B6B]/40 flex items-center justify-center transition-colors shadow-sm"
                title="Back to trip setup"
              >
                <ArrowLeft size={20} />
              </button>

              {/* Day Mode button */}
              <button
                onClick={onEnterDayMode}
                className="px-4 py-2 bg-white rounded-full flex items-center gap-2 transition-all hover:shadow-md border border-gray-200 text-gray-700 hover:text-[#FF6B6B] hover:border-[#FF6B6B]/40"
                title="Switch to Day Mode"
              >
                <Calendar size={18} />
                <span className="text-gray-800 font-medium text-sm hidden sm:inline">Day Mode</span>
              </button>

              {/* Avatar-only button that opens a user menu with Setup API, Account Settings and Sign Out */}
              {currentUser && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(prev => !prev)}
                    className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center focus:outline-none border border-gray-100"
                    title={currentUser.displayName || currentUser.email}
                  >
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-10 h-10 rounded-full object-cover border-2 border-white/50" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-medium border-2 border-white">
                        {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
                      <div className="px-3 py-2 border-b">
                        <div className="text-sm font-medium text-gray-800">{currentUser.displayName || 'Account'}</div>
                        <div className="text-xs text-gray-500 truncate">{currentUser.email}</div>
                      </div>
                      <button
                        onClick={() => { setShowApiKeyModal(true); setShowUserMenu(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <MapIcon size={16} className="text-gray-600" />
                        <span className="text-sm text-gray-700">Setup API</span>
                      </button>
                      <button
                        onClick={() => { setShowAccountSettings(true); setShowUserMenu(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <User size={16} className="text-gray-600" />
                        <span className="text-sm text-gray-700">Account Settings</span>
                      </button>
                      <button
                        onClick={async () => {
                          setShowUserMenu(false);
                          try {
                            await saveCurrentTrip({ id: null, name: null, startDate: null, endDate: null, countries: [] });
                            onExitTrip();
                          } catch (error) {
                            console.error('Failed to start new trip:', error);
                            alert('Failed to start new trip. Please try again.');
                          }
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 border-t"
                      >
                        <Plus size={16} className="text-gray-600" />
                        <span className="text-sm text-gray-700">Start New Trip</span>
                      </button>
                      <button
                        onClick={async () => { setShowUserMenu(false); if (window.confirm('Are you sure you want to sign out?')) { await signOut(); } }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600 border-t"
                      >
                        <LogOut size={16} />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-4 sm:mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 font-medium flex items-center justify-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'itinerary' ? 'border-b-3 border-[#FF6B6B] text-[#FF6B6B]' : 'text-gray-600 hover:text-[#FF6B6B]'
              }`}
            >
              <Calendar size={20} />
              <span className="hidden sm:inline">Daily Plans</span>
              <span className="sm:hidden">Plans</span>
            </button>
            <button
              onClick={() => setActiveTab('flights')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 font-medium flex items-center justify-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'flights' ? 'border-b-3 border-[#4ECDC4] text-[#4ECDC4]' : 'text-gray-600 hover:text-[#4ECDC4]'
              }`}
            >
              <Plane size={20} />
              <span>Flights</span>
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 font-medium flex items-center justify-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'expenses' ? 'border-b-3 border-[#FFE66D] text-[#F7B731]' : 'text-gray-600 hover:text-[#F7B731]'
              }`}
            >
              <DollarSign size={20} />
              <span>Expenses</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 font-medium flex items-center justify-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'analytics' ? 'border-b-3 border-[#26DE81] text-[#26DE81]' : 'text-gray-600 hover:text-[#26DE81]'
              }`}
            >
              <TrendingUp size={20} />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-6">
          
          {/* ITINERARY TAB */}
          {activeTab === 'itinerary' && (
            <div className={`grid gap-4 items-start ${showMapPanel ? 'grid-cols-1 lg:grid-cols-[60%_40%]' : 'grid-cols-1'}`}>
              <div className="space-y-6">
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#FF6B6B] flex items-center justify-center text-white shadow-sm">
                        <Calendar size={18} className="text-white" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-base font-semibold text-gray-800">Itinerary</span>
                        <span className="text-xs text-gray-500">Your daily plan</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowMapPanel(prev => !prev)}
                      className="h-10 w-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:text-[#4ECDC4] hover:border-[#4ECDC4]/40 bg-white shadow-sm transition-all hover:-translate-y-0.5"
                      title={showMapPanel ? 'Hide Map' : 'Show Map'}
                    >
                      <FaMapMarkedAlt size={18} />
                    </button>
                  </div>

                  {/* Day Selector */}
                  <div className="border-t border-gray-100 px-3 py-3 bg-white/60">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => scrollDayChips('left')}
                        className="h-10 w-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:text-[#FF6B6B] hover:border-[#FF6B6B]/40 bg-white shadow-sm transition-all hover:-translate-y-0.5"
                        title="Previous days"
                      >
                        <IoIosArrowBack size={18} />
                      </button>
                      <div className="relative flex-1 overflow-hidden">
                        <div
                          ref={dayChipsRef}
                          className="flex items-center gap-2 px-2 scroll-smooth overflow-x-auto"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                        >
                            {dailyPlans.map((day, index) => {
                            return (
                              <button
                                key={day.id}
                                onClick={() => setSelectedDay(day.id)}
                                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                                  selectedDay === day.id
                                  ? 'bg-[#FF6B6B] text-white shadow-md scale-[1.03]'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:border-[#FF6B6B]/40 hover:text-[#FF6B6B] hover:-translate-y-0.5'
                                }`}
                              >
                                <div className="text-[11px] uppercase tracking-wide">{parseLocalDate(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                <div className="text-xs text-gray-600">{parseLocalDate(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <button
                        onClick={() => scrollDayChips('right')}
                        className="h-10 w-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:text-[#FF6B6B] hover:border-[#FF6B6B]/40 bg-white shadow-sm transition-all hover:-translate-y-0.5"
                        title="Next days"
                      >
                        <IoIosArrowForward size={18} />
                      </button>
                    </div>
                  </div>
                </div>

              {selectedDayData && (
                <div className="rounded-2xl border border-gray-100 shadow-md overflow-visible bg-white">
                  {/* Day Info */}
                  <div className="p-4 sm:p-5 border-b border-gray-100 bg-white">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="hidden sm:block w-1 self-stretch bg-[#FF6B6B] rounded-full opacity-80"></div>
                        <div className="flex flex-col gap-1">
                          {editingDayTitle ? (
                            <input
                              type="text"
                              value={dayTitleValue}
                              onChange={(e) => setDayTitleValue(e.target.value)}
                              onBlur={handleSaveDayTitle}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveDayTitle();
                                if (e.key === 'Escape') setEditingDayTitle(false);
                              }}
                              autoFocus
                              placeholder={`Day ${dailyPlans.findIndex(d => d.id === selectedDay) + 1}`}
                              className="w-full px-3 py-2 rounded-lg bg-white/90 border border-[#FF6B6B]/30 text-lg font-semibold text-[#FF6B6B] outline-none shadow-sm"
                            />
                          ) : (
                            <div
                              onClick={() => handleStartEditingDayTitle(selectedDayData.title)}
                              className="w-full px-0 py-1 rounded cursor-pointer text-lg font-semibold text-[#FF6B6B] hover:text-[#E85A5A] transition-colors"
                            >
                              {selectedDayData.title || `Day ${dailyPlans.findIndex(d => d.id === selectedDay) + 1}`}
                            </div>
                          )}
                          <div className="text-xs uppercase tracking-[0.08em] text-gray-500">
                            {parseLocalDate(selectedDayData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      {/* Smart Summaries */}
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 flex-wrap">
                        <div className="flex items-center gap-1 bg-white/70 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm" title="Total stops">
                          <FaMapMarkerAlt className="text-[#FF6B6B]" size={14} />
                          <span className="font-semibold">{daySummaries[selectedDay]?.totalStops ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/70 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm" title="Total walking distance">
                          <span>🚶</span>
                          <span className="font-semibold">
                            {(daySummaries[selectedDay]?.totalDistance ?? 0).toFixed(1)} km
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/70 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm" title="Estimated total time">
                          <span>⏱</span>
                          <span className="font-semibold">
                            {daySummaries[selectedDay]?.totalTime ?? 0} min
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/70 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm" title="Expected daily cost">
                          <span>💶</span>
                          <span className="font-semibold">
                            €{(daySummaries[selectedDay]?.totalCost ?? 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Places List */}
                  <div className="space-y-3 p-3 sm:p-5 bg-white">
                    {selectedDayData.places.map((place, index) => (
                      <React.Fragment key={place.id}>
                        {/* Transportation Info - Between places */}
                        {!place.visited && index > 0 && (
                          <div className="relative py-3">
                            {/* Transport summary left, aligned with place card */}
                            <div className="ml-[3.25rem] flex justify-start">
                              <div className="relative">
                                {/* Compact single-line display */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setChangingTransportMode(
                                      changingTransportMode?.dayId === selectedDay && changingTransportMode?.placeId === place.id
                                        ? null
                                        : { dayId: selectedDay, placeId: place.id }
                                    );
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4ECDC4]/5 hover:bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 hover:border-[#4ECDC4]/40 transition-all cursor-pointer text-xs"
                                >
                                  {/* Icon */}
                                  {place.transportMode === 'walking' && <FaWalking size={14} className="text-[#4ECDC4]" />}
                                  {place.transportMode === 'car' && <FaCar size={14} className="text-[#4ECDC4]" />}
                                  {place.transportMode === 'transit' && <FaSubway size={14} className="text-[#4ECDC4]" />}
                                  {place.transportMode === 'plane' && <Plane size={14} className="text-[#4ECDC4]" />}
                                  {/* Legacy support */}
                                  {(place.transportMode === 'bus' || place.transportMode === 'metro' || place.transportMode === 'train') && <FaSubway size={14} className="text-[#4ECDC4]" />}

                                  {/* Time */}
                                  {!place.isAutoCalculated && editingManualDistance?.dayId === selectedDay && editingManualDistance?.placeId === place.id && editingManualDistance?.field === 'time' ? (
                                    <input
                                      type="number"
                                      value={editingManualDistance.value}
                                      onChange={(e) => setEditingManualDistance({ ...editingManualDistance, value: e.target.value })}
                                      onBlur={() => {
                                        const updatedPlans = dailyPlans.map(d => ({
                                          ...d,
                                          places: d.places.map(p =>
                                            p.id === place.id && d.id === selectedDay
                                              ? { ...p, transportTime: editingManualDistance.value, isAutoCalculated: false }
                                              : p
                                          )
                                        }));
                                        setDailyPlans(updatedPlans);
                                        setEditingManualDistance(null);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') e.target.blur();
                                        if (e.key === 'Escape') setEditingManualDistance(null);
                                        e.stopPropagation();
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      autoFocus
                                      className="w-10 px-1 font-semibold text-gray-700 bg-white rounded border border-[#4ECDC4] outline-none"
                                    />
                                  ) : (
                                    <span
                                      onClick={(e) => {
                                        if (!place.isAutoCalculated) {
                                          e.stopPropagation();
                                          setEditingManualDistance({ dayId: selectedDay, placeId: place.id, field: 'time', value: place.transportTime || '' });
                                        }
                                      }}
                                      className={`font-semibold ${
                                        place.isAutoCalculated ? 'text-gray-700' : 'text-gray-600'
                                      }`}
                                    >
                                      {place.transportTime || '--'} min
                                    </span>
                                  )}

                                  <span className="text-gray-400">|</span>

                                  {/* Distance */}
                                  {!place.isAutoCalculated && editingManualDistance?.dayId === selectedDay && editingManualDistance?.placeId === place.id && editingManualDistance?.field === 'distance' ? (
                                    <input
                                      type="number"
                                      step="0.1"
                                      value={editingManualDistance.value}
                                      onChange={(e) => setEditingManualDistance({ ...editingManualDistance, value: e.target.value })}
                                      onBlur={() => {
                                        const updatedPlans = dailyPlans.map(d => ({
                                          ...d,
                                          places: d.places.map(p =>
                                            p.id === place.id && d.id === selectedDay
                                              ? { ...p, distance: editingManualDistance.value, isAutoCalculated: false }
                                              : p
                                          )
                                        }));
                                        setDailyPlans(updatedPlans);
                                        setEditingManualDistance(null);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') e.target.blur();
                                        if (e.key === 'Escape') setEditingManualDistance(null);
                                        e.stopPropagation();
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      autoFocus
                                      className="w-10 px-1 font-semibold text-gray-700 bg-white rounded border border-[#4ECDC4] outline-none"
                                    />
                                  ) : (
                                    <span
                                      onClick={(e) => {
                                        if (!place.isAutoCalculated) {
                                          e.stopPropagation();
                                          setEditingManualDistance({ dayId: selectedDay, placeId: place.id, field: 'distance', value: place.distance || '' });
                                        }
                                      }}
                                      className={`font-semibold ${
                                        place.isAutoCalculated ? 'text-gray-700' : 'text-gray-600'
                                      }`}
                                    >
                                      {place.distance ? `${place.distance} km` : (place.transportTime ? '-- km' : '--')}
                                    </span>
                                  )}

                                  <ChevronDown size={12} className="text-gray-400" />
                                </button>
                                {/* Dropdown Menu */}
                                {changingTransportMode?.dayId === selectedDay && changingTransportMode?.placeId === place.id && (
                                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[140px]">
                                    {['walking', 'car', 'transit', 'plane'].map((mode, idx, arr) => (
                                      <button
                                        key={mode}
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleChangeTransportMode(selectedDay, place.id, mode);
                                        }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors ${
                                          place.transportMode === mode ? 'bg-[#4ECDC4]/10' : ''
                                        } ${idx === 0 ? 'rounded-t-lg' : ''} ${idx === arr.length - 1 ? 'rounded-b-lg' : ''}`}
                                      >
                                        {mode === 'walking' && <FaWalking size={16} className="text-[#4ECDC4]" />}
                                        {mode === 'car' && <FaCar size={16} className="text-[#4ECDC4]" />}
                                        {mode === 'transit' && <FaSubway size={16} className="text-[#4ECDC4]" />}
                                        {mode === 'plane' && <Plane size={16} className="text-[#4ECDC4]" />}
                                        <span className="text-sm font-medium text-gray-700">{mode === 'transit' ? 'Transport' : mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Centered Insert Button */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInsertingAtIndex(insertingAtIndex === index ? null : index);
                                }}
                                className="text-teal-500 hover:text-teal-600 transition-colors cursor-pointer pointer-events-auto"
                                title="Add place here"
                              >
                                <IoIosAddCircle size={28} />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Dropdown Menu and Form for Insert (between places) */}
                        {index > 0 && insertingAtIndex === index && (
                          <div className="my-2" ref={insertMenuRef}>
                            {!selectedAddType && (
                              <div className="absolute left-1/2 -translate-x-1/2 z-20 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 p-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAddType('place');
                                  }}
                                  className="w-full px-2.5 py-1.5 hover:bg-gray-50 transition-colors flex items-center gap-2 rounded-lg"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Building size={14} />
                                  </div>
                                  <div className="text-left">
                                    <div className="font-semibold text-sm text-gray-900 leading-tight">Place / Attraction</div>
                                  </div>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAddType('restaurant');
                                  }}
                                  className="w-full px-2.5 py-1.5 hover:bg-gray-50 transition-colors flex items-center gap-2 rounded-lg"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                    <FaUtensils size={13} />
                                  </div>
                                  <div className="text-left">
                                    <div className="font-semibold text-sm text-gray-900 leading-tight">Restaurant</div>
                                  </div>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAddType('cafe');
                                  }}
                                  className="w-full px-2.5 py-1.5 hover:bg-gray-50 transition-colors flex items-center gap-2 rounded-lg"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                                    <Coffee size={14} />
                                  </div>
                                  <div className="text-left">
                                    <div className="font-semibold text-sm text-gray-900 leading-tight">Café / Bar</div>
                                  </div>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAddType('activity');
                                  }}
                                  className="w-full px-2.5 py-1.5 hover:bg-gray-50 transition-colors flex items-center gap-2 rounded-lg"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                    <Camera size={14} />
                                  </div>
                                  <div className="text-left">
                                    <div className="font-semibold text-sm text-gray-900 leading-tight">Activity</div>
                                  </div>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAddType('note');
                                  }}
                                  className="w-full px-2.5 py-1.5 hover:bg-gray-50 transition-colors flex items-center gap-2 rounded-lg"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                    <StickyNote size={14} />
                                  </div>
                                  <div className="text-left">
                                    <div className="font-semibold text-sm text-gray-900 leading-tight">Note</div>
                                  </div>
                                </button>
                              </div>
                            )}

                            {selectedAddType && (
                              <div className="p-3 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                                <div className="flex items-center gap-2">
                                  <div className="flex-shrink-0">
                                    {selectedAddType === 'place' && <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center"><Building size={12} className="text-white" /></div>}
                                    {selectedAddType === 'restaurant' && <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center"><FaUtensils size={10} className="text-white" /></div>}
                                    {selectedAddType === 'cafe' && <div className="w-6 h-6 rounded-lg bg-amber-600 flex items-center justify-center"><Coffee size={12} className="text-white" /></div>}
                                    {selectedAddType === 'activity' && <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center"><Camera size={12} className="text-white" /></div>}
                                    {selectedAddType === 'note' && <div className="w-6 h-6 rounded-lg bg-purple-500 flex items-center justify-center"><StickyNote size={12} className="text-white" /></div>}
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Type name and press Enter..."
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && e.target.value.trim()) {
                                        const newPlace = {
                                          id: Date.now(),
                                          name: e.target.value.trim(),
                                          type: selectedAddType,
                                          address: '',
                                          notes: '',
                                          visited: false,
                                          transportMode: 'walking',
                                          transportTime: '',
                                          distance: '',
                                          priority: 0
                                        };
                                        const updatedPlans = dailyPlans.map(day => {
                                          if (day.id === selectedDay) {
                                            const places = [...day.places];
                                            places.splice(index, 0, newPlace);
                                            return { ...day, places };
                                          }
                                          return day;
                                        });
                                        setDailyPlans(updatedPlans);
                                        setInsertingAtIndex(null);
                                        setSelectedAddType(null);
                                        e.target.value = '';
                                      } else if (e.key === 'Escape') {
                                        setInsertingAtIndex(null);
                                        setSelectedAddType(null);
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setInsertingAtIndex(null);
                                      setSelectedAddType(null);
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Place Card with Drag Indicator */}
                        <div className="flex items-stretch gap-3 group relative">
                          {/* Number + drag column */}
                          <div className="flex-shrink-0 w-10 flex flex-col items-center relative">
                            <div className="w-9 h-9 flex items-center justify-center mb-2">
                              <div className="relative w-9 h-9 flex items-center justify-center text-[#FF6B6B] drop-shadow-sm">
                                <FaLocationPin size={30} />
                                <span className="absolute text-[13px] font-bold text-white top-1.5">
                                  {index + 1}
                                </span>
                              </div>
                            </div>
                            {!place.visited && (
                              <button
                                onMouseDown={(e) => e.preventDefault()}
                                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Drag to reorder"
                              >
                                <MdDragIndicator size={18} className="text-gray-400 cursor-grab active:cursor-grabbing" />
                              </button>
                            )}
                          </div>

                          {/* Place Card */}
                          <div
                            draggable={!place.visited}
                            onDragStart={(e) => handleDragStart(e, selectedDay, place.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, selectedDay, place.id)}
                            onDragEnd={handleDragEnd}
                            onClick={() => {
                              // Don't trigger click if we're dragging
                              if (isDragging) return;

                              // Trigger the corresponding map marker
                              const markerIndex = selectedDayData.places.findIndex(p => p.id === place.id);
                              if (markerIndex !== -1 && markersRef.current[markerIndex]) {
                                window.google.maps.event.trigger(markersRef.current[markerIndex], 'click');
                                // Ensure map panel is visible
                                if (!showMapPanel) {
                                  setShowMapPanel(true);
                                }
                              }
                            }}
                            className={`flex-1 transition-all ring-1 ring-transparent ${
                              isCompactType(place.type)
                                ? `rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 px-3 py-2 ${place.visited ? 'opacity-80' : ''}`
                                : `rounded-2xl overflow-hidden ${
                                    place.visited
                                      ? 'bg-gray-50 border border-gray-200'
                                      : 'bg-white/90 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:ring-[#FF6B6B]/15 cursor-move'
                                  }`
                            } ${draggedItem?.placeId === place.id ? 'opacity-50' : ''}`}
                          >
                            {isCompactType(place.type) ? (
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                                    {renderTypeIcon(place.type, 16, 'text-gray-700')}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                      {place.name || 'Item'}
                                    </p>
                                    {place.address && (
                                      <p className="text-xs text-gray-500 truncate">{place.address}</p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {place.cost && (
                                    <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                                      {getCurrencySymbol(place.currency)}{place.cost}
                                    </span>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openInGoogleMaps(place.address || place.name);
                                    }}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title="Open in Google Maps"
                                  >
                                    <MapIcon size={16} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePlace(selectedDay, place.id);
                                    }}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Place Header */}
                                <div className="p-4 sm:p-5 bg-gradient-to-br from-white via-white to-[#FFE66D]/10">
                                  <div className="flex items-start gap-4">
                                    {/* Photo / Icon column */}
                                    <div className="flex-shrink-0">
                                      {place.photoUrl ? (
                                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-md border border-gray-100">
                                          <img
                                            src={place.photoUrl}
                                            alt={place.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                                          {place.type && place.type !== 'place' && (
                                            <div className="absolute bottom-1 left-1">
                                              <div className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center shadow">
                                                {place.type === 'restaurant' && <FaUtensils size={14} className="text-orange-500" />}
                                                {place.type === 'cafe' && <Coffee size={16} className="text-amber-600" />}
                                                {place.type === 'activity' && <Camera size={16} className="text-green-500" />}
                                                {place.type === 'note' && <StickyNote size={16} className="text-purple-500" />}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B6B] to-[#FFE66D] flex items-center justify-center shadow-sm text-white">
                                          {place.type === 'place' && <Building size={18} className="text-white" />}
                                          {place.type === 'restaurant' && <FaUtensils size={15} className="text-white" />}
                                          {place.type === 'cafe' && <Coffee size={17} className="text-white" />}
                                          {place.type === 'activity' && <Camera size={17} className="text-white" />}
                                          {place.type === 'note' && <StickyNote size={17} className="text-white" />}
                                          {!place.type && <Building size={18} className="text-white" />}
                                        </div>
                                      )}
                                    </div>

                                    {/* Place Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <h4 className="font-bold text-base sm:text-lg text-gray-900">
                                          {place.name}
                                        </h4>

                                        {/* Priority Stars */}
                                        <div className="flex items-center gap-0.5">
                                          {[1, 2, 3, 4, 5].map((star) => {
                                            const currentPriority = place.priority || 0;
                                            const isActive = star <= currentPriority;

                                            return (
                                              <button
                                                key={star}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleChangePriority(selectedDay, place.id, star);
                                                }}
                                                className="transition-all hover:scale-110"
                                                title={`Priority: ${star}/5`}
                                              >
                                                <FaStar className={isActive ? 'text-yellow-500' : 'text-gray-300'} size={16} />
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap items-center gap-2 mb-1">
                                        {place.duration && (
                                          <span className="px-3 py-1 text-xs rounded-full bg-[#4ECDC4]/10 text-[#17806f] border border-[#4ECDC4]/20">
                                            ⏱ {place.duration}h
                                          </span>
                                        )}
                                        {place.cost && (
                                          <span className="px-3 py-1 text-xs rounded-full bg-[#FF6B6B]/10 text-[#c84a4a] border border-[#FF6B6B]/20">
                                            💰 {place.cost} {place.currency || ''}
                                          </span>
                                        )}
                                        {place.visited && (
                                          <span className="px-3 py-1 text-xs rounded-full bg-gray-800 text-white">
                                            Completed
                                          </span>
                                        )}
                                      </div>

                                      {/* Rich Text Notes Input */}
                                    <div className="relative -mt-1">
                                      {/* Formatting Toolbar */}
                                      {focusedNotesEditor === place.id && (
                                        <div
                                          className="flex items-center gap-1 mb-1 p-1 bg-gray-50 border border-gray-200 rounded flex-wrap"
                                          onMouseDown={(e) => e.preventDefault()}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {/* Bold */}
                                          <button
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              document.execCommand('bold', false, null);
                                            }}
                                            className="px-2 py-1 hover:bg-gray-200 rounded text-xs font-bold"
                                            title="Bold"
                                          >
                                            B
                                          </button>

                                          {/* Italic */}
                                          <button
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              document.execCommand('italic', false, null);
                                            }}
                                            className="px-2 py-1 hover:bg-gray-200 rounded text-xs italic"
                                            title="Italic"
                                          >
                                            I
                                          </button>

                                          <span className="text-gray-300">|</span>

                                          {/* Font Family */}
                                          <select
                                            onMouseDown={(e) => e.preventDefault()}
                                            onChange={(e) => {
                                              document.execCommand('fontName', false, e.target.value);
                                              e.target.value = '';
                                            }}
                                            className="px-1 py-1 text-xs border border-gray-300 rounded hover:bg-gray-200"
                                            title="Font"
                                          >
                                            <option value="">Font</option>
                                            <option value="Arial">Arial</option>
                                            <option value="Courier New">Courier</option>
                                            <option value="Georgia">Georgia</option>
                                            <option value="Times New Roman">Times</option>
                                            <option value="Verdana">Verdana</option>
                                            <option value="Comic Sans MS">Comic Sans</option>
                                          </select>

                                          {/* Font Color */}
                                          <input
                                            type="color"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onChange={(e) => {
                                              document.execCommand('foreColor', false, e.target.value);
                                            }}
                                            className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
                                            title="Text Color"
                                          />

                                          {/* Background Color */}
                                          <input
                                            type="color"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onChange={(e) => {
                                              document.execCommand('backColor', false, e.target.value);
                                            }}
                                            className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
                                            title="Background Color"
                                          />

                                          <span className="text-gray-300">|</span>

                                          {/* Emoji Picker Button */}
                                          <button
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setShowEmojiPicker(showEmojiPicker === place.id ? null : place.id);
                                            }}
                                            className="px-2 py-1 hover:bg-gray-200 rounded text-xs"
                                            title="Add Emoji"
                                          >
                                            😀
                                          </button>

                                          {/* Emoji Picker Dropdown */}
                                          {showEmojiPicker === place.id && (
                                            <div
                                              className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-2 z-10 flex flex-wrap gap-1 max-w-[200px]"
                                              onMouseDown={(e) => e.preventDefault()}
                                            >
                                              {['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '⭐', '✨', '🌟', '💫', '⚡', '🔥', '💥', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '💪', '🦾', '🙏', '✍️', '💅', '🦵', '🦿', '🦶'].map(emoji => (
                                                <button
                                                  key={emoji}
                                                  onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    document.execCommand('insertText', false, emoji);
                                                    setShowEmojiPicker(null);
                                                  }}
                                                  className="text-lg hover:bg-gray-100 rounded p-1"
                                                >
                                                  {emoji}
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      <div
                                        contentEditable
                                        suppressContentEditableWarning
                                        onFocus={(e) => {
                                          e.stopPropagation();
                                          setFocusedNotesEditor(place.id);
                                        }}
                                        onBlur={(e) => {
                                          // Delay to allow toolbar clicks to register
                                          setTimeout(() => {
                                            setFocusedNotesEditor(null);
                                            setShowEmojiPicker(null);
                                          }, 200);

                                          const updatedPlans = dailyPlans.map(d => ({
                                            ...d,
                                            places: d.places.map(p =>
                                              p.id === place.id && d.id === selectedDay
                                                ? { ...p, notes: e.currentTarget.innerHTML }
                                                : p
                                            )
                                          }));
                                          setDailyPlans(updatedPlans);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => e.stopPropagation()}
                                        dangerouslySetInnerHTML={{ __html: place.notes || '' }}
                                        data-placeholder="Add notes, links and so on..."
                                        className="text-gray-600 text-sm mb-2 px-2 py-1 border border-transparent hover:border-gray-300 focus:border-[#4ECDC4] rounded outline-none min-h-[24px] max-h-[200px] overflow-y-auto transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
                                        style={{
                                          wordWrap: 'break-word',
                                          whiteSpace: 'pre-wrap'
                                        }}
                                      />
                                    </div>

                                    {/* Compact Metadata Inputs */}
                                    <div className="flex items-center gap-2 text-xs flex-wrap">
                                      {/* Time */}
                                      <div className="flex items-center gap-1">
                                        <Calendar size={14} className="text-gray-400" />
                                        <input
                                          type="time"
                                          value={place.visitTime || ''}
                                          onChange={(e) => {
                                            const updatedPlans = dailyPlans.map(d => ({
                                              ...d,
                                              places: d.places.map(p =>
                                                p.id === place.id && d.id === selectedDay
                                                  ? { ...p, visitTime: e.target.value }
                                                  : p
                                              )
                                            }));
                                            setDailyPlans(updatedPlans);
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-16 px-1 py-0.5 border border-gray-300 rounded text-xs focus:border-[#4ECDC4] focus:outline-none"
                                          placeholder="--:--"
                                        />
                                      </div>

                                      <span className="text-gray-300">|</span>

                                      {/* Duration */}
                                      <div className="flex items-center gap-1">
                                        <TbTimeDuration30 size={14} className="text-gray-400" />
                                        <input
                                          type="number"
                                          step="0.5"
                                          value={place.duration || ''}
                                          onChange={(e) => {
                                            const updatedPlans = dailyPlans.map(d => ({
                                              ...d,
                                              places: d.places.map(p =>
                                                p.id === place.id && d.id === selectedDay
                                                  ? { ...p, duration: e.target.value }
                                                  : p
                                              )
                                            }));
                                            setDailyPlans(updatedPlans);
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-12 px-1 py-0.5 border border-gray-300 rounded text-xs focus:border-[#4ECDC4] focus:outline-none"
                                          placeholder="1.5"
                                        />
                                        <span className="text-gray-500">h</span>
                                      </div>

                                      <span className="text-gray-300">|</span>

                                      {/* Cost */}
                                      <div className="flex items-center gap-1 relative">
                                        <MdAttachMoney size={16} className="text-gray-400" />
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={place.cost || ''}
                                          onChange={(e) => {
                                            const updatedPlans = dailyPlans.map(d => ({
                                              ...d,
                                              places: d.places.map(p =>
                                                p.id === place.id && d.id === selectedDay
                                                  ? { ...p, cost: e.target.value }
                                                  : p
                                              )
                                            }));
                                            setDailyPlans(updatedPlans);
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-16 px-1 py-0.5 border border-gray-300 rounded text-xs focus:border-[#4ECDC4] focus:outline-none"
                                          placeholder="25.00"
                                        />
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setCurrencyPickerPosition({
                                              top: rect.bottom + 8,
                                              left: rect.right - 180
                                            });
                                            setShowCurrencyPicker(showCurrencyPicker === place.id ? null : place.id);
                                          }}
                                          className="text-gray-500 hover:text-[#4ECDC4] transition-colors cursor-pointer text-xs font-medium"
                                        >
                                          {(place.currency || 'EUR') === 'EUR' && '€'}
                                          {(place.currency || 'EUR') === 'USD' && '$'}
                                          {(place.currency || 'EUR') === 'GBP' && '£'}
                                          {(place.currency || 'EUR') === 'CHF' && 'CHF'}
                                          {(place.currency || 'EUR') === 'BRL' && 'R$'}
                                        </button>

                                        {/* Currency Picker Popup */}
                                        {showCurrencyPicker === place.id && (
                                          <>
                                            {/* Backdrop to close picker when clicking outside */}
                                            <div
                                              className="fixed inset-0 z-[998]"
                                              onClick={() => setShowCurrencyPicker(null)}
                                            />
                                            <div
                                              className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 py-1 z-[999] min-w-[180px]"
                                              style={{
                                                top: `${currencyPickerPosition.top}px`,
                                                left: `${currencyPickerPosition.left}px`
                                              }}
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const updatedPlans = dailyPlans.map(d => ({
                                                  ...d,
                                                  places: d.places.map(p =>
                                                    p.id === place.id && d.id === selectedDay
                                                      ? { ...p, currency: 'EUR' }
                                                      : p
                                                  )
                                                }));
                                                setDailyPlans(updatedPlans);
                                                setShowCurrencyPicker(null);
                                              }}
                                              className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 transition-colors flex items-center justify-between ${(place.currency || 'EUR') === 'EUR' ? 'bg-[#4ECDC4] bg-opacity-10' : ''}`}
                                            >
                                              <span className="text-sm text-gray-700 flex items-center gap-2">
                                                <span className="text-lg">🇪🇺</span>
                                                Euro (EUR)
                                              </span>
                                              {(place.currency || 'EUR') === 'EUR' && <span className="text-[#4ECDC4] text-xs">✓</span>}
                                            </button>

                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const updatedPlans = dailyPlans.map(d => ({
                                                  ...d,
                                                  places: d.places.map(p =>
                                                    p.id === place.id && d.id === selectedDay
                                                      ? { ...p, currency: 'USD' }
                                                      : p
                                                  )
                                                }));
                                                setDailyPlans(updatedPlans);
                                                setShowCurrencyPicker(null);
                                              }}
                                              className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 transition-colors flex items-center justify-between ${(place.currency || 'EUR') === 'USD' ? 'bg-[#4ECDC4] bg-opacity-10' : ''}`}
                                            >
                                              <span className="text-sm text-gray-700 flex items-center gap-2">
                                                <span className="text-lg">🇺🇸</span>
                                                US Dollar (USD)
                                              </span>
                                              {(place.currency || 'EUR') === 'USD' && <span className="text-[#4ECDC4] text-xs">✓</span>}
                                            </button>

                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const updatedPlans = dailyPlans.map(d => ({
                                                  ...d,
                                                  places: d.places.map(p =>
                                                    p.id === place.id && d.id === selectedDay
                                                      ? { ...p, currency: 'GBP' }
                                                      : p
                                                  )
                                                }));
                                                setDailyPlans(updatedPlans);
                                                setShowCurrencyPicker(null);
                                              }}
                                              className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 transition-colors flex items-center justify-between ${(place.currency || 'EUR') === 'GBP' ? 'bg-[#4ECDC4] bg-opacity-10' : ''}`}
                                            >
                                              <span className="text-sm text-gray-700 flex items-center gap-2">
                                                <span className="text-lg">🇬🇧</span>
                                                British Pound (GBP)
                                              </span>
                                              {(place.currency || 'EUR') === 'GBP' && <span className="text-[#4ECDC4] text-xs">✓</span>}
                                            </button>

                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const updatedPlans = dailyPlans.map(d => ({
                                                  ...d,
                                                  places: d.places.map(p =>
                                                    p.id === place.id && d.id === selectedDay
                                                      ? { ...p, currency: 'CHF' }
                                                      : p
                                                  )
                                                }));
                                                setDailyPlans(updatedPlans);
                                                setShowCurrencyPicker(null);
                                              }}
                                              className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 transition-colors flex items-center justify-between ${(place.currency || 'EUR') === 'CHF' ? 'bg-[#4ECDC4] bg-opacity-10' : ''}`}
                                            >
                                              <span className="text-sm text-gray-700 flex items-center gap-2">
                                                <span className="text-lg">🇨🇭</span>
                                                Swiss Franc (CHF)
                                              </span>
                                              {(place.currency || 'EUR') === 'CHF' && <span className="text-[#4ECDC4] text-xs">✓</span>}
                                            </button>

                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const updatedPlans = dailyPlans.map(d => ({
                                                  ...d,
                                                  places: d.places.map(p =>
                                                    p.id === place.id && d.id === selectedDay
                                                      ? { ...p, currency: 'BRL' }
                                                      : p
                                                  )
                                                }));
                                                setDailyPlans(updatedPlans);
                                                setShowCurrencyPicker(null);
                                              }}
                                              className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 transition-colors flex items-center justify-between ${(place.currency || 'EUR') === 'BRL' ? 'bg-[#4ECDC4] bg-opacity-10' : ''}`}
                                            >
                                              <span className="text-sm text-gray-700 flex items-center gap-2">
                                                <span className="text-lg">🇧🇷</span>
                                                Brazilian Real (BRL)
                                              </span>
                                              {(place.currency || 'EUR') === 'BRL' && <span className="text-[#4ECDC4] text-xs">✓</span>}
                                            </button>
                                          </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            {/* Action Buttons */}
                            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openInGoogleMaps(place.address);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Open in Google Maps"
                              >
                                <MapIcon size={18} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePlace(selectedDay, place.id);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Add Item Section */}
                  <div className="mt-4">
                    {!selectedAddType ? (
                      /* Step 1: Show + button and menu */
                      <div className="relative" ref={addMenuRef}>
                        <button
                          onClick={() => setShowAddMenu(!showAddMenu)}
                          className="w-full flex items-center justify-center text-teal-500 hover:text-teal-600 transition-colors cursor-pointer"
                          title="Add to This Day"
                        >
                          <IoIosAddCircle size={28} />
                        </button>

                        {/* Dropdown Menu */}
                        {showAddMenu && (
                          <div className="absolute left-1/2 -translate-x-1/2 z-10 w-64 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-2">
                            <button
                              onClick={() => {
                                setSelectedAddType('place');
                                setShowAddMenu(false);
                              }}
                              className="w-full px-2.5 py-1.5 hover:bg-gray-50 transition-colors flex items-center gap-2 rounded-lg"
                            >
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                <Building size={16} />
                              </div>
                              <div className="text-left">
                                <div className="font-semibold text-sm text-gray-900 leading-tight">Place / Attraction</div>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedAddType('restaurant');
                                setShowAddMenu(false);
                              }}
                              className="w-full px-2.5 py-1.5 hover:bg-gray-50 transition-colors flex items-center gap-2 rounded-lg"
                            >
                              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                <FaUtensils size={14} />
                              </div>
                              <div className="text-left">
                                <div className="font-semibold text-sm text-gray-900 leading-tight">Restaurant</div>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedAddType('cafe');
                                setShowAddMenu(false);
                              }}
                              className="w-full px-2.5 py-1.5 hover:bg-gray-50 transition-colors flex items-center gap-2 rounded-lg"
                            >
                              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                                <Coffee size={16} />
                              </div>
                              <div className="text-left">
                                <div className="font-semibold text-sm text-gray-900 leading-tight">Café / Bar</div>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedAddType('activity');
                                setShowAddMenu(false);
                              }}
                              className="w-full px-2.5 py-1.5 hover:bg-gray-50 transition-colors flex items-center gap-2 rounded-lg"
                            >
                              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                <Camera size={16} />
                              </div>
                              <div className="text-left">
                                <div className="font-semibold text-sm text-gray-900 leading-tight">Activity</div>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedAddType('note');
                                setShowAddMenu(false);
                              }}
                              className="w-full px-2.5 py-1.5 hover:bg-gray-50 transition-colors flex items-center gap-2 rounded-lg"
                            >
                              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                <StickyNote size={16} />
                              </div>
                              <div className="text-left">
                                <div className="font-semibold text-sm text-gray-900 leading-tight">Note</div>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Step 2: Show search bar with type indicator */
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
                        <div className="flex items-center gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0">
                            {selectedAddType === 'place' && <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center"><Building size={16} className="text-white" /></div>}
                            {selectedAddType === 'restaurant' && <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center"><FaUtensils size={14} className="text-white" /></div>}
                            {selectedAddType === 'cafe' && <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center"><Coffee size={16} className="text-white" /></div>}
                            {selectedAddType === 'activity' && <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center"><Camera size={16} className="text-white" /></div>}
                            {selectedAddType === 'note' && <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center"><StickyNote size={16} className="text-white" /></div>}
                          </div>

                          {/* Search bar */}
                          <div className="relative flex-1">
                            <input
                              type="text"
                              placeholder="Search for a place..."
                              value={placeSearchTerm || placeForm.name}
                              onChange={(e) => {
                                setPlaceSearchTerm(e.target.value);
                                setPlaceForm({ ...placeForm, name: e.target.value });
                                fetchPlaceSuggestions(e.target.value);
                              }}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4ECDC4] focus:outline-none bg-white"
                            />
                            {mapsApiKey && placeSuggestions.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg divide-y max-h-60 overflow-y-auto">
                                {placeSuggestions.map((s) => (
                                  <button
                                    key={s.place_id}
                                    onClick={() => handlePlaceSuggestionSelect(s)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      {s.photoUrl && (
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                          <img
                                            src={s.photoUrl}
                                            alt={s.structured_formatting?.main_text || s.description}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">{s.structured_formatting?.main_text || s.description}</div>
                                        <div className="text-xs text-gray-500">{s.structured_formatting?.secondary_text || 'Google Places'}</div>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                            {placeSearchLoading && (
                              <div className="absolute right-3 top-3 text-sm text-gray-400">Searching...</div>
                            )}
                          </div>

                          {/* Close button */}
                          <button
                            onClick={() => {
                              setSelectedAddType(null);
                              setPlaceForm({
                                name: '',
                                address: '',
                                placeId: '',
                                location: null,
                                notes: '',
                                transportMode: 'walking',
                                transportTime: '',
                                distance: ''
                              });
                              setPlaceSearchTerm('');
                              setPlaceSuggestions([]);
                            }}
                            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {showMapPanel && (
              <div className="bg-white border rounded-2xl shadow-md p-3 sm:p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapIcon size={18} className="text-[#4ECDC4]" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Day Map</p>
                      <p className="text-xs text-gray-500">
                        {selectedDayData ? parseLocalDate(selectedDayData.date).toLocaleDateString() : 'Select a day to view pins'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMapPanel(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="Hide map"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="relative">
                  <div
                    ref={mapRef}
                    className="w-full h-96 sm:h-[500px] lg:h-[600px] xl:h-[700px] rounded-xl overflow-hidden bg-gray-100"
                  />
                  {!mapsApiKey && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                      <div className="p-4 text-sm text-gray-500 bg-white rounded-lg border border-dashed">
                        Google Maps integration active
                      </div>
                    </div>
                  )}
                  {mapsApiKey && !mapsReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                      <div className="p-4 text-center text-sm text-gray-500">Loading map...</div>
                    </div>
                  )}
                  {mapLoading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center text-sm text-gray-600">
                      Mapping your stops...
                    </div>
                  )}
                  {mapsReady && !selectedDayData?.places?.length && !mapLoading && !mapPlaceholderDismissed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative p-4 text-sm text-gray-500 bg-white/90 rounded-lg border border-dashed backdrop-blur-sm pointer-events-auto">
                        Add places to this day to see pins here.
                        <button
                          onClick={() => setMapPlaceholderDismissed(true)}
                          className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                          title="Dismiss"
                        >
                          <X size={14} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          )}

          {/* FLIGHTS TAB */}
          {activeTab === 'flights' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Flights</h2>
                <button
                  onClick={() => setShowAddFlight(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#4ECDC4] to-[#44A08D] text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] flex items-center gap-2 font-medium"
                >
                  <Plus size={20} />
                  Add Flight
                </button>
              </div>

              {flights.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Plane size={48} className="mx-auto mb-4 opacity-50 text-[#4ECDC4]" />
                  <p>No flights added yet. Click "Add Flight" to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {flights.map(flight => (
                    <div key={flight.id} className="border-2 border-gray-100 rounded-xl p-4 hover:shadow-lg hover:border-[#4ECDC4]/30 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-lg">{flight.airline} {flight.flightNumber}</span>
                            <span className="text-sm text-gray-500">{flight.bookingRef}</span>
                          </div>
                          <div className="flex items-center gap-4 text-gray-700">
                            <div>
                              <div className="font-medium">{flight.from}</div>
                              <div className="text-sm">{flight.departureTime}</div>
                            </div>
                            <Plane size={20} className="text-[#4ECDC4]" />
                            <div>
                              <div className="font-medium">{flight.to}</div>
                              <div className="text-sm">{flight.arrivalTime}</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 mt-2">
                            {new Date(flight.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteFlight(flight.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Flight Modal */}
              {showAddFlight && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4">Add Flight</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Airline *"
                          value={flightForm.airline}
                          onChange={(e) => setFlightForm({ ...flightForm, airline: e.target.value })}
                          className="px-3 py-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Flight number *"
                          value={flightForm.flightNumber}
                          onChange={(e) => setFlightForm({ ...flightForm, flightNumber: e.target.value })}
                          className="px-3 py-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="From (airport) *"
                          value={flightForm.from}
                          onChange={(e) => setFlightForm({ ...flightForm, from: e.target.value })}
                          className="px-3 py-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="To (airport) *"
                          value={flightForm.to}
                          onChange={(e) => setFlightForm({ ...flightForm, to: e.target.value })}
                          className="px-3 py-2 border rounded-lg"
                        />
                        <input
                          type="date"
                          value={flightForm.date}
                          onChange={(e) => setFlightForm({ ...flightForm, date: e.target.value })}
                          className="px-3 py-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Booking reference"
                          value={flightForm.bookingRef}
                          onChange={(e) => setFlightForm({ ...flightForm, bookingRef: e.target.value })}
                          className="px-3 py-2 border rounded-lg"
                        />
                        <input
                          type="time"
                          placeholder="Departure time"
                          value={flightForm.departureTime}
                          onChange={(e) => setFlightForm({ ...flightForm, departureTime: e.target.value })}
                          className="px-3 py-2 border rounded-lg"
                        />
                        <input
                          type="time"
                          placeholder="Arrival time"
                          value={flightForm.arrivalTime}
                          onChange={(e) => setFlightForm({ ...flightForm, arrivalTime: e.target.value })}
                          className="px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <button
                        onClick={handleAddFlight}
                        disabled={!flightForm.airline || !flightForm.flightNumber || !flightForm.from || !flightForm.to}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-[#4ECDC4] to-[#44A08D] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
                      >
                        Add Flight
                      </button>
                      <button
                        onClick={() => setShowAddFlight(false)}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 text-sm sm:text-base transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EXPENSES TAB */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Expenses</h2>
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#FFE66D] to-[#FFBE5C] text-gray-800 rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] flex items-center gap-2 font-medium"
                >
                  <Plus size={20} />
                  Add Expense
                </button>
              </div>

              {expenses.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign size={48} className="mx-auto mb-4 opacity-50 text-[#FFE66D]" />
                  <p>No expenses tracked yet. Click "Add Expense" to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map(expense => (
                    <div key={expense.id} className="border-2 border-gray-100 rounded-xl p-4 hover:shadow-lg hover:border-[#FFE66D]/50 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-lg">{expense.description}</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                              {expense.category}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-[#F7B731] mb-2">
                            {expense.currency} ${parseFloat(expense.amount).toFixed(2)}
                          </div>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>{new Date(expense.date).toLocaleDateString()}</span>
                            {expense.city && <span>📍 {expense.city}</span>}
                            {expense.country && <span>🌍 {expense.country}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Expense Modal */}
              {showAddExpense && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4">Add Expense</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Description *"
                        value={expenseForm.description}
                        onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Amount *"
                          value={expenseForm.amount}
                          onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                          className="px-3 py-2 border rounded-lg"
                        />
                        <select
                          value={expenseForm.currency}
                          onChange={(e) => setExpenseForm({ ...expenseForm, currency: e.target.value })}
                          className="px-3 py-2 border rounded-lg"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="BRL">BRL</option>
                          <option value="CHF">CHF</option>
                        </select>
                        <select
                          value={expenseForm.category}
                          onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                          className="px-3 py-2 border rounded-lg"
                        >
                          <option value="food">Food & Dining</option>
                          <option value="accommodation">Accommodation</option>
                          <option value="transportation">Transportation</option>
                          <option value="activities">Activities</option>
                          <option value="shopping">Shopping</option>
                          <option value="other">Other</option>
                        </select>
                        <input
                          type="date"
                          value={expenseForm.date}
                          onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                          className="px-3 py-2 border rounded-lg"
                        />
                        
                        {/* City Autocomplete for Expenses */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="City"
                            value={expenseCitySearch || expenseForm.city}
                            onChange={(e) => {
                              setExpenseCitySearch(e.target.value);
                              setExpenseForm({ ...expenseForm, city: e.target.value });
                              setShowExpenseCitySuggestions(true);
                            }}
                            onFocus={() => setShowExpenseCitySuggestions(true)}
                            onBlur={() => setTimeout(() => setShowExpenseCitySuggestions(false), 200)}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                          {showExpenseCitySuggestions && expenseCitySearch && getFilteredCities(expenseCitySearch).length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {getFilteredCities(expenseCitySearch).map(({ city, country }, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setExpenseForm({ ...expenseForm, city, country });
                                    setExpenseCitySearch('');
                                    setShowExpenseCitySuggestions(false);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-indigo-50 flex justify-between items-center"
                                >
                                  <span className="font-medium">{city}</span>
                                  <span className="text-sm text-gray-500">{country}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Country Autocomplete for Expenses */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Country"
                            value={expenseCountrySearch || expenseForm.country}
                            onChange={(e) => {
                              setExpenseCountrySearch(e.target.value);
                              setExpenseForm({ ...expenseForm, country: e.target.value });
                              setShowExpenseCountrySuggestions(true);
                            }}
                            onFocus={() => setShowExpenseCountrySuggestions(true)}
                            onBlur={() => setTimeout(() => setShowExpenseCountrySuggestions(false), 200)}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                          {showExpenseCountrySuggestions && expenseCountrySearch && getFilteredCountries(expenseCountrySearch).length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {getFilteredCountries(expenseCountrySearch).map((country, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setExpenseForm({ ...expenseForm, country });
                                    setExpenseCountrySearch('');
                                    setShowExpenseCountrySuggestions(false);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-indigo-50"
                                >
                                  {country}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <button
                        onClick={handleAddExpense}
                        disabled={!expenseForm.description || !expenseForm.amount}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-[#FFE66D] to-[#FFBE5C] text-gray-800 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
                      >
                        Add Expense
                      </button>
                      <button
                        onClick={() => setShowAddExpense(false)}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 text-sm sm:text-base transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Analytics & Insights</h2>

              {/* Expense Analytics */}
              <div className="border-2 border-gray-100 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <DollarSign className="text-[#26DE81]" />
                  Expense Breakdown
                </h3>
                
                {expenses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No expenses to analyze yet.</p>
                ) : (
                  <div className="space-y-6">
                    {/* By Category */}
                    <div>
                      <h4 className="font-medium mb-3">By Category</h4>
                      <div className="space-y-2">
                        {Object.entries(getTotalExpensesByCategory()).map(([category, amount]) => (
                          <div key={category} className="flex justify-between items-center p-3 bg-gradient-to-r from-[#FFE66D]/10 to-[#FFE66D]/5 rounded-lg">
                            <span className="capitalize font-medium">{category}</span>
                            <span className="font-bold text-[#F7B731]">${amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t font-bold text-lg flex justify-between">
                        <span>Total</span>
                        <span className="text-[#F7B731]">
                          ${expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* By City */}
                    {Object.keys(getTotalExpensesByCity()).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">By City</h4>
                        <div className="space-y-2">
                          {Object.entries(getTotalExpensesByCity()).map(([city, amount]) => (
                            <div key={city} className="flex justify-between items-center p-3 bg-gradient-to-r from-[#4ECDC4]/10 to-[#4ECDC4]/5 rounded-lg">
                              <span className="font-medium">{city}</span>
                              <span className="font-bold text-[#4ECDC4]">${amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* By Country */}
                    {Object.keys(getTotalExpensesByCountry()).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">By Country</h4>
                        <div className="space-y-2">
                          {Object.entries(getTotalExpensesByCountry()).map(([country, amount]) => (
                            <div key={country} className="flex justify-between items-center p-3 bg-gradient-to-r from-[#FF6B6B]/10 to-[#FF8E53]/10 rounded-lg">
                              <span className="font-medium">{country}</span>
                              <span className="font-bold text-[#FF6B6B]">${amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Distance Analytics */}
              <div className="border-2 border-gray-100 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Navigation className="text-[#4ECDC4]" />
                  Distance Tracking
                </h3>

                {dailyPlans.every(d => d.places.length === 0) ? (
                  <p className="text-gray-500 text-center py-8">No distances to analyze yet.</p>
                ) : (
                  <div className="space-y-6">
                    {/* By Transport Mode */}
                    <div>
                      <h4 className="font-medium mb-3">By Transport Mode</h4>
                      <div className="space-y-2">
                        {Object.entries(getTotalDistanceByMode())
                          .filter(([_, dist]) => dist > 0)
                          .map(([mode, distance]) => (
                            <div key={mode} className="flex justify-between items-center p-3 bg-gradient-to-r from-[#4ECDC4]/10 to-[#4ECDC4]/5 rounded-lg">
                              <span className="capitalize font-medium">{mode}</span>
                              <span className="font-bold text-[#4ECDC4]">{distance.toFixed(2)} km</span>
                            </div>
                          ))}
                      </div>
                      <div className="mt-3 pt-3 border-t font-bold text-lg flex justify-between">
                        <span>Total Distance</span>
                        <span className="text-[#4ECDC4]">
                          {Object.values(getTotalDistanceByMode()).reduce((a, b) => a + b, 0).toFixed(2)} km
                        </span>
                      </div>
                    </div>

                    {/* By City */}
                    {Object.keys(getTotalDistanceByCity()).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">By City</h4>
                        <div className="space-y-2">
                          {Object.entries(getTotalDistanceByCity())
                            .filter(([_, dist]) => dist > 0)
                            .map(([city, distance]) => (
                              <div key={city} className="flex justify-between items-center p-3 bg-gradient-to-r from-[#26DE81]/10 to-[#26DE81]/5 rounded-lg">
                                <span className="font-medium">{city}</span>
                                <span className="font-bold text-[#26DE81]">{distance.toFixed(2)} km</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Google Maps API Key Modal */}
        {showApiKeyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Google Maps API Setup</h3>
              
              <div className="space-y-4 mb-6">
                <p className="text-gray-700">
                  To automatically calculate distances and travel times between places, you need a Google Maps API key.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-medium text-blue-900">How to get your API key:</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800">
                    <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                    <li>Create a new project or select an existing one</li>
                    <li>Enable "Distance Matrix API" and "Maps JavaScript API"</li>
                    <li>Go to "Credentials" and create an API key</li>
                    <li>Copy the API key and paste it below</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800">
                  <p className="font-medium mb-1">⚠️ Important Notes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Google provides $200 free credit per month</li>
                    <li>The API key is stored only in your browser</li>
                    <li>Never share your API key publicly</li>
                    <li>Consider restricting your API key to specific domains</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Maps API Key
                  </label>
                  <input
                    type="text"
                    value={mapsApiKey}
                    onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                    placeholder="Enter your API key here"
                    className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 px-4 py-2 text-center text-sm text-gray-500">
                  API key is provided via environment. No need to paste it here.
                </div>
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 text-sm sm:text-base transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account Settings Modal */}
        {showAccountSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <div className="mt-1 text-gray-800">{currentUser?.displayName || '—'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 text-gray-800">{currentUser?.email}</div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowAccountSettings(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Trip Modal */}
        {showEditTripModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Edit Trip Details</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip Name
                  </label>
                  <input
                    type="text"
                    value={tripForm.name}
                    onChange={(e) => setTripForm({ ...tripForm, name: e.target.value })}
                    placeholder="e.g., European Adventure 2026"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={tripForm.startDate}
                      onChange={(e) => setTripForm({ ...tripForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={tripForm.endDate}
                      onChange={(e) => setTripForm({ ...tripForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {tripForm.startDate !== currentTrip.startDate || tripForm.endDate !== currentTrip.endDate ? (
                  <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800">
                    <p className="font-medium mb-1">⚠️ Note about changing dates:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Your existing daily plans will be preserved where dates match</li>
                      <li>New days will be added if you extend the trip</li>
                      <li>Days outside the new range will be removed</li>
                    </ul>
                  </div>
                ) : null}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSaveTripEdit}
                  disabled={!tripForm.name || !tripForm.startDate || !tripForm.endDate}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditTripModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 text-sm sm:text-base transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelPlanner;
