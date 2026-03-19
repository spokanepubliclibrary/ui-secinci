/**
 * DetailsPane.test.js
 * Snapshot + smoke tests for the DetailsPane container.
 */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import DetailsPane from './DetailsPane';

/* ------------------------------------------------------------------ *
  1 external-library mocks                                          
 * ------------------------------------------------------------------ */
jest.mock('react-intl', () => ({
  useIntl          : () => ({ formatMessage: ({ id }) => id }),
  FormattedMessage : (p) => <span>{p.id}</span>,
}));
jest.mock('react-router-dom', () => ({
  useParams   : () => ({ id: 'test-id' }),
  useHistory  : () => ({ push: jest.fn(), replace: jest.fn() }),
  useLocation : () => ({ pathname: '/incidents/123', search: '' }),
}));
jest.mock('@folio/stripes/core', () => ({
  useStripes: () => ({ hasPerm: jest.fn(() => true) }),
}));
jest.mock('@folio/stripes/components', () => {
  const React = require('react');
  const mk = (tag) => (p) => React.createElement(tag, p, p.children);
  return {
    Button         : mk('button'),
    Headline       : mk('h2'),
    Icon           : (p) => <span {...p}>{p.icon}</span>,
    Pane           : mk('div'),
    PaneHeader     : mk('div'),
    AccordionSet   : mk('div'),
    Accordion      : mk('div'),
    ExpandAllButton: mk('button'),
    Label          : mk('label'),
    MetaSection    : mk('div'),
    MessageBanner  : mk('div'),
    Row            : mk('div'),
    Col            : mk('div'),
    LoadingPane    : mk('div'),
    List           : (p) => <ul>{(p.items || []).map((it, i) => <li key={i}>{it}</li>)}</ul>,
  };
});
jest.mock('../helpers/ProfilePicture/ProfilePicture.js', () => {
  const React = require('react');
  const mk = (tag) => (p) => React.createElement(tag, p, p.children);
  return {
    ProfilePicture  : mk('div'),
  };
});

/* ------------------------------------------------------------------ *
  2  child-component mocks                                           
 * ------------------------------------------------------------------ */
jest
  .mock('./GetDetails',               () => () => <div>Mock GetDetails</div>)
  .mock('./GetName',                  () => () => <div>Mock GetName</div>)
  .mock('./GetNameCreatedBy',         () => () => <div>Mock GetNameCreatedBy</div>)
  .mock('../../settings/GetLocationsInService',  () => () => <div>Mock GetLocationsInService</div>)
  .mock('../../settings/GetIncidentTypesDetails',() => () => <div>Mock GetIncidentTypesDetails</div>)
  .mock('../../settings/GetTrespassReasons',() => () => <div>Mock GetTrespassReasons</div>)
  .mock('./ModalViewMedia',           () => () => <div>Mock ModalViewMedia</div>)
  .mock('./ModalViewCustomerDetails', () => () => <div>Mock ModalViewCustomerDetails</div>)
  .mock('./ModalViewTrespass',        () => () => <div>Mock ModalViewTrespass</div>)
  .mock('./GetMedia',                 () => () => <div>Mock GetMedia</div>)
  .mock('./Thumbnail',                () => () => <div>Mock Thumbnail</div>)
  .mock('./ThumbnailSkeleton',        () => () => <div>Mock ThumbnailSkeleton</div>)
  .mock('./ModalCustomWitness',       () => () => <div>Mock ModalCustomWitness</div>);

/* ------------------------------------------------------------------ *
  3 helper mocks                                                    
 * ------------------------------------------------------------------ */
jest.mock('./helpers/convertDateIgnoringTZ',           () => jest.fn((d) => d));
jest.mock('./helpers/convertUTCISOToPrettyDate',       () => jest.fn((d) => d));
jest.mock('./helpers/convertUTCISOToLocalePrettyTime', () => jest.fn((d) => d));

/* ------------------------------------------------------------------ *
 * 4 incidentContext mock         
 * ------------------------------------------------------------------ */
jest.mock('../../contexts/IncidentContext', () => {
  const customers = [];
  const incidentContext = {
    singleIncident : {
      incidentLocation : 'loc-1',
      subLocation      : 'sub-1',
      dateTimeOfIncident: '2020-01-01T12:00:00Z',
      customers,
      incidentTypes    : [],
      incidentWitnesses: [],
      attachments      : [],
      detailedDescriptionOfIncident: 'Test Description',
      createdBy : {},
      metadata  : {},
    },
    customers,
    associatedKeyCustArray : [],
    setSingleIncident      : jest.fn(),
    closeDetailsPane       : jest.fn(),
    openEditPane           : jest.fn(),
    openLoadingDetails     : jest.fn(),
    isLoadingDetails       : false,
    isModalViewImage       : false,
    openModalViewImage     : jest.fn(),
    mode                   : 'view',
    incidentTypesList      : [],
    locationsInService     : [],
    isImageArrayLoading    : false,
    openImageSkeleton      : jest.fn(),
    closeImageSkeleton     : jest.fn(),
    openModalCustomWitness : jest.fn(),
    documentError          : false,
    documentErrorMessage   : '',
    clearDocumentError     : jest.fn(),
  };
  return { useIncidents: () => incidentContext };
});

/* ------------------------------------------------------------------ *
  5 DOM setup / teardown                                           
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
  6  tests                                                           
 * ------------------------------------------------------------------ */
it('renders without crashing (snapshot)', () => {
  act(() => {
    root.render(<DetailsPane />);
  });
  expect(container.innerHTML).toMatchSnapshot();
});

it('mounts key child components', () => {
  act(() => {
    root.render(<DetailsPane />);
  });
  expect(container.textContent).toContain('Mock GetDetails');
});
