  
/* 
  @param {string} dateString - validate for strict format of mm/dd/yyyy in DatePicker component
  @returns: zero-padded single digits for months, days, four digit year
  - not allowed: non-existent date number (ex: 02/33/2024), alphabet chars, extra spaces, or non-slash delimiters
  - convert to ISO format is handled at relevant submit function
*/  
const isValidDateFormat = (dateString) => {
  if(!dateString) return null; 
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d\d$/;
  return regex.test(dateString)
};

export default isValidDateFormat; 