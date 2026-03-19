
// sort trespass documents for display in UI

/**
 * parses a trespass document ID and extracts the date and increment.
 * @param {string} id - document id in the format "name-trespass-MM-DD-YYYY-increment"
 * @returns {{ date: Date, increment: number }}
 */
const parseDocId = (id) => {
  const raw = id.slice(id.indexOf('trespass-') + 'trespass-'.length);
  const parts = raw.split('-');
  const [month, day, year] = parts;
  const date = new Date(`${month}/${day}/${year}`);
  const increment = parts.length > 3 ? parseInt(parts[3], 10) || 0 : 0;
  return { date, increment };
};

/**
 * sorts trespass documents so that the most recent ones (based on date & increment) are first.
 * documents identified as 'most current' are prioritized at the top.
 *
 * @param {Array} documents - Array of document objects with `id` field
 * @param {Array} mostCurrentDocIds - Array of IDs that represent the most current trespass documents
 * @returns {Array} - Sorted document array
 */
export default function sortTrespassDocuments(documents, mostCurrentDocIds = []) {
  return [...documents].sort((a, b) => {
    const aIsCurrent = mostCurrentDocIds.includes(a.id);
    const bIsCurrent = mostCurrentDocIds.includes(b.id);

    // prioritize current documents
    if (aIsCurrent && !bIsCurrent) return -1;
    if (!aIsCurrent && bIsCurrent) return 1;

    // then sort by date and increment
    const { date: dateA, increment: incA } = parseDocId(a.id);
    const { date: dateB, increment: incB } = parseDocId(b.id);

    if (dateA > dateB) return -1;
    if (dateA < dateB) return 1;

    return incB - incA;
  });
}
