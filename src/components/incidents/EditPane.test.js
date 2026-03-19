/**
 * EditPane.test.js
 * Snapshot + smoke tests for the EditPane container.
 */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import EditPane from './EditPane';

/* ------------------------------------------------------------------ *
 * 1. react-intl / router / stripes mocks                              *
 * ------------------------------------------------------------------ */
jest.mock('react-intl', () => ({
  useIntl          : () => ({ formatMessage: ({ id }) => id }),
  FormattedMessage : (p) => <span>{p.id}</span>,
}));
jest.mock('react-router-dom', () => ({
  useParams   : () => ({ id: 'edit-id' }),
  useHistory  : () => ({ push: jest.fn(), replace: jest.fn() }),
  useLocation : () => ({ pathname: '/incidents/edit-id', search: '' }),
}));
jest.mock('@folio/stripes/core', () => ({
  useStripes: () => ({ hasPerm: jest.fn(() => true) }),
}));

/* ------------------------------------------------------------------ *
 * 2. stripes/components mock (minimal DOM)                            *
 * ------------------------------------------------------------------ */
jest.mock('@folio/stripes/components', () => {
  const React = require('react');
  const mk = (tag) => (p) => React.createElement(tag, p, p.children);

  /* need PaneHeader/PaneFooter to render footer buttons */
  return {
    Accordion        : mk('div'),
    AccordionSet     : mk('div'),
    Button           : mk('button'),
    Checkbox         : mk('div'),
    Col              : mk('div'),
    Datepicker       : mk('input'),
    Editor           : mk('textarea'),
    ExpandAllButton  : mk('button'),
    Icon             : (p) => <span {...p}>{p.icon}</span>,
    Label            : mk('label'),
    List             : (p) => <ul>{(p.items||[]).map((x,i)=><li key={i}>{x}</li>)}</ul>,
    LoadingPane      : mk('div'),
    MetaSection      : mk('div'),
    MessageBanner    : mk('div'),
    Pane             : mk('div'),
    PaneHeader       : mk('div'),
    PaneFooter       : mk('div'),
    Row              : mk('div'),
    Select           : mk('select'),
    TextArea         : mk('textarea'),
    Timepicker       : mk('input'),
  };
});

/* ------------------------------------------------------------------ *
 * 3. Child-component stubs                                            *
 * ------------------------------------------------------------------ */
jest
  .mock('../../settings/GetLocationsInService', () => () => <div>Mock GetLocationsInService</div>)
  .mock('../../settings/GetIncidentTypesDetails', () => () => <div>Mock GetIncidentTypesDetails</div>)
  .mock('./ModalSelectKnownCustomer',   () => () => <div>Mock ModalSelectKnownCustomer</div>)
  .mock('./ModalDescribeCustomer',      () => () => <div>Mock ModalDescribeCustomer</div>)
  .mock('./ModalSelectIncidentTypes',   () => () => <div>Mock ModalSelectIncidentTypes</div>)
  .mock('./ModalSelectWitness',         () => () => <div>Mock ModalSelectWitness</div>)
  .mock('./ModalTrespass',              () => () => <div>Mock ModalTrespass</div>)
  .mock('./ModalCustomerDetails',       () => () => <div>Mock ModalCustomerDetails</div>)
  .mock('./ModalAddMedia',              () => () => <div>Mock ModalAddMedia</div>)
  .mock('./CreateMedia',                () => () => <div>Mock CreateMedia</div>)
  .mock('./GetDetails',                 () => () => <div>Mock GetDetails</div>)
  .mock('./GetListDQLinkIncident',      () => () => <div>Mock GetListDQLinkIncident</div>)
  .mock('./GEtOrgLocaleSettings',       () => () => <div>Mock GEtOrgLocaleSettings</div>)
  .mock('./GetSelf',                    () => () => <div>Mock GetSelf</div>)
  .mock('./GetMedia',                   () => () => <div>Mock GetMedia</div>)
  .mock('./GetName',                    () => () => <div>Mock GetName</div>)
  .mock('./GetLocations',               () => () => <div>Mock GetLocations</div>)
  .mock('./GetSummary',                 () => () => <div>Mock GetSummary</div>)
  .mock('./GetNameCreatedBy',           () => () => <div>Mock GetNameCreatedBy</div>)
  .mock('./Thumbnail',                  () => () => <div>Mock Thumbnail</div>)
  .mock('./ThumbnailSkeleton',          () => () => <div>Mock ThumbnailSkeleton</div>)
  .mock('./ThumbnailMarkRemoval',       () => () => <div>Mock ThumbnailMarkRemoval</div>)
  .mock('./ThumbnailTempPreSave',       () => () => <div>Mock ThumbnailTempPreSave</div>)
  .mock('./UpdateReport',               () => () => <div>Mock UpdateReport</div>)
  .mock('./ModalCustomWitness',         () => () => <div>Mock ModalCustomWitness</div>)
  .mock('../../settings/GetTrespassTemplates', () => () => <div>Mock GetTrespassTemplates</div>)
  .mock('../../settings/GetTrespassReasons', () => () => <div>Mock GetTrespassReasons</div>);

/* ------------------------------------------------------------------ *
 * 4. Simple helper mocks                                              *
 * ------------------------------------------------------------------ */
jest.mock('./helpers/convertUTCISOToPrettyDate', () => jest.fn((d)=>d));
jest.mock('./helpers/convertUTCISOToLocalePrettyTime', () => jest.fn((d)=>d));
jest.mock('./helpers/parseMMDDYYYY',    () => jest.fn((d)=>new Date(d)));
jest.mock('./helpers/isValidDateFormat',() => jest.fn(()=>true));
jest.mock('./helpers/isValidTimeInput', () => jest.fn(()=>true));
jest.mock('./helpers/formatDateToUTCISO',        () => jest.fn((d)=>d));
jest.mock('./helpers/formatDateAndTimeToUTCISO', () => jest.fn((d,t)=>`${d}T${t}`));
jest.mock('./helpers/stripHTML', () => jest.fn((s)=>s));
jest.mock('./helpers/getTodayDate', () => jest.fn(()=> '01/01/2020'));
jest.mock('../../settings/helpers/makeId', () => () => 'mockedId');

/* ------------------------------------------------------------------ *
 * 5. IncidentContext mock (defined inside the factory)                *
 * ------------------------------------------------------------------ */
jest.mock('../../contexts/IncidentContext', () => {
  const context = {
    singleIncident : {
      id: 'edit-id',
      customerNa          : false,
      customers           : [],
      incidentLocation    : 'loc-1',
      subLocation         : '',
      dateTimeOfIncident  : '2020-01-01T12:00:00Z',
      isApproximateTime   : false,
      detailedDescriptionOfIncident: 'desc',
      incidentWitnesses   : [],
      incidentTypes       : [],
      attachments         : [],
      metadata            : {},
      staffSuppressed     : false,
    },
    closeEditPane     : jest.fn(),
    openModalSelectTypes   : jest.fn(),
    openModalUnknownCust   : jest.fn(),
    openModalSelectKnownCust: jest.fn(),
    selectedCustomers      : [],
    setSelectedCustomers   : jest.fn(),
    selectedWitnesses      : [],
    setSelectedWitnesses   : jest.fn(),
    openModalSelectWitness : jest.fn(),
    self                   : { id:'self', firstName:'Self', lastName:'User' },
    openModalTrespass      : jest.fn(),
    isLoadingDetails       : false,
    openLoadingDetails     : jest.fn(),
    isUpdatingReport       : false,
    setIsUpdatingReport    : jest.fn(),
    openModalMedia         : jest.fn(),
    setAttachmentsData     : jest.fn(),
    idForMediaCreate       : null,
    setIdForMediaCreate    : jest.fn(),
    formDataArrayForMediaCreate : null,
    setFormDataArrayForMediaCreate: jest.fn(),
    openModalCustomerDetails: jest.fn(),
    locationsInService     : [],
    incidentTypesList      : [],
    isImageArrayLoading    : false,
    openImageSkeleton      : jest.fn(),
    closeImageSkeleton     : jest.fn(),
    openModalCustomWitness : jest.fn(),
    trespassTemplates      : [],
    triggerDocumentError   : jest.fn(),
  };
  return { useIncidents: () => context };
});

/* ------------------------------------------------------------------ *
 * 6. DOM setup / teardown                                             *
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
 * 7. Tests                                                            *
 * ------------------------------------------------------------------ */
it('renders without crashing (snapshot)', async () => {
  await act(async () => { root.render(<EditPane />); });
  await act(async () => {});
  expect(container.innerHTML).toMatchSnapshot();
});

it('mounts key child components', () => {
  act(() => { root.render(<EditPane />); });
  expect(container.textContent).toContain('Mock GetDetails');
  expect(container.textContent).toContain('Mock GetLocationsInService');
});
