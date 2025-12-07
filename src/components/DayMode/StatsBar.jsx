import React from 'react';
import { CheckCircle2, MapPin, Clock, DollarSign } from 'lucide-react';

const StatsBar = ({ visited, total, distance, totalDistance, time, totalTime, todayExpenses }) => {
  return (
    <div className="bg-white border-b-2 border-gray-100 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Places visited */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 size={16} className="text-[#26DE81]" />
              <span className="text-xs text-gray-500 font-medium">Places</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {visited}<span className="text-sm text-gray-400">/{total}</span>
            </div>
          </div>

          {/* Distance */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MapPin size={16} className="text-[#4ECDC4]" />
              <span className="text-xs text-gray-500 font-medium">Distance</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {distance.toFixed(1)}<span className="text-sm text-gray-400">/{totalDistance.toFixed(1)} km</span>
            </div>
          </div>

          {/* Time */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={16} className="text-[#FF6B6B]" />
              <span className="text-xs text-gray-500 font-medium">Time</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {Math.floor(time)}<span className="text-sm text-gray-400">/{Math.floor(totalTime)} min</span>
            </div>
          </div>

          {/* Budget */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign size={16} className="text-[#FFE66D]" />
              <span className="text-xs text-gray-500 font-medium">Spent</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              €{todayExpenses.toFixed(0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
