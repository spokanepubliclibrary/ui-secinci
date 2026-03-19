
const decodeParamsToForm = (obj) => ({
  searchType: obj.searchType || 'keyword',
  term:            obj.term               || '',
  locationValue:   obj.locationValue ? 
    obj.locationValue.split(',') : [],
  incidentTypeId:  obj.incidentTypeId ? 
    obj.incidentTypeId.split(',') : [],
  witnessedBy:     obj.witnessedBy        || '',
  createdBy:       obj.createdBy          || '',
  startDate:       obj.startDate          || '',
  endDate:         obj.endDate            || '',
  currentTrespass: obj.currentTrespass === 'true',
  expiredTrespass: obj.expiredTrespass === 'true',
  staffSuppress: obj.staffSuppress || 'non',
  sort: obj.sort || '',
  dir: obj.dir || ''
});

export default decodeParamsToForm;