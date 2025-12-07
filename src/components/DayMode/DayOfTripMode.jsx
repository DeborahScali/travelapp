import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useCurrentTrip, useDailyPlans, useExpenses } from '../../hooks/useFirestore';
import DayModeHeader from './DayModeHeader';
import NextStopCard from './NextStopCard';
import StatsBar from './StatsBar';
import TodayTimeline from './TodayTimeline';
import DayMap from './DayMap';
import QuickActions from './QuickActions';
import ExpenseQuickAdd from './ExpenseQuickAdd';

const DayOfTripMode = ({ onExitDayMode }) => {
  const { currentTrip } = useCurrentTrip();
  const { dailyPlans, saveDailyPlans } = useDailyPlans();
  const { expenses, saveExpense } = useExpenses();

  const [selectedDayId, setSelectedDayId] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMapView, setShowMapView] = useState(false);

  // Helper to format date as YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Detect current day based on today's date
  useEffect(() => {
    if (dailyPlans.length > 0 && !selectedDayId) {
      const today = formatDate(new Date());
      const todayPlan = dailyPlans.find(plan => plan.date === today);

      if (todayPlan) {
        // Today is within the trip
        setSelectedDayId(todayPlan.id);
      } else {
        // Not on trip today - default to first day or most recent
        const sortedPlans = [...dailyPlans].sort((a, b) => new Date(a.date) - new Date(b.date));
        const todayDate = new Date();

        // Find the closest upcoming day or today
        const upcomingDay = sortedPlans.find(plan => new Date(plan.date) >= todayDate);

        if (upcomingDay) {
          setSelectedDayId(upcomingDay.id);
        } else {
          // Trip has passed, show last day
          setSelectedDayId(sortedPlans[sortedPlans.length - 1]?.id);
        }
      }
    }
  }, [dailyPlans, selectedDayId]);

  // Get selected day data
  const selectedDay = useMemo(() => {
    return dailyPlans.find(plan => plan.id === selectedDayId);
  }, [dailyPlans, selectedDayId]);

  // Calculate day number (1-indexed)
  const dayNumber = useMemo(() => {
    if (!selectedDay) return 0;
    const sortedPlans = [...dailyPlans].sort((a, b) => new Date(a.date) - new Date(b.date));
    return sortedPlans.findIndex(plan => plan.id === selectedDayId) + 1;
  }, [dailyPlans, selectedDayId]);

  // Find next unvisited place
  const nextPlace = useMemo(() => {
    if (!selectedDay?.places) return null;
    return selectedDay.places.find(place => !place.visited && !place.skipped);
  }, [selectedDay]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!selectedDay?.places) return { visited: 0, total: 0, distance: 0, totalDistance: 0, time: 0, totalTime: 0 };

    const total = selectedDay.places.length;
    const visited = selectedDay.places.filter(p => p.visited).length;
    const totalDistance = selectedDay.places.reduce((sum, p) => sum + (parseFloat(p.distance) || 0), 0);
    const totalTime = selectedDay.places.reduce((sum, p) => sum + (parseFloat(p.transportTime) || 0), 0);

    const visitedPlaces = selectedDay.places.filter(p => p.visited);
    const distance = visitedPlaces.reduce((sum, p) => sum + (parseFloat(p.distance) || 0), 0);
    const time = visitedPlaces.reduce((sum, p) => sum + (parseFloat(p.transportTime) || 0), 0);

    return { visited, total, distance, totalDistance, time, totalTime };
  }, [selectedDay]);

  // Handle marking place as visited
  const handleMarkVisited = async (placeId) => {
    if (!selectedDay) return;

    const updatedPlans = dailyPlans.map(plan => {
      if (plan.id === selectedDayId) {
        return {
          ...plan,
          places: plan.places.map(place =>
            place.id === placeId
              ? { ...place, visited: !place.visited, visitedAt: !place.visited ? new Date().toISOString() : null }
              : place
          )
        };
      }
      return plan;
    });

    try {
      await saveDailyPlans(updatedPlans);
    } catch (error) {
      console.error('Failed to mark place as visited:', error);
    }
  };

  // Handle marking place as skipped
  const handleMarkSkipped = async (placeId) => {
    if (!selectedDay) return;

    const updatedPlans = dailyPlans.map(plan => {
      if (plan.id === selectedDayId) {
        return {
          ...plan,
          places: plan.places.map(place =>
            place.id === placeId
              ? { ...place, skipped: !place.skipped }
              : place
          )
        };
      }
      return plan;
    });

    try {
      await saveDailyPlans(updatedPlans);
    } catch (error) {
      console.error('Failed to mark place as skipped:', error);
    }
  };

  // Handle adding expense
  const handleAddExpense = async (expenseData) => {
    try {
      const newExpense = {
        id: Date.now(),
        date: selectedDay.date,
        city: selectedDay.city || '',
        country: selectedDay.country || '',
        ...expenseData
      };
      await saveExpense(newExpense);
      setShowExpenseModal(false);
    } catch (error) {
      console.error('Failed to add expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  // Calculate today's expenses
  const todayExpenses = useMemo(() => {
    if (!selectedDay) return 0;
    return expenses
      .filter(exp => exp.date === selectedDay.date)
      .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  }, [expenses, selectedDay]);

  if (!selectedDay) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4ECDC4]/20 border-t-[#4ECDC4] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your day...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Header */}
      <DayModeHeader
        onBack={onExitDayMode}
        dayNumber={dayNumber}
        totalDays={dailyPlans.length}
        dayTitle={selectedDay.title}
        dayDate={selectedDay.date}
        city={selectedDay.city}
      />

      {/* Stats Bar */}
      <StatsBar
        visited={stats.visited}
        total={stats.total}
        distance={stats.distance}
        totalDistance={stats.totalDistance}
        time={stats.time}
        totalTime={stats.totalTime}
        todayExpenses={todayExpenses}
      />

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4">
        {/* Next Stop Card */}
        {nextPlace && (
          <NextStopCard
            place={nextPlace}
            onMarkVisited={() => handleMarkVisited(nextPlace.id)}
            onMarkSkipped={() => handleMarkSkipped(nextPlace.id)}
          />
        )}

        {/* View Toggle */}
        <div className="flex gap-2 mb-4 mt-6">
          <button
            onClick={() => setShowMapView(false)}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              !showMapView
                ? 'bg-gradient-to-r from-[#4ECDC4] to-[#44A08D] text-white shadow-md'
                : 'bg-white text-gray-600 border-2 border-gray-200'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setShowMapView(true)}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              showMapView
                ? 'bg-gradient-to-r from-[#4ECDC4] to-[#44A08D] text-white shadow-md'
                : 'bg-white text-gray-600 border-2 border-gray-200'
            }`}
          >
            Map
          </button>
        </div>

        {/* Timeline or Map View */}
        {!showMapView ? (
          <TodayTimeline
            places={selectedDay.places || []}
            onMarkVisited={handleMarkVisited}
            onMarkSkipped={handleMarkSkipped}
          />
        ) : (
          <DayMap
            places={selectedDay.places || []}
            nextPlaceId={nextPlace?.id}
          />
        )}
      </div>

      {/* Quick Actions */}
      <QuickActions
        onAddExpense={() => setShowExpenseModal(true)}
        onMarkNextVisited={nextPlace ? () => handleMarkVisited(nextPlace.id) : null}
      />

      {/* Expense Quick Add Modal */}
      {showExpenseModal && (
        <ExpenseQuickAdd
          onClose={() => setShowExpenseModal(false)}
          onSave={handleAddExpense}
        />
      )}
    </div>
  );
};

export default DayOfTripMode;
