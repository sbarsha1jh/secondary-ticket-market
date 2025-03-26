import { useState, useEffect } from 'react';
import Papa from 'papaparse';

/**
 * Hook to load and parse the CSV data files
 */
function useDataLoader() {
  const [marketData, setMarketData] = useState([]);
  const [equilibriumData, setEquilibriumData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Load market data
        const marketResponse = await fetch('/secondary-ticket-market/data/market_data.csv');
        const marketCsv = await marketResponse.text();
        
        // Parse market data
        Papa.parse(marketCsv, {
          header: true,
          dynamicTyping: true, 
          delimiter: ",",
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn('Some errors occurred while parsing market_data.csv:', results.errors);
            }
            setMarketData(results.data);
          },
          error: (error) => {
            setError('Error parsing market data: ' + error.message);
          }
        });
        
        // Load equilibrium data
        const equilibriumResponse = await fetch('/secondary-ticket-market/data/equilibrium_data.csv');
        const equilibriumCsv = await equilibriumResponse.text();
        
        // Parse equilibrium data
        Papa.parse(equilibriumCsv, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn('Some errors occurred while parsing equilibrium_data.csv:', results.errors);
            }
            setEquilibriumData(results.data);
            setLoading(false);
          },
          error: (error) => {
            setError('Error parsing equilibrium data: ' + error.message);
          }
        });
      } catch (err) {
        setError('Error loading data: ' + err.message);
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Return the loaded data and state
  return { 
    marketData, 
    equilibriumData, 
    loading, 
    error 
  };
}

export default useDataLoader;