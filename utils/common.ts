const convertSecondToTime = (seconds: number) => {
  if (seconds < 60) return seconds + "s";
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (remainingMinutes === 0 && remainingSeconds === 0) return `${hours}h`;
  if (remainingSeconds === 0) return `${hours}h ${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h ${remainingSeconds}s`;
  return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
};

const convertMeterToDistance = (meter: number) => {
  if (meter < 1000) return meter + "m";
  const kilometer = meter / 1000;

  return `${kilometer}km`;
};

export { convertMeterToDistance, convertSecondToTime };
