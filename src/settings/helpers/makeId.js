/* 
  -transform name or title to ID
  -@example: "Yasuhara Middle School" --> "yasuhara-middle-school"
  -@example: "1.1 Failure to comply" --> "1-1-failure-to-comply"
  @param {String} name or title relating to obj 
  @returns {string} ID based on name or title to lowercase and delimited by replacing any non a-z, 0-9 characters with hyphen (no non-alpha/num chars) and trimmed for no preceding or hanging hyphens. this new string is used as an id for that related obj
*/
const makeId = (string) => {
  const replaceSpace = string.replace(/[^A-Za-z0-9]+/g, '-');
  const lower_case = replaceSpace.toLowerCase();
  const trimmed = lower_case.replace(/^-+|-+$/g, '');
  return trimmed;
};

export default makeId;