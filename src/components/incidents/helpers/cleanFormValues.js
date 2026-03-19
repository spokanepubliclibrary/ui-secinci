
// intlDTFResolvedOptionsTZ = Intl.DateTimeFormat().resolvedOptions().timeZone
const cleanFormValues = (formParamsObject, orgTZ, intlDTFResolvedOptionsTZ) => {
  const trimmedTerm = formParamsObject.term?.trim();
  const cleanedSearchParams = Object.keys(formParamsObject).reduce((acc, key) => {
    const value = formParamsObject[key];

    // includeSuppressed should only be sent when it is true
    if (key === 'includeSuppressed' && value !== true) {
      return acc; // skip when false or undefined
    }

    if ((key === 'currentTrespass' || key === 'expiredTrespass') && value !== true) {
      return acc; //skip this key
    };

    // handle searchType when it is 'created-by' or 'witnessed-by'
    // is case of use UI Select for those keys and move them to its own key outside of searchType
    // so single source of truth (UI has options for searchType Select OR single text field filter)
    if (key === 'searchType' && value === 'created-by' && trimmedTerm) {
      acc['createdBy'] = trimmedTerm;
      return acc; //skip adding 'searchType' and 'term'
    } else if (key === 'searchType' && value === 'witnessed-by' && trimmedTerm) {
      acc['witnessedBy'] = trimmedTerm;
      return acc; //skip adding 'searchType' and 'term'
    };

    // check for searchType without term
    if (key === 'searchType' && !trimmedTerm) {
      return acc; //skip adding 'searchType' without 'term'
    };

    // if value is array and empty, skip it (locationValue, incidentTypeId)
    if (Array.isArray(value) && value.length === 0) {
      return acc; 
    };

    // add only non-empty, non-null, non-undefined values
    if (value !== '' && value !== null && value !== undefined) {
      acc[key] = key === 'term' ? trimmedTerm : value; 
    };

    return acc; 
  }, {});

  if (cleanedSearchParams.startDate && cleanedSearchParams.endDate) {
    cleanedSearchParams.timezone = orgTZ || intlDTFResolvedOptionsTZ;
  };

  return cleanedSearchParams;
};

export default cleanFormValues;