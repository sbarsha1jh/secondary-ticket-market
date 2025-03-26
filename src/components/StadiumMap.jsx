import React from 'react';

function StadiumMap({ selectedZone, onZoneSelect }) {
  // Define the ticket zones
  const zones = [
    { id: 'Standard', color: '#4299e1', description: 'Balcony, Rafters, SportsDeck, Deck' }, 
    { id: 'Premium', color: '#48bb78', description: 'Loge, Club, North Lounge' }, 
    { id: 'Luxury', color: '#ed8936', description: 'VIP, Floor, Suites, Boardroom, Lofts' }    // currently hidden because sample size too small
  ];

  // Filter to only Standard and Premium for the legend (luxury sample size currently too small)
  const legendZones = zones.filter(zone => zone.id !== 'Luxury');

  return (
    <div className="bg-white rounded-lg shadow p-3 flex">
      <div className="flex-grow relative">
        <svg 
          viewBox="0 0 800 500" 
          className="w-full h-auto"
          style={{ maxHeight: '180px' }}
        >
          {/* Outer stadium  */}
          <path
            d="M50,250 C50,150 150,50 400,50 C650,50 750,150 750,250 C750,350 650,450 400,450 C150,450 50,350 50,250 Z"
            fill={selectedZone === 'Standard' ? zones.find(z => z.id === 'Standard').color : '#e2e8f0'} 
            stroke="#94a3b8"
            strokeWidth="2"
          />
          
          {/* White separator */}
          <path
            d="M100,250 C100,170 180,100 400,100 C620,100 700,170 700,250 C700,330 620,400 400,400 C180,400 100,330 100,250 Z"
            fill="white"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          
          {/* Mid-level  */}
          <path
            d="M120,250 C120,180 200,120 400,120 C600,120 680,180 680,250 C680,320 600,380 400,380 C200,380 120,320 120,250 Z"
            fill={selectedZone === 'Premium' ? zones.find(z => z.id === 'Premium').color : '#e2e8f0'} 
            stroke="#94a3b8"
            strokeWidth="2"
          />
          
          {/* White separator */}
          <path
            d="M220,250 C220,200 270,170 400,170 C530,170 580,200 580,250 C580,300 530,330 400,330 C270,330 220,300 220,250 Z"
            fill="white"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          
          {/* Inner bowl  */}
          <path
            d="M240,250 C240,210 290,190 400,190 C510,190 560,210 560,250 C560,290 510,310 400,310 C290,310 240,290 240,250 Z"
            fill={selectedZone === 'Luxury' ? zones.find(z => z.id === 'Luxury').color : '#e2e8f0'} 
            stroke="#94a3b8"
            strokeWidth="2"
          />
          
          {/* Basketball Court */}
          <rect x="320" y="210" width="160" height="80" fill="#c2935f" stroke="#94a3b8" strokeWidth="2" rx="5" />
          <circle cx="400" cy="250" r="10" fill="#10B981" stroke="#ffffff" strokeWidth="1" />
          
          {/* Zone Labels*/}
          <text x="400" y="85" textAnchor="middle" fontSize="25" fontWeight="bold" fill="#1e293b">STANDARD</text>
          <text x="400" y="150" textAnchor="middle" fontSize="25" fontWeight="bold" fill="#1e293b">PREMIUM</text>
        </svg>
      </div>
      
      {/* Zone selector */}
      <div className="ml-4 flex flex-col justify-center">
        <h3 className="text-sm font-semibold mb-2">Zone:</h3>
        {legendZones.map(zone => (
          <div 
            key={zone.id} 
            className={`flex items-center mb-2 px-2 py-1 rounded cursor-pointer ${
              selectedZone === zone.id ? 'bg-gray-100' : ''
            }`}
            onClick={() => onZoneSelect(zone.id)}
          >
            <div 
              className="w-4 h-4 mr-2 rounded" 
              style={{ backgroundColor: zone.color }}
            ></div>
            <span className={`text-sm ${selectedZone === zone.id ? 'font-bold' : ''}`}>
              {zone.id}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StadiumMap;