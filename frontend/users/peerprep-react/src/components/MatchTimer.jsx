import React, { useState, useEffect, useRef } from 'react';

function MatchTimer({ initialSeconds }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds - 1);
    }, 1000);
    return () => clearInterval(intervalRef.current); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (seconds < 0) {
      clearInterval(intervalRef.current);
    }
  }, [seconds]);

  return <div><span>⏳</span> Timeout: {seconds}</div>;
}

export default MatchTimer;