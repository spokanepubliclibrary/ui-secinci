
const parseMMDDYYYY = (dateString) => {
  const [month, day, year] = dateString.split('/').map((val) => parseInt(val, 10));
  return new Date(year, month - 1, day); 
};

export default parseMMDDYYYY;