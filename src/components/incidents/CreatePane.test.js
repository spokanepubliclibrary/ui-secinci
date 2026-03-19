import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import CreatePane from './CreatePane';

// --- Mocks for External Dependencies ---

// Mock react-intl.
jest.mock('react-intl', () => ({
  useIntl: () => ({
    formatMessage: ({ id }) => id,
  }),
  FormattedMessage: (props) => <span>{props.id}</span>,
}));

// Mock react-router-dom.
jest.mock('react-router-dom', () => ({
  useHistory: () => ({ push: jest.fn() }),
}));

// Mock @folio/stripes/components.
jest.mock('@folio/stripes/components', () => {
  const React = require('react');
  return {
    Accordion: (props) => <div {...props}>{props.children}</div>,
    AccordionSet: (props) => <div {...props}>{props.children}</div>,
    Button: (props) => <button {...props}>{props.children}</button>,
    Checkbox: (props) => <div {...props}>{props.children}</div>,
    Col: (props) => <div {...props}>{props.children}</div>,
    Datepicker: (props) => <input type="date" {...props} />,
    Editor: (props) => <textarea {...props} />,
    ExpandAllButton: (props) => <button {...props}>{props.children}</button>,
    List: (props) => (
      <ul {...props}>
        {props.items && props.items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    ),
    Icon: (props) => <span {...props}>{props.icon}</span>,
    Label: (props) => <label {...props}>{props.children}</label>,
    Pane: (props) => <div {...props}>{props.children}</div>,
    PaneHeader: (props) => <div {...props}>{props.children}</div>,
    PaneFooter: (props) => <div {...props}>{props.children}</div>,
    Row: (props) => <div {...props}>{props.children}</div>,
    Select: (props) => <select {...props}>{props.children}</select>,
    Timepicker: (props) => <input type="time" {...props} />,
  };
});

// --- Mocks for Child Components ---

jest.mock('../../settings/GetLocationsInService', () => () => <div>Mock GetLocationsInService</div>);
jest.mock('../../settings/GetIncidentTypesDetails', () => () => <div>Mock GetIncidentTypesDetails</div>);
jest.mock('./ModalSelectIncidentTypes', () => () => <div>Mock ModalSelectIncidentTypes</div>);
jest.mock('./ModalSelectKnownCustomer', () => () => <div>Mock ModalSelectKnownCustomer</div>);
jest.mock('./ModalSelectWitness', () => () => <div>Mock ModalSelectWitness</div>);
jest.mock('./ModalDescribeCustomer', () => () => <div>Mock ModalDescribeCustomer</div>);
jest.mock('./ModalTrespass', () => () => <div>Mock ModalTrespass</div>);
jest.mock('./ModalCustomerDetails', () => () => <div>Mock ModalCustomerDetails</div>);
jest.mock('./ModalAddMedia', () => () => <div>Mock ModalAddMedia</div>);
jest.mock('./CreateMedia', () => () => <div>Mock CreateMedia</div>);
jest.mock('./GetLocations', () => () => <div>Mock GetLocations</div>);
jest.mock('./GetSelf', () => () => <div>Mock GetSelf</div>);
jest.mock('./CreateReport', () => () => <div>Mock CreateReport</div>);
jest.mock('../../settings/helpers/makeId', () => () => 'mockedId');
jest.mock('./ThumbnailTempPreSave', () => () => <div>Mock ThumbnailTempPreSave</div>);
jest.mock('./ModalCustomWitness', () => () => <div>Mock ModalCustomWitness</div>);
jest.mock('../../settings/GetTrespassTemplates', () => () => <div>Mock GetTrespassTemplates</div>);

// --- Mocks for Helper Functions ---
jest.mock('./helpers/stripHTML', () => jest.fn((str) => str));
jest.mock('./helpers/getTodayDate', () => jest.fn(() => '01/01/2020'));
jest.mock('./helpers/isValidDateFormat', () => jest.fn(() => true));
jest.mock('./helpers/isValidTimeInput', () => jest.fn(() => true));
jest.mock('./helpers/convertUTCISOToPrettyDate', () => jest.fn((date) => date));
jest.mock('./helpers/formatDateToUTCISO', () => jest.fn((date) => date));
jest.mock('./helpers/formatDateAndTimeToUTCISO', () => jest.fn((date, time) => `${date}T${time}`));
jest.mock('./helpers/getCurrentTime', () => jest.fn(() => '12:00'));

// --- Mock for Incident Context ---
jest.mock('../../contexts/IncidentContext', () => ({
  useIncidents: () => ({
    openModalSelectTypes: jest.fn(),
    closeCreatePane: jest.fn(),
    openModalUnknownCust: jest.fn(),
    openModalSelectKnownCust: jest.fn(),
    openModalSelectWitness: jest.fn(),
    openModalMedia: jest.fn(),
    idForMediaCreate: null,
    setIdForMediaCreate: jest.fn(),
    formDataArrayForMediaCreate: null,
    setFormDataArrayForMediaCreate: jest.fn(),
    selectedCustomers: [],
    setSelectedCustomers: jest.fn(),
    selectedWitnesses: [],
    setSelectedWitnesses: jest.fn(),
    attachmentsData: [],
    setAttachmentsData: jest.fn(),
    self: { id: 'self-id', barcode: 'self-barcode', lastName: 'SelfLast', firstName: 'SelfFirst' },
    openModalTrespass: jest.fn(),
    openModalCustomerDetails: jest.fn(),
    incidentTypesList: [],
    isModalCustomWitness: false,
    openModalCustomWitness: jest.fn(),
    locationsInService: [],
    trespassTemplates: [],
    triggerDocumentError: jest.fn(),
  }),
}));

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

test('CreatePane renders correctly (snapshot test)', () => {
  act(() => {
    ReactDOM.render(<CreatePane />, container);
  });
  // Capture the snapshot of the rendered output.
  expect(container.innerHTML).toMatchSnapshot();
});

test('CreatePane loads child components', () => {
  act(() => {
    ReactDOM.render(<CreatePane />, container);
  });
  // Check that at least one of the mocked child components appears.
  expect(container.textContent).toMatch(/Mock ModalSelectIncidentTypes/);
  expect(container.textContent).toMatch(/Mock GetLocationsInService/);
});
