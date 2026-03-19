
// This test file is currently still being built/is incomplete.
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import ModalSelectIncidentTypes from './ModalSelectIncidentTypes';

// --- Mocks for the Incident Context ---
const mockIncidentContext = {
  isModalSelectTypesOpen: false,
  closeModalSelectTypes: jest.fn(),
  incidentTypesList: [],
  incidentCategories: [],
};

// Provide a mock for the useIncidents hook
jest.mock('../../contexts/IncidentContext', () => ({
  useIncidents: () => mockIncidentContext,
}));

// Mocks for the child components used inside ModalSelectIncidentTypes
jest.mock('../../settings/GetIncidentTypesDetails', () => () => <div>Mock GetIncidentTypesDetails</div>);
jest.mock('../../settings/GetIncidentCategories', () => () => <div>Mock GetIncidentCategories</div>);
jest.mock('./IncidentTypeCard', () => {
  // We'll pretend IncidentTypeCard is a simple clickable div for test purposes
  return function IncidentTypeCard(props) {
    const { id, title, isSelected, handleTypeToggle } = props;
    const handleClick = () => {
      handleTypeToggle({ id, title });
    };
    return (
      <div data-testid={`card-${id}`} onClick={handleClick}>
        {title} {isSelected ? '(selected)' : '(not selected)'}
      </div>
    );
  };
});

// Minimal mocks for stripes components
jest.mock('@folio/stripes/components', () => {
  const React = require('react');
  return {
    Modal: (props) => {
      // In your test, we want the label's ID to appear in the output
      let labelId = '';
      if (props.label && props.label.props && props.label.props.id) {
        labelId = props.label.props.id;
      }
      return (
        <div>
          {labelId && <h2>{labelId}</h2>}
          {props.children}
        </div>
      );
    },
    ModalFooter: (props) => <div>{props.children}</div>,
    Button: (props) => <button {...props}>{props.children}</button>,
    Checkbox: (props) => {
      const { label, value, onChange, ...rest } = props;
      const handleChange = (evt) => {
        onChange({ target: { checked: evt.target.checked, value } });
      };
      return (
        <label>
          <input type="checkbox" onChange={handleChange} {...rest} />
          {label}
        </label>
      );
    },
    Row: (props) => <div>{props.children}</div>,
    Col: (props) => <div>{props.children}</div>,
    Pane: (props) => <div>{props.children}</div>,
    Paneset: (props) => <div>{props.children}</div>,
  };
});

describe('ModalSelectIncidentTypes', () => {
  let container;
  let handleIncidentTypeToggle;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    // Provide a fresh mock toggle function for each test
    handleIncidentTypeToggle = jest.fn();

    // Reset the stable context defaults
    mockIncidentContext.isModalSelectTypesOpen = false;
    mockIncidentContext.closeModalSelectTypes.mockClear();
    mockIncidentContext.incidentTypesList = [];
    mockIncidentContext.incidentCategories = [];
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  test('returns null when modal is not open', () => {
    act(() => {
      ReactDOM.render(
        <ModalSelectIncidentTypes
          handleIncidentTypeToggle={handleIncidentTypeToggle}
          formDataIncidentTypes={[]}
        />,
        container
      );
    });
    // The entire container should be empty
    expect(container.innerHTML).toBe('');
  });

  test('renders basic structure when open', () => {
    mockIncidentContext.isModalSelectTypesOpen = true;
    mockIncidentContext.incidentCategories = [
      { id: 'cat-1', title: 'Category One' },
      { id: 'cat-2', title: 'Category Two' },
    ];
    mockIncidentContext.incidentTypesList = [
      { id: 'type-1', title: 'Type One', category_id: 'cat-1' },
      { id: 'type-2', title: 'Type Two', category_id: 'cat-2' },
    ];

    act(() => {
      ReactDOM.render(
        <ModalSelectIncidentTypes
          handleIncidentTypeToggle={handleIncidentTypeToggle}
          formDataIncidentTypes={[]}
        />,
        container
      );
    });

    const text = container.textContent;
    // Should see the label for the modal
    expect(text).toMatch(/modal-incident-type-label/);

    // Should see the checkboxes for categories
    expect(text).toMatch(/Category One/);
    expect(text).toMatch(/Category Two/);

    // Should see the 2 "cards"
    expect(text).toMatch(/Type One \(not selected\)/);
    expect(text).toMatch(/Type Two \(not selected\)/);

    // Should see child mocks
    expect(text).toMatch(/Mock GetIncidentTypesDetails/);
    expect(text).toMatch(/Mock GetIncidentCategories/);
  });

  test('clicking type card calls handleIncidentTypeToggle', () => {
    mockIncidentContext.isModalSelectTypesOpen = true;
    mockIncidentContext.incidentTypesList = [
      { id: 'type-10', title: 'Type Ten', category_id: 'cat-A' },
    ];

    act(() => {
      ReactDOM.render(
        <ModalSelectIncidentTypes
          handleIncidentTypeToggle={handleIncidentTypeToggle}
          formDataIncidentTypes={[]}
        />,
        container
      );
    });

    // The "card" is a <div data-testid="card-type-10" /> from our mock
    const cardDiv = container.querySelector('[data-testid="card-type-10"]');
    expect(cardDiv).toBeTruthy();

    act(() => {
      cardDiv.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    // Should have called handleIncidentTypeToggle once
    expect(handleIncidentTypeToggle).toHaveBeenCalledTimes(1);

    // The param: { id: 'type-10', title: 'Type Ten' }
    expect(handleIncidentTypeToggle).toHaveBeenCalledWith({
      id: 'type-10',
      title: 'Type Ten',
    });
  });

  test('clicking category checkboxes filters the incident types shown', () => {
    mockIncidentContext.isModalSelectTypesOpen = true;
    mockIncidentContext.incidentCategories = [
      { id: 'cat-x', title: 'Category X' },
      { id: 'cat-y', title: 'Category Y' },
    ];
    mockIncidentContext.incidentTypesList = [
      { id: 'type-1', title: 'Type One', category_id: 'cat-x' },
      { id: 'type-2', title: 'Type Two', category_id: 'cat-x' },
      { id: 'type-3', title: 'Type Three', category_id: 'cat-y' },
    ];

    act(() => {
      ReactDOM.render(
        <ModalSelectIncidentTypes
          handleIncidentTypeToggle={handleIncidentTypeToggle}
          formDataIncidentTypes={[]}
        />,
        container
      );
    });

    let text = container.textContent;
    // All 3 types appear initially
    expect(text).toMatch(/Type One \(not selected\)/);
    expect(text).toMatch(/Type Two \(not selected\)/);
    expect(text).toMatch(/Type Three \(not selected\)/);

    // Now let's simulate checking a single category, e.g. cat-x
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(2); // cat-x and cat-y
    const catXBox = [...checkboxes].find(cb => cb.parentElement.textContent.includes('Category X'));

    act(() => {
      catXBox.checked = true;
      catXBox.dispatchEvent(new MouseEvent('change', { bubbles: true }));
    });

    // With only cat-x checked, we expect to see only Type One, Type Two
    text = container.textContent;
    expect(text).toMatch(/Type One \(not selected\)/);
    expect(text).toMatch(/Type Two \(not selected\)/);
    // Type Three should be filtered out
    expect(text).not.toMatch(/Type Three \(not selected\)/);
  });

  test('clicking "Close and Continue" calls closeModalSelectTypes and resets filterArgs', () => {
    mockIncidentContext.isModalSelectTypesOpen = true;

    act(() => {
      ReactDOM.render(
        <ModalSelectIncidentTypes
          handleIncidentTypeToggle={handleIncidentTypeToggle}
          formDataIncidentTypes={[]}
        />,
        container
      );
    });

    const button = container.querySelector('#close-continue-button-access');
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(mockIncidentContext.closeModalSelectTypes).toHaveBeenCalledTimes(1);
  });

  test('clicking "Cancel" also closes the modal', () => {
    mockIncidentContext.isModalSelectTypesOpen = true;

    act(() => {
      ReactDOM.render(
        <ModalSelectIncidentTypes
          handleIncidentTypeToggle={handleIncidentTypeToggle}
          formDataIncidentTypes={[]}
        />,
        container
      );
    });

    const cancelButton = [...container.querySelectorAll('button')].find(btn =>
      btn.textContent.includes('cancel-button')
    );
    act(() => {
      cancelButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(mockIncidentContext.closeModalSelectTypes).toHaveBeenCalledTimes(1);
  });
});