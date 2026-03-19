/* 
  - @returns {string} 'mm/dd/yyyy' to populate in DatePicker component on initial render 
*/
const getTodayDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${month}/${day}/${year}`;
};

export default getTodayDate;
