import React from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';

const DayModeHeader = ({ onBack, dayNumber, totalDays, dayTitle, dayDate, city }) => {
  // Format date for display
  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Back button and day info */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
            <span className="font-medium text-gray-700">Planning</span>
          </button>

          <div className="text-right">
            <div className="text-sm font-semibold text-[#4ECDC4]">
              Day {dayNumber} of {totalDays}
            </div>
            <div className="text-xs text-gray-500">
              {formatDateDisplay(dayDate)}
            </div>
          </div>
        </div>

        {/* Day title and location */}
        <div>
          {dayTitle && (
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {dayTitle}
            </h1>
          )}
          {city && (
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin size={16} />
              <span className="text-sm font-medium">{city}</span>
            </div>
          )}
          {!dayTitle && !city && (
            <h1 className="text-2xl font-bold text-gray-900">
              Day {dayNumber}
            </h1>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayModeHeader;
