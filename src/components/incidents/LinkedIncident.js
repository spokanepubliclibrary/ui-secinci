import convertUTCISOToPrettyDate from './helpers/convertUTCISOToPrettyDate';
import { Icon } from '@folio/stripes/components';
import { useIntl, FormattedMessage } from 'react-intl';
const containerStyle = { padding: '2px 0' };

const rowStyle = {
  display: 'flex',
  alignItems: 'flex-start', 
  gap: '8px',
};

const linkBlockStyle = {
  display: 'block',      
  textDecoration: 'none',
  color: 'rgb(0,0,238)',
  fontWeight: 'bold',
};

const dateStyle = {
  margin: 0,
  lineHeight: 1.2,
};

const listStyle = {
  margin: '6px 0 0 1.5rem',
  padding: 0,
  listStyleType: 'disc',
  listStylePosition: 'outside',
};

const LinkedIncident = ({ summaryObj, onDelete, renderContext = 'create-edit' }) => {
  const intl = useIntl();
  const ariaLabel = intl.formatMessage({ 
    id: 'linked-incident.aria-label-report-details-view' 
  });

  const customers = summaryObj.customers ?? [];
  const created = summaryObj.createdDate;

  const handleIconKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDelete?.(summaryObj.id);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={rowStyle}>
        {renderContext !== 'details' && (
          <button
            style={{}}
            onClick={() => onDelete?.(summaryObj.id)}
            type="button"
            aria-label="Remove linked incident"
            onKeyDown={handleIconKeyDown}
          >
            <Icon icon="trash" size="medium" />
          </button>
        )}

        <a
          href={`/incidents/${summaryObj.id}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
          style={linkBlockStyle}
        >
          <p style={dateStyle}>
            {convertUTCISOToPrettyDate(created)}
          </p>

          {customers.length > 0 && (
            <ul style={listStyle}>
              {customers.map((cust, idx) => (
                <li key={`${summaryObj.id}-${idx}`}>{cust}</li>
              ))}
            </ul>
          )}
        </a>
      </div>
    </div>
  );
};

export default LinkedIncident;