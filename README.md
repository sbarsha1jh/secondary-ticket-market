```
Secondary-Ticket-Market/
├── public/
│   └── data/                  # Data files
│       ├── market_data.csv    # Historical market data
│       └── equilibrium_data.csv # Nash equilibrium calculations
└── src/
    ├── components/            # UI Components
    │   ├── StadiumMap.jsx     # Visual stadium layout
    │   ├── TimeSlider.jsx     # Days-to-event slider
    │   ├── PriceChart.jsx     # Price trend visualization
    │   ├── ProbabilityChart.jsx # Purchase probability viz
    │   └── StrategyPanel.jsx  # Current day recommendations
    ├── hooks/
    │   └── useDataLoader.js   # Data loading and processing
    └── App.jsx                # Main application component
``` 
