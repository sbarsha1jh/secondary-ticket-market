import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

function PriceChart({ 
  marketData, 
  equilibriumData, 
  selectedZone, 
  selectedProfiles, 
  currentDaysToEvent,
  compareWithMarket = false 
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
    // Normalize the profile ID
    const normalizedId = profileId.trim().toLowerCase();
    
    const names = {
      'profit_maximizer': 'Profit Maximizer',
      'low_risk': 'Low Risk',
      'balanced': 'Balanced',
      'safety_oriented': 'Safety Oriented',
      'guaranteed_sale': 'Guaranteed Sale'
    };
    
    // Find matching key
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
      
      // Filter market data if market toggle is set to  true
      if (compareWithMarket && marketData && marketData.length > 0) {
        const zoneMarketData = marketData.filter(d => d.zone === selectedZone);
        
        if (zoneMarketData.length > 0) {
          const sortedMarketData = [...zoneMarketData].sort((a, b) => b.days_to_event - a.days_to_event);
          
          // Add market median price trace
          datasets.push({
            x: sortedMarketData.map(d => d.days_to_event),
            y: sortedMarketData.map(d => d.median_price),
            type: 'scatter',
            mode: 'lines',
            name: 'Market Median Price',
            line: {
              color: '#64748b',  // Slate-500
              width: 3,
              dash: 'dot'
            }
          });
        }
      }

      // Add equilibrium price traces for each selected profile
      if (selectedProfiles && selectedProfiles.length > 0) {
        // Log for debugging
        console.log("Selected profiles:", selectedProfiles);
        
        selectedProfiles.forEach(profileId => {
          // Filter data for this profile and zone
          const profileData = equilibriumData.filter(
            d => {
              // Ensure we're matching the profile ID format correctly
              // Convert d.seller_type to the same format as profileId if needed
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
            
            const sellerType = d.seller_type.trim().toLowerCase();
            const profileToMatch = normalizeProfileId(profileId);
              const zoneMatches = d.zone === selectedZone;
              
              // Debugging logs
              if (sellerType === profileToMatch && zoneMatches) {
                console.log(`Found match for ${profileId} in zone ${selectedZone}`);
              }
              
              return sellerType === profileToMatch && zoneMatches;
            }
          );
          
          // Debugging logs
          console.log(`Profile ${profileId} has ${profileData.length} data points`);
          
          if (profileData.length > 0) {
            // Sort by days to event
            const sortedProfileData = [...profileData].sort((a, b) => b.days_to_event - a.days_to_event);
            
            // Create line showing the past trajectory
            const pastData = sortedProfileData.filter(d => d.days_to_event >= currentDaysToEvent);
            
            if (pastData.length > 0) {
              datasets.push({
                x: pastData.map(d => d.days_to_event),
                y: pastData.map(d => d.equilibrium_price),
                type: 'scatter',
                mode: 'lines',
                name: getProfileName(profileId),
                line: {
                  color: profileColors[profileId] || '#000000',
                  width: 2
                }
              });
            }
            
            // Add a point for the current day
            const currentDayData = sortedProfileData.find(d => d.days_to_event === currentDaysToEvent);
            
            if (currentDayData) {
              datasets.push({
                x: [currentDayData.days_to_event],
                y: [currentDayData.equilibrium_price],
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
                text: [`${getProfileName(profileId)}: ${currentDayData.equilibrium_price.toFixed(2)}`]
              });
            }
          }
        });
      }

      setChartData(datasets);
      
      setLayout({
        title: `${selectedZone} Ticket Prices`,
        xaxis: {
          title: 'Days to Event',
          autorange: 'reversed',
          gridcolor: '#e2e8f0',
          zeroline: false
        },
        yaxis: {
          title: 'Price ($)',
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
        shapes: [{
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
        }],
        margin: { l: 50, r: 20, t: 40, b: 50 },
        autosize: true,
        height: 400,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
      });

      setLoading(false);
    } catch (error) {
      console.error("Error preparing chart data:", error);
      setLoading(false);
    }
  }, [equilibriumData, marketData, selectedZone, selectedProfiles, currentDaysToEvent, compareWithMarket]);

  const handleCompareToggle = () => {

  };

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
              No data available for the selected filters
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PriceChart;