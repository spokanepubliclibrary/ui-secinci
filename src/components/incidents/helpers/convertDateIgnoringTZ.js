
// used for rendering instance values where only the date is considered
function convertDateIgnoringTZ(isoString) {
  const [yyyy, mm, dd] = isoString.split('T')[0].split('-');
  return `${mm}/${dd}/${yyyy}`;
};

export default convertDateIgnoringTZ;