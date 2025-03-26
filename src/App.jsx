import { useState, useEffect } from 'react';
import StadiumMap from './components/StadiumMap';
import TimeSlider from './components/TimeSlider';
import PriceChart from './components/PriceChart';
import useDataLoader from './hooks/useDataLoader';
import ProbabilityChart from './components/ProbabilityChart';
import StrategyPanel from './components/StrategyPanel';

function App() {
  // Load data
  const { marketData, equilibriumData, loading, error } = useDataLoader();
  
  // State
  const [selectedZone, setSelectedZone] = useState('Standard');
  const [currentDaysToEvent, setCurrentDaysToEvent] = useState(25);
  const [selectedProfiles, setSelectedProfiles] = useState(['balanced', 'profit_maximizer', 'guaranteed_sale']);
  const [compareWithMarket, setCompareWithMarket] = useState(false);
  
  // Initialize with all seller types when data loads
  useEffect(() => {
    if (equilibriumData && equilibriumData.length > 0) {
        // Find unique seller types from the data
        const sellerTypes = [...new Set(equilibriumData.map(d => d.seller_type))];
        if (sellerTypes.length > 0) {
            // Only update the profiles if none are selected yet
            if (selectedProfiles.length === 0) {
                const defaultProfiles = ['balanced', 'profit_maximizer', 'guaranteed_sale'].filter(profile => 
                    sellerTypes.some(type => type.toLowerCase().includes(profile))
                );
                console.log("Setting default profiles to:", defaultProfiles);
                setSelectedProfiles(defaultProfiles);
            }
        }
    }
}, [equilibriumData]);


  // Handlers for loading/error states
  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-xl">Loading data...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center p-8 max-w-lg">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
        <p className="text-gray-700">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Secondary Ticket Market Analysis</h1>
        <p className="text-gray-600 text-sm">
          Interactive visualization of Nash equilibrium pricing strategies for the secondary ticket market, using Lakers @ Celtics (Feb. 1, 2024)
        </p>
      </header>
      
      {/* Stadium Map and Zone Selection  */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-1 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Select Ticket Zone</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {['Standard', 'Premium'].map(zone => (
              <button
                key={zone}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  selectedZone === zone 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                onClick={() => setSelectedZone(zone)}
              >
                {zone}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {selectedZone === 'Standard' && 'Balcony, Rafters, SportsDeck, Deck'}
            {selectedZone === 'Premium' && 'Loge, Club, North Lounge'}
          </div>
        </div>
        
        <div className="md:col-span-2">
          <StadiumMap 
            selectedZone={selectedZone} 
            onZoneSelect={setSelectedZone} 
            className="h-40"
          />
        </div>
      </div>
      
      {/* Seller Profiles*/}
      <div className="bg-white rounded-lg shadow p-3 mb-3">
        <div className="flex flex-wrap items-center">
          <h2 className="text-lg font-semibold mr-4">Select Seller Profiles: (hover for descriptions)</h2>
          
          <label className="flex items-center cursor-pointer mr-3">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 rounded mr-1"
              checked={selectedProfiles.length === [...new Set(equilibriumData.map(d => d.seller_type))].length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedProfiles(['profit_maximizer', 'low_risk', 'balanced', 'safety_oriented', 'guaranteed_sale']);
                } else {
                  setSelectedProfiles([]);
                }
              }}
            />
            <span className="text-sm">All</span>
          </label>
          
          {['profit_maximizer', 'low_risk', 'balanced', 'safety_oriented', 'guaranteed_sale'].map(profile => {
            const labels = {
              'profit_maximizer': 'Profit Max',
              'low_risk': 'Low Risk',
              'balanced': 'Balanced',
              'safety_oriented': 'Safety',
              'guaranteed_sale': 'Guaranteed'
            };
            
            const colors = {
              'profit_maximizer': '#F59E0B',
              'low_risk': '#3B82F6',
              'balanced': '#10B981',
              'safety_oriented': '#8B5CF6',
              'guaranteed_sale': '#EF4444'
            };
            
            const descriptions = {
              'profit_maximizer': 'Risk-seeking strategy focused on maximum profit (risk_aversion: 0.1)',
              'low_risk': 'Moderate risk tolerance with focus on profit (risk_aversion: 0.3)',
              'balanced': 'Balanced approach between profit and sale probability (risk_aversion: 0.5)',
              'safety_oriented': 'Prioritizes sale likelihood over maximum profit (risk_aversion: 0.7)',
              'guaranteed_sale': 'Focuses on ensuring tickets are sold, even at lower prices (risk_aversion: 0.9)'
            };
            
            return (
              <label 
                key={profile} 
                className="flex items-center cursor-pointer mr-3 group relative"
                title={descriptions[profile]} 
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded mr-1"
                  checked={selectedProfiles.includes(profile)}
                  onChange={() => {
                    if (selectedProfiles.includes(profile)) {
                      setSelectedProfiles(selectedProfiles.filter(p => p !== profile));
                    } else {
                      setSelectedProfiles([...selectedProfiles, profile]);
                    }
                  }}
                />
                <span className="text-sm whitespace-nowrap" style={{ color: colors[profile] }}>
                  {labels[profile]}
                </span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded w-48 z-10">
                  {descriptions[profile]}
                  <div className="absolute top-full left-4 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
      
      {/* Strategy Recommendations */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Strategy Recommendations for Current Day (nash eq. of price strategy for seller and probability buyer chooses to purchase)</h2>
        <StrategyPanel
          equilibriumData={equilibriumData}
          selectedZone={selectedZone}
          selectedProfiles={selectedProfiles}
          currentDaysToEvent={currentDaysToEvent}
        />
      </div>

      {/* Time Slider */}
      <div className="mb-4">
        <TimeSlider 
          data={equilibriumData}
          selectedZone={selectedZone}
          currentDaysToEvent={currentDaysToEvent}
          onTimeChange={setCurrentDaysToEvent}
        />
      </div>  
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Nash Eq. Price Through Current Day</h2>
              <label className="flex items-center cursor-pointer">
                <span className="mr-2 text-sm text-gray-600">Compare with Market Prices</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={compareWithMarket}
                    onChange={() => setCompareWithMarket(!compareWithMarket)}
                  />
                  <div className={`block w-10 h-5 rounded-full ${compareWithMarket ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
                  <div className={`dot absolute left-1 top-0.5 bg-white w-4 h-4 rounded-full transition ${compareWithMarket ? 'transform translate-x-5' : ''}`}></div>
                </div>
              </label>
            </div>
            <PriceChart
              marketData={marketData}
              equilibriumData={equilibriumData}
              selectedZone={selectedZone}
              selectedProfiles={selectedProfiles}
              currentDaysToEvent={currentDaysToEvent}
              compareWithMarket={compareWithMarket}
              height={300}
            />
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-2">Probability of Purchase Through Current Day</h2>
            <ProbabilityChart
              equilibriumData={equilibriumData}
              selectedZone={selectedZone}
              selectedProfiles={selectedProfiles}
              currentDaysToEvent={currentDaysToEvent}
              height={300}
            />
          </div>
        </div>
      </div>    
      
      {/* Data Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Market Data Summary</h2>
          {marketData.length > 0 ? (
            <div className="space-y-1 text-sm">
              <p>Total data points: <span className="font-medium">{marketData.length}</span></p>
              <p>Zones: <span className="font-medium">{[...new Set(marketData.map(d => d.zone))].join(', ')}</span></p>
              <p>Days covered: <span className="font-medium">{Math.max(...marketData.map(d => d.days_to_event)) || 'N/A'}</span></p>
              <p>Current selection: <span className="font-medium">{selectedZone} zone, {currentDaysToEvent} days to event</span></p>
            </div>
          ) : (
            <p>No market data available</p>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Equilibrium Data Summary</h2>
          {equilibriumData.length > 0 ? (
            <div className="space-y-1 text-sm">
              <p>Total calculations: <span className="font-medium">{equilibriumData.length}</span></p>
              <p>Seller types: <span className="font-medium">{[...new Set(equilibriumData.map(d => d.seller_type))].join(', ').replace(/_/g, ' ')}</span></p>
              <p>Selected profiles: <span className="font-medium">{selectedProfiles.length > 0 ? selectedProfiles.map(p => p.replace(/_/g, ' ')).join(', ') : 'None'}</span></p>
              <p>Selected zone: <span className="font-medium">{selectedZone}</span></p>
            </div>
          ) : (
            <p>No equilibrium data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;