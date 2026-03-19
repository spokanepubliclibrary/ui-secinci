/**
 * IncidentTypesPaneset.test.js
 * Snapshot + smoke tests for the IncidentTypesPaneset settings container.
 */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import IncidentTypesPaneset from './IncidentTypesPaneset';

/* ------------------------------------------------------------------ *
 * 1. external-library mocks
 * ------------------------------------------------------------------ */
jest.mock('react-intl', () => ({
  useIntl          : () => ({ formatMessage: ({ id }) => id }),
  FormattedMessage : (p) => <span>{p.id}</span>,
}));

jest.mock('react-router-dom', () => ({
  useHistory : () => ({ push: jest.fn(), replace: jest.fn() }),
  useLocation: () => ({ pathname: '/settings/incidents/types', search: '' }),
  // keep these inert for stable snapshots
  Switch     : (p) => <div>{p.children}</div>,
  Route      : () => null,
}));

jest.mock('@folio/stripes/components', () => {
  const React = require('react');
  const mk = (tag) => (p) => React.createElement(tag, p, p.children);

  // Render NavList as simple UL/LI structure so items are visible in textContent
  const NavList        = (p) => <ul {...p}>{p.children}</ul>;
  const NavListSection = (p) => <li {...p}>{p.children}</li>;
  const NavListItem    = (p) => <li onClick={p.onClick}>{p.children}</li>;

  return {
    Button       : mk('button'),
    Col          : mk('div'),
    Pane         : mk('div'),
    PaneHeader   : mk('div'),
    Paneset      : mk('div'),
    Row          : mk('div'),
    NavList,
    NavListItem,
    NavListSection,
  };
});

/* ------------------------------------------------------------------ *
 * 2. child-component mocks
 * ------------------------------------------------------------------ */
jest
  .mock('./GetIncidentTypesDetails', () => () => <div>Mock GetIncidentTypesDetails</div>)
  .mock('./IncidentTypeDetailsPane', () => () => <div>Mock IncidentTypeDetailsPane</div>)
  .mock('./IncidentTypeEditPane',    () => () => <div>Mock IncidentTypeEditPane</div>)
  .mock('./NewIncidentTypePane',     () => () => <div>Mock NewIncidentTypePane</div>);

/* ------------------------------------------------------------------ *
 * 3. IncidentContext mock
 * ------------------------------------------------------------------ */
jest.mock('../contexts/IncidentContext', () => {
  // Unsorted input list exercises the numeric-part sorter in the component
  const incidentTypesNamesIdsList = [
    { id: 't10', title: 'Type 10 - Assault' },
    { id: 't2',  title: 'Type 2 - Theft' },
    { id: 't1',  title: 'Type 1 - Disorderly' },
    { id: 't21', title: 'Type 2.1 - Minor' },
  ];
  return {
    useIncidents: () => ({
      incidentTypesNamesIdsList,
    }),
  };
});

/* ------------------------------------------------------------------ *
 * 4. DOM setup / teardown
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
 * 5. tests
 * ------------------------------------------------------------------ */
it('renders without crashing (snapshot)', async () => {
  await act(async () => { root.render(<IncidentTypesPaneset />); });
  expect(container.innerHTML).toMatchSnapshot();
});

it('mounts key child components', async () => {
  await act(async () => { root.render(<IncidentTypesPaneset />); });
  const txt = container.textContent;
  expect(txt).toContain('Mock GetIncidentTypesDetails');

  // list or fallback text should render
  expect(
    txt.includes('Type 1 - Disorderly') ||
    txt.includes('settings.incident-types-default-if-no-list')
  ).toBe(true);
});

it('sorts the incident type list by numeric parts in the title', async () => {
  await act(async () => { root.render(<IncidentTypesPaneset />); });
  const txt = container.textContent;

  // ensure 1 < 2 < 2.1 < 10 by index positions in the rendered text
  const i1  = txt.indexOf('Type 1 - Disorderly');
  const i2  = txt.indexOf('Type 2 - Theft');
  const i21 = txt.indexOf('Type 2.1 - Minor');
  const i10 = txt.indexOf('Type 10 - Assault');

  expect(i1).toBeGreaterThanOrEqual(0);
  expect(i2).toBeGreaterThan(i1);
  expect(i21).toBeGreaterThan(i2);
  expect(i10).toBeGreaterThan(i21);
});
