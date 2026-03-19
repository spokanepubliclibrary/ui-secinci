/**
 * IncidentTypeEditPane.test.js
 * Snapshot + smoke + basic behavior tests for the IncidentTypeEditPane.
 */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import IncidentTypeEditPane from './IncidentTypeEditPane';

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

  // IMPORTANT: render footer (and renderHeader) so buttons appear in DOM
  const Pane = (p) => (
    <div>
      {typeof p.renderHeader === 'function' ? p.renderHeader({}) : p.renderHeader}
      {p.children}
      {p.footer}
    </div>
  );

  // PaneFooter needs to render its start/end
  const PaneFooter = (p) => <div>{p.renderStart}{p.renderEnd}</div>;

  return {
    Accordion   : mk('div'),
    AccordionSet: mk('div'),
    Button      : (p) => <button {...p}>{p.children}</button>,
    Col         : mk('div'),
    Pane,
    PaneHeader  : mk('div'),
    PaneFooter,
    Row         : mk('div'),
    Select      : (p) => <select {...p}>{p.children}</select>,
    TextArea    : (p) => <textarea {...p}>{p.children}</textarea>,
    TextField   : (p) => <input {...p} />,
  };
});

/* ------------------------------------------------------------------ *
 * 2) child-component mocks
 * ------------------------------------------------------------------ */
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

jest.mock('./GetIncidentCategories', () => () => (
  <div>Mock GetIncidentCategories</div>
));

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
const findButtonByText = (rootEl, text) => {
  const btns = Array.from(rootEl.querySelectorAll('button'));
  return btns.find((b) => (b.textContent || '').includes(text));
};

/* ------------------------------------------------------------------ *
 * 6) tests
 * ------------------------------------------------------------------ */
it('renders without crashing (snapshot)', async () => {
  await act(async () => {
    root.render(<IncidentTypeEditPane handleCloseEdit={jest.fn()} />);
  });
  // allow effects (details/types) to flush
  await act(async () => {});
  expect(container.innerHTML).toMatchSnapshot();
});

it('mounts key child components', async () => {
  await act(async () => {
    root.render(<IncidentTypeEditPane handleCloseEdit={jest.fn()} />);
  });
  await act(async () => {});
  const txt = container.textContent;
  expect(txt).toContain('Mock GetSingleIncidentTypeDetails');
  expect(txt).toContain('Mock GetIncidentCategories');
  expect(txt).toContain('Mock GetIncidentTypesDetails');
});

it('enables the Save button once form data is present', async () => {
  await act(async () => {
    root.render(<IncidentTypeEditPane handleCloseEdit={jest.fn()} />);
  });
  await act(async () => {}); // flush state updates from useEffect
  const saveBtn = findButtonByText(container, 'save-and-close-button');
  expect(saveBtn).toBeTruthy();
  expect(saveBtn.hasAttribute('disabled')).toBe(false);
});

it('submits and renders PutIncidentType when Save is clicked', async () => {
  await act(async () => {
    root.render(<IncidentTypeEditPane handleCloseEdit={jest.fn()} />);
  });
  await act(async () => {}); // flush initial effects
  const saveBtn = findButtonByText(container, 'save-and-close-button');
  await act(async () => {
    saveBtn.click();
  });
  expect(container.textContent).toContain('Mock PutIncidentType');
});
