import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Plane, DollarSign, TrendingUp, Calendar, Navigation, Train, Map } from 'lucide-react';

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

// Create a flat list for searching
const ALL_CITIES = Object.entries(CITIES_DATABASE).flatMap(([country, cities]) => 
  cities.map(city => ({ city, country }))
);

const TravelPlanner = () => {
  const [activeTab, setActiveTab] = useState('itinerary');
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [flights, setFlights] = useState([]);
  const [dailyPlans, setDailyPlans] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showAddFlight, setShowAddFlight] = useState(false);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [calculatingDistance, setCalculatingDistance] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [expenseCitySearch, setExpenseCitySearch] = useState('');
  const [expenseCountrySearch, setExpenseCountrySearch] = useState('');
  const [showExpenseCitySuggestions, setShowExpenseCitySuggestions] = useState(false);
  const [showExpenseCountrySuggestions, setShowExpenseCountrySuggestions] = useState(false);
  const [showEditTripModal, setShowEditTripModal] = useState(false);
  const [editingTripName, setEditingTripName] = useState(false);
  const [editingTripDates, setEditingTripDates] = useState(false);
  const [editingDayTitle, setEditingDayTitle] = useState(false);
  const [dayTitleValue, setDayTitleValue] = useState('');
  const [tripForm, setTripForm] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  // Initialize with sample data and load from localStorage
  useEffect(() => {
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem('googleMapsApiKey');
    if (savedApiKey) {
      setGoogleMapsApiKey(savedApiKey);
    }

    // Try to load saved data from localStorage
    const savedTrips = localStorage.getItem('travelPlanner_trips');
    const savedCurrentTrip = localStorage.getItem('travelPlanner_currentTrip');
    const savedDailyPlans = localStorage.getItem('travelPlanner_dailyPlans');
    const savedFlights = localStorage.getItem('travelPlanner_flights');
    const savedExpenses = localStorage.getItem('travelPlanner_expenses');

    if (savedTrips && savedCurrentTrip && savedDailyPlans) {
      // Load existing data
      setTrips(JSON.parse(savedTrips));
      setCurrentTrip(JSON.parse(savedCurrentTrip));
      setDailyPlans(JSON.parse(savedDailyPlans));
      setFlights(savedFlights ? JSON.parse(savedFlights) : []);
      setExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);
      
      const plans = JSON.parse(savedDailyPlans);
      setSelectedDay(plans[0]?.id);
    } else {
      // Initialize with sample data if no saved data exists
      const sampleTrip = {
        id: 1,
        name: 'European Adventure 2026',
        startDate: '2026-04-15',
        endDate: '2026-05-02'
      };
      setTrips([sampleTrip]);
      setCurrentTrip(sampleTrip);
      
      // Generate days for the trip
      const days = [];
      const start = new Date('2026-04-15');
      const end = new Date('2026-05-02');
      let current = new Date(start);
      
      while (current <= end) {
        days.push({
          id: days.length + 1,
          date: current.toISOString().split('T')[0],
          title: '',
          city: '',
          country: '',
          places: []
        });
        current.setDate(current.getDate() + 1);
      }
      
      setDailyPlans(days);
      setSelectedDay(days[0]?.id);
    }
  }, []);

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
    notes: '',
    transportMode: 'walking',
    transportTime: '',
    distance: '',
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

  const handleAddFlight = () => {
    const newFlight = {
      id: Date.now(),
      ...flightForm
    };
    setFlights([...flights, newFlight]);
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
  };

  const handleAddPlace = async () => {
    const selectedDayData = dailyPlans.find(d => d.id === selectedDay);
    let finalPlaceForm = { ...placeForm };
    
    // If there's a previous place and we have an API key, calculate distance and time
    if (selectedDayData && selectedDayData.places.length > 0 && googleMapsApiKey) {
      const previousPlace = selectedDayData.places[selectedDayData.places.length - 1];
      const result = await calculateDistanceAndTime(
        previousPlace.address,
        placeForm.address,
        placeForm.transportMode
      );
      
      if (!result.error) {
        finalPlaceForm = {
          ...placeForm,
          distance: result.distance,
          transportTime: result.time
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
      notes: '',
      transportMode: 'walking',
      transportTime: '',
      distance: '',
      metroStation: '',
      metroLine: '',
      visited: false
    });
    setShowAddPlace(false);
  };

  const handleAddExpense = () => {
    const newExpense = {
      id: Date.now(),
      ...expenseForm
    };
    setExpenses([...expenses, newExpense]);
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

  const handleDeleteFlight = (flightId) => {
    setFlights(flights.filter(f => f.id !== flightId));
  };

  const handleDeleteExpense = (expenseId) => {
    setExpenses(expenses.filter(e => e.id !== expenseId));
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

  const calculateDistanceAndTime = async (origin, destination, mode) => {
    if (!googleMapsApiKey) {
      return { distance: '', time: '', error: 'API key not set' };
    }

    try {
      setCalculatingDistance(true);
      
      // Map our transport modes to Google Maps travel modes
      const travelModeMap = {
        'walking': 'walking',
        'metro': 'transit',
        'bus': 'transit',
        'train': 'transit',
        'car': 'driving',
        'other': 'driving'
      };
      
      const travelMode = travelModeMap[mode] || 'walking';
      
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&mode=${travelMode}&key=${googleMapsApiKey}`;
      
      // Note: Due to CORS restrictions, we need to use a proxy or backend
      // For now, we'll use the Directions API with JSONP callback
      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${travelMode}&key=${googleMapsApiKey}`;
      
      // Since we can't directly call the API from the browser due to CORS,
      // we'll use the JavaScript API instead
      return await new Promise((resolve) => {
        if (window.google && window.google.maps) {
          const service = new window.google.maps.DistanceMatrixService();
          service.getDistanceMatrix(
            {
              origins: [origin],
              destinations: [destination],
              travelMode: travelMode.toUpperCase(),
            },
            (response, status) => {
              setCalculatingDistance(false);
              if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
                const element = response.rows[0].elements[0];
                const distanceKm = (element.distance.value / 1000).toFixed(1);
                const timeMin = Math.round(element.duration.value / 60);
                resolve({ distance: distanceKm, time: timeMin, error: null });
              } else {
                resolve({ distance: '', time: '', error: 'Could not calculate route' });
              }
            }
          );
        } else {
          setCalculatingDistance(false);
          resolve({ distance: '', time: '', error: 'Google Maps not loaded' });
        }
      });
    } catch (error) {
      setCalculatingDistance(false);
      return { distance: '', time: '', error: error.message };
    }
  };

  // Load Google Maps API
  useEffect(() => {
    if (googleMapsApiKey && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [googleMapsApiKey]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (trips.length > 0) {
      localStorage.setItem('travelPlanner_trips', JSON.stringify(trips));
    }
  }, [trips]);

  useEffect(() => {
    if (currentTrip) {
      localStorage.setItem('travelPlanner_currentTrip', JSON.stringify(currentTrip));
    }
  }, [currentTrip]);

  useEffect(() => {
    if (dailyPlans.length > 0) {
      localStorage.setItem('travelPlanner_dailyPlans', JSON.stringify(dailyPlans));
    }
  }, [dailyPlans]);

  useEffect(() => {
    localStorage.setItem('travelPlanner_flights', JSON.stringify(flights));
  }, [flights]);

  useEffect(() => {
    localStorage.setItem('travelPlanner_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Filter cities based on search term
  const getFilteredCities = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 1) return [];
    const term = searchTerm.toLowerCase();
    return ALL_CITIES
      .filter(({ city }) => city.toLowerCase().includes(term))
      .slice(0, 10);
  };

  // Get unique countries
  const getFilteredCountries = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 1) return [];
    const term = searchTerm.toLowerCase();
    return Object.keys(CITIES_DATABASE)
      .filter(country => country.toLowerCase().includes(term));
  };

  // Handle city selection for daily plan
  const handleCitySelect = (city, country) => {
    const updated = dailyPlans.map(d => 
      d.id === selectedDay ? { ...d, city, country } : d
    );
    setDailyPlans(updated);
    setCitySearchTerm('');
    setShowCitySuggestions(false);
  };

  // Handle country selection for daily plan
  const handleCountrySelect = (country) => {
    const updated = dailyPlans.map(d => 
      d.id === selectedDay ? { ...d, country } : d
    );
    setDailyPlans(updated);
    setCountrySearchTerm('');
    setShowCountrySuggestions(false);
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
    setEditingTripDates(true);
  };

  const handleSaveTripName = () => {
    if (tripForm.name.trim()) {
      const updatedTrip = { ...currentTrip, name: tripForm.name };
      setCurrentTrip(updatedTrip);
      const updatedTrips = trips.map(t => t.id === currentTrip.id ? updatedTrip : t);
      setTrips(updatedTrips);
    }
    setEditingTripName(false);
  };

  const handleSaveTripDates = () => {
    if (tripForm.startDate && tripForm.endDate) {
      const updatedTrip = {
        ...currentTrip,
        startDate: tripForm.startDate,
        endDate: tripForm.endDate
      };
      setCurrentTrip(updatedTrip);
      
      const updatedTrips = trips.map(t => t.id === currentTrip.id ? updatedTrip : t);
      setTrips(updatedTrips);

      // Regenerate daily plans if dates changed
      if (tripForm.startDate !== currentTrip.startDate || tripForm.endDate !== currentTrip.endDate) {
        const days = [];
        const start = new Date(tripForm.startDate);
        const end = new Date(tripForm.endDate);
        let current = new Date(start);
        let dayId = 1;
        
        while (current <= end) {
          const dateStr = current.toISOString().split('T')[0];
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
        
        setDailyPlans(days);
        setSelectedDay(days[0]?.id);
      }
    }
    setEditingTripDates(false);
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

  const handleSaveTripEdit = () => {
    // Update current trip
    const updatedTrip = {
      ...currentTrip,
      name: tripForm.name,
      startDate: tripForm.startDate,
      endDate: tripForm.endDate
    };
    setCurrentTrip(updatedTrip);
    
    // Update trips list
    const updatedTrips = trips.map(t => 
      t.id === currentTrip.id ? updatedTrip : t
    );
    setTrips(updatedTrips);

    // Regenerate daily plans if dates changed
    if (tripForm.startDate !== currentTrip.startDate || tripForm.endDate !== currentTrip.endDate) {
      const days = [];
      const start = new Date(tripForm.startDate);
      const end = new Date(tripForm.endDate);
      let current = new Date(start);
      let dayId = 1;
      
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
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
      
      setDailyPlans(days);
      setSelectedDay(days[0]?.id);
    }
    
    setShowEditTripModal(false);
  };

  const openInGoogleMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const getRouteInGoogleMaps = (origin, destination) => {
    const encodedOrigin = encodeURIComponent(origin);
    const encodedDest = encodeURIComponent(destination);
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDest}`, '_blank');
  };

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

  const selectedDayData = dailyPlans.find(d => d.id === selectedDay);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                <MapPin className="text-indigo-600" size={24} />
                Travel Planner
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
                        className="px-3 py-1 rounded bg-gray-100 text-lg font-medium flex-1 outline-none"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={handleStartEditingTripName}
                      className="cursor-pointer hover:bg-gray-100 px-3 py-1 rounded transition-colors inline-block"
                    >
                      <span className="text-lg font-medium text-gray-800">{currentTrip.name}</span>
                    </div>
                  )}

                  {/* Trip Dates - Inline Edit */}
                  <div className="hidden sm:block">
                    {editingTripDates ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded">
                        <input
                          type="date"
                          value={tripForm.startDate}
                          onChange={(e) => setTripForm({ ...tripForm, startDate: e.target.value })}
                          className="px-2 py-1 rounded text-sm bg-white outline-none"
                        />
                        <span className="text-gray-600">to</span>
                        <input
                          type="date"
                          value={tripForm.endDate}
                          onChange={(e) => setTripForm({ ...tripForm, endDate: e.target.value })}
                          onBlur={handleSaveTripDates}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveTripDates();
                            if (e.key === 'Escape') setEditingTripDates(false);
                          }}
                          className="px-2 py-1 rounded text-sm bg-white outline-none"
                        />
                        <button
                          onClick={handleSaveTripDates}
                          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={handleStartEditingTripDates}
                        className="cursor-pointer hover:bg-gray-100 px-3 py-1 rounded transition-colors inline-block"
                      >
                        <span className="text-sm text-gray-600">
                          {new Date(currentTrip.startDate).toLocaleDateString()} - {new Date(currentTrip.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowApiKeyModal(true)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  googleMapsApiKey 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                <Map size={18} />
                <span className="hidden sm:inline">{googleMapsApiKey ? 'API Connected' : 'Setup API'}</span>
                <span className="sm:hidden">API</span>
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear ALL trip data? This cannot be undone!')) {
                    localStorage.removeItem('travelPlanner_trips');
                    localStorage.removeItem('travelPlanner_currentTrip');
                    localStorage.removeItem('travelPlanner_dailyPlans');
                    localStorage.removeItem('travelPlanner_flights');
                    localStorage.removeItem('travelPlanner_expenses');
                    window.location.reload();
                  }
                }}
                className="px-3 sm:px-4 py-2 rounded-lg text-sm bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-2"
                title="Clear all data"
              >
                <Trash2 size={18} />
                <span className="hidden sm:inline">Clear Data</span>
              </button>
            </div>
          </div>
          
          {/* Data Status Indicator */}
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Auto-saving enabled • All changes are saved automatically</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-4 sm:mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 font-medium flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'itinerary' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'
              }`}
            >
              <Calendar size={20} />
              <span className="hidden sm:inline">Daily Plans</span>
              <span className="sm:hidden">Plans</span>
            </button>
            <button
              onClick={() => setActiveTab('flights')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 font-medium flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'flights' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'
              }`}
            >
              <Plane size={20} />
              <span>Flights</span>
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 font-medium flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'expenses' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'
              }`}
            >
              <DollarSign size={20} />
              <span>Expenses</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 font-medium flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'analytics' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'
              }`}
            >
              <TrendingUp size={20} />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
          
          {/* ITINERARY TAB */}
          {activeTab === 'itinerary' && (
            <div className="space-y-6">
              {/* Day Selector */}
              <div className="flex items-center gap-4 overflow-x-auto pb-4">
                {dailyPlans.map((day, index) => {
                  const dayNumber = index + 1;
                  const defaultTitle = `Day ${dayNumber}`;
                  const displayTitle = day.title || defaultTitle;
                  
                  return (
                    <button
                      key={day.id}
                      onClick={() => setSelectedDay(day.id)}
                      className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all ${
                        selectedDay === day.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="text-sm">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      <div className={`text-xs mt-1 font-medium max-w-[100px] truncate ${day.title ? 'text-indigo-600' : 'text-gray-500'}`}>
                        {displayTitle}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedDayData && (
                <div>
                  {/* Day Info */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-bold mb-3">
                      {new Date(selectedDayData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    
                    {/* Day Title - Inline Edit */}
                    <div className="mb-4">
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
                          className="w-full px-3 py-2 rounded bg-gray-100 font-medium text-indigo-700 outline-none"
                        />
                      ) : (
                        <div
                          onClick={() => handleStartEditingDayTitle(selectedDayData.title)}
                          className="w-full px-3 py-2 rounded cursor-pointer hover:bg-gray-100 transition-colors font-medium text-indigo-700"
                        >
                          {selectedDayData.title || `Day ${dailyPlans.findIndex(d => d.id === selectedDay) + 1}`}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* City Autocomplete */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="City"
                          value={citySearchTerm || selectedDayData.city}
                          onChange={(e) => {
                            setCitySearchTerm(e.target.value);
                            setShowCitySuggestions(true);
                            // Also update the actual city value for manual entry
                            const updated = dailyPlans.map(d => 
                              d.id === selectedDay ? { ...d, city: e.target.value } : d
                            );
                            setDailyPlans(updated);
                          }}
                          onFocus={() => setShowCitySuggestions(true)}
                          onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                        {showCitySuggestions && citySearchTerm && getFilteredCities(citySearchTerm).length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {getFilteredCities(citySearchTerm).map(({ city, country }, index) => (
                              <button
                                key={index}
                                onClick={() => handleCitySelect(city, country)}
                                className="w-full px-3 py-2 text-left hover:bg-indigo-50 flex justify-between items-center"
                              >
                                <span className="font-medium">{city}</span>
                                <span className="text-sm text-gray-500">{country}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Country Autocomplete */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Country"
                          value={countrySearchTerm || selectedDayData.country}
                          onChange={(e) => {
                            setCountrySearchTerm(e.target.value);
                            setShowCountrySuggestions(true);
                            // Also update the actual country value for manual entry
                            const updated = dailyPlans.map(d => 
                              d.id === selectedDay ? { ...d, country: e.target.value } : d
                            );
                            setDailyPlans(updated);
                          }}
                          onFocus={() => setShowCountrySuggestions(true)}
                          onBlur={() => setTimeout(() => setShowCountrySuggestions(false), 200)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                        {showCountrySuggestions && countrySearchTerm && getFilteredCountries(countrySearchTerm).length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {getFilteredCountries(countrySearchTerm).map((country, index) => (
                              <button
                                key={index}
                                onClick={() => handleCountrySelect(country)}
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

                  {/* Places List */}
                  <div className="space-y-4">
                    {selectedDayData.places.map((place, index) => (
                      <div 
                        key={place.id} 
                        className={`border rounded-lg overflow-hidden transition-all ${
                          place.visited ? 'bg-gray-50 border-gray-300' : 'hover:shadow-md'
                        }`}
                      >
                        {/* Place Header - Always Visible */}
                        <div 
                          className="p-3 sm:p-4 cursor-pointer"
                          onClick={() => toggleVisited(selectedDay, place.id)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <div className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center mt-1 ${
                              place.visited 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-gray-300 hover:border-indigo-500'
                            }`}>
                              {place.visited && (
                                <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M5 13l4 4L19 7"></path>
                                </svg>
                              )}
                            </div>

                            {/* Place Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs sm:text-sm font-medium">
                                  #{index + 1}
                                </span>
                                <h4 className={`font-bold text-base sm:text-lg ${place.visited ? 'line-through text-gray-500' : ''}`}>
                                  {place.name}
                                </h4>
                              </div>
                              {!place.visited && (
                                <>
                                  <p className="text-gray-600 text-sm mb-1">{place.address}</p>
                                  {place.notes && (
                                    <p className="text-gray-500 text-sm italic">{place.notes}</p>
                                  )}
                                </>
                              )}
                              {place.visited && (
                                <p className="text-gray-500 text-sm">✓ Visited</p>
                              )}
                            </div>

                            {/* Action Buttons - Only show when not visited */}
                            {!place.visited && (
                              <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openInGoogleMaps(place.address);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="Open in Google Maps"
                                >
                                  <Map size={18} />
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
                            )}
                          </div>
                        </div>

                        {/* Transportation Info - Only show when not visited */}
                        {!place.visited && index > 0 && (
                          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                            <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                <div className="flex items-center gap-2">
                                  {place.transportMode === 'walking' && <Navigation size={16} className="text-blue-600" />}
                                  {place.transportMode === 'metro' && <Train size={16} className="text-blue-600" />}
                                  <span className="font-medium capitalize">{place.transportMode}</span>
                                </div>
                                {place.transportTime && (
                                  <span className="text-gray-700">{place.transportTime} min</span>
                                )}
                                {place.distance && (
                                  <span className="text-gray-700">{place.distance} km</span>
                                )}
                                {place.transportMode === 'metro' && place.metroStation && (
                                  <span className="text-gray-700 flex-1 min-w-0 truncate">
                                    {place.metroStation}
                                    {place.metroLine && ` (${place.metroLine})`}
                                  </span>
                                )}
                                {index > 0 && selectedDayData.places[index - 1] && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      getRouteInGoogleMaps(
                                        selectedDayData.places[index - 1].address,
                                        place.address
                                      );
                                    }}
                                    className="text-blue-600 hover:underline flex items-center gap-1 whitespace-nowrap"
                                  >
                                    <Map size={14} />
                                    <span className="hidden sm:inline">Get Directions</span>
                                    <span className="sm:hidden">Route</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Place Button */}
                  <button
                    onClick={() => setShowAddPlace(true)}
                    className="mt-4 w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Plus size={20} />
                    Add Place to This Day
                  </button>
                </div>
              )}

              {/* Add Place Modal */}
              {showAddPlace && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4">Add Place</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Place name *"
                        value={placeForm.name}
                        onChange={(e) => setPlaceForm({ ...placeForm, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Address *"
                        value={placeForm.address}
                        onChange={(e) => setPlaceForm({ ...placeForm, address: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <textarea
                        placeholder="Notes"
                        value={placeForm.notes}
                        onChange={(e) => setPlaceForm({ ...placeForm, notes: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        rows="3"
                      />
                      
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Transportation from previous place</h4>
                        {googleMapsApiKey && selectedDayData && selectedDayData.places.length > 0 && (
                          <div className="mb-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                            ℹ️ Distance and time will be automatically calculated when you add this place
                          </div>
                        )}
                        {!googleMapsApiKey && selectedDayData && selectedDayData.places.length > 0 && (
                          <div className="mb-3 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                            ⚠️ Set up Google Maps API to auto-calculate distance and time
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <select
                            value={placeForm.transportMode}
                            onChange={(e) => setPlaceForm({ ...placeForm, transportMode: e.target.value })}
                            className="px-3 py-2 border rounded-lg"
                          >
                            <option value="walking">Walking</option>
                            <option value="metro">Metro</option>
                            <option value="bus">Bus</option>
                            <option value="train">Train</option>
                            <option value="car">Car</option>
                            <option value="other">Other</option>
                          </select>
                          <input
                            type="number"
                            placeholder={googleMapsApiKey ? "Auto-calculated" : "Time (minutes)"}
                            value={placeForm.transportTime}
                            onChange={(e) => setPlaceForm({ ...placeForm, transportTime: e.target.value })}
                            className="px-3 py-2 border rounded-lg"
                            disabled={calculatingDistance}
                          />
                          <input
                            type="number"
                            step="0.1"
                            placeholder={googleMapsApiKey ? "Auto-calculated" : "Distance (km)"}
                            value={placeForm.distance}
                            onChange={(e) => setPlaceForm({ ...placeForm, distance: e.target.value })}
                            className="px-3 py-2 border rounded-lg"
                            disabled={calculatingDistance}
                          />
                        </div>
                        
                        {placeForm.transportMode === 'metro' && (
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <input
                              type="text"
                              placeholder="Metro station"
                              value={placeForm.metroStation}
                              onChange={(e) => setPlaceForm({ ...placeForm, metroStation: e.target.value })}
                              className="px-3 py-2 border rounded-lg"
                            />
                            <input
                              type="text"
                              placeholder="Metro line"
                              value={placeForm.metroLine}
                              onChange={(e) => setPlaceForm({ ...placeForm, metroLine: e.target.value })}
                              className="px-3 py-2 border rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <button
                        onClick={handleAddPlace}
                        disabled={!placeForm.name || !placeForm.address || calculatingDistance}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 text-sm sm:text-base"
                      >
                        {calculatingDistance ? 'Calculating Route...' : 'Add Place'}
                      </button>
                      <button
                        onClick={() => setShowAddPlace(false)}
                        className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                    </div>
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Flight
                </button>
              </div>

              {flights.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Plane size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No flights added yet. Click "Add Flight" to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {flights.map(flight => (
                    <div key={flight.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
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
                            <Plane size={20} className="text-indigo-600" />
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
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 text-sm sm:text-base"
                      >
                        Add Flight
                      </button>
                      <button
                        onClick={() => setShowAddFlight(false)}
                        className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm sm:text-base"
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Expense
                </button>
              </div>

              {expenses.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No expenses tracked yet. Click "Add Expense" to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map(expense => (
                    <div key={expense.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-lg">{expense.description}</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                              {expense.category}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-indigo-600 mb-2">
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
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 text-sm sm:text-base"
                      >
                        Add Expense
                      </button>
                      <button
                        onClick={() => setShowAddExpense(false)}
                        className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm sm:text-base"
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
              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <DollarSign className="text-green-600" />
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
                          <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="capitalize">{category}</span>
                            <span className="font-bold text-green-600">${amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t font-bold text-lg flex justify-between">
                        <span>Total</span>
                        <span className="text-green-600">
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
                            <div key={city} className="flex justify-between items-center p-3 bg-blue-50 rounded">
                              <span>{city}</span>
                              <span className="font-bold text-blue-600">${amount.toFixed(2)}</span>
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
                            <div key={country} className="flex justify-between items-center p-3 bg-purple-50 rounded">
                              <span>{country}</span>
                              <span className="font-bold text-purple-600">${amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Distance Analytics */}
              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Navigation className="text-blue-600" />
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
                            <div key={mode} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <span className="capitalize">{mode}</span>
                              <span className="font-bold text-blue-600">{distance.toFixed(2)} km</span>
                            </div>
                          ))}
                      </div>
                      <div className="mt-3 pt-3 border-t font-bold text-lg flex justify-between">
                        <span>Total Distance</span>
                        <span className="text-blue-600">
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
                              <div key={city} className="flex justify-between items-center p-3 bg-indigo-50 rounded">
                                <span>{city}</span>
                                <span className="font-bold text-indigo-600">{distance.toFixed(2)} km</span>
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
                    value={googleMapsApiKey}
                    onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                    placeholder="Enter your API key here"
                    className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    if (googleMapsApiKey) {
                      localStorage.setItem('googleMapsApiKey', googleMapsApiKey);
                    }
                    setShowApiKeyModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm sm:text-base"
                >
                  Save API Key
                </button>
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm sm:text-base"
                >
                  Cancel
                </button>
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
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 text-sm sm:text-base"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditTripModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm sm:text-base"
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