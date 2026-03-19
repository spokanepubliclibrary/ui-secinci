/* 
  - format 'mm/dd/yyyy' (local date) string to UTC ISO format date/time at start of day, with optional add offset in seconds
  @param {string} dateString - string set by DatePicker component
  @param {number} offsetInSeconds - Optional - defaults to 0
  @returns {string|null} ISO formatted date string as local machine date, or null if input is not present (EX: If in Pacific Time and dateString = '01/02/2025', the return is '2025-01-02T08:00:00.000Z' or with optional offsetInSeconds ('01/02/2025', 1) the return is '2025-01-02T08:00:01.000Z')
*/
const formatDateToUTCISO = (dateString, offsetInSeconds = 0) => {
  if (!dateString) return null;
  const dateObj = new Date(dateString); // interprets as midnight in local tz
  dateObj.setHours(0, 0, offsetInSeconds, 0); // force local time to midnight, offset seconds
  return dateObj.toISOString(); // convert internal epoch time to UTC ISO 
};

export default formatDateToUTCISO;