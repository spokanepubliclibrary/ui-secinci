/**
 * IncidentTypeDetailsPane.test.js
 * Snapshot + smoke + basic behavior tests for the IncidentTypeDetailsPane.
 */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import IncidentTypeDetailsPane from './IncidentTypeDetailsPane';

/* ------------------------------------------------------------------ *
 * 1) external-library mocks
 * ------------------------------------------------------------------ */
jest.mock('react-intl', () => ({
  useIntl          : () => ({ formatMessage: ({ id }) => id }),
  FormattedMessage : (p) => <span>{p.id}</span>,
}));

jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: 't1' }),
}));

jest.mock('@folio/stripes/components', () => {
  const React = require('react');
  const mk = (tag) => (p) => React.createElement(tag, p, p.children);

  // Pane: render header (so lastMenu appears) and children
  const Pane = (p) => (
    <div>
      {typeof p.renderHeader === 'function' ? p.renderHeader({}) : p.renderHeader}
      {p.children}
      {p.footer}
    </div>
  );

  // PaneHeader: include lastMenu so dropdown content is in DOM
  const PaneHeader = (p) => <div>{p.children}{p.lastMenu}</div>;

  // Simple dropdowns: just render children (always "open" for tests)
  const Dropdown     = (p) => <div>{p.children}</div>;
  const DropdownMenu = (p) => <div>{p.children}</div>;

  // Buttons must be clickable
  const Button = (p) => <button {...p}>{p.children}</button>;

  return {
    Accordion      : mk('div'),
    AccordionSet   : mk('div'),
    Button,
    Col            : mk('div'),
    Dropdown,
    DropdownMenu,
    Label          : mk('label'),
    Pane,
    PaneHeader,
    PaneMenu       : mk('div'),
    Paneset        : mk('div'),
    Row            : mk('div'),
  };
});

/* ------------------------------------------------------------------ *
 * 2) child-component mocks
 * ------------------------------------------------------------------ */
// Provide categories via context; this component also calls GetIncidentCategories
jest.mock('./GetIncidentCategories', () => () => (
  <div>Mock GetIncidentCategories</div>
));

// Feed details so content fields render
jest.mock('./GetSingleIncidentTypeDetails', () => {
  const React = require('react');
  return (props) => {
    React.useEffect(() => {
      props.handleFetchedDetails?.({
        id: 't1',
        title: 'Type 1 - Disorderly',
        category_id: 'cat-1',
        description: 'Initial description',
      });
    }, []);
    return <div>Mock GetSingleIncidentTypeDetails</div>;
  };
});

// Provide all types so delete logic can filter & submit
jest.mock('./GetIncidentTypesDetails', () => {
  const React = require('react');
  return (props) => {
    React.useEffect(() => {
      props.handleIncidentTypes?.([
        { id: 't1', title: 'Type 1 - Disorderly', category_id: 'cat-1', description: 'Initial description' },
        { id: 't2', title: 'Type 2 - Theft',       category_id: 'cat-2', description: 'Other' },
      ]);
    }, []);
    return <div>Mock GetIncidentTypesDetails</div>;
  };
});

// Render a confirm/close pair to drive the deletion flow
jest.mock('./ModalDeleteIncidentType', () => (p) => (
  p.isOpen ? (
    <div>
      <div>Mock ModalDeleteIncidentType</div>
      <button onClick={p.onConfirm}>confirm-delete</button>
      <button onClick={p.onClose}>close-modal</button>
    </div>
  ) : null
));

// Marker for submission
jest.mock('./PutIncidentType', () => (p) => (
  <div>Mock PutIncidentType (context={p?.context})</div>
));

/* ------------------------------------------------------------------ *
 * 3) IncidentContext mock
 * ------------------------------------------------------------------ */
jest.mock('../contexts/IncidentContext', () => ({
  useIncidents: () => ({
    incidentCategories: [
      { id: 'cat-1', title: 'Behavior' },
      { id: 'cat-2', title: 'Property' },
    ],
  }),
}));

/* ------------------------------------------------------------------ *
 * 4) DOM setup / teardown
 * ------------------------------------------------------------------ */
let container, root;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  root.unmount();
  document.body.removeChild(container);
  container = null;
});

/* ------------------------------------------------------------------ *
 * 5) helpers
 * ------------------------------------------------------------------ */
const findButtonByText = (rootEl, text) =>
  Array.from(rootEl.querySelectorAll('button')).find(b => (b.textContent || '').includes(text));

/* ------------------------------------------------------------------ *
 * 6) tests
 * ------------------------------------------------------------------ */
it('renders without crashing (snapshot)', async () => {
  await act(async () => {
    root.render(
      <IncidentTypeDetailsPane handleCloseDetails={jest.fn()} handleShowEdit={jest.fn()} />
    );
  });
  await act(async () => {}); // flush effects
  expect(container.innerHTML).toMatchSnapshot();
});

it('mounts key child components', async () => {
  await act(async () => {
    root.render(
      <IncidentTypeDetailsPane handleCloseDetails={jest.fn()} handleShowEdit={jest.fn()} />
    );
  });
  await act(async () => {});
  const txt = container.textContent;
  expect(txt).toContain('Mock GetIncidentCategories');
  expect(txt).toContain('Mock GetSingleIncidentTypeDetails');
  expect(txt).toContain('Mock GetIncidentTypesDetails');
});

it('renders details fields (title, category, description)', async () => {
  await act(async () => {
    root.render(
      <IncidentTypeDetailsPane handleCloseDetails={jest.fn()} handleShowEdit={jest.fn()} />
    );
  });
  await act(async () => {});
  const txt = container.textContent;
  expect(txt).toContain('Type 1 - Disorderly'); // title
  expect(txt).toContain('Behavior');            // category (resolved by helper against context)
  expect(txt).toContain('Initial description'); // description
});

it('invokes handleShowEdit when Edit is clicked', async () => {
  const onEdit = jest.fn();
  await act(async () => {
    root.render(
      <IncidentTypeDetailsPane handleCloseDetails={jest.fn()} handleShowEdit={onEdit} />
    );
  });
  await act(async () => {});
  const editBtn = findButtonByText(container, 'edit-button');
  expect(editBtn).toBeTruthy();
  await act(async () => { editBtn.click(); });
  expect(onEdit).toHaveBeenCalledWith('t1');
});

it('opens delete modal and submits PutIncidentType on confirm', async () => {
  await act(async () => {
    root.render(
      <IncidentTypeDetailsPane handleCloseDetails={jest.fn()} handleShowEdit={jest.fn()} />
    );
  });
  await act(async () => {});
  // Click the delete action in the dropdown
  const deleteBtn = findButtonByText(container, 'settings.incident-types.details-delete-button');
  expect(deleteBtn).toBeTruthy();
  await act(async () => { deleteBtn.click(); });

  // Modal should be visible; confirm deletion
  const confirm = findButtonByText(container, 'confirm-delete');
  expect(confirm).toBeTruthy();
  await act(async () => { confirm.click(); });

  // Submission marker appears
  expect(container.textContent).toContain('Mock PutIncidentType (context=details)');
});
