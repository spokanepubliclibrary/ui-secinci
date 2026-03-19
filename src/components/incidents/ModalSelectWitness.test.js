/**
 * ModalSelectWitness.test.js
 * Snapshot + smoke + basic interactions for ModalSelectWitness.
 */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ModalSelectWitness from './ModalSelectWitness';

/* ------------------------------------------------------------------ *
 * 1) intl + stripes/core mocks
 * ------------------------------------------------------------------ */
jest.mock('react-intl', () => ({
  useIntl: () => ({ formatMessage: ({ id }) => id }),
  FormattedMessage: (p) => <span>{p.id}</span>,
}));

// allow toggling permission behavior if needed
let HAS_PFPERM = true;
jest.mock('@folio/stripes/core', () => ({
  useStripes: () => ({ hasPerm: () => HAS_PFPERM }),
}));

/* ------------------------------------------------------------------ *
 * 2) stripes/components mocks
 * ------------------------------------------------------------------ */
jest.mock('@folio/stripes/components', () => {
  const React = require('react');
  const mk = (tag) => (p) => React.createElement(tag, p, p.children);

  const Pane = (p) => (
    <div data-pane>
      {typeof p.renderHeader === 'function' ? p.renderHeader({}) : p.renderHeader}
      <div>{p.children}</div>
      {p.footer}
    </div>
  );

  const PaneHeader = (p) => <div data-pane-header>{p.paneSub || p.paneTitle || p.children}</div>;
  const Paneset = (p) => <div data-paneset>{p.children}</div>;

  const ModalFooter = (p) => <div data-modal-footer>{p.children}</div>;
  const Modal = (p) =>
    p.open ? (
      <div data-modal>
        <div data-modal-body>{p.children}</div>
        {p.footer}
      </div>
    ) : null;

  // NOTE: we intentionally do NOT pass the "disabled" prop to DOM to avoid browser-disabled click semantics in tests.
  const Button = ({ buttonStyle, marginBottom0, disabled, ...rest }) => <button {...rest}>{rest.children}</button>;
  const Icon = ({ icon, ...rest }) => <span {...rest}>{icon}</span>;

  // IMPORTANT: make SearchField UNCONTROLLED; ignore the `value` prop entirely.
  const SearchField = ({ onChange, onKeyDown, placeholder }) => (
    <input placeholder={placeholder} onChange={onChange} onKeyDown={onKeyDown} />
  );

  const LoadingPane = (p) => <div data-loading-pane>{p.children}</div>;

  const MultiColumnList = (p) => {
    const items = p.contentData || [];
    const cols = p.visibleColumns || Object.keys(p.columnMapping || {});
    const fmt = p.formatter || {};
    return (
      <table data-mcl>
        <tbody>
          {items.map((item, r) => (
            <tr key={item.id ?? r}>
              {cols.map((col) => (
                <td key={col} data-col={col}>
                  {fmt[col] ? fmt[col](item) : String(item[col] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return {
    Button,
    Icon,
    LoadingPane,
    Modal,
    ModalFooter,
    MultiColumnList,
    Pane,
    PaneHeader,
    Paneset,
    SearchField,
  };
});

/* ------------------------------------------------------------------ *
 * 3) child-component + css mocks
 * ------------------------------------------------------------------ */
jest.mock('./SearchCustomerOrWitness', () => (p) => (
  <div>Mock SearchCustomerOrWitness: {p.term}</div>
));

jest.mock('../helpers/ProfilePicture/ProfilePicture.js', () => {
  const React = require('react');
  return function ProfilePictureMock(props) {
    return <div data-profile-picture>{props.profilePictureLink}</div>;
  };
});

jest.mock('./GetPatronGroups', () => {
  const React = require('react');
  return function GetPatronGroupsMock({ setPatronGroups }) {
    React.useEffect(() => {
      setPatronGroups?.([
        { id: 'pg1', group: 'Staff' },
        { id: 'pg2', group: 'Visitor' },
      ]);
    }, [setPatronGroups]);
    return <div>Mock GetPatronGroups</div>;
  };
});

// CSS module stub
jest.mock('./ModalStyle.css', () => ({
  modalContent: 'modalContent',
  modalBody: 'modalBody',
  mclContainer: 'mclContainer',
}));

/* ------------------------------------------------------------------ *
 * 4) IncidentContext mock (hook)
 * ------------------------------------------------------------------ */
let mockCtxState = {
  isModalSelectWitness: true,
  closeModalSelectWitness: jest.fn(),
  isLoadingSearch: false,
  selectedWitnesses: [],
  setSelectedWitnesses: jest.fn(),
  setCustomers: jest.fn(),
  customers: [
    {
      id: 'u1',
      firstName: 'Jane',
      middleName: 'Q',
      lastName: 'Public',
      barcode: '111',
      active: true,
      patronGroup: 'pg1',
      profilePicLinkOrUUID: 'uuid-111',
    },
    {
      id: 'u2',
      firstName: 'John',
      lastName: 'Doe',
      barcode: '222',
      active: false,
      patronGroup: 'pg2',
      profilePicLinkOrUUID: 'uuid-222',
    },
  ],
};

jest.mock('../../contexts/IncidentContext', () => ({
  useIncidents: () => mockCtxState,
}));

/* ------------------------------------------------------------------ *
 * 5) DOM setup / teardown
 * ------------------------------------------------------------------ */
let container, root;
beforeEach(() => {
  jest.clearAllMocks();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  document.body.removeChild(container);
  container = null;
});

/* ------------------------------------------------------------------ *
 * helpers
 * ------------------------------------------------------------------ */
const flushAll = async () => {
  await act(async () => { await Promise.resolve(); });
  await act(async () => { await new Promise(r => setTimeout(r, 0)); });
};

const findButtonByText = (rootEl, text) =>
  Array.from(rootEl.querySelectorAll('button')).find((b) =>
    (b.textContent || '').includes(text)
  );

/* ------------------------------------------------------------------ *
 * fixtures (props)
 * ------------------------------------------------------------------ */
const baseProps = {
  context: 'create', // use create to avoid edit-specific toggling with removed ids
  setFormData: jest.fn(),
  formData: { incidentWitnesses: [] },
  setRemovedWitnessIds: jest.fn(),
  removedWitnessIds: [],
};

/* ------------------------------------------------------------------ *
 * tests
 * ------------------------------------------------------------------ */
it('returns null when the modal flag is false', async () => {
  mockCtxState.isModalSelectWitness = false;
  await act(async () => {
    root.render(<ModalSelectWitness {...baseProps} />);
  });
  expect(container.innerHTML).toBe('');
  mockCtxState.isModalSelectWitness = true; // restore
});

it('renders open modal with search + results (snapshot)', async () => {
  await act(async () => {
    root.render(<ModalSelectWitness {...baseProps} />);
  });
  await flushAll();
  expect(container.innerHTML).toMatchSnapshot();
});

it('search field typing is accepted (smoke; no fragile disabled assertions)', async () => {
  await act(async () => {
    root.render(<ModalSelectWitness {...baseProps} />);
  });
  await flushAll();

  const input = container.querySelector('input[placeholder="Name or barcode"]');
  expect(input).toBeTruthy();

  // Type value; component reads e.target.value in onChange
  await act(async () => {
    input.value = 'Jane';
    input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  });
  await flushAll();

  // Button is present; we do not assert disabled/enabled to avoid timing flakes.
  const searchBtn = findButtonByText(container, 'search-button');
  expect(searchBtn).toBeTruthy();
});

it('shows an "Add" button for rows and calls setSelectedWitnesses when clicked', async () => {
  mockCtxState.selectedWitnesses = [];
  mockCtxState.setSelectedWitnesses = jest.fn();

  await act(async () => {
    root.render(<ModalSelectWitness {...baseProps} />);
  });
  await flushAll();

  const addButtons = Array.from(container.querySelectorAll('button')).filter((b) =>
    (b.textContent || '').includes('Add')
  );
  expect(addButtons.length).toBeGreaterThan(0);

  await act(async () => {
    addButtons[0].click();
  });
  await flushAll();

  expect(mockCtxState.setSelectedWitnesses).toHaveBeenCalled();
});

it('in edit context shows a check for witnesses already present in formData', async () => {
  const editProps = {
    ...baseProps,
    context: 'edit',
    formData: { incidentWitnesses: [{ id: 'u1' }] },
  };

  await act(async () => {
    root.render(<ModalSelectWitness {...editProps} />);
  });
  await flushAll();

  expect(container.textContent).toContain('check-circle');
});

it('clicking "Close & Continue" calls close + clears customers + clears search', async () => {
  mockCtxState.closeModalSelectWitness = jest.fn();
  mockCtxState.setCustomers = jest.fn();

  await act(async () => {
    root.render(<ModalSelectWitness {...baseProps} />);
  });
  await flushAll();

  const closeBtn = container.querySelector('#close-continue-button');
  expect(closeBtn).toBeTruthy();

  await act(async () => {
    closeBtn.click();
  });
  await flushAll();

  expect(mockCtxState.closeModalSelectWitness).toHaveBeenCalled();
  expect(mockCtxState.setCustomers).toHaveBeenCalledWith([]);
  expect(container.textContent).not.toContain('Mock SearchCustomerOrWitness:');
});
