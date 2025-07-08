const convertSecondToTime = (seconds: number) => {
  if (seconds < 60) return seconds + "s";
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
};

const convertMeterToTime = (meter: number) => {
  if (meter < 1000) return meter + "m";
  const kilometer = Math.floor(meter / 1000);
  const remainingMeter = meter % 1000;
  return `${kilometer}km ${remainingMeter}m`;
};

export { convertMeterToTime, convertSecondToTime };
