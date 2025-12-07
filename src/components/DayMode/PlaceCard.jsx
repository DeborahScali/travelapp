import React, { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp, MapPin, Clock, Navigation, StickyNote, DollarSign } from 'lucide-react';
import { FaWalking, FaCar, FaSubway } from 'react-icons/fa';
import { Plane } from 'lucide-react';

const PlaceCard = ({ place, index, onMarkVisited, onMarkSkipped, onUpdateActualCost }) => {
  const [isExpanded, setIsExpanded] = useState(!place.visited && !place.skipped);
  const [actualCostInput, setActualCostInput] = useState(place.actualCost || '');

  // Get transport icon
  const getTransportIcon = (mode) => {
    switch (mode) {
      case 'walking':
        return <FaWalking size={14} className="text-[#4ECDC4]" />;
      case 'car':
        return <FaCar size={14} className="text-[#4ECDC4]" />;
      case 'transit':
        return <FaSubway size={14} className="text-[#4ECDC4]" />;
      case 'plane':
        return <Plane size={14} className="text-[#4ECDC4]" />;
      default:
        return <FaWalking size={14} className="text-[#4ECDC4]" />;
    }
  };

  // Start navigation
  const handleStartNavigation = () => {
    const destination = encodeURIComponent(place.address || place.name);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, '_blank');
  };

  const isCompleted = place.visited || place.skipped;

  return (
    <div
      className={`bg-white rounded-xl shadow-md border-2 transition-all ${
        place.visited
          ? 'border-[#26DE81]/30 bg-gradient-to-r from-[#26DE81]/5 to-transparent'
          : place.skipped
          ? 'border-gray-300 bg-gray-50 opacity-60'
          : 'border-gray-100 hover:border-[#4ECDC4]/30 hover:shadow-lg'
      }`}
    >
      {/* Header - Always visible */}
      <div
        className="px-4 py-3 flex items-start justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 flex items-start gap-3">
          {/* Photo / badge */}
          <div className="flex-shrink-0">
            {place.photoUrl ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                <img
                  src={place.photoUrl}
                  alt={place.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="absolute top-1 left-1">
                  <div className="w-6 h-6 rounded-full bg-white/85 backdrop-blur flex items-center justify-center shadow">
                    {place.visited ? (
                      <Check size={12} className="text-[#26DE81]" />
                    ) : place.skipped ? (
                      <X size={12} className="text-gray-500" />
                    ) : (
                      <span className="text-[10px] font-bold text-gray-600">{index + 1}</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold border">
                {place.visited ? <Check size={14} /> : place.skipped ? <X size={14} /> : index + 1}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3
              className={`font-semibold text-base mb-1 ${
                place.visited ? 'text-gray-700' : place.skipped ? 'text-gray-500 line-through' : 'text-gray-900'
              }`}
            >
              {place.name}
            </h3>

            {/* Quick info - always shown */}
            {!isCompleted && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {place.transportMode && (
                  <>
                    {getTransportIcon(place.transportMode)}
                    {place.transportTime && (
                      <span>{place.transportTime} min</span>
                    )}
                    {place.distance && (
                      <span>• {place.distance} km</span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Expand/collapse icon */}
        <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          {isExpanded ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Address */}
          {place.address && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin size={14} className="mt-0.5 text-[#4ECDC4] flex-shrink-0" />
              <span>{place.address}</span>
            </div>
          )}

          {/* Travel details */}
          {(place.transportMode || place.transportTime || place.distance) && !isCompleted && (
            <div className="flex items-center gap-3 text-sm">
              {place.transportMode && (
                <div className="flex items-center gap-1 px-2 py-1 bg-[#4ECDC4]/10 rounded-lg">
                  {getTransportIcon(place.transportMode)}
                  <span className="text-gray-700 capitalize">
                    {place.transportMode === 'transit' ? 'Transit' : place.transportMode}
                  </span>
                </div>
              )}
              {place.transportTime && (
                <div className="flex items-center gap-1">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-gray-600">{place.transportTime} min</span>
                </div>
              )}
              {place.distance && (
                <span className="text-gray-600">{place.distance} km</span>
              )}
            </div>
          )}

          {/* Notes */}
          {place.notes && (
            <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <StickyNote size={14} className="mt-0.5 text-gray-400 flex-shrink-0" />
              <span>{place.notes}</span>
            </div>
          )}

          {/* Actual Cost Field */}
          {!isCompleted && (
            <div className="bg-[#FFE66D]/10 border-2 border-[#FFE66D]/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={14} className="text-[#F7B731]" />
                <label className="text-xs font-semibold text-gray-700">
                  Actual Cost (Optional)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">€</span>
                <input
                  type="number"
                  step="0.01"
                  value={actualCostInput}
                  onChange={(e) => setActualCostInput(e.target.value)}
                  onBlur={() => {
                    if (actualCostInput !== (place.actualCost || '')) {
                      onUpdateActualCost(place.id, actualCostInput);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={place.estimatedCost ? `Estimated: ${place.estimatedCost}` : '0.00'}
                  className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FFE66D] text-sm"
                />
              </div>
              {place.estimatedCost && (
                <div className="text-xs text-gray-500 mt-1">
                  Estimated: €{place.estimatedCost}
                  {actualCostInput && parseFloat(actualCostInput) !== parseFloat(place.estimatedCost) && (
                    <span className={`ml-2 font-medium ${
                      parseFloat(actualCostInput) > parseFloat(place.estimatedCost)
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      {parseFloat(actualCostInput) > parseFloat(place.estimatedCost)
                        ? `+€${(parseFloat(actualCostInput) - parseFloat(place.estimatedCost)).toFixed(2)}`
                        : `-€${(parseFloat(place.estimatedCost) - parseFloat(actualCostInput)).toFixed(2)}`
                      }
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Show actual cost for completed places */}
          {isCompleted && place.actualCost && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign size={14} className="text-[#F7B731]" />
              <span className="text-gray-700">
                Actual Cost: <span className="font-semibold">€{place.actualCost}</span>
              </span>
              {place.estimatedCost && parseFloat(place.actualCost) !== parseFloat(place.estimatedCost) && (
                <span className={`text-xs ${
                  parseFloat(place.actualCost) > parseFloat(place.estimatedCost)
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  ({parseFloat(place.actualCost) > parseFloat(place.estimatedCost) ? '+' : '-'}€
                  {Math.abs(parseFloat(place.actualCost) - parseFloat(place.estimatedCost)).toFixed(2)})
                </span>
              )}
            </div>
          )}

          {/* Action buttons */}
          {!isCompleted && (
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartNavigation();
                }}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-[#4ECDC4] text-white rounded-lg font-medium text-sm hover:bg-[#44A08D] transition-all shadow-sm"
              >
                <Navigation size={14} />
                Navigate
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkVisited(place.id);
                }}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-[#26DE81] text-white rounded-lg font-medium text-sm hover:bg-[#20bf6b] transition-all shadow-sm"
              >
                <Check size={14} />
                Visited
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkSkipped(place.id);
                }}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-400 text-white rounded-lg font-medium text-sm hover:bg-gray-500 transition-all shadow-sm"
              >
                <X size={14} />
                Skip
              </button>
            </div>
          )}

          {/* Undo buttons for completed */}
          {isCompleted && (
            <div className="pt-2">
              {place.visited && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkVisited(place.id);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Undo visited
                </button>
              )}
              {place.skipped && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkSkipped(place.id);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Undo skip
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaceCard;
