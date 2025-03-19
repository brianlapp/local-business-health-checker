
import mapboxgl from 'mapbox-gl';
import { Business } from '@/types/business';
import { generateRandomPointInRadius } from '@/services/map/geocodingService';

/**
 * Renders a circular radius around a center point on the map
 */
export const renderRadiusCircle = (
  map: mapboxgl.Map,
  coordinates: [number, number],
  radiusKm: number
): void => {
  const existingSource = map.getSource('radius-circle');
  
  if (existingSource) {
    (existingSource as mapboxgl.GeoJSONSource).setData({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates
      },
      properties: {
        radius: radiusKm * 1000
      }
    });
  } else {
    map.addSource('radius-circle', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates
        },
        properties: {
          radius: radiusKm * 1000
        }
      }
    });
    
    map.addLayer({
      id: 'radius-circle-fill',
      type: 'circle',
      source: 'radius-circle',
      paint: {
        'circle-radius': ['get', 'radius'],
        'circle-color': '#3b82f6',
        'circle-opacity': 0.15,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#3b82f6',
        'circle-stroke-opacity': 0.5,
        'circle-radius-units': 'meters'
      }
    });
  }
};

/**
 * Creates a location selection popup at the specified coordinates
 */
export const createLocationSelectionPopup = (
  map: mapboxgl.Map,
  coordinates: { lng: number, lat: number },
  onLocationSelect: (location: string) => void
): mapboxgl.Popup => {
  const popup = new mapboxgl.Popup()
    .setLngLat([coordinates.lng, coordinates.lat])
    .setHTML(`
      <div style="text-align: center;">
        <strong>Selected Location</strong><br>
        <button 
          id="use-location-btn"
          style="
            background: #3b82f6; 
            color: white; 
            border: none; 
            padding: 4px 8px; 
            border-radius: 4px;
            margin-top: 4px;
            cursor: pointer;
          "
        >
          Search this area
        </button>
      </div>
    `)
    .addTo(map);
    
  setTimeout(() => {
    document.getElementById('use-location-btn')?.addEventListener('click', () => {
      const locationStr = `${coordinates.lat.toFixed(6)},${coordinates.lng.toFixed(6)}`;
      onLocationSelect(locationStr);
    });
  }, 100);
  
  return popup;
};

/**
 * Generates marker coordinates for a business within the specified radius
 */
export const getBusinessMarkerCoordinates = (
  business: Business,
  centerCoordinates: [number, number],
  radiusKm: number
): [number, number] => {
  return generateRandomPointInRadius(centerCoordinates, radiusKm * 0.8);
};
