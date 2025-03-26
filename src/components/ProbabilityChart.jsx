import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

function ProbabilityChart({ 
  equilibriumData, 
  selectedZone, 
  selectedProfiles, 
  currentDaysToEvent 
}) {
  const [chartData, setChartData] = useState([]);
  const [layout, setLayout] = useState({});
  const [loading, setLoading] = useState(true);

  // Profile color mapping 
  const profileColors = {
    'profit_maximizer': '#F59E0B', 
    'low_risk': '#3B82F6',         
    'balanced': '#10B981',         
    'safety_oriented': '#8B5CF6',  
    'guaranteed_sale': '#EF4444'   
  };

  // Helper function to get display name for profile ID
  const getProfileName = (profileId) => {
    const normalizedId = profileId.trim().toLowerCase();
    
    const names = {
      'profit_maximizer': 'Profit Maximizer',
      'low_risk': 'Low Risk',
      'balanced': 'Balanced',
      'safety_oriented': 'Safety Oriented',
      'guaranteed_sale': 'Guaranteed Sale'
    };
    
    for (const [key, value] of Object.entries(names)) {
      if (normalizedId.includes(key)) {
        return value;
      }
    }
    return profileId.charAt(0).toUpperCase() + profileId.slice(1).replace(/_/g, ' ');
  };

  useEffect(() => {
    if (!equilibriumData || equilibriumData.length === 0) {
      setLoading(true);
      return;
    }

    setLoading(true);
    
    try {
      const datasets = [];

      // Add buy probability traces for each selected profile
      if (selectedProfiles && selectedProfiles.length > 0) {
        selectedProfiles.forEach(profileId => {
          // Handle column name mismatch
          const normalizeProfileId = (id) => {
            const mapping = {
              "profit_maximizer": "profit",
              "low_risk": "low",
              "balanced": "balanced",
              "safety_oriented": "safety",
              "guaranteed_sale": "guaranteed"
            };
            return mapping[id.trim().toLowerCase()] || id.trim().toLowerCase();
          };

          const profileToMatch = normalizeProfileId(profileId);

          // Filter data for this profile and zone
          const profileData = equilibriumData.filter(d => {
            const sellerType = d.seller_type.trim().toLowerCase();
            return (sellerType === profileToMatch) && (d.zone === selectedZone);
          });

          if (profileData.length > 0) {
            // Sort by days_to_event descending
            const sortedProfileData = [...profileData].sort((a, b) => b.days_to_event - a.days_to_event);

            // Display the past up to current day
            const pastData = sortedProfileData.filter(d => d.days_to_event >= currentDaysToEvent);
            
            if (pastData.length > 0) {
              datasets.push({
                x: pastData.map(d => d.days_to_event),
                y: pastData.map(d => d.buy_probability),
                type: 'scatter',
                mode: 'lines',
                name: getProfileName(profileId),
                line: {
                  color: profileColors[profileId] || '#000000',
                  width: 2
                }
              });
            }
            
            // Add a point at current day
            const currentDayData = sortedProfileData.find(d => d.days_to_event === currentDaysToEvent);
            
            if (currentDayData) {
              datasets.push({
                x: [currentDayData.days_to_event],
                y: [currentDayData.buy_probability],
                type: 'scatter',
                mode: 'markers',
                marker: {
                  color: profileColors[profileId] || '#000000',
                  size: 10,
                  line: {
                    color: '#ffffff',
                    width: 2
                  }
                },
                showlegend: false,
                hoverinfo: 'y+text',
                text: [
                  `${getProfileName(profileId)}: ${(currentDayData.buy_probability * 100).toFixed(1)}%`
                ]
              });
            }
          }
        });
      }

      setChartData(datasets);
      
      setLayout({
        title: `${selectedZone} Ticket Buy Probability`,
        xaxis: {
          title: 'Days to Event',
          autorange: 'reversed',
          gridcolor: '#e2e8f0',
          zeroline: false
        },
        yaxis: {
          title: 'Buy Probability (0 - 1)',
          gridcolor: '#e2e8f0',
          zeroline: false
        },
        hovermode: 'closest',
        legend: {
          orientation: 'h',
          yanchor: 'bottom',
          y: -0.2,
          xanchor: 'center',
          x: 0.5
        },
        shapes: [
          {
            type: 'line',
            yref: 'paper',
            y0: 0,
            y1: 1,
            xref: 'x',
            x0: currentDaysToEvent,
            x1: currentDaysToEvent,
            line: {
              color: 'rgba(0, 0, 0, 0.5)',
              width: 1,
              dash: 'dash'
            }
          }
        ],
        margin: { l: 50, r: 20, t: 40, b: 50 },
        autosize: true,
        height: 400,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
      });

      setLoading(false);
    } catch (error) {
      console.error('Error preparing probability chart data:', error);
      setLoading(false);
    }
  }, [
    equilibriumData, 
    selectedZone, 
    selectedProfiles, 
    currentDaysToEvent
  ]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      
      {loading ? (
        <div className="h-64 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="w-full h-96">
          {chartData.length > 0 ? (
            <Plot
              data={chartData}
              layout={layout}
              config={{ responsive: true }}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div className="h-full flex justify-center items-center text-gray-500">
              No probability data available for the selected filters
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProbabilityChart;
