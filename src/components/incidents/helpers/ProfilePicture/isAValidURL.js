export const isAValidURL = (str) => {
  return URL.canParse(str);
};