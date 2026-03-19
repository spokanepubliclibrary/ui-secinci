/* 
  -sort for ascending alphabetical order
  @param {Array} locationsInServiceArray - array containing opted-in locations for service
  @returns {Array} reference of location objects sorted in alphabetical order by their 'location' key value
*/
const alphabetize = (locationsInServiceArray) => {
  const sorted = locationsInServiceArray.sort((a, b) => {
    if (a.location < b.location) {
      return -1;
    }
    if (a.location > b.location) {
      return 1; 
    }
    return 0;
  });
  return sorted;
} 
export default alphabetize;