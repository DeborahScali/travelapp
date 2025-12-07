import React, { useEffect, useRef, useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';

const DayMap = ({ places, nextPlaceId }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const directionsRenderersRef = useRef([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Wait for Google Maps to load
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
      } else {
        setTimeout(checkGoogleMaps, 100);
      }
    };
    checkGoogleMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: 0, lng: 0 },
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      mapInstanceRef.current = map;
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }
  }, [isLoaded]);

  // Update markers and routes when places change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || !places || places.length === 0) return;

    // Clear existing markers and routes
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    directionsRenderersRef.current.forEach(renderer => renderer.setMap(null));
    directionsRenderersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    const validPlaces = places.filter(p => p.location && p.location.lat && p.location.lng);

    if (validPlaces.length === 0) {
      setError('No locations available for today');
      return;
    }

    // Add markers for each place
    validPlaces.forEach((place, index) => {
      const position = {
        lat: parseFloat(place.location.lat),
        lng: parseFloat(place.location.lng)
      };

      // Determine marker color and icon
      const isNext = place.id === nextPlaceId;
      const isVisited = place.visited;
      const isSkipped = place.skipped;

      let markerColor = '#4ECDC4'; // Default blue
      let label = (index + 1).toString();

      if (isVisited) {
        markerColor = '#26DE81'; // Green for visited
      } else if (isSkipped) {
        markerColor = '#95a5a6'; // Gray for skipped
      } else if (isNext) {
        markerColor = '#FF6B6B'; // Red for next stop
      }

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: place.name,
        label: {
          text: label,
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
        }
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold; font-size: 14px;">${place.name}</h3>
            ${place.address ? `<p style="margin: 0; font-size: 12px; color: #666;">${place.address}</p>` : ''}
            ${isNext ? '<p style="margin: 4px 0 0 0; font-size: 12px; color: #FF6B6B; font-weight: bold;">⭐ Next Stop</p>' : ''}
            ${isVisited ? '<p style="margin: 4px 0 0 0; font-size: 12px; color: #26DE81; font-weight: bold;">✓ Visited</p>' : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Draw routes between places
    const travelModeMap = {
      walking: 'WALKING',
      car: 'DRIVING',
      transit: 'TRANSIT',
      plane: 'DRIVING',
    };

    for (let i = 0; i < validPlaces.length - 1; i++) {
      const origin = {
        lat: parseFloat(validPlaces[i].location.lat),
        lng: parseFloat(validPlaces[i].location.lng)
      };
      const destination = {
        lat: parseFloat(validPlaces[i + 1].location.lat),
        lng: parseFloat(validPlaces[i + 1].location.lng)
      };

      const nextPlace = validPlaces[i + 1];
      const travelMode = travelModeMap[nextPlace.transportMode] || 'WALKING';

      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: mapInstanceRef.current,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#4ECDC4',
          strokeWeight: 3,
          strokeOpacity: 0.7
        }
      });

      directionsService.route({
        origin,
        destination,
        travelMode
      }, (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          directionsRenderersRef.current.push(directionsRenderer);
        }
      });
    }

    // Fit map to bounds
    if (validPlaces.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);
      if (validPlaces.length === 1) {
        mapInstanceRef.current.setZoom(15);
      }
    }

    setError(null);
  }, [places, nextPlaceId, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="w-12 h-12 border-4 border-[#4ECDC4]/20 border-t-[#4ECDC4] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">{error}</p>
        <p className="text-sm text-gray-500">
          Add locations to places in planning mode
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div
        ref={mapRef}
        className="w-full h-[500px] sm:h-[600px]"
      />

      {/* Legend */}
      <div className="p-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#FF6B6B] rounded-full border-2 border-white"></div>
          <span className="text-gray-600">Next Stop</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#4ECDC4] rounded-full border-2 border-white"></div>
          <span className="text-gray-600">Upcoming</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#26DE81] rounded-full border-2 border-white"></div>
          <span className="text-gray-600">Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#95a5a6] rounded-full border-2 border-white"></div>
          <span className="text-gray-600">Skipped</span>
        </div>
      </div>
    </div>
  );
};

export default DayMap;
