
import React from 'react';
import mapboxgl from 'mapbox-gl';
import { Business } from '@/types/business';

interface BusinessMarkerProps {
  business: Business;
  map: mapboxgl.Map;
  coordinates: [number, number];
}

/**
 * Creates a marker for a business on the map
 */
const BusinessMarker = ({ business, map, coordinates }: BusinessMarkerProps): mapboxgl.Marker => {
  const el = document.createElement('div');
  el.className = 'business-marker';
  el.style.width = '24px';
  el.style.height = '24px';
  el.style.borderRadius = '50%';
  el.style.backgroundColor = '#3b82f6';
  el.style.border = '2px solid white';
  el.style.cursor = 'pointer';
  el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
  
  const popup = new mapboxgl.Popup({ offset: 25 })
    .setHTML(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 240px;">
        <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">${business.name}</h3>
        ${business.industry ? `<p style="margin: 4px 0; font-size: 14px; color: #666;">Industry: ${business.industry}</p>` : ''}
        ${business.website ? `<a href="https://${business.website}" target="_blank" style="font-size: 14px; color: #3b82f6; text-decoration: none;">${business.website}</a>` : ''}
      </div>
    `);
  
  const marker = new mapboxgl.Marker(el)
    .setLngLat(coordinates)
    .setPopup(popup)
    .addTo(map);
    
  return marker;
};

export default BusinessMarker;
