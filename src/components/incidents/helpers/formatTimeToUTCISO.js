/* 
  - format timeString to to UTC ISO w/ associated 'dateOfIncident'
    as date value the string
  @param {string} dateOfIncidentString - user inputted value from Datepicker 
  component fed via formData 
    (Ex: "10/30/2024")
  @param {string} timeString - user inputted value from Timepicker component 
    (Ex: "9:33 AM")
  @returns {string} UTC ISO formatted datetime string, or null if input is not present
    (Ex: '2024-10-16T17:27:00.000Z')
*/

const formatTimeToUTCISO = (dateOfIncidentString, timeString) => {
  if (!dateOfIncidentString || !timeString) {
    return null;
  };

  // check if timeString is already in ISO
  if (!isNaN(Date.parse(timeString))) {
    console.log("timeString: ", timeString)
    return timeString;
  }
  const utcDateTime = new Date(`${dateOfIncidentString} ${timeString}`).toISOString();
  // console.log("utcDateTime: ", utcDateTime)
  return utcDateTime;
}

export default formatTimeToUTCISO;