import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  RadioButton,
  Modal,
  ModalFooter,
  MultiColumnList,
  PaneHeader,
  LoadingPane,
} from '@folio/stripes/components';
import css from './ModalLinkIncidentStyle.css';
import GetLocationsInService from '../../settings/GetLocationsInService'; 
import GetListDQLinkIncident from './GetListDQLinkIncident';
import GetLocations from './GetLocations';
import GetIncidentTypesDetails from '../../settings/GetIncidentTypesDetails';
import buildQueryString from './helpers/buildQueryString.js';
import cleanFormValues from './helpers/cleanFormValues.js';
import GetOrgLocaleSettings from './GetOrgLocaleSettings.js';
import usePersistedSortModalLink from './usePersistedSortModalLink.js';
import convertUTCISOToPrettyDate from './helpers/convertUTCISOToPrettyDate';
import ColumnChooser from './ColumnChooser.js';
import usePersistedColModalLink from './usePersistedColModalLink.js'; 
import { useIncidents } from '../../contexts/IncidentContext';


const ModalLinkIncident = ({ 
  handleCloseModalLinkIncident, 
  toggleRowChecked,
  ids, // linkedTo ids (CreatePane passes selectedIds, EditPane passes allLinkedToArray)
  setIds, // setter for ids (CreatePane passes setSelectedIds, EditPane passes setAllLinkedToArray)
  ...props 
}) => {
  const intl = useIntl();
  const {
    incidentTypesNamesIdsList,
    locationsInService, 
    isLoadingSearch, 
    organizationTimezone,
  } = useIncidents();

  const { 
    sortColumn, 
    sortDirection, 
    setSortColumn, 
    setSortDirection
  } = usePersistedSortModalLink();

  const [limit, setLimit] = useState(20); //limit value for query params, load more
  const [offset, setOffset] = useState(0);//offset value for query params, load more
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [incidentsListForLink, setIncidentsListForLink] = useState([]); // data for MCL
  const [totalResultsForLink, setTotalResultsForLink] = useState(0);
  const [readyQuery, setReadyQuery] = useState(null) // local query string
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

  const logSelection = (label, set, total) => {
    const ids = [...set];        
    
    console.log(
      `[${label}] ${ids.length}/${total} selected`,
      ids.length === total ? 'ALL rows' : '',
      ids.sort()             
    );
  };

  // useEffect(() => {
  //   logSelection('effect', ids, incidentsListForLink.length);
  // }, [ids]);

  const buildLocalQuery = ({
    filters,
    limit,
    offset,
    sortColumn,
    sortDirection,
    organizationTimezone,
  }) => {
    const cleaned = cleanFormValues(
      filters,
      organizationTimezone,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    // if there's no sortColumn, pass empty strings so back end ignores sort.
    return buildQueryString(
      { ...cleaned, limit, offset },
      sortColumn || '',
      sortColumn ? sortDirection : '' // 'asc' | 'desc' or ''
    );
  };

  useEffect(() => {
    // Compare the *filter-only* canonical strings to avoid ref churn
    const canonical = buildQueryString(
      cleanFormValues(formSearchParams, organizationTimezone, Intl.DateTimeFormat().resolvedOptions().timeZone),
    );
    const canonicalApplied = appliedFilters
      ? buildQueryString(
          cleanFormValues(appliedFilters, organizationTimezone, Intl.DateTimeFormat().resolvedOptions().timeZone),
        )
      : '';

    if (canonical !== canonicalApplied) {
      // new filters -> reset to page 1
      const nextFilters = formSearchParams;
      const nextOffset = 0;

      setAppliedFilters(nextFilters);
      setOffset(nextOffset);

      const qs = buildLocalQuery({
        filters: nextFilters,
        limit,
        offset: nextOffset,
        sortColumn,
        sortDirection,
        organizationTimezone,
      });

      setReadyQuery(qs);
    }
    // Only re-run when the toggled filter groups change:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formSearchParams.locationValue,
    formSearchParams.incidentTypeId,
    formSearchParams.currentTrespass,
    formSearchParams.expiredTrespass,
    formSearchParams.staffSuppress,
    organizationTimezone,
  ]);

  const handleSubmit = (resetPaging = true, overrideForm = formSearchParams) => {
    const nextFilters = overrideForm;
    const nextOffset = resetPaging ? 0 : offset;

    setAppliedFilters(nextFilters);
    setOffset(nextOffset);

    const qs = buildLocalQuery({
      filters: nextFilters,
      limit,
      offset: nextOffset,
      sortColumn,
      sortDirection, // already 'asc' | 'desc'
      organizationTimezone,
    });

    setReadyQuery(qs);
  };

  const handleSort = (_e, { name }) => {
    const nextCol = name;
    const nextDir = name === sortColumn && sortDirection === 'asc' ? 'desc' : 'asc';

    setSortColumn(nextCol);
    setSortDirection(nextDir);

    const baseFilters = appliedFilters || formSearchParams;
    const nextOffset = 0;
    setOffset(nextOffset);

    const qs = buildLocalQuery({
      filters: baseFilters,
      limit,
      offset: nextOffset,
      sortColumn: nextCol,
      sortDirection: nextDir,
      organizationTimezone,
    });

    setReadyQuery(qs);
  };

  const handleLoadMore = () => {
    const nextOffset = incidentsListForLink.length; // append after current rows
    setOffset(nextOffset);

    const baseFilters = appliedFilters || formSearchParams;

    const qs = buildLocalQuery({
      filters: baseFilters,
      limit,
      offset: nextOffset,
      sortColumn,
      sortDirection,
      organizationTimezone,
    });

    setReadyQuery(qs);
  };


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
      expiredTrespass: false,
      staffSuppress: 'non',
    };

    // UI resets
    setLocationInputValue('');
    setIncidentTypeInputValue('');
    setResetKey((k) => k + 1);
    setSortColumn('');
    setSortDirection('');
    setFormSearchParams(blankFilters);

    // Run a new baseline search (page 1)
    // handleSubmit(true, blankFilters);
  };

  // produce canonical (sorted) string that contains only the filter params
  // const buildFiltersOnlyQS = (source = formSearchParams) => {
  //   const cleaned = cleanFormValues(
  //     source,
  //     organizationTimezone,
  //     Intl.DateTimeFormat().resolvedOptions().timeZone
  //   );
  //   // drop paging, always restart at the first page
  //   const { limit: _1, offset: _0, ...filters } = cleaned; 
  //   return buildQueryString(filters) // "locationValue=..." etc
  // };

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

  const customCameraSvg = (props) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" {...props}>
        <g clipPath="url(#a)">
          <path fill="#fff" d="M0 0h24v24H0z"/><path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M3 8a1 1 0 0 1 1-1h4.5l1-3h5l1 3H20a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8Z"/>
          <circle cx="12" cy="13" r="3" stroke="#000" strokeLinejoin="round"/>
        </g>
          <defs>
            <clipPath id="a">
            <path fill="#fff" d="M0 0h24v24H0z"/></clipPath>
          </defs>
    </svg>
  );

  const inlineIconStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    verticalAlign: 'middle',
    lineHeight: '1.2', 
    gap: '4px',
    marginLeft: '8px'
  };

  const selectAllHeader = (
    <Checkbox 
        aria-label={<FormattedMessage id="column-mapping.select-all-or-deselect-rows-aria-label" />}
        checked={ids.size === incidentsListForLink.length} 
        indeterminate={
          ids.size > 0 && ids.size < incidentsListForLink.length
        }
        onClick={(e) => {
          e.stopPropagation();
          ids.size === incidentsListForLink.length
            ? setIds(new Set())
            : setIds(new Set(incidentsListForLink.map(r => r.id)));
        }}
    />
  );

  const resultsFormatter = {
    id: (item) => {
      return (
        <Checkbox 
          checked={ids.has(item.id)} 
          value={item.id}
          onClick={(e) => { 
            e.stopPropagation();
            toggleRowChecked(item.id)
          }}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') e.stopPropagation();  
          }}
        />
      )
    },
    customers: (item) => {
      const isStaffSuppressed = item.staffSuppressed && item.staffSuppressed === true;
      // if report has attachments of image or video, returns true
      const hasImageOrVideo = item.attachments?.some((att) => {
        return att.contentType.startsWith('image/') || att.contentType.startsWith('video/') || false
      });
      // if report has non trespass related document, returns true
      const hasNonTrespassPDF = item.attachments?.some((att) => att.contentType === 'application/pdf' && !att.id?.toLowerCase()?.includes('trespass')) || false;

      const customerNameList = item.customers?.map((cust, index) => {
        const nameLabel = cust.customerNameLabel; 
        const custDescSnippet = cust.customerDescSnippet;
        const trespassServed =
          cust.trespass && cust.trespass.declarationOfService;
        const endDateOfTrespass = cust.trespass?.endDateOfTrespass ?? null;
        const isTrespassExpired = 
          endDateOfTrespass && new Date(endDateOfTrespass) < Date.now();

        return (
          <li key={index}> 
            {nameLabel ? nameLabel : custDescSnippet}

            {/* render green check for has been served 'in hand' */}
            {trespassServed && !isTrespassExpired ? (
              <span style={{ 
                ...inlineIconStyle,
                color: 'green'
                }}>
                <Icon icon="check-circle"/>
              </span>
            ) : (
              null
            )}
            {/* render X if currently trespassed, else trespass expired  */}
            {cust.trespass && !isTrespassExpired ? (
              <span style={{ 
                  ...inlineIconStyle,
                  color: 'red'
                  }}>
                <Icon 
                  icon="times-circle-solid" /> 
                {endDateOfTrespass ? 
                  convertUTCISOToPrettyDate(endDateOfTrespass) 
                  : <FormattedMessage id="results-pane.customers-formatter-trespass-no-end-date"/>}
              </span>
            ) : cust.trespass && isTrespassExpired ? (
              <span style={{ marginLeft: '10px' }}>
                <FormattedMessage id="results-pane.customers-formatter-trespass-expired"/>
              </span> 
            ) : (
              null
            )}
            {/* render icon if report has attachment(s) of image or video or non-trespass pdf*/}
            {hasImageOrVideo || hasNonTrespassPDF ? (
              <span style={{ ...inlineIconStyle, marginTop: '3px', }}>
                <Icon 
                  size='large'
                  iconClassName='cameraIcon'
                  icon={customCameraSvg} 
                  aria-label='camera icon'
                  />
              </span>
            ) : (
              null
            )}
            {isStaffSuppressed ? (
             <span
              style={{ 
                display: 'inline-block',
                marginBottom: '4px', 
                marginLeft: '3px',
                verticalAlign: 'middle'
              }}>
                <Icon size='small' icon='exclamation-circle' status='warn'>
                </Icon>
             </span>) 
              : ( 
                null 
              )}
          </li>
          );
        });
      return <ul style={{ margin: '0' }}>
        {customerNameList?.length > 0 ? 
          customerNameList 
          : (
              <li>
                <FormattedMessage 
                  id="results-pane.customers-formatter-no-associated-customers"
                  />
                 {hasImageOrVideo || hasNonTrespassPDF ? (
                 <span style={{ ...inlineIconStyle, marginTop: '3px', }}>
                    <Icon 
                      size='large'
                      iconClassName='cameraIcon'
                      icon={customCameraSvg} 
                      aria-label='camera icon'
                      />
                  </span>
                ) : (
                  null
                )}
                {isStaffSuppressed ? (
                <span
                  style={{ 
                    display: 'inline-block',
                    marginBottom: '2px', 
                    marginLeft: '3px',
                    verticalAlign: 'middle'
                    
                  }}>
                    <Icon size='small' icon='exclamation-circle' status='warn'>
                    </Icon>
                </span>) 
                  : ( 
                    null 
                  )}
              </li>
            )
          }
      </ul>;
    },
    incidentLocation: (item) => {
      return item.incidentLocationLabel ? item.incidentLocationLabel : item.incidentLocation
    },
    dateOfIncident: (item) => {
      const readableDate = convertUTCISOToPrettyDate(item.dateTimeOfIncident);
      return readableDate;
    },
    endDateOfTrespass: (item) => {
      const readableDate = item.convertUTCISOToPrettyDate(endDateOfTrespass);
      return readableDate;
    },
    incidentTypes: (item) => {
      const typeList = item.incidentTypesLabels.map((type, index) => (
        <li key={index} style={{ listStyleType: 'none', padding: '5px 0' }}>
          {type}
        </li>
      ));

      return <ul style={{ padding: '0', margin: '0' }}>{typeList}</ul>;
    },
    incidentWitnesses: (item) => {
      const staffInvolvedNamesAssociatedKeys = item.incidentWitnesses?.map((wit) => {
        const witnessNameLabel = wit.witnessNameLabel;
        return (
          <li key={wit.id} style={{ listStyleType: 'none', padding: '5px 0' }}>
            {`${witnessNameLabel}`}
          </li>
        );
      });

      return <ul style={{ padding: '0', margin: '0' }}>
        {staffInvolvedNamesAssociatedKeys}
      </ul>
    },
    createdBy: (item) => {
      return item.createdByLabel ? item.createdByLabel 
        : `${item.createdBy?.lastName}, ${item.createdBy?.firstName}`
    },
    trespassExpirationDates: (item) => {
      const { customers = [] } = item; 
      
      if (customers.length === 0) {
        return <FormattedMessage id="no-customers" />
      }

      const endDates = customers
        .map(cust => cust.trespass?.endDateOfTrespass)
        .filter(Boolean);

      if (endDates.length === 0) {
        return <FormattedMessage id="no-trespass" />;
      }

      return (
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {endDates.map((date, idx) => (
            <li key={idx}>{convertUTCISOToPrettyDate(date)}</li>
          ))}
        </ul>
      );
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

  const columnWidths = {
    customers: '375px',
    incidentLocation: '175px',
    dateOfIncident: '110px',
    incidentTypes: '175px'
  };

  const resultCount = intl.formatMessage(
    { id: `results-pane.paneSubTitle` },
    { count: totalResultsForLink }
  );

  const fixedColumns = ['id', 'customers'];
  const toggleableColumns = useMemo(() => [
    'incidentLocation',
    'dateOfIncident',
    'incidentTypes',
    'incidentWitnesses',
    'createdBy',
    'trespassExpirationDates'
  ], []);
  const allColumns = [...fixedColumns, ...toggleableColumns];
  const sortableFields = [...allColumns];
  const columnLabels = {
    customers:          <FormattedMessage id="column-mapping.name" />,
    incidentLocation:   <FormattedMessage id="column-mapping.incidentLocation" />,
    dateOfIncident:     <FormattedMessage id="column-mapping.dateOfIncident" />,
    incidentTypes:      <FormattedMessage id="column-mapping.incidentTypes" />,
    incidentWitnesses:  <FormattedMessage id="column-mapping.witnessedBy" />,
    createdBy:          <FormattedMessage id="column-mapping.createdBy" />,
    trespassExpirationDates: <FormattedMessage id="column-mapping.trespassExpirationDates" />
  };

  const [visibleToggleable, toggleColumn] = usePersistedColModalLink(toggleableColumns);

  const visibleColumns = [...fixedColumns, ...visibleToggleable];

  const actionMenu = useCallback(({ onToggle }) => (
    <div 
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      style={{ padding: '0.5rem 0.75rem', maxWidth: 320 }}
    >
      <ColumnChooser 
        possibleColumns={toggleableColumns} 
        visibleColumns={visibleToggleable}
        toggleColumn={toggleColumn}
        columnLabels={columnLabels}
      />
    </div>
  ));

  const renderHeader = (renderProps) => (
    <PaneHeader
      {...renderProps}
      paneTitle={<FormattedMessage id="results-pane.paneTitle" />} 
      paneSub={resultCount}
      actionMenu={actionMenu}
    />
  );

  const footer = (
    <ModalFooter>
      <Button
        id="close-continue-button"
        onClick={handleCloseModalLinkIncident}
        buttonStyle="primary"
        marginBottom0
      >
        <FormattedMessage id="close-continue-button" />
      </Button>
    </ModalFooter>
  );

  return (
   <Modal
    enforceFocus={false}
    style={{ 
      minHeight: '550px',
      height: '80%', // allows modal to grow/shrink based on content
      maxHeight: '600vh', 
      maxWidth: '600vw', // modal width responsive to viewport width
      width: '70%' // modal width adjusts based on content and window size
    }}
    open
    dismissible
    closeOnBackgroundClick
    label={<FormattedMessage id="search-pane.paneTitle" />}
    size="large"
    onClose={handleCloseModalLinkIncident}
    footer={footer}
    contentClass={css.modalContent}
   >
   <div className={css.modalBody}>
    <Paneset style={{ height: '100%', flexGrow: 1 }}>
      <Pane
        paneTitle={<FormattedMessage id="search-pane.paneTitle" />}
        defaultWidth="25%"
        {...props}
      >
     <div className={css.leftPaneScroll}>

        {readyQuery && 
          <GetListDQLinkIncident 
            queryStringLinkIncident={readyQuery} 
            offset={offset}
            setIncidentsListForLink={setIncidentsListForLink}
            setTotalResultsForLink={setTotalResultsForLink}
            />}

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
     </div>
      </Pane>

      { isLoadingSearch ? (
        <LoadingPane defaultWidth="fill" paneTitle="Loading results..." />
        ) : <Pane
            paneTitle={<FormattedMessage id="results-pane.paneTitle"/>}
            id="results-pane"
            defaultWidth="75%"
            {...props}
            renderHeader={renderHeader}
          >

          <div className={css.mclContainer}>
            <MultiColumnList
              autosize
              virtualize
              showSortIndicator 
              sortableFields={sortableFields}
              onHeaderClick={handleSort}
              sortedColumn={sortColumn} 
              sortDirection={sortDirection === 'desc' ? 'descending' : 'ascending'} 
              contentData={incidentsListForLink} 
              pageAmount={limit} 
              totalCount={totalResultsForLink}
              pagingType='click'
              pagingOffset={incidentsListForLink.length}
              pagingCanGoNext={incidentsListForLink.length < totalResultsForLink}
              pagingCanGoPrevious={false} 
              onNeedMoreData={() => handleLoadMore()}
              formatter={resultsFormatter}
              visibleColumns={visibleColumns}
              columnMapping={{
                id: selectAllHeader,
                customers: <FormattedMessage id="column-mapping.name" />,
                incidentLocation: 
                <FormattedMessage id="column-mapping.incidentLocation" />
                ,
                dateOfIncident: 
                <FormattedMessage id="column-mapping.dateOfIncident" />
                ,
                incidentTypes: 
                <FormattedMessage id="column-mapping.incidentTypes" />
                ,
                incidentWitnesses: 
                <FormattedMessage id="column-mapping.witnessedBy" />,
                createdBy: 
                <FormattedMessage id="column-mapping.createdBy" />,
                trespassExpirationDates: 
                <FormattedMessage id="column-mapping.trespassExpirationDates" />,
              }}
              columnWidths={columnWidths}
            />
          </div>
        </Pane>}
    </Paneset>
   </div>
   </Modal>
  );
};

export default ModalLinkIncident;