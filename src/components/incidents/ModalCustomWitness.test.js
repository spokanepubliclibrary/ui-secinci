// Define the mutable IncidentContext mock (allowed because its name begins with "mock")
const mockIncidentContext = {
  isModalCustomWitness: true, // default: modal open for tests
  closeModalCustomWitness: jest.fn(),
  setSelectedWitnesses: jest.fn(),
  selectedWitnesses: [],
};

// --- Mocks for the Incident Context ---
jest.mock('../../contexts/IncidentContext', () => ({
  useIncidents: () => mockIncidentContext,
}));

import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import ModalCustomWitness from './ModalCustomWitness';

// --- Suppress known nonfatal warnings ---
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('ReactDOM.render is no longer supported') ||
       args[0].includes('Invalid hook call') ||
       args[0].includes('does not recognize the') ||
       args[0].includes('Unknown event handler property') ||
       args[0].includes('contentClass') ||
       args[0].includes('defaultWidth'))
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

// Mock react-intl so that FormattedMessage simply renders its id.
jest.mock('react-intl', () => ({
  FormattedMessage: (props) => <span>{props.id}</span>,
}));

// Update our mock for @folio/stripes/components so that TextField renders its label.
jest.mock('@folio/stripes/components', () => {
  const React = require('react');
  return {
    Button: (props) => <button {...props}>{props.children}</button>,
    Col: (props) => <div {...props}>{props.children}</div>,
    Modal: (props) => <div {...props}>{props.children}</div>,
    Paneset: (props) => <div {...props}>{props.children}</div>,
    Pane: (props) => <div {...props}>{props.children}</div>,
    ModalFooter: (props) => <div {...props}>{props.children}</div>,
    Row: (props) => <div {...props}>{props.children}</div>,
    // Modified TextField: renders a label and an input.
    // Inside your jest.mock('@folio/stripes/components', ...) block:
    TextField: (props) => {
      // If props.label is an object and has a props.id (from FormattedMessage),
      // then use that for rendering.
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
    // Render MessageBanner only if props.show is truthy.
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
describe('ModalCustomWitness', () => {
  test('returns null when modal is closed', () => {
    mockIncidentContext.isModalCustomWitness = false;
    act(() => {
      ReactDOM.render(<ModalCustomWitness />, container);
    });
    expect(container.innerHTML).toBe('');
  });

  test('renders view mode when custWitViewObj is provided', () => {
    mockIncidentContext.isModalCustomWitness = true;
    const custWitViewObj = {
      firstName: 'Alice',
      lastName: 'Smith',
      role: 'Manager',
      phone: '123-456-7890',
      email: 'alice@example.com',
    };
    act(() => {
      ReactDOM.render(
        <ModalCustomWitness custWitViewObj={custWitViewObj} />,
        container
      );
    });
    const text = container.textContent;
    // Expect the view mode to render detail labels and witness data.
    expect(text).toMatch(/modal-custom-witness-firstName-details/);
    expect(text).toMatch(/modal-custom-witness-lastName-details/);
    expect(text).toMatch(/Alice/);
  });

  test('renders edit/add form when no custWitViewObj is provided', () => {
    mockIncidentContext.isModalCustomWitness = true;
    act(() => {
      ReactDOM.render(
        <ModalCustomWitness context="edit" />,
        container
      );
    });
    const text = container.textContent;
    // Now the label should be rendered by our updated TextField mock.
    expect(text).toMatch(/modal-custom-witness-firstName-label/);
    expect(text).toMatch(/modal-custom-witness-lastName-label/);
  });
});



