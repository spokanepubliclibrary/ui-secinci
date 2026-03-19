 

const deepNormalizeForComparison = (obj) => {
  const DATE_KEYS = new Set(['dateOfOccurrence', 'endDateOfTrespass', 'date']);

  const toLocalYMD = (d) => {
    if (!d || typeof d !== 'string') return d;
    const md = d.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (md) {
      const [ , mm, dd, yyyy ] = md;
      return `${yyyy}-${mm}-${dd}`;
    }
    const iso = d.match(/^\d{4}-\d{2}-\d{2}T/);
    if (iso) {
      const date = new Date(d);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    return d.trim();
  };

  if (Array.isArray(obj)) {
    return obj.map(deepNormalizeForComparison);
  }

  if (obj && typeof obj === 'object') {
    return Object.entries(obj)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .sort(([a], [b]) => a.localeCompare(b))  // sort object keys
      .reduce((acc, [k, v]) => {
        acc[k] = typeof v === 'string'
          ? (DATE_KEYS.has(k) ? toLocalYMD(v.trim()) : v.trim())
          : deepNormalizeForComparison(v);
        return acc;
      }, {});
  }
  return obj;
};

export default deepNormalizeForComparison; 