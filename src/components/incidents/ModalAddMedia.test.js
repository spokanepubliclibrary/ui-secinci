import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import ModalAddMedia from './ModalAddMedia';

// --- Mocks for External Dependencies ---

// Mock react-intl so that FormattedMessage simply renders its id.
jest.mock('react-intl', () => ({
  FormattedMessage: (props) => <span>{props.id}</span>,
}));

// Mock react-router-dom with stable params and history.
jest.mock('react-router-dom', () => ({
  useParams: () => ({}),
  useHistory: () => ({ push: jest.fn() }),
}));

// Mock @folio/stripes/components with minimal implementations.
jest.mock('@folio/stripes/components', () => {
  const React = require('react');
  return {
    Button: (props) => <button {...props}>{props.children}</button>,
    Col: (props) => <div {...props}>{props.children}</div>,
    MessageBanner: (props) => <div {...props}>{props.children}</div>,
    Modal: (props) => <div {...props}>{props.children}</div>,
    Pane: (props) => <div {...props}>{props.children}</div>,
    Paneset: (props) => <div {...props}>{props.children}</div>,
    ModalFooter: (props) => <div {...props}>{props.children}</div>,
    Row: (props) => <div {...props}>{props.children}</div>,
    TextField: (props) => <input type="text" {...props} />,
  };
});

// --- Virtual Mock for file-type ---
// Jest has trouble locating the file-type module (ESM-only), so we create a virtual module.
jest.mock(
  'file-type',
  () => ({
    fileTypeFromBuffer: jest.fn(() => Promise.resolve({ ext: 'jpg', mime: 'image/jpeg' })),
  }),
  { virtual: true }
);

// Mock the CSS module.
jest.mock('./ModalStyle.css', () => ({}));

// --- Mocks for the Incident Context ---
// Define a stable context so that the same object is returned on every call.
// This prevents useEffect dependencies from changing on every render.
jest.mock('../../contexts/IncidentContext', () => {
  const stableMediaContext = {
    isModalMedia: true, // default open for our rendering test
    closeModalMedia: jest.fn(),
    setIdForMediaCreate: jest.fn(),
    setFormDataArrayForMediaCreate: jest.fn(),
  };
  return {
    useIncidents: () => stableMediaContext,
  };
});

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

// Test case 1: When isModalMedia is true, the modal should render.
// We capture a snapshot to help detect unintended changes.
test('ModalAddMedia renders correctly when open (snapshot test)', () => {
  act(() => {
    ReactDOM.render(<ModalAddMedia context="edit" handleAddMedia={() => {}} />, container);
  });
  expect(container.innerHTML).toMatchSnapshot();
});

// Test case 2: When isModalMedia is false, the component should return null.
test('ModalAddMedia returns null when not open', () => {
  // Get the stable context and set isModalMedia to false to simulate the modal being closed.
  const { useIncidents } = require('../../contexts/IncidentContext');
  const stableContext = useIncidents();
  stableContext.isModalMedia = false;

  act(() => {
    ReactDOM.render(<ModalAddMedia context="edit" handleAddMedia={() => {}} />, container);
  });
  // When the modal is closed, the component returns null, so the container should be empty.
  expect(container.innerHTML).toBe('');
});
