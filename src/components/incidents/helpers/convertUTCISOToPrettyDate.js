
const convertUTCISOToPrettyDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return '';

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return '';
  }
};

export default convertUTCISOToPrettyDate;