

// Mock helper functions so they don’t interfere with rendering.
jest.mock('./helpers/isValidDateFormat', () => jest.fn(() => true));
jest.mock('./helpers/stripHTML', () => jest.fn((str) => str));

// Mock DOMPurify to simply return the content.
jest.mock('dompurify', () => ({
  sanitize: (content) => content,
}));

// Define a stable IncidentContext object (name begins with "mock" so Jest allows it).
const mockIncidentContext = {
  isModalUnknownCustOpen: true, // default: modal open for tests
  closeModalUnknownCust: jest.fn(),
  setSelectedCustomers: jest.fn(),
};

// Mock the IncidentContext.
jest.mock('../../contexts/IncidentContext', () => ({
  useIncidents: () => mockIncidentContext,
}));

import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import ModalDescribeCustomer from './ModalDescribeCustomer';

// --- Suppress known nonfatal warnings ---
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (
        args[0].includes('ReactDOM.render is no longer supported') ||
        args[0].includes('Invalid hook call') ||
        args[0].includes('does not recognize the') ||
        args[0].includes('Unknown event handler property') ||
        args[0].includes('contentClass') ||
        args[0].includes('defaultWidth')
      )
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});
afterEach(() => {
  console.error = originalConsoleError;
});

// --- Mocks for External Dependencies ---
// react‑intl: FormattedMessage simply renders its id.
jest.mock('react-intl', () => ({
  FormattedMessage: (props) => <span>{props.id}</span>,
}));

// @folio/stripes/components: Minimal implementations.
jest.mock('@folio/stripes/components', () => {
  const React = require('react');
  return {
    Button: (props) => <button {...props}>{props.children}</button>,
    Col: (props) => <div {...props}>{props.children}</div>,
    Modal: (props) => {
      let labelId = '';
      // Check if the Modal received a "label" prop that is a Formatted Message with id
      if (props.label && props.label.props && props.label.props.id) {
        labelId = props.label.props.id;
      }
      return (
        <div>
          {/* Render the label text so it shows up in container.textContent */}
          {labelId && <h2>{labelId}</h2>}

          {/* Then render the modal children */}
          {props.children}
        </div>
      );
    },
    Paneset: (props) => <div {...props}>{props.children}</div>,
    Pane: (props) => <div {...props}>{props.children}</div>,
    ModalFooter: (props) => <div {...props}>{props.children}</div>,
    Row: (props) => <div {...props}>{props.children}</div>,
    TextField: (props) => {
      let labelText = '';
      if (props.label) {
        if (typeof props.label === 'object' && props.label.props && props.label.props.id) {
          labelText = props.label.props.id;
        } else {
          labelText = props.label;
        }
      }
      return (
        <div>
          {labelText && <label>{labelText}</label>}
          <input type="text" {...props} />
        </div>
      );
    },
    Datepicker: (props) => <input type="date" {...props} />,
    Editor: (props) => <textarea {...props} />,
    AccordionSet: (props) => <div {...props}>{props.children}</div>,
    Accordion: (props) => <div {...props}>{props.children}</div>,
    MessageBanner: (props) => (props.show ? <div {...props}>{props.children}</div> : null),
  };
});

// Mock the CSS module.
jest.mock('./ModalStyle.css', () => ({}));

// --- Test Setup ---
let container = null;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});
afterEach(() => {
  ReactDOM.unmountComponentAtNode(container);
  container.remove();
  container = null;
});

// --- Test Cases ---
describe('ModalDescribeCustomer', () => {
  test('returns null when modal is closed', () => {
    // Set the modal flag to false.
    mockIncidentContext.isModalUnknownCustOpen = false;
    act(() => {
      ReactDOM.render(<ModalDescribeCustomer />, container);
    });
    expect(container.innerHTML).toBe('');
  });

  test('renders modal when isModalUnknownCustOpen is true', () => {
    // Ensure modal is open.
    mockIncidentContext.isModalUnknownCustOpen = true;
    act(() => {
      ReactDOM.render(<ModalDescribeCustomer />, container);
    });
    const text = container.textContent;
    // Expect that the modal's label appears.
    expect(text).toMatch(/modal-describe-unknown-customer-label/);
  });

  test('renders first and last name text fields in the description accordion', () => {
    mockIncidentContext.isModalUnknownCustOpen = true;
    act(() => {
      ReactDOM.render(<ModalDescribeCustomer />, container);
    });
    const text = container.textContent;
    // Expect that the TextField labels for first name and last name appear.
    expect(text).toMatch(/modal-describe-unknown-customer\.textField-first-name-label/);
    expect(text).toMatch(/modal-describe-unknown-customer\.textField-last-name-label/);
  });
});
