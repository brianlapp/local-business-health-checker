
import React from 'react';
import mapboxgl from 'mapbox-gl';
import { Business } from '@/types/business';

interface BusinessMarkerProps {
  business: Business;
  map: mapboxgl.Map;
  coordinates: [number, number];
  onClick?: (business: Business) => void;
}

/**
 * Creates a marker for a business on the map
 * Renders a business location with popup information
 */
const BusinessMarker = ({ 
  business, 
  map, 
  coordinates,
  onClick
}: BusinessMarkerProps): mapboxgl.Marker => {
  // Create marker element
  const el = document.createElement('div');
  el.className = 'business-marker';
  el.style.width = '24px';
  el.style.height = '24px';
  el.style.borderRadius = '50%';
  el.style.backgroundColor = business.score && business.score > 60 ? '#ef4444' : '#3b82f6';
  el.style.border = '2px solid white';
  el.style.cursor = 'pointer';
  el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
  el.style.transition = 'transform 0.2s ease';
  
  // Add hover effect
  el.addEventListener('mouseenter', () => {
    el.style.transform = 'scale(1.2)';
  });
  
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'scale(1)';
  });
  
  // Add click handler if provided
  if (onClick) {
    el.addEventListener('click', () => {
      onClick(business);
    });
  }
  
  // Create popup with business information
  const popup = new mapboxgl.Popup({ 
    offset: 25,
    closeButton: true,
    closeOnClick: false,
    maxWidth: '300px'
  })
    .setHTML(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 240px;">
        <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">${business.name}</h3>
        ${business.industry ? `<p style="margin: 4px 0; font-size: 14px; color: #666;">Industry: ${business.industry}</p>` : ''}
        ${business.website ? `<a href="${business.website.startsWith('http') ? business.website : 'https://' + business.website}" target="_blank" style="font-size: 14px; color: #3b82f6; text-decoration: none; display: block; margin-top: 8px;">${business.website}</a>` : ''}
        ${business.score ? `<p style="margin: 4px 0; font-size: 14px; color: ${business.score > 60 ? '#ef4444' : '#666'};">Opportunity Score: ${business.score}</p>` : ''}
      </div>
    `);
  
  // Create and add marker to map
  const marker = new mapboxgl.Marker(el)
    .setLngLat(coordinates)
    .setPopup(popup)
    .addTo(map);
    
  return marker;
};

export default BusinessMarker;
