import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';
import {
  Accordion,
  AutoSuggest,
  Checkbox,
  Paneset,
  Pane,
  SearchField,
  Button,
  Headline,
  Datepicker,
  Row,
  Col,
  Icon,
  TextField,
  RadioButton
} from '@folio/stripes/components';
import GetLocationsInService from '../../settings/GetLocationsInService'; 
import GetListDynamicQuery from './GetListDynamicQuery';
import GetLocations from './GetLocations';
import GetIncidentTypesDetails from '../../settings/GetIncidentTypesDetails';
import buildQueryString from './helpers/buildQueryString.js';
import cleanFormValues from './helpers/cleanFormValues.js';
import decodeParamsToForm from './helpers/decodeParamsToForm.js';
import ResultsPane from './ResultsPane';
import DetailsPane from './DetailsPane';
import EditPane from './EditPane';
import CreatePane from './CreatePane';
import GetOrgLocaleSettings from './GetOrgLocaleSettings.js';
import usePersistedSort from './usePersistedSort.js';
import { useIncidents } from '../../contexts/IncidentContext';

const IncidentsPaneset = ({ ...props }) => {
  const intl = useIntl();
  const {
    isDetailsPaneOpen,
    isEditPaneOpen,
    isCreatePaneOpen,
    incidentTypesNamesIdsList,
    locationsInService,
    setQueryString,
    queryString,
    limit, setLimit,
    offset, setOffset,
    organizationTimezone,
    appliedSearchParams, setAppliedSearchParams
  } = useIncidents();

  const { 
    sortColumn, 
    sortDirection, 
    setSortColumn, 
    setSortDirection
  } = usePersistedSort();

  const [locationInputValue, setLocationInputValue] = useState('');
  const [locationsVisibleCount, setLocationsVisibleCount] = useState(5);
  const [locationsHasExpanded, setLocationsHasExpanded] = useState(false);
  const [incidentTypeInputValue, setIncidentTypeInputValue] = useState('');
  const [incidentTypesVisibleCount, setIncidentTypesVisibleCount] = useState(5);
  const [incTypesHasExpanded, setIncTypesHasExpanded] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [disableCreatedByTextField, setDisableCreatedByTextField] = useState(false);
  const [disableWitnessedByTextField, setDisableWitnessedByTextField] = useState(false);
  const [formSearchParams, setFormSearchParams] = useState({
    searchType: 'keyword', // type of search (e.g. 'keyword', 'name-or-barcode')
    term: '', // user input of search term
    locationValue: [], // location filter set via Checkbox
    incidentTypeId: [], // incident type filter set via Checkbox
    witnessedBy: '', // search by who witnessed/staff involved in incident
    createdBy: '',  // search by who created the incident
    startDate: '',  // filter by incident start date
    endDate: '', // filter by incident end date
    currentTrespass: false, // filter by has current trespass
    expiredTrespass: false, // filter by has expired trespass
    timezone: '', // gets set if query with date range (no UI)
    // includeSuppressed: false, // default show non-suppressed
    // notIncludeSuppressed: true 
    staffSuppress: 'non' // legal values 'non'(default), 'suppressed', 'all'
  });

  const history = useHistory();
  const location = useLocation();
  const firstRunRef = useRef(true); // ignore the very first render after mount
  /* 
    skipNextSubmitRef: mutable flag
      one shot flag that suppresses the filters watcher. 

      When we programmatically copy values from the URL into local state (location.search --> 
      setFormSearchParams, setSortColumn, ...) we do not want the filters watcher useEffect to treat that as a 'user change' and push a second, identical URL or fire a duplicate search. 

      sequence:
        1. URL sync effect sets skipNextSubmitRef.current = true
        2. It then calls the various state setters
        3. filters watcher runs, sees the flag, exists immediately, and
          resets skipNextSubmitREf.current = false
        4. Future real user edits run the watcher normally 
  */ 
  const skipNextSubmitRef = useRef(false); 

  // URL-sync effect
  useEffect(() => {
    if (!location.pathname.startsWith('/incidents')) {
      return;
    }
    // initial on render list route, inject defaults once
    if (location.pathname === '/incidents' && location.search === '') {
      history.replace(`/incidents?limit=20&offset=0`);
      return;
    };
    // any route with no search params (Details/Edit) - keep current
    if(location.pathname !== '/incidents') {
      return; // do not touch limit/offset/queryString
    }
    const params = new URLSearchParams(location.search);
    const limit = +(params.get('limit') || 20);
    const offset = +(params.get('offset') || 0);
    const sort = params.get('sort') ?? '';
    const dir = params.get('dir') ?? 'asc';
    const filterObj = Object.fromEntries(params); 

    skipNextSubmitRef.current = true; // tell watcher ignore 1st pass

    setSortColumn(sort);
    setSortDirection(dir);
    setLimit(limit);
    setOffset(offset);
    setAppliedSearchParams(filterObj);
    setQueryString(params.toString());
    setFormSearchParams(decodeParamsToForm(filterObj)); 
    if (firstRunRef.current) firstRunRef.current = false; 
  }, [location.search, history]);

  const handlePagination = (_askAmount, newOffset) => {
    if (newOffset < 0 || newOffset === offset) return; 

    const qs = buildQueryString({
        ...appliedSearchParams,
        limit,
        offset: newOffset,
      },
      sortColumn,
      sortDirection
    );

    history.push(`/incidents?${qs}`);
  };

  const handleSubmit = (
    resetPaging = true, 
    overrideForm = formSearchParams // default = current state
  ) => {
    const cleaned = cleanFormValues(
      overrideForm,
      // formSearchParams, 
      organizationTimezone, 
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    // new searches reset paging
    const qs = buildQueryString({ 
        ...cleaned, 
        limit, 
        offset: resetPaging ? 0 : offset
      },
      sortColumn,
      sortColumn !== '' ? (sortDirection === 'descending' ? 'desc' : 'asc') : ''
      // sortDirection === 'descending' ? 'desc' : 'asc'
    );

    // console.log("qs --> ", JSON.stringify(qs, null, 2))
    // URL changes trigger the [search] useEffect
    history.push(`/incidents?${qs}`) 
  };

  // produce canonical (sorted) string that contains only the filter params
  const buildFiltersOnlyQS = (source = formSearchParams) => {
    const cleaned = cleanFormValues(
      source,
      organizationTimezone,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    // drop paging, always restart at the first page
    const { limit: _1, offset: _0, ...filters } = cleaned; 
    return buildQueryString(filters) // "locationValue=..." etc
  };

  // handle run new search when filters are used
  useEffect(() => {
    if (firstRunRef.current) return; 
    if (skipNextSubmitRef.current) {
      skipNextSubmitRef.current = false;
      return; 
    }

    const liveQS = buildFiltersOnlyQS(); // UI
    const appliedQS = buildFiltersOnlyQS(
      decodeParamsToForm(appliedSearchParams || {}) // URL
    );

    // compare the new string to the one derived from
    // appliedSearchParams to know toggle
    // intentionally ignore limit, offset so paging doesn't retrigger
    // this effect 
    if (liveQS !== appliedQS) {
      handleSubmit(true); // run search reset paging
    };
  }, [
    formSearchParams.locationValue, 
    formSearchParams.incidentTypeId, 
    formSearchParams.currentTrespass, 
    formSearchParams.expiredTrespass,
    formSearchParams.staffSuppress
  ]);
             
  // reset to on-app render baseline results (top n, most recent)
  const handleResetAll = () => {
    const blankFilters = {
      searchType: formSearchParams.searchType,
      term: '',
      locationValue: [], 
      incidentTypeId: [], 
      witnessedBy: '',
      createdBy: '',  
      startDate: '',  
      endDate: '',
      timezone: '',
      currentTrespass: false, 
      expiredTrespass: false
    };
    //  build cleaned query str w/ no sort/dir
    const cleaned = cleanFormValues(
      blankFilters,
      organizationTimezone,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    const qs = buildQueryString(
      { ...cleaned, limit, offset: 0 }, // reset paging
      '', // no sort
      '' // no dir
    )
    history.push(`/incidents?${qs}`);

    setFormSearchParams(blankFilters);
    setAppliedSearchParams(''); // clear cached URL filters
    setLocationInputValue('');
    setIncidentTypeInputValue('');
    // handles reset <Select/> 'searchableIndexes' default value to 'keyword'
    setResetKey((prevKey) => prevKey + 1); 
    setSortColumn('');
    setSortDirection(''); 
  };

  const handleClearSearchField = () => {
    setFormSearchParams((prev) => {
      return {
        ...prev,
        term: '',
      };
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSubmit(true);
    }
  };

  const incidentTypesItems = useMemo(() => {
    const formattedIncTypes = incidentTypesNamesIdsList
      ? incidentTypesNamesIdsList.map((incident) => ({
          value: incident.id,
          label: incident.title,
        }))
      : [{ 
        value: '', 
        label: <FormattedMessage 
          id="search-pane.incTypesItems-label-no-loaded" 
      />}];
    return formattedIncTypes;
  }, [incidentTypesNamesIdsList]);

  const locationItems = useMemo(() => {
    const formattedLocations = locationsInService 
      ? locationsInService.map((loc) => ({
          value: loc.id,
          label: loc.location,
        }))
      : [{ 
        value: '', 
        label: <FormattedMessage 
          id="search-pane.locationItems-label-no-loaded"
      />}]; 
    return formattedLocations;
  }, [locationsInService]); 

  const handleParamsValueChange = (event) => {
    const { name, value } = event.target;
    setFormSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIndexChange = (event) => {
    if (event.target.value === 'created-by') {
      setDisableCreatedByTextField(true);
    } else {
      setDisableCreatedByTextField(false);
    };
    if (event.target.value === 'witnessed-by') {
      setDisableWitnessedByTextField(true);
    } else {
      setDisableWitnessedByTextField(false);
    };
    setFormSearchParams((prev) => ({
      ...prev,
      searchType: event.target.value,
    }));
  };

  const handleCreatedByChange = (event) => {
    const { value } = event.target;
    setFormSearchParams((prev) => {
      const newState = { ...prev };
      if (value) {
        newState.createdBy = value;
      } else {
        delete newState.createdBy;
      }
      return newState;
    });
  };

  const handleWitnessedByChange = (event) => {
    const { value } = event.target;
    setFormSearchParams((prev) => {
      const newState = { ...prev };
      if (value) {
        newState.witnessedBy = value;
      } else {
        delete newState.witnessedBy;
      }
      return newState;
    });
  };

  const handleLocationFilterChange = (value) => {
    setFormSearchParams((prevParams) => {
      const currentLocations = prevParams.locationValue;
      const isChecked = currentLocations.includes(value);

      // add/remove value
      const updatedLocations = isChecked 
      ? currentLocations.filter((loc) => loc !== value) 
      : [...currentLocations, value];

      return {
        ...prevParams,
        locationValue: updatedLocations
      };
    });
  };

  const handleIncidentTypeFilterChange = (value) => {
    setFormSearchParams((prevParams) => {
      const currentIncTypeIds = prevParams.incidentTypeId;
      const isChecked = currentIncTypeIds.includes(value);

      // add/remove value
      const updatedIncTypeIds = isChecked 
      ? currentIncTypeIds.filter((loc) => loc !== value) 
      : [...currentIncTypeIds, value];

      return {
        ...prevParams,
        incidentTypeId: updatedIncTypeIds
      };
    });
  };

  const handleTrespassFilterChange = (value) => {
    setFormSearchParams((prev) => {
      const params = { ...prev };
      if (value === 'none') {
        delete params.currentTrespass;
        delete params.expiredTrespass;
      };
      if (value === 'currentTrespass') {
        params.currentTrespass = true;
        delete params.expiredTrespass;
      };
      if (value === 'expiredTrespass') {
        params.expiredTrespass = true;
        delete params.currentTrespass;
      };
      return params;
    });
  };

  const handleSuppressedFilterChange = (event) => {
    const { value } = event.target;
    // console.log("value --> ", value);
    setFormSearchParams((prev) => ({
      ...prev,
      staffSuppress: value
    }));
  };

  // START locations help
  const allFilteredLocations = locationItems.filter(item => item.label.toLowerCase().includes(locationInputValue.toLowerCase())); 
  const filteredLocations = allFilteredLocations.slice(0, locationsVisibleCount);
  const handleMoreLocationsClick = () => {
    setLocationsVisibleCount((prevCount) => {
      return Math.min(prevCount + 5, allFilteredLocations.length)
    });
  };

  const loadMoreLocations = () => {
    handleMoreLocationsClick();
    if (!locationsHasExpanded) {
      setLocationsHasExpanded(true);
    };
  };

  const locationsContainerStyle = {
    maxHeight: locationsHasExpanded ? '175px' : '125px',
    overflowX: 'clip',
    overflowY: 'auto',
    marginTop: '8px'
  };
  // END locations help

  // START incident types help
  const allFilteredIncidentTypes = incidentTypesItems.filter(item => item.label.toLowerCase().includes(incidentTypeInputValue.toLowerCase()));
  const filteredIncidentTypes = allFilteredIncidentTypes.slice(0, incidentTypesVisibleCount);
  const handleMoreIncidentTypesClick = () => {
    setIncidentTypesVisibleCount((prevCount) => {
      return Math.min(prevCount + 5, allFilteredIncidentTypes.length)
    });
  };

  const loadMoreIncTypes = () => {
    handleMoreIncidentTypesClick();
    if (!incTypesHasExpanded) {
      setIncTypesHasExpanded(true);
    };
  };

  const incTypesContainerStyle = {
    maxHeight: incTypesHasExpanded ? '175px' : '125px',
    overflowX: 'clip',
    overflowY: 'auto',
    marginTop: '8px'
  };
  // END incident types help

  const searchableIndexes = [
    { 
      label: intl.formatMessage({ 
        id: "search-pane.searchableIndex-label-keyword" 
      }), 
      value: 'keyword' 
    },
    { 
      label: intl.formatMessage({ 
        id: "search-pane.searchableIndex-label-name-or-barcode" 
      }), 
      value: 'name-or-barcode' 
    },
    { 
      label: intl.formatMessage({ 
        id: "search-pane.searchableIndex-label-customer-desc" 
      }), 
      value: 'customer-desc' 
    },
    { 
      label: intl.formatMessage({ 
        id: "search-pane.searchableIndex-label-witnessed-by" 
      }), 
      value: 'witnessed-by' 
    },
    { 
      label: intl.formatMessage({ 
        id: "search-pane.searchableIndex-label-created-by" 
      }), 
      value: 'created-by' 
    }
  ];

  return (
    <Paneset>
      <Pane
        paneTitle={<FormattedMessage id="search-pane.paneTitle" />}
        defaultWidth="25%"
        {...props}
      >
        {queryString && <GetListDynamicQuery query={queryString} />}

        <GetIncidentTypesDetails 
            context='incidents'
          />
        <GetLocationsInService />
        <GetLocations />
        <GetOrgLocaleSettings />

        <Row style={{ marginTop: '35px' }}>
          <Col xs={10}>
            <Headline
              size="large"
              margin="medium"
              tag="h2"
              id="searchField-label"
            >
              <FormattedMessage id="search-pane.searchField-h2-label" />
            </Headline>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <SearchField
              aria-labelledby="searchField-label"
              key={resetKey}
              onChange={handleParamsValueChange}
              name="term"
              value={formSearchParams.term}
              searchableIndexes={searchableIndexes}
              onChangeIndex={handleIndexChange}
              onClear={handleClearSearchField}
              onKeyDown={handleKeyDown}
            />

            <Row style={{ marginTop: '45px' }}>
              <Col xs={10}>
                <Headline size="large" margin="medium" tag="h2">
                  <FormattedMessage id="search-pane.filters-h2-label" />
                </Headline>
              </Col>
            </Row>

           <Accordion label={
             <FormattedMessage id="search-pane.accordion-label-location" />
           }>
             <Row>
              <Col xs={10}>
                <AutoSuggest
                  value={locationInputValue}
                  items={[]} 
                  onChange={setLocationInputValue}
                  menuStyle={{ display: 'none' }}
                  renderValue={(val) => val || ''} //render item in input field
                />
              </Col>
            </Row>
             <Row>
              <Col xs={12} style={{ marginLeft: '10px' }}>
              <div style={locationsContainerStyle}>
                {filteredLocations.map((item) => (
                  <Checkbox 
                    key={item.value}
                    label={item.label} 
                    value={item.value}
                    checked={formSearchParams.locationValue.includes(item.value)}
                    onChange={() => handleLocationFilterChange(item.value)}
                  />
                ))}
              </div>
             <div style={{ marginTop: '2px' }}>
               {locationsVisibleCount < allFilteredLocations.length && (
                <Button 
                  onClick={loadMoreLocations}
                >
                  <FormattedMessage id="more-button" />
                </Button>
               )}
              </div>
              </Col>
            </Row>
           </Accordion>

          <Accordion label={
             <FormattedMessage id="search-pane.accordion-label-incident-types" />
           }>
            <Row>
              <Col xs={10}>
                <AutoSuggest
                  value={incidentTypeInputValue}
                  items={[]} 
                  onChange={setIncidentTypeInputValue}
                  menuStyle={{ display: 'none' }}
                  renderValue={(val) => val || ''} //render item in input field
                />
              </Col>
            </Row>
            <Row>
              <Col xs={12} style={{ marginLeft: '10px' }}>
              <div style={incTypesContainerStyle}>
                {filteredIncidentTypes.map((item) => (
                  <Checkbox 
                    value={item.value} 
                    key={item.value}
                    label={item.label} 
                    checked={formSearchParams.incidentTypeId.includes(item.value)}
                    onChange={() => handleIncidentTypeFilterChange(item.value)}
                  />
                ))}
              </div>
              <div style={{ marginTop: '2px' }}>
                {incidentTypesVisibleCount < allFilteredIncidentTypes.length && (
                  <Button 
                    onClick={loadMoreIncTypes}
                  >
                    <FormattedMessage id="more-button" />
                  </Button>
                )}
              </div>
              </Col>
            </Row>
          </Accordion>
          <hr/>

            <Row style={{ marginTop: '25px'}}>
              <Col xs={8}>
                <TextField
                  disabled={disableWitnessedByTextField}
                  value={formSearchParams.witnessedBy || ''}
                  label={
                    <FormattedMessage id= "search-pane.witnessed-by-text-field-label"/>
                  }
                  onChange={handleWitnessedByChange}
                />
              </Col>
            </Row>

            <Row>
              <Col xs={8}>
                <TextField
                  disabled={disableCreatedByTextField}
                  value={formSearchParams.createdBy || ''}
                  label={
                    <FormattedMessage id="search-pane.created-by-text-field-label" />
                  }
                  onChange={handleCreatedByChange}
                />
              </Col>
            </Row>
          </Col>
        </Row>

        <Row>
          <Col xs={10} style={{ marginTop: '12px' }}>
            <Datepicker
              label={
                <FormattedMessage id="search-pane.date-picker-from-label" />
              }
              name="startDate"
              value={formSearchParams.startDate || ''}
              onChange={handleParamsValueChange}
            />
            <Datepicker
              label={<FormattedMessage id="search-pane.date-picker-to-label" />}
              name="endDate"
              value={formSearchParams.endDate || ''}
              onChange={handleParamsValueChange}
            />
          </Col>
        </Row>

        <Row>
           <Col xs={12}>
            <Headline size="large" tag="h2" style={{ marginTop: '15px'}}>
              <FormattedMessage id="search-pane.trespass-status-label" />
            </Headline>
          </Col>
        </Row>

        <Row style={{ marginTop: '-15px'}}>
          <Col xs={12}>
          <RadioButton
            label={<FormattedMessage 
              id="search-pane.radio-button-all-statuses-label" 
            />}
            checked={!formSearchParams.currentTrespass && !formSearchParams.expiredTrespass}
            onChange={() => handleTrespassFilterChange('none')} 
          />
          </Col>
        </Row>
        
        <Row>
           <Col xs={12}>
          <RadioButton
            label={<FormattedMessage 
              id="search-pane.radio-button-current-trespass-label" 
            />}
            checked={formSearchParams.currentTrespass === true}
            onChange={() => handleTrespassFilterChange('currentTrespass')} 
          />
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
          <RadioButton
            label={<FormattedMessage 
              id="search-pane.radio-button-expired-trespass-label" 
            />}
            checked={formSearchParams.expiredTrespass === true}
            onChange={() => handleTrespassFilterChange('expiredTrespass')} 
          />
          </Col>
        </Row>

        <Row style={{ marginTop: '20px' }}>
        <Col xs={12}>
          <Accordion 
            closedByDefault 
            label={<FormattedMessage 
              id="search-pane.accordion-label-staff-suppressed"
            />}>
            <Row>
                <Col xs={12}>
                  <RadioButton
                    name='staffSuppress'
                    value='non'
                    checked={formSearchParams.staffSuppress === 'non'}
                    label={<FormattedMessage 
                      id="search-pane.radio-button-suppressed-non-label"
                    />}
                    onChange={handleSuppressedFilterChange} 
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <RadioButton
                    name='staffSuppress'
                    value='suppressed'
                    checked={formSearchParams.staffSuppress === 'suppressed'}
                    label={<FormattedMessage 
                      id="search-pane.radio-button-suppressed-suppressed-label"
                    />}
                    onChange={handleSuppressedFilterChange} 
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <RadioButton
                    name='staffSuppress'
                    value='all'
                    checked={formSearchParams.staffSuppress === 'all'}
                    label={<FormattedMessage 
                      id="search-pane.radio-button-suppressed-all-label"
                    />}
                    onChange={handleSuppressedFilterChange} 
                  />
                </Col>
              </Row>
          </Accordion>
        </Col>
      </Row>

        <Row>
          <Col xs={12}>
            <Button
              fullWidth
              style={{ marginTop: '23px' }}
              buttonStyle="primary"
              onClick={() => handleSubmit(true)}
            >
              <FormattedMessage id="search-button" />
            </Button>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <Button
              fullWidth
              style={{ backgroundColor: 'rgb(222, 221, 217)' }}
              buttonStyle="disabled"
              onClick={handleResetAll}
            >
              <Icon icon="times-circle-solid">
                <FormattedMessage id="search-pane.reset-all-button" />
              </Icon>
            </Button>
          </Col>
        </Row>
      </Pane>

      <ResultsPane 
        {...props}
        handlePagination={handlePagination}
        />
      {isDetailsPaneOpen && <DetailsPane 
          appliedSearchParams={appliedSearchParams}
          {...props} 
        />}
      {isEditPaneOpen && <EditPane {...props} />}
      {isCreatePaneOpen && <CreatePane {...props} />}
    </Paneset>
  );
};

export default IncidentsPaneset;