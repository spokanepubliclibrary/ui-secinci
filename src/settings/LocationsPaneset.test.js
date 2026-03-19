/**
 * LocationsPaneset.test.js
 * Snapshot + smoke tests for the LocationsPaneset settings container.
 */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import LocationsPaneset from './LocationsPaneset';

/* ------------------------------------------------------------------ *
 * 1. external-library mocks
 * ------------------------------------------------------------------ */
jest.mock('react-intl', () => ({
  useIntl          : () => ({ formatMessage: ({ id }) => id }),
  FormattedMessage : (p) => <span>{p.id}</span>,
}));

jest.mock('react-router-dom', () => ({
  useHistory : () => ({ push: jest.fn(), replace: jest.fn() }),
  useLocation: () => ({ pathname: '/settings/incidents/locations', search: '' }),
  // Keep <Switch> / <Route> simple so routing doesn’t affect snapshots.
  Switch     : (p) => <div>{p.children}</div>,
  Route      : () => null,
}));

jest.mock('@folio/stripes/components', () => {
  const React = require('react');
  const mk = (tag) => (p) => React.createElement(tag, p, p.children);
  return {
    Accordion       : mk('div'),
    AccordionSet    : mk('div'),
    Button          : mk('button'),
    Col             : mk('div'),
    Icon            : (p) => <span {...p}>{p.icon}</span>,
    Label           : mk('label'),
    List            : (p) => <ul>{(p.items || []).map((it, i) => <li key={i}>{p.itemFormatter ? p.itemFormatter(it, i) : it}</li>)}</ul>,
    MessageBanner   : mk('div'),
    MultiColumnList : mk('div'),
    Pane            : mk('div'),
    Paneset         : mk('div'),
    Row             : mk('div'),
    Select          : mk('select'),
    TextArea        : mk('textarea'),
    TextField       : mk('input'),
  };
});

/* ------------------------------------------------------------------ *
 * 2. child-component mocks
 * ------------------------------------------------------------------ */
jest
  .mock('../components/incidents/GetLocations',      () => () => <div>Mock GetLocations</div>)
  .mock('./GetLocationsInService',                   () => () => <div>Mock GetLocationsInService</div>)
  .mock('./PutLocationsInService',                   () => (p) => <div>Mock PutLocationsInService {p?.data ? '(with data)' : ''}</div>)
  .mock('./LocationInServiceEditPane',               () => () => <div>Mock LocationInServiceEditPane</div>);

/* ------------------------------------------------------------------ *
 * 3. helpers (only if they could affect render)
 * ------------------------------------------------------------------ */
jest.mock('./helpers/makeId', () => () => 'mocked-id');

/* ------------------------------------------------------------------ *
 * 4. IncidentContext mock
 * ------------------------------------------------------------------ */
jest.mock('../contexts/IncidentContext', () => {
  const context = {
    // source lists (available locations not yet “in service”)
    locations: ['Central', 'Shadle', 'Hillyard', 'Liberty Park'],
    // persisted/managed “in service” list
    locationsInService: [
      { id: 'central', location: 'Central', subLocations: [] },
    ],
    setLocationsInService: jest.fn(),
  };
  return { useIncidents: () => context };
});

/* ------------------------------------------------------------------ *
 * 5. DOM setup / teardown
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
 * 6. tests
 * ------------------------------------------------------------------ */
it('renders without crashing (snapshot)', async () => {
  await act(async () => { root.render(<LocationsPaneset />); });
  expect(container.innerHTML).toMatchSnapshot();
});

it('mounts key child components', async () => {
  await act(async () => { root.render(<LocationsPaneset />); });
  const txt = container.textContent;
  expect(txt).toContain('Mock GetLocations');
  expect(txt).toContain('Mock GetLocationsInService');
});
