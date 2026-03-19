
import buildQueryString from "./buildQueryString";

const extractFilterString = (params = {}) => {
  // return valid URL if no params
  if (Object.keys(params).length === 0) return "";

  const { limit, offset, ...filters } = params; 
  return buildQueryString(filters);
}

export default extractFilterString;