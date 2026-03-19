import DOMPurify from 'dompurify';
import { decode } from 'html-entities';
import { FormattedMessage } from 'react-intl';
import Handlebars from 'handlebars';
import convertUTCISOToPrettyDate from './convertUTCISOToPrettyDate';

export function registerHandlebarsHelpers({ 
  locationDataOptions, 
  trespassReasons,
  self, 
  triggerDocumentError 
}) {

  const reasonById = new Map((trespassReasons ?? []).map(tr => [tr.id, tr.reason]));
  if (!Handlebars.helpers.resolveTrespassReasons) {
    // no 'path', Handlebars handles scope on this one
    // token -> {{resolveTrespassReasons customer.trespass.exclusionOrTrespassBasedOn}}
    Handlebars.registerHelper('resolveTrespassReasons', function(list) {
      try {
        if (!Array.isArray(list) || list.length === 0) return '';

        const seen = new Set();
        const reasons = [];

        for (const entry of list) {
          // handle for prev set up / strays after migration - entry is a string id
          if (typeof entry === 'string') {
            const r = reasonById.get(entry);
            if (r && !seen.has(r)) { reasons.push(r); seen.add(r); }
            continue;
          }

          // current - entry is an object
          if (entry && typeof entry === 'object') {
            const id = entry.id ?? entry.reasonId ?? entry.value; 
            const r = entry.reason ?? (id ? reasonById.get(id) : undefined);
            if (r && !seen.has(r)) { reasons.push(r); seen.add(r); }
          }
        }

        return reasons.join(', ');

      } catch (error) {
        triggerDocumentError?.(<FormattedMessage id="generate-trespass.error-doc-incTypes" values={{ error: error.message }} />);
        return '';
      }
    });
  }
  if (!Handlebars.helpers.resolveIncTypes) {
    // token -> {{resolveIncTypes "incident.incidentTypes.title"}}
    Handlebars.registerHelper('resolveIncTypes', function(path) {
      try {
        const keys = path.split('.');
        const propertyKey = keys.pop();
        let arrayValue = this;
        for (const key of keys) arrayValue = arrayValue?.[key];
        if (!Array.isArray(arrayValue)) return '';
        return arrayValue
          .map(item => item?.[propertyKey] || '')
          .filter(Boolean)
          .join(', ');
      } catch (error) {
        triggerDocumentError?.(<FormattedMessage id="generate-trespass.error-doc-incTypes" values={{ error: error.message }} />);
        return '';
      }
    });
  }

  if (!Handlebars.helpers.formatLocation) {
    // tokens -> 
    // {{formatLocation incident.incidentLocation}}
    // {{formatLocation customer.trespass.declarationOfService.placeSigned}}
    Handlebars.registerHelper('formatLocation', function(locationIdString) {
      try {
        const matched = locationDataOptions.find(loc => loc.value === locationIdString);
        return matched?.label || locationIdString || '';
      } catch (error) {
        triggerDocumentError?.(<FormattedMessage id="generate-trespass.error-doc-locationIdString" values={{ error: error.message }} />);
        return locationIdString || '';
      }
    });
  }

  if (!Handlebars.helpers.formatDate) {
    // tokens ->
    // {{formatDate (resolve "customer.trespass.dateOfOccurrence")}}
    // {{formatDate (resolve "customer.trespass.declarationOfService.date")}}
    // {{formatDate (resolve "customer.trespass.endDateOfTrespass")}}
    Handlebars.registerHelper('formatDate', function(dateString) {
      try {
        return convertUTCISOToPrettyDate(dateString);
      } catch (error) {
        triggerDocumentError(<FormattedMessage id="generate-trespass.error-doc-formatDate" values={{ dateString, error: error.message }} />);
        return '';
      }
    });
  }

  if (!Handlebars.helpers.resolve) {
    // runs on customer keys and nested keys
    Handlebars.registerHelper('resolve', function(path, options) {
      try {
        const keys = path.split('.');
        let value = this;
        for (const key of keys) value = value?.[key];
        if (Array.isArray(value)) {
          const prop = options.hash?.property;
          return prop
            ? value.map(item => item?.[prop] || '').join(', ')
            : value.map(item => JSON.stringify(item)).join(', ');
        }
        return value ?? '';
      } catch (error) {
        triggerDocumentError(<FormattedMessage id="generate-trespass.error-doc-resolve" values={{ path, error: error.message }} />);
        return '';
      }
    });
  }

  if (!Handlebars.helpers.trespassDescriptionPlain) {
    // token -> {{{trespassDescriptionPlain}}}
    Handlebars.registerHelper('trespassDescriptionPlain', function () {
      try {
        const html = this?.customer?.trespass?.description?.trim() || this?.customer?.trespass?.descriptionOfOccurrence?.trim() || '';

        // preserve HTML blocks
        const raw = decode(DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }));
        // return raw; 
        return new Handlebars.SafeString(raw);
      } catch (error) {
        triggerDocumentError(<FormattedMessage id="generate-trespass.error-doc-descriptionPlainFallback" values={{ error: error.message }} />);
        return '';
      }
    });
  }

  if (!Handlebars.helpers.declarationOfServiceIssuedBy) {
    // token -> {{declarationOfServiceIssuedBy}} (is the logged in FOLIO user 'self')
    Handlebars.registerHelper('declarationOfServiceIssuedBy', function () {
      try {
        return `${self?.lastName || ''}, ${self?.firstName || ''}` || 'User not found';
      } catch (error) {
        triggerDocumentError(<FormattedMessage id="generate-trespass.error-doc-declarationOfServiceIssuedBy" values={{ error: error.message }} />);
        return '';
      }
    });
  }
};