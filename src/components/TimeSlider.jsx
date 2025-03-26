import React, { useState, useEffect } from 'react';

function TimeSlider({ data, selectedZone, onTimeChange, currentDaysToEvent }) {
  const [daysList, setDaysList] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState(null);

  useEffect(() => {
    if (data && data.length > 0 && selectedZone) {
      const uniqueDays = Array.from(
        new Set(data
          .filter(d => d.zone === selectedZone)
          .map(d => Number(d.days_to_event))
        )
      ).sort((a, b) => b - a); // Sort in descending order (highest days first and closer days on the right)

      setDaysList(uniqueDays);
    }
  }, [data, selectedZone]);

  // Automatically decrement days when playing
  useEffect(() => {
    if (playing && daysList.length > 0) {
      const interval = setInterval(() => {
        onTimeChange(prevDay => {
          const currentIndex = daysList.indexOf(prevDay);

          // In descending order, increasing index means decreasing days
          if (currentIndex >= daysList.length - 1) {
            setPlaying(false);
            return daysList[daysList.length - 1]; // Return the smallest day in the current set (closest to event)
          }

          const newIndex = currentIndex + 1;
          return daysList[newIndex];
        });
      }, 1000);

      setPlayInterval(interval);
    } else if (playInterval) {
      clearInterval(playInterval);
      setPlayInterval(null);
    }

    return () => {
      if (playInterval) clearInterval(playInterval);
    };
  }, [playing, daysList, onTimeChange]);

  const currentIndex = daysList.indexOf(currentDaysToEvent);

  const handleSliderChange = (e) => {
    const newIndex = Number(e.target.value);
    const newDay = daysList[newIndex];
    onTimeChange(newDay);
  };

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
    } else {
      setPlaying(true);
    }
  };

  const formatDayLabel = (days) => {
    if (days === 0) return "Event Day";
    if (days === 1) return "1 Day Before";
    return `${days} Days Before Event`;
  };

  const generateTickIndices = () => {
    const length = daysList.length;
    if (length <= 1) return [0];

    const maxTicks = 5;
    const step = Math.max(1, Math.floor(length / (maxTicks - 1)));
    const ticks = [];

    for (let i = 0; i < length; i += step) {
      ticks.push(i);
    }

    if (ticks[ticks.length - 1] !== length - 1) {
      ticks.push(length - 1);
    }

    return ticks;
  };

  const tickIndices = generateTickIndices();

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Time to Event (scroll manually or hit play to see how values change over time!)</h2>
        <button
          onClick={togglePlay}
          className={`px-3 py-1 rounded-lg ${playing 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>

      {daysList.length === 0 ? (
        <p className="text-gray-600">No data available for the selected zone.</p>
      ) : (
        <>
          <div className="relative mb-2">
            <input
              type="range"
              min={0}
              max={daysList.length - 1}
              value={currentIndex >= 0 ? currentIndex : 0}
              onChange={handleSliderChange}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between px-1 mt-1">
              {tickIndices.map(tickIndex => (
                <div key={tickIndex} className="text-xs text-gray-500">|</div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-xs text-gray-600">{daysList[0]} Days Before </span>
            <span className="text-lg font-semibold">
              {currentIndex >= 0 ? formatDayLabel(daysList[currentIndex]) : "Loading..."}
            </span>
            <span className="text-xs text-gray-600">Event Day</span>
          </div>
        </>
      )}
    </div>
  );
}

export default TimeSlider;