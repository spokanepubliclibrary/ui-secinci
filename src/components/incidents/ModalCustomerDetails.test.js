import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import ModalCustomerDetails from './ModalCustomerDetails';

// --- Mocks for External Dependencies ---

// Mock react-intl: FormattedMessage renders the id.
jest.mock('react-intl', () => ({
  FormattedMessage: (props) => <span>{props.id}</span>,
}));

// Mock @folio/stripes/components with minimal implementations.
jest.mock('@folio/stripes/components', () => {
  const React = require('react');
  return {
    AccordionSet: (props) => <div {...props}>{props.children}</div>,
    Accordion: (props) => <div {...props}>{props.children}</div>,
    Button: (props) => <button {...props}>{props.children}</button>,
    Col: (props) => <div {...props}>{props.children}</div>,
    Datepicker: (props) => <input type="date" {...props} />,
    Editor: (props) => <textarea {...props} />,
    Modal: (props) => <div {...props}>{props.children}</div>,
    ModalFooter: (props) => <div {...props}>{props.children}</div>,
    Paneset: (props) => <div {...props}>{props.children}</div>,
    Pane: (props) => <div {...props}>{props.children}</div>,
    Row: (props) => <div {...props}>{props.children}</div>,
    TextField: (props) => <input type="text" {...props} />,
  };
});

// Mock helper functions.
jest.mock('./helpers/isValidDateFormat', () => jest.fn(() => true));
jest.mock('./helpers/stripHTML', () => jest.fn((str) => str));

// --- Mocks for the Incident Context ---
// Define a stable context object inside the module factory to avoid re-render loops.
jest.mock('../../contexts/IncidentContext', () => {
  const stableContext = {
    isModalCustomerDetails: true, // modal is open for our test
    closeModalCustomerDetails: jest.fn(),
    selectedCustomers: [
      { id: 'cust-1', firstName: 'John', lastName: 'Doe', registered: false }
    ],
    setSelectedCustomers: jest.fn(),
  };
  return {
    useIncidents: () => stableContext,
  };
});

// --- Test Props ---
// Even though the PropTypes define customersList and setCustomersList,
// the component destructures props as { customerID, allCustomers, setAllCustomers }.
// Here we supply sample props for testing.
const sampleCustomer = {
  id: 'cust-1',
  firstName: 'John',
  lastName: 'Doe',
  registered: false,
  details: {
    sex: '',
    race: '',
    height: '',
    weight: '',
    hair: '',
    eyes: '',
    dateOfBirth: '',
    streetAddress: '',
    city: '',
    state: '',
    zipcode: '',
  },
  description: 'Test description',
};

const sampleProps = {
  customerID: 'cust-1',
  allCustomers: [sampleCustomer],
  setAllCustomers: jest.fn(),
};

// --- Test Setup ---
let container = null;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});
afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

// --- Test Cases ---

// Test case 1: When isModalCustomerDetails is true, the modal renders.
test('ModalCustomerDetails renders correctly when open (snapshot test)', () => {
  act(() => {
    ReactDOM.render(<ModalCustomerDetails {...sampleProps} />, container);
  });
  expect(container.innerHTML).toMatchSnapshot();
});

// Test case 2: When isModalCustomerDetails is false, the component returns null.
test('ModalCustomerDetails returns null when closed', () => {
  // Retrieve the stable context and set isModalCustomerDetails to false.
  const { useIncidents } = require('../../contexts/IncidentContext');
  const stableContext = useIncidents();
  stableContext.isModalCustomerDetails = false; // simulate modal closed

  act(() => {
    ReactDOM.render(<ModalCustomerDetails {...sampleProps} />, container);
  });
  // If the modal is closed, the component should render nothing.
  expect(container.innerHTML).toBe('');
});
