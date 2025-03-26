import React, { useState, useEffect } from 'react';

function StrategyPanel({ 
  equilibriumData, 
  selectedZone, 
  selectedProfiles, 
  currentDaysToEvent 
}) {
  const [recommendations, setRecommendations] = useState([]);

  // Profile color mapping
  const profileColors = {
    'profit_maximizer': '#F59E0B',
    'low_risk': '#3B82F6',         
    'balanced': '#10B981',         
    'safety_oriented': '#8B5CF6', 
    'guaranteed_sale': '#EF4444'   
  };

  // Helper function to adjust column naming differences
  const normalizeProfileId = (id) => {
    const mapping = {
      'profit_maximizer': 'profit',
      'low_risk': 'low',
      'balanced': 'balanced',
      'safety_oriented': 'safety',
      'guaranteed_sale': 'guaranteed'
    };
    return mapping[id.trim().toLowerCase()] || id.trim().toLowerCase();
  };

  // Helper function to get display name for profile ID
  const getProfileName = (profileId) => {
    const names = {
      'profit_maximizer': 'Profit Maximizer',
      'low_risk': 'Low Risk',
      'balanced': 'Balanced',
      'safety_oriented': 'Safety Oriented',
      'guaranteed_sale': 'Guaranteed Sale'
    };
    return names[profileId] || profileId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  useEffect(() => {
    if (!equilibriumData || equilibriumData.length === 0) {
      setRecommendations([]);
      return;
    }

    const newRecommendations = [];

    selectedProfiles.forEach(profileId => {
      // Find data for this profile, zone, and day to give strategy
      const profileToMatch = normalizeProfileId(profileId);
      
      const profileData = equilibriumData.filter(d => {
        const sellerType = d.seller_type.trim().toLowerCase();
        return sellerType === profileToMatch && d.zone === selectedZone && d.days_to_event === currentDaysToEvent;
      });
      
      if (profileData.length > 0) {
        const data = profileData[0];
        newRecommendations.push({
          profileId,
          name: getProfileName(profileId),
          color: profileColors[profileId] || '#000000',
          price: data.equilibrium_price?.toFixed(2),
          probability: (data.buy_probability * 100).toFixed(1)
        });
      }
    });

    setRecommendations(newRecommendations);
  }, [equilibriumData, selectedZone, selectedProfiles, currentDaysToEvent]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        gap: '10px', 
        overflowX: 'auto', 
        whiteSpace: 'nowrap'
      }}>
      {recommendations.map(rec => (
        <div 
          key={rec.profileId} 
          style={{ 
            border: `1px solid ${rec.color}`,
            borderRadius: '4px',
            padding: '10px',
            minWidth: '180px'
          }}
        >
          <div style={{ color: rec.color, fontWeight: 'bold', marginBottom: '5px' }}>
            {rec.name}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Price: <strong>${rec.price}</strong></span>
            <span style={{ marginLeft: '1px' }}>Prob: <strong>{rec.probability}%</strong></span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StrategyPanel;