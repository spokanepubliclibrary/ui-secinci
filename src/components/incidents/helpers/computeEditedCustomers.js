import { isSameHtml } from './isSameHtml.js';
import deepNormalizeForComparison from './deepNormalizeForComparison.js';

// ***** helpers ***** 
const stripUIOnlyKeys = (cust = {}) => {
  const {
    associatedFirstName,
    associatedLastName,
    ...rest
  } = cust || {};
  return rest;
};

const deepMergeWithFallback = (fallback, curr) => {
  if (Array.isArray(fallback) || Array.isArray(curr)) {
    return Array.isArray(curr) ? curr : fallback;
  }
  if (fallback && typeof fallback === 'object' && curr && typeof curr === 'object') {
    const out = { ...fallback };
    for (const k of Object.keys(curr)) {
      out[k] = deepMergeWithFallback(fallback[k], curr[k]);
    }
    return out;
  }
  return curr !== undefined ? curr : fallback;
};

// remove empty/whitespace-only keys from details, and text-normalize description
const normalizeCustomerForComparison = (cust) => {
  const {
    details,
    description = '',
    ...rest
  } = stripUIOnlyKeys(cust);

  const canonTrespass = (() => {
    const t = rest?.trespass;
    if (!t) return undefined;

    const raw = Array.isArray(t.exclusionOrTrespassBasedOn)
      ? t.exclusionOrTrespassBasedOn
      : [];

    const ids = raw
      .map(e =>
        typeof e === 'string'
          ? e
          : (e?.id ?? e?.reasonId ?? e?.value ?? '')
      )
      .filter(Boolean);

    // treat as set for meaningful change 
    const uniqSortedIds = Array.from(new Set(ids)).sort();

    return {
      ...t,
      exclusionOrTrespassBasedOn: uniqSortedIds,
    };
  })();

  // strip whitespace-only or empty-string keys from details
  const cleanedDetails = Object.entries(details || {}).reduce((acc, [k, v]) => {
    const trimmed = typeof v === 'string' ? v.trim() : v;
    if (trimmed !== '' && trimmed !== null && trimmed !== undefined) {
      acc[k] = trimmed;
    }
    return acc;
  }, {});
  const hasRealDetails = Object.keys(cleanedDetails).length > 0;

  const cleaned = {
    ...rest,
    ...(hasRealDetails ? { details: cleanedDetails } : {}),
    ...(canonTrespass ? { trespass: canonTrespass } : {}),
  };

  // IMPORTANT: we keep description for HTML semantic equality first;
  // only if it’s not empty do we store a text-normalized version for deep compare.
  if (description && !isSameHtml(description, '')) {
    const text = typeof window !== 'undefined'
      ? new DOMParser().parseFromString(description, 'text/html').body.textContent.trim()
      : description; // SSR safety fallback
    cleaned.description = text;
  };

  return deepNormalizeForComparison(cleaned);
};


// ***** main ***** 
const computeEditedCustomers = (initialFormData, allCustomers) => {
  const edited = new Set();

  for (const init of (initialFormData.customers || [])) {
    const curr = (allCustomers || []).find(c => c.id === init.id);
    if (!curr) {
      // removed entirely => top-level change; not a per-customer edit here
      continue;
    }

    // first, check HTML semantic equality for description (cheap early exit)
    const initDesc = stripUIOnlyKeys(init).description;
    const currDesc = stripUIOnlyKeys(curr).description;
    if (!isSameHtml(initDesc, currDesc)) {
      edited.add(init.id);
      continue; // already edited; no need to do deeper compare
    }

    // merge current over initial so missing fields fall back
    const merged = deepMergeWithFallback(init, curr);

    // normalize both sides the same way (strip UI keys, clean details/description, normalize)
    const normInit = normalizeCustomerForComparison(init);
    const normCurr = normalizeCustomerForComparison(merged);

    if (JSON.stringify(normInit) !== JSON.stringify(normCurr)) {
      edited.add(init.id);
    }
  }

  return edited;
};

export default computeEditedCustomers;