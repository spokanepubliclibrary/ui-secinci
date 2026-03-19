/* 
  - concatenate 'mm/dd/yyyy' string and 'HH:MM AM/PM' string and format 
    to UTC ISO format 
  @param {string} dateString - string set by DatePicker component
  @param {string} timeString - string set by TimePicker component
  @returns {string} ISO formatted date string, or null if input is not present
*/
const formatDateAndTimeToUTCISO = (dateString, timeString) => {
  if (!dateString || !timeString) return null;
  const utcDateTime = new Date(`${dateString} ${timeString}`).toISOString();
  return utcDateTime
};

export default formatDateAndTimeToUTCISO;
