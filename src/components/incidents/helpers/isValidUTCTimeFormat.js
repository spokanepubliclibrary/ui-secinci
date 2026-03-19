



const isValidUTCTimeFormat = (timeString) => {
  console.log("@isValidUTCTimeFormat - timeString:", timeString);
  if (!timeString) return false;

  // regex for "hh:mm:ss.sssZ" UTC ISO format
  const timePattern = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)\.\d{3}Z$/;
  return timePattern.test(timeString);
};

export default isValidUTCTimeFormat;
