// IncidentsPaneset.test.js
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import IncidentsPaneset from './IncidentsPaneset';

/* ------------------------------------------------------------------ *
 * 1 mock externals                  
 * ------------------------------------------------------------------ */
jest.mock('@folio/stripes/core', () => ({
  stripesConnect: (Comp) => Comp,
}));

jest.mock('@folio/stripes/components', () => {
  const React = require('react');
  const make = (tag) => (p) => React.createElement(tag, p, p.children);
  return {
    Accordion: make('div'),
    AutoSuggest: make('div'),
    Checkbox: make('div'),
    Paneset: make('div'),
    Pane: make('div'),
    SearchField: make('input'),
    Button: make('button'),
    Headline: make('h2'),
    Datepicker: make('input'),
    Row: make('div'),
    Col: make('div'),
    Icon: (p) => <span {...p}>{p.icon}</span>,
    TextField: make('input'),
    RadioButton: (p) => <input type="radio" {...p} />,
  };
});

/* ------------------------------------------------------------------ *
 * 2 mock nested panes and utils                         
 * ------------------------------------------------------------------ */
jest
  .mock('../../settings/GetLocationsInService', () => () => <div>Mock GetLocationsInService</div>)
  .mock('./GetListDynamicQuery', () => () => <div>Mock GetListDynamicQuery</div>)
  .mock('./GetLocations', () => () => <div>Mock GetLocations</div>)
  .mock('../../settings/GetIncidentTypesDetails', () => () => <div>Mock GetIncidentTypesDetails</div>)
  .mock('./GetOrgLocaleSettings', () => () => <div>Mock GetOrgLocaleSettings</div>)
  .mock('./ResultsPane', () => () => <div>Mock ResultsPane</div>)
  .mock('./DetailsPane', () => () => <div>Mock DetailsPane</div>)
  .mock('./EditPane', () => () => <div>Mock EditPane</div>)
  .mock('./CreatePane', () => () => <div>Mock CreatePane</div>);

jest.mock('./usePersistedSort', () => () => ({
  sortColumn: '',
  sortDirection: 'asc',
  setSortColumn: jest.fn(),
  setSortDirection: jest.fn(),
}));

jest.mock('./helpers/buildQueryString', () => jest.fn(() => 'mockedQueryString'));

/* ------------------------------------------------------------------ *
 * 3 router and context                                 
 * ------------------------------------------------------------------ */
jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/incidents', search: '' }),
  useHistory: () => ({ push: jest.fn(), replace: jest.fn() }),
  useParams: () => ({}),
}));

jest.mock('../../contexts/IncidentContext', () => ({
  useIncidents: () => ({
    /* pane toggles */
    isDetailsPaneOpen: false,
    isEditPaneOpen: false,
    isCreatePaneOpen: false,
    /* data / helpers */
    incidentTypesNamesIdsList: [],
    locationsInService: [],
    organizationTimezone: 'America/Chicago',
    /* query-string & paging */
    queryString: '',
    setQueryString: jest.fn(),
    appliedSearchParams: {},
    setAppliedSearchParams: jest.fn(),
    limit: 20,
    setLimit: jest.fn(),
    offset: 0,
    setOffset: jest.fn(),
    /* misc */
    setIncidentsList: jest.fn(),
    setTotalResults: jest.fn(),
  }),
}));

/* ------------------------------------------------------------------ *
 * 4 test harness setup / teardown                                  *
 * ------------------------------------------------------------------ */
let container;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

/* ------------------------------------------------------------------ *
 * 5 test cases                                                     *
 * ------------------------------------------------------------------ */
it('renders without crashing (snapshot)', () => {
  act(() => {
    ReactDOM.render(<IncidentsPaneset />, container);
  });
  expect(container.innerHTML).toMatchSnapshot();
});

it('mounts key child panes', () => {
  act(() => {
    ReactDOM.render(<IncidentsPaneset />, container);
  });
  // Smoke-test that one or two top-level mocked panes are present
  expect(container.textContent).toEqual(
    expect.stringContaining('Mock GetLocationsInService')
  );
  expect(container.textContent).toEqual(
    expect.stringContaining('Mock ResultsPane')
  );
});

