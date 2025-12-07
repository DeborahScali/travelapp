import React from 'react';
import PlaceCard from './PlaceCard';

const TodayTimeline = ({ places, onMarkVisited, onMarkSkipped, onUpdateActualCost }) => {
  if (!places || places.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="text-gray-400 text-lg mb-2">No places planned for today</div>
        <p className="text-gray-500 text-sm">
          Add places in the planning mode to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      {places.map((place, index) => (
        <PlaceCard
          key={place.id}
          place={place}
          index={index}
          onMarkVisited={onMarkVisited}
          onMarkSkipped={onMarkSkipped}
          onUpdateActualCost={onUpdateActualCost}
        />
      ))}
    </div>
  );
};

export default TodayTimeline;
