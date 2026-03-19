/* 
  - @returns {string} 'hh:mm AM/PM' to populate in TimePicker component on initial render 
*/

const getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // 12-hour format
  // console.log(`hours before format: ${hours} - formattedHours: ${formattedHours}`)
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const currentTime = `${formattedHours}:${formattedMinutes} ${ampm}`
  // return `${formattedHours}:${formattedMinutes} ${ampm}`
  // console.log("@getCurrentTime - currentTime: ", currentTime)
  return currentTime; 
}

// console.log(getCurrentTime());
export default getCurrentTime;