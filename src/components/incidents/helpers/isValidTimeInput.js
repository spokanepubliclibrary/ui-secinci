


const isValidTimeInput = (timeString) => {
  if(!timeString) return null;
  // space character required between final number char and first alphabet char
  const timePattern = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/i; 
  return timePattern.test(timeString);
}

export default isValidTimeInput;