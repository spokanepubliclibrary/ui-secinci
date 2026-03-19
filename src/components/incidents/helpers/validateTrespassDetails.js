import isValidDateFormat from './isValidDateFormat';

export const isDeclarationOfServiceEmpty = (declaration = {}) =>
  Object.values(declaration).every(value => value === '' || value === false);

export const validateDeclarationOfService = (declaration) => {
  if (!declaration) return true;
  const { date, placeSigned, title, signature } = declaration;
  const fields = [date, placeSigned, title, signature];
  const allFilled = fields.every(Boolean);
  const allEmpty = fields.every(value => !value);
  return allEmpty || (allFilled && isValidDateFormat(date));
};

export const validateDateFields = (data = {}) => {
  const { endDateOfTrespass, declarationOfService } = data;
  const dateValues = [endDateOfTrespass, declarationOfService?.date];
  return dateValues.every(val => val === '' || isValidDateFormat(val));
};

export const hasTrespassReason = (data = {}) => {
  const arr = data.exclusionOrTrespassBasedOn;
  if (!Array.isArray(arr)) return false;
  return arr.some(item => {
    if (!item) return false;
    if (typeof item === 'string') return item.trim() !== '';
    if (typeof item === 'object') return typeof item.id === 'string' && item.id.trim() !== '';
    return false;
  });
};

export const validateTrespass = (data) => {
  const dateFieldsValid = validateDateFields(data);
  const declarationValid = validateDeclarationOfService(data.declarationOfService);
  const reasonsValid = hasTrespassReason(data);
  return dateFieldsValid && declarationValid && reasonsValid;
};