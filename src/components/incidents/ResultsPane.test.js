/**
 * ResultsPane.test.js
 * Snapshot + smoke tests for the ResultsPane container.
 */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import ResultsPane from './ResultsPane';

/* ------------------------------------------------------------------ *
  1 stripes core + UI widget mocks                                   
 * ------------------------------------------------------------------ */
jest.mock('@folio/stripes/core', () => ({
  useStripes: () => ({ hasPerm: jest.fn(() => true) }),
  stripesConnect: (Comp) => Comp,
}));

jest.mock('@folio/stripes/components', () => {
  const React = require('react');
  const make = (tag) => (p) => React.createElement(tag, p, p.children);

  /* render actionMenu so ColumnChooser text appears */
  const PaneHeader = (props) => {
    const menu = props.actionMenu ? props.actionMenu({ onToggle: jest.fn() }) : null;
    return React.createElement('div', props, menu, props.children);
  };

  return {
    Icon: (p) => <span {...p}>{p.icon}</span>,
    Pane: make('div'),
    PaneHeader,
    PaneMenu: make('div'),
    MultiColumnList: make('div'),
    Button: make('button'),
    LoadingPane: make('div'),
  };
});

/* ------------------------------------------------------------------ *
  2  nested components & hooks                                       
 * ------------------------------------------------------------------ */
jest
  .mock('../../settings/GetIncidentTypesDetails', () => () => <div>Mock GetIncidentTypesDetails</div>)
  .mock('../../settings/GetLocationsInService', () => () => <div>Mock GetLocationsInService</div>)
  .mock('./GetName', () => () => <div>Mock GetName</div>)
  .mock('./ColumnChooser', () => () => <div>Mock ColumnChooser</div>);

jest.mock('./usePersistedColumns', () => () => [['customers', 'incidentLocation'], jest.fn()]);
jest.mock('./usePersistedSort', () => () => ({
  sortColumn: '',
  sortDirection: 'asc',
  setSortColumn: jest.fn(),
  setSortDirection: jest.fn(),
}));

jest.mock('./helpers/buildQueryString', () => jest.fn(() => 'mockedQueryString'));
jest.mock('./helpers/convertUTCISOToPrettyDate', () => jest.fn((d) => d));

/* ------------------------------------------------------------------ *
 * 3 router + IncidentContext                                        
 * ------------------------------------------------------------------ */
const stableIncidentsList  = [];   // avoid new [] on each render
const stableAppliedFilters = {};

jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/incidents', search: '' }),
  useHistory: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('../../contexts/IncidentContext', () => ({
  useIncidents: () => ({
    openDetailsPane: jest.fn(),
    openCreatePane: jest.fn(),
    isLoadingSearch: false,
    incidentsList: stableIncidentsList,
    appliedSearchParams: stableAppliedFilters,
    incidentTypesList: [],
    locationsInService: [],
    limit: 20,
    offset: 0,
    totalResults: 0,
  }),
}));

/* ------------------------------------------------------------------ *
  4 DOM setup / teardown (React-18 createRoot)                       
 * ------------------------------------------------------------------ */
let container;
let root;
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
  5 Tests                                                            
 * ------------------------------------------------------------------ */
it('renders without crashing (snapshot)', () => {
  act(() => {
    root.render(<ResultsPane />);
  });
  expect(container.innerHTML).toMatchSnapshot();
});

it('mounts key child components', () => {
  act(() => {
    root.render(<ResultsPane />);
  });
  expect(container.textContent).toEqual(
    expect.stringContaining('Mock GetIncidentTypesDetails')
  );
});

