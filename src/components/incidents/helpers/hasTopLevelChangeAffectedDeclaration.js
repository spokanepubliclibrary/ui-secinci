
import { isSameHtml } from './isSameHtml.js';
import deepNormalizeForComparison from './deepNormalizeForComparison.js';

// intentionally does not consider:
// selectedCustomers, customers add/remove, staffSuppressed,
// isApproximateTime, media add/remove -> these should not force global 'Update declaration' 
const hasTopLevelChangeAffectedDeclaration = (
  initial,
  current, 
  selectedWitnesses
) => {
  const simpleKeys = [
    'customerNa',
    'incidentLocation',
    'subLocation',
    'dateTimeOfIncident',
    'timeOfIncident'
  ];

  // return true if any changes to simple keys
  for (const key of simpleKeys) {
    if (current[key] !== initial[key]) {
      return true;
    }
  };

  // return true if any changes to top-level detailedDescriptionOfIncident
  if (!isSameHtml(current.detailedDescriptionOfIncident, initial.detailedDescriptionOfIncident)) {
    return true;
  };

  // return true if any new witnesses selected for saving
  if (selectedWitnesses.length > 0) {
    return true;
  };

  const getSortedIds = arr => (arr || []).map(i => i.id).sort();

  // return true if relevant item is removed in UI
  if (
    JSON.stringify(getSortedIds(current.incidentTypes)) !== JSON.stringify(getSortedIds(initial.incidentTypes)) ||
    JSON.stringify(getSortedIds(current.incidentWitnesses)) !== JSON.stringify(getSortedIds(initial.incidentWitnesses)) ||
    JSON.stringify(getSortedIds(current.attachments)) !== JSON.stringify(getSortedIds(initial.attachments))
  ) {
    return true;
  };

  const normalizedWitness = (wit) => {
    const {
      id,
      isCustom,
      firstName = '',
      lastName = '',
      role = '',
      phone = '',
      email = '',
    } = wit;

    return deepNormalizeForComparison({
      id, 
      isCustom,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      ...(role.trim() && { role: role.trim() }),
      ...(phone.trim() && { phone: phone.trim() }),
      ...(email.trim() && { email: email.trim() }),
    });
  };

  const initialCustomWitnesses = (initial.incidentWitnesses || []).filter(w => w.isCustom);
  const currentCustomWitnesses = (current.incidentWitnesses || []).filter(w => w.isCustom);

  // check for any modified custom witness
  for (const initWit of initialCustomWitnesses) {
    const currWit = currentCustomWitnesses.find(w => w.id === initWit.id);
    if (!currWit) return true; 

    const normInit = normalizedWitness(initWit);
    const normCurr = normalizedWitness(currWit);

    if (JSON.stringify(normInit) !== JSON.stringify(normCurr)) {
      return true;
    };
  };

  return false; // no changes
};

export default hasTopLevelChangeAffectedDeclaration;