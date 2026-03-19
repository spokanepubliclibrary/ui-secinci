
/* 
  @param {string} queryString - parse query string from current URL
  @returns: obj w/ key/values of query string
*/  
const parseQueryString = (queryString) => {
  const query = {};
  const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    query[decodeURIComponent(key)] = decodeURIComponent(value || '');
  }
  return query;
};

export default parseQueryString