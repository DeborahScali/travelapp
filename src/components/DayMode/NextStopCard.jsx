import React from 'react';
import { Navigation, Clock, MapPin, Check, X } from 'lucide-react';
import { FaWalking, FaCar, FaSubway } from 'react-icons/fa';
import { Plane } from 'lucide-react';

const NextStopCard = ({ place, onMarkVisited, onMarkSkipped }) => {
  // Get transport icon
  const getTransportIcon = (mode) => {
    switch (mode) {
      case 'walking':
        return <FaWalking size={20} className="text-[#4ECDC4]" />;
      case 'car':
        return <FaCar size={20} className="text-[#4ECDC4]" />;
      case 'transit':
        return <FaSubway size={20} className="text-[#4ECDC4]" />;
      case 'plane':
        return <Plane size={20} className="text-[#4ECDC4]" />;
      default:
        return <FaWalking size={20} className="text-[#4ECDC4]" />;
    }
  };

  // Start navigation - deep link to Google Maps
  const handleStartNavigation = () => {
    const destination = encodeURIComponent(place.address || place.name);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-[#4ECDC4] to-[#44A08D] rounded-2xl shadow-xl p-6 mb-6 mt-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="text-white/80 text-sm font-medium mb-1">NEXT STOP</div>
          <h2 className="text-2xl font-bold text-white mb-2">{place.name}</h2>
          {place.address && (
            <div className="flex items-start gap-2 text-white/90 text-sm">
              <MapPin size={16} className="mt-0.5 flex-shrink-0" />
              <span>{place.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Travel info */}
      <div className="flex items-center gap-4 mb-4 text-white">
        <div className="flex items-center gap-2">
          {getTransportIcon(place.transportMode)}
          <span className="font-medium capitalize">
            {place.transportMode === 'transit' ? 'Public Transport' : place.transportMode}
          </span>
        </div>
        {place.transportTime && (
          <>
            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span className="font-medium">{place.transportTime} min</span>
            </div>
          </>
        )}
        {place.distance && (
          <>
            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
            <span className="font-medium">{place.distance} km</span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={handleStartNavigation}
          className="col-span-3 sm:col-span-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-[#4ECDC4] rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-md"
        >
          <Navigation size={18} />
          Navigate
        </button>
        <button
          onClick={onMarkVisited}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all backdrop-blur-sm border border-white/30"
        >
          <Check size={18} />
          Visited
        </button>
        <button
          onClick={onMarkSkipped}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all backdrop-blur-sm border border-white/30"
        >
          <X size={18} />
          Skip
        </button>
      </div>

      {/* Notes if any */}
      {place.notes && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="text-white/90 text-sm">{place.notes}</div>
        </div>
      )}
    </div>
  );
};

export default NextStopCard;
