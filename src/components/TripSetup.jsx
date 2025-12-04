import React, { useState, useEffect, useRef } from 'react';
import { DateRange } from 'react-date-range';
import { MapPin, Plus, X, Calendar, GripVertical, Clock, Trash2 } from 'lucide-react';
import { useTrips } from '../hooks/useFirestore';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

// Available countries with their cities
const COUNTRIES = {
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
  ],
  Spain: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao', 'Málaga', 'Granada'],
  Portugal: ['Lisbon', 'Porto', 'Faro', 'Coimbra', 'Braga'],
  Germany: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Düsseldorf'],
  Austria: ['Vienna', 'Salzburg', 'Innsbruck', 'Graz', 'Linz'],
  Netherlands: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
  Belgium: ['Brussels', 'Antwerp', 'Ghent', 'Bruges', 'Liège'],
  Greece: ['Athens', 'Thessaloniki', 'Santorini', 'Mykonos', 'Crete', 'Rhodes'],
  'United Kingdom': ['London', 'Edinburgh', 'Manchester', 'Liverpool', 'Oxford', 'Cambridge'],
  'Czech Republic': ['Prague', 'Brno', 'Český Krumlov'],
  Croatia: ['Zagreb', 'Dubrovnik', 'Split', 'Pula'],
  Poland: ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw'],
  Hungary: ['Budapest', 'Debrecen', 'Szeged'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'San Francisco', 'Miami', 'Las Vegas'],
  Canada: ['Toronto', 'Vancouver', 'Montreal', 'Quebec City', 'Calgary'],
  Japan: ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima', 'Nara'],
  'South Korea': ['Seoul', 'Busan', 'Jeju'],
  Thailand: ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya'],
  Australia: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
  'New Zealand': ['Auckland', 'Wellington', 'Christchurch', 'Queenstown'],
  Brazil: ['Rio de Janeiro', 'São Paulo', 'Salvador', 'Brasília'],
  Argentina: ['Buenos Aires', 'Mendoza', 'Bariloche', 'Córdoba'],
  Mexico: ['Mexico City', 'Cancun', 'Playa del Carmen', 'Guadalajara'],
  Egypt: ['Cairo', 'Alexandria', 'Luxor', 'Aswan'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah'],
  Turkey: ['Istanbul', 'Ankara', 'Antalya', 'Izmir'],
  Morocco: ['Marrakech', 'Casablanca', 'Fes', 'Rabat'],
  'South Africa': ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria']
};

const TripSetup = ({ onCreateTrip }) => {
  const { trips, loading: tripsLoading, deleteTrip } = useTrips();
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [dateRange, setDateRange] = useState([{
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    key: 'selection'
  }]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customTripName, setCustomTripName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  const datePickerRef = useRef(null);
  const countryDropdownRef = useRef(null);

  const availableCountries = Object.keys(COUNTRIES).filter(
    country => !selectedCountries.includes(country)
  );

  const filteredCountries = availableCountries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleAddCountry = (country) => {
    setSelectedCountries([...selectedCountries, country]);
    setCountrySearch('');
    setShowCountryDropdown(false);
  };

  const handleRemoveCountry = (country) => {
    setSelectedCountries(selectedCountries.filter(c => c !== country));
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newCountries = [...selectedCountries];
    const [draggedCountry] = newCountries.splice(draggedIndex, 1);
    newCountries.splice(dropIndex, 0, draggedCountry);

    setSelectedCountries(newCountries);
    setDraggedIndex(null);
  };

  // Auto-generate trip name based on selected countries
  const generateTripName = () => {
    if (selectedCountries.length === 0) return '';
    if (selectedCountries.length === 1) {
      return `Trip to ${selectedCountries[0]}`;
    } else if (selectedCountries.length === 2) {
      return `Trip to ${selectedCountries[0]} & ${selectedCountries[1]}`;
    } else {
      return `Trip to ${selectedCountries.slice(0, -1).join(', ')} & ${selectedCountries[selectedCountries.length - 1]}`;
    }
  };

  // Update custom trip name when countries change (unless user is editing)
  useEffect(() => {
    if (!isEditingName) {
      setCustomTripName(generateTripName());
    }
  }, [selectedCountries, isEditingName]);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  // Close country dropdown when clicking outside
  useEffect(() => {
    const handleOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
    };

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [showCountryDropdown]);

  const formatDateLocal = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCreateTrip = async () => {
    if (selectedCountries.length === 0) {
      alert('Please select at least one country');
      return;
    }

    if (!customTripName.trim()) {
      alert('Please enter a trip name');
      return;
    }

    // Create trip object with custom name
    const trip = {
      id: Date.now(),
      name: customTripName.trim(),
      startDate: formatDateLocal(dateRange[0].startDate),
      endDate: formatDateLocal(dateRange[0].endDate),
      countries: selectedCountries
    };

    try {
      console.log('TripSetup: creating trip', trip);
      await onCreateTrip(trip);
      console.log('TripSetup: onCreateTrip resolved');
    } catch (error) {
      console.error('Failed to create trip:', error);
      alert('Failed to create trip. Please try again.');
    }
  };

  const handleSelectExistingTrip = async (trip) => {
    // Set the existing trip as current trip
    console.log('TripSetup: selecting existing trip', trip);
    await onCreateTrip(trip);
  };

  const confirmDeleteTrip = (trip) => {
    setTripToDelete(trip);
    setShowDeleteModal(true);
  };

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;
    try {
      await deleteTrip(tripToDelete.id);
    } catch (error) {
      console.error('Failed to delete trip:', error);
      alert('Failed to delete trip. Please try again.');
    } finally {
      setShowDeleteModal(false);
      setTripToDelete(null);
    }
  };

  // Sort trips by most recent first
  const recentTrips = trips
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    .slice(0, 6); // Show max 6 recent trips

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] rounded-3xl shadow-lg mb-4">
            <MapPin className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Plan Your Adventure
          </h1>
          <p className="text-gray-600 text-lg">
            Tell us where you're going and when
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border-2 border-gray-50">
          {/* Countries Section */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Where are you travelling to?
            </label>

            {/* Selected Countries - Draggable */}
            <div className="flex flex-wrap gap-3 mb-3">
              {selectedCountries.map((country, index) => (
                <div
                  key={country}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#FF6B6B]/10 to-[#FF8E53]/10 text-[#FF6B6B] rounded-full border-2 border-[#FF6B6B]/20 cursor-move hover:shadow-md hover:border-[#FF6B6B]/40 transition-all ${
                    draggedIndex === index ? 'opacity-50 scale-95' : ''
                  }`}
                >
                  <GripVertical size={20} className="text-[#FF6B6B]/60 flex-shrink-0" />
                  <span className="font-medium text-base">{country}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCountry(country);
                    }}
                    className="hover:bg-[#FF6B6B]/20 rounded-full p-1 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}

              {/* Add Country Button */}
              <button
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="flex items-center gap-2 px-5 py-3 border-2 border-dashed border-gray-300 hover:border-[#4ECDC4] text-gray-600 hover:text-[#4ECDC4] rounded-full transition-all"
              >
                <Plus size={18} />
                <span className="font-medium">Add Country</span>
              </button>
            </div>

            {/* Hint text */}
            {selectedCountries.length > 1 && (
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                <GripVertical size={14} />
                Drag countries to reorder them
              </p>
            )}

            {/* Country Dropdown */}
            {showCountryDropdown && (
              <div ref={countryDropdownRef} className="relative mt-2">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#4ECDC4] transition-colors"
                  autoFocus
                />
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map(country => (
                      <button
                        key={country}
                        onClick={() => handleAddCountry(country)}
                        className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-[#4ECDC4]/10 hover:to-[#4ECDC4]/5 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <span className="font-medium">{country}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No countries found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dates Section */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              When are you going?
            </label>

            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#4ECDC4]/10 to-[#4ECDC4]/5 border-2 border-[#4ECDC4]/30 hover:border-[#4ECDC4] rounded-xl transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Calendar className="text-[#4ECDC4]" size={20} />
                <span className="font-medium text-gray-700">
                  {dateRange[0].startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' → '}
                  {dateRange[0].endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {Math.ceil((dateRange[0].endDate - dateRange[0].startDate) / (1000 * 60 * 60 * 24)) + 1} days
              </span>
            </button>

            {showDatePicker && (
              <div ref={datePickerRef} className="mt-4 flex justify-center">
                <div className="inline-block bg-white border-2 border-gray-200 rounded-xl shadow-lg p-4">
                  <DateRange
                    ranges={dateRange}
                    onChange={ranges => {
                      const selection = ranges.selection;
                      setDateRange([selection]);
                      // Close picker only when both start and end dates are selected and different
                      if (selection.startDate && selection.endDate &&
                          selection.startDate.getTime() !== selection.endDate.getTime()) {
                        setShowDatePicker(false);
                      }
                    }}
                    months={2}
                    direction="horizontal"
                    showDateDisplay={false}
                    rangeColors={["#4ECDC4"]}
                    className="rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Trip Name Section */}
          {selectedCountries.length > 0 && (
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Trip Name
              </label>
              <input
                type="text"
                value={customTripName}
                onChange={(e) => {
                  setCustomTripName(e.target.value);
                  setIsEditingName(true);
                }}
                onBlur={() => {
                  if (!customTripName.trim()) {
                    setCustomTripName(generateTripName());
                    setIsEditingName(false);
                  }
                }}
                placeholder="Enter trip name"
                className="w-full px-4 py-3 border-2 border-[#FFE66D]/30 bg-gradient-to-r from-[#FFE66D]/10 to-[#FFE66D]/5 rounded-xl focus:outline-none focus:border-[#FFE66D] focus:bg-white transition-colors text-lg font-semibold text-gray-900"
              />
            </div>
          )}

          {/* Create Button */}
          <button
            onClick={handleCreateTrip}
            disabled={selectedCountries.length === 0}
            className="w-full px-6 py-4 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Create My Trip
          </button>
        </div>

        {/* Recent Trips Section */}
        {!tripsLoading && recentTrips.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={20} className="text-[#4ECDC4]" />
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Trips
              </h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Continue planning one of your previous trips
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-gray-50 hover:border-[#4ECDC4] p-5 text-left transition-all hover:scale-[1.02] group relative"
                >
                  <button
                    onClick={() => confirmDeleteTrip(trip)}
                    className="absolute top-3 right-3 p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                    title="Delete trip"
                  >
                    <Trash2 size={18} />
                  </button>

                  <button
                    onClick={() => handleSelectExistingTrip(trip)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between mb-3 pr-6">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-[#4ECDC4] transition-colors">
                        {trip.name}
                      </h3>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} className="text-[#4ECDC4]" />
                        <span>
                          {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' - '}
                          {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {trip.countries && trip.countries.length > 0 && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-[#FF6B6B]" />
                          <div className="flex flex-wrap gap-1">
                            {trip.countries.slice(0, 2).map((country, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-gradient-to-r from-[#FF6B6B]/10 to-[#FF8E53]/10 text-[#FF6B6B] rounded-full font-medium"
                              >
                                {country}
                              </span>
                            ))}
                            {trip.countries.length > 2 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                                +{trip.countries.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <span className="text-xs text-[#4ECDC4] font-medium group-hover:underline">
                        Continue Planning →
                      </span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Trip Modal */}
      {showDeleteModal && tripToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 className="text-red-500" size={20} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Delete trip?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              "{tripToDelete.name}" will be removed from your trips. This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDeleteTrip}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Delete Trip
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setTripToDelete(null); }}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripSetup;
