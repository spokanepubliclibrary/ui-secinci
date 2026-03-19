
/*
  Helper function to determine most recent trespass document for each customer.
  Each document.id contains a customer name and date, and version as relevant (when report is updated)
  (e.g. 
    Initial -> 
      "id": "smith-danielle-louise-trespass-03-26-2025"
    Incremented on updated report ->   
      "id": "smith-danielle-louise-trespass-03-26-2025-1"
  ). 

  Documents are grouped by customer based on the prefix before 'trespass-'. Within each customer group, the most recent document is identified based on date and increment. 

  - @param {Array} docs - array containing trespass document objects
  - @param {string} startStr - string for where to start for indexOf ('trespass-')
  - @returns {Array} array of most current document.id for each customer
*/

// extract date and increment (version) from document.id 
const parseDateAndIncrement = (id, startStr) => {
  // get the part of 'id' that comes after 'trespass-'
  const raw = id.slice(id.indexOf(startStr) + startStr.length); // e.g. '03-26-2025' or '03-26-2025-1'
  const parts = raw.split('-'); // e.g. ['03', '26', '2025', '1']

  // construct standard date string for Date comparison
  const [month, day, year] = parts;
  const date = `${month}/${day}/${year}`;

  // if there is a fourth part, it is the increment (e.g. '1'), else it is the base document
  let increment = 0;
  if (parts.length > 3) {
    const maybeInc = parseInt(parts[3], 10);
    increment = isNaN(maybeInc) ? 0 : maybeInc;
  };
  return { date, increment };
};

// compare two documents to deterimine which is most recent
const compareDocDates = (doc1, doc2, startStr) => {
  // parse out date and increment values for both docs
  const { date: date1, increment: inc1 } = parseDateAndIncrement(doc1.id, startStr);
  const { date: date2, increment: inc2 } = parseDateAndIncrement(doc2.id, startStr);

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // compare dates first
  if (d1 > d2) return 1;
  if (d1 < d2) return -1;

  // if the dates are equal, use incrment to find which is most recent
  if (inc1 > inc2) return 1;
  if (inc1 < inc2) return -1;
  return 0; // both are equal
};


// extract unique customer key form document.id, from segment before 'trespass-'
const extractCustomerKey = (id, startStr) => {
  const index = id.indexOf(startStr);
  // slice everything up to the hyphen before 'trespass-'
  return index !== -1 ? id.slice(0, index - 1) : null;
};

// reduce into object, grouped by key of customer name from document.id (e.g. key of 'halls-kerry-amanda' referencing arr of respective docuemtn objs)
const groupDocsByCustomer = (docs, startStr) => {
  return docs.reduce((groups, doc) => {
    const customerKey = extractCustomerKey(doc.id, startStr);
    if (!customerKey) return groups; // skip if no key

    // if the customer hasn't been seen before, init their group
    if (!groups[customerKey]) {
      groups[customerKey] = [];
    }
    // add document obj to customer's group
    groups[customerKey].push(doc);
    // console.log("groups", JSON.stringify(groups, null, 2));
    return groups;
  }, {});
};


// return array of document ids that are the most recent trespass for each customer
const identifyCurrentTrespassDocs = (docs, startStr) => {
  // group documents by customer
  const grouped = groupDocsByCustomer(docs, startStr);
  const mostCurrentIds = [];

  // for each group (each customer)
  for (const customerKey in grouped) {
    const customerDocs = grouped[customerKey];
    // assume first document is most current initally
    let mostCurrent = customerDocs[0];
    
    // compare each document to the current 'most recent' and replace if newer
    for (let i = 1; i < customerDocs.length; i++) {
      if (compareDocDates(customerDocs[i], mostCurrent, startStr) > 0) {
        mostCurrent = customerDocs[i];
      }
    }
    // save id of the most current doc for this customer
    mostCurrentIds.push(mostCurrent.id);
  };
  // console.log("mostCurrentIds", JSON.stringify(mostCurrentIds, null, 2));
  return mostCurrentIds;
};

// console.log(identifyCurrentTrespassDocs(attachments, "trespass-"));
export default identifyCurrentTrespassDocs;