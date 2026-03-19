
const hasFormChangedAtCreate = ({
  formData,
  initialFormData,
  selectedCustomers,
  selectedWitnesses,
  editorWasTouched,
}) => {
  // ignore these keys as they are populated on render
  const keysToIgnore = ['dateOfIncident', 'timeOfIncident', 'id'];

  if (selectedCustomers.length > 0) return true;
  if (selectedWitnesses.length > 0) return true;
  if (editorWasTouched) {
    // we check for was touched instead of formData was mutated b/c of our onBlur pattern to mitigate 
    // react-quill's cleanup <-> setState feedback loop.
    // i.e. user inputs to Editor, doesn't make onBlur and clicks directly to 'cancel' the form 
    // would not be considered 'dirty' as no update to formData. This editorWasTouch ref handles that case. 
    return true;
  }

  for (const key in formData) {
    if (keysToIgnore.includes(key)) continue;

    const original = initialFormData[key] ?? null;
    const current = formData[key] ?? null;

    if (Array.isArray(original) && Array.isArray(current)) {
      if (original.length !== current.length) {
        return true;
      }

      if (JSON.stringify(original) !== JSON.stringify(current)) {
        return true;
      }
    } else if (typeof original === 'string' || typeof current === 'string') {
      if ((original || '').trim() !== (current || '').trim()) {
        return true;
      }
    } else {
      if (JSON.stringify(original) !== JSON.stringify(current)) {
        return true;
      }
    }
  };

  return false;
};

export default hasFormChangedAtCreate;