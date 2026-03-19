import Handlebars from 'handlebars';
import { FormattedMessage } from 'react-intl';
import { registerHandlebarsHelpers } from './handlebarsHelpers.js';
import stripHTML from './stripHTML.js';
import convertUTCISOToPrettyDate from './convertUTCISOToPrettyDate.js';
import getTodayDate from './getTodayDate.js';
import makeId from '../../../settings/helpers/makeId.js';
import html2pdf from 'html2pdf.js';

export function createTrespassDocument(
  template, 
  customer, 
  incidentData, 
  helperDeps
) {
  try {
    registerHandlebarsHelpers(helperDeps);

    const readyCustomer = {
      ...customer,
      description: stripHTML(customer.description),
      fullName: `${customer.lastName}, ${customer.firstName}`,
      trespass: {
        ...customer.trespass,
        descriptionOfOccurrence: customer.trespass.descriptionOfOccurrence, // sani at related token helper
        witnessedBy: customer.trespass.witnessedBy.map(wit => ({
          ...wit,
          fullName: `${wit.lastName}, ${wit.firstName}`
        })),
        dateOfOccurrence: convertUTCISOToPrettyDate(customer.trespass.dateOfOccurrence),
        endDateOfTrespass: convertUTCISOToPrettyDate(customer.trespass.endDateOfTrespass)
      }
    };

    // console.log("readyCustomer --> ",JSON.stringify(readyCustomer, null, 2))
    const compiled = Handlebars.compile(template);

    return compiled({
      customer: readyCustomer,
      incident: incidentData
    });
  } catch (error) {
    helperDeps.triggerDocumentError?.(
      <FormattedMessage id="generate-trespass.error-doc-createTrespassDocument" values={{ error: error.message }} />
    );
    return '';
  }
};

// Used at CreatePane
export function generateTrespassDocuments(
  customers, 
  incidentData, 
  template, 
  helperDeps
) {
  try {
    return customers
      .filter(cust => cust.trespass?.declarationOfService) 
      .map(cust => {
        const html = createTrespassDocument(template, cust, incidentData, helperDeps);
        if (!html || html.trim() === '') return null;
        return {
          content: html,
          customerName: `${cust.lastName || 'Unknown'}, ${cust.firstName}`
        };
      })
      .filter(Boolean); // remove any null docs
  } catch (error) {
    helperDeps.triggerDocumentError?.(
      <FormattedMessage id="generate-trespass.error-doc-generateTrespassDocuments" values={{ error: error.message }} />
    );
    return [];
  }
};


// used at EditPane
export function generateTrespassDocumentsAtEdit(
  customers,
  customersToUpdateDeclaration,      // array
  selectedCustomerIds,               // Set
  originalDeclarationCustomerIds,    // Set
  topLevelAffectsDeclaration,        // boolean
  incidentData,
  template,
  helperDeps
) {
  try {
    const allowSet = new Set(customersToUpdateDeclaration);

    return customers
      .filter(cust => {
        const hasDoS = Boolean(cust?.trespass?.declarationOfService);
        if (!hasDoS) return false;

        const id = cust.id;
        const originallyHad = originalDeclarationCustomerIds.has(id);
        const newlyAdded = !originallyHad;

        if (newlyAdded) return true; // always generate for newly added DoS
        if (selectedCustomerIds.has(id)) return true; // new customer this session

        if (topLevelAffectsDeclaration) {
          // require opt-in for everyone who originally had DoS
          return allowSet.has(id);
        } else {
          // per-customer-only mode: generate only for edited + opted-in
          return allowSet.has(id); 
        }
      })
      .map(cust => {
        const html = createTrespassDocument(template, cust, incidentData, helperDeps);
        if (!html || html.trim() === '') return null;
        return {
          content: html,
          customerName: `${cust.lastName || 'Unknown'}, ${cust.firstName}`
        };
      })
      .filter(Boolean);
  } catch (error) {
    helperDeps.triggerDocumentError?.(
      <FormattedMessage id="generate-trespass.error-doc-generateTrespassDocuments" values={{ error: error.message }} />
    );
    return [];
  };
};

export async function generatePDFAttachments(documents, triggerDocumentError) {
  try {
    const attachments = await Promise.all(documents.map(async (doc) => {
      const tempParent = document.createElement('div');
      tempParent.style.visibility = 'hidden';
      tempParent.style.position = 'absolute';
      tempParent.style.left = '-10000px';

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = doc.content;
      // force layout normalization to avoid phantom height
      tempDiv.style.whiteSpace = 'normal';
      tempDiv.style.padding = '0';
      tempDiv.style.margin = '0';
      tempDiv.style.position = 'relative';
      tempDiv.style.top = '0';
      tempDiv.style.lineHeight = '1.5';
      tempDiv.style.fontSize = '12pt';
   
      tempParent.appendChild(tempDiv);
      document.body.appendChild(tempParent);

      const style = document.createElement('style');
      style.textContent = `
        html, body {
          margin: 0;
          padding: 0;
        }

        p, h1, h2, h3, h4 {
          orphans: 3;
          widows: 3;
          margin: 0 0 0.25in 0;
        }
      `;

      tempDiv.prepend(style);

      const options = {
        margin: 0.5,
        filename: `Trespass_Document_${doc.customerName}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy']
        }
      };

      const blob = await html2pdf().set(options).from(tempDiv).output('blob');
      // console.log('PDF HTML snapshot:\n', tempDiv.innerHTML);

      document.body.removeChild(tempParent);

      return {
        contentType: 'application/pdf',
        description: `${doc.customerName} trespass ${getTodayDate()}`,
        id: makeId(`${doc.customerName} trespass ${getTodayDate()}`),
        file: blob
      };
    }));

    return attachments;
  } catch (error) {
    triggerDocumentError?.(
      <FormattedMessage id="generate-trespass.error-doc-generatePDFAttachments" values={{ error: error.message }} />
    );
    return [];
  }
};