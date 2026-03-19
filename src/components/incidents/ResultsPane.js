import React, { useEffect, useState, useMemo } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useHistory, useLocation } from 'react-router-dom';
import { useStripes } from '@folio/stripes/core';
import {
  Icon,
  Pane,
  MultiColumnList,
  Button,
  PaneHeader,
  LoadingPane,
} from '@folio/stripes/components';
import { useIncidents } from '../../contexts/IncidentContext';
import GetIncidentTypesDetails from '../../settings/GetIncidentTypesDetails';
import convertUTCISOToPrettyDate from './helpers/convertUTCISOToPrettyDate';
import ColumnChooser from './ColumnChooser.js';
import usePersistedColumns from './usePersistedColumns.js';
import usePersistedSort from './usePersistedSort.js';
import buildQueryString from './helpers/buildQueryString.js';

const ResultsPane = ({ 
  handlePagination, 
  ...props 
} ) => {
  const stripes = useStripes();
  const history = useHistory();
  const location = useLocation();
  const intl = useIntl();

  const { 
    openDetailsPane, 
    openCreatePane, 
    isLoadingSearch, 
    incidentsList, 
    limit, 
    offset, 
    totalResults,
    appliedSearchParams
  } = useIncidents();

  const { 
    sortColumn, 
    sortDirection, 
    setSortColumn, 
    setSortDirection
  } = usePersistedSort();

  const [sortedData, setSortedData] = useState([]); // final data prop for MCL


  const handleCreateReport = () => {
    openCreatePane();
    history.push(`/incidents/create`);
  };

  const handleViewDetails = (event, row) => {
    const id = row.id;
    openDetailsPane(id);
    sessionStorage.setItem('lastTrackListRoute', location.pathname + location.search);
    history.push(`/incidents/${id}${location.search}`);
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
  }

  const resultsFormatter = {
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

  const columnWidths = {
    customers: '375px',
    incidentLocation: '175px',
    dateOfIncident: '110px',
    incidentTypes: '175px'
  };

  const resultCount = intl.formatMessage(
    { id: `results-pane.paneSubTitle` },
    { count: totalResults }
  );

    const columnsList = [
    'customers',
    'incidentLocation',
    'dateOfIncident',
    'incidentTypes',
    'incidentWitnesses',
    'createdBy',
    'trespassExpirationDates'
  ];







  const fixedColumns = ['customers'];

  const toggleableColumns = useMemo(() => [
    'incidentLocation',
    'dateOfIncident',
    'incidentTypes',
    'incidentWitnesses',
    'createdBy',
    'trespassExpirationDates'
  ], []);

  const allColumns = [...fixedColumns, ...toggleableColumns];

  // const possibleColumns = useMemo(() => [...columnsList]);
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

  const [visibleToggleable, toggleColumn] = usePersistedColumns(toggleableColumns);

  const visibleColumns = [...fixedColumns, ...visibleToggleable];

  const actionMenu = ({ onToggle }) => (
    <>
      {stripes.hasPerm('ui-security-incident.edit') ? 
      <Button
        style={{ marginTop: '10px' }}
        buttonStyle="primary"
        onClick={handleCreateReport}
      >
        <FormattedMessage id="results-pane.create-report-button" />
      </Button> 
      : null
      } 
      <ColumnChooser 
        possibleColumns={toggleableColumns} 
        visibleColumns={visibleToggleable}
        toggleColumn={toggleColumn}
        columnLabels={columnLabels}
      />
    </>
  );

  const renderHeader = (renderProps) => (
    <PaneHeader
      {...renderProps}
      paneTitle={<FormattedMessage id="results-pane.paneTitle" />} 
      paneSub={resultCount}
      actionMenu={actionMenu}
    />
  );

  const handleSort = (_e, { name }) => {
    const nextCol = name;
    const nextDir =
      name === sortColumn && sortDirection === 'asc' ? 'desc' : 'asc';

    setSortColumn(nextCol);
    setSortDirection(nextDir);

    const qs = buildQueryString(
      { ...appliedSearchParams, limit, offset: 0 }, // always restart at offset 0
      nextCol,
      nextDir
    );
    history.push(`/incidents?${qs}`)
  };

  useEffect(() => {
    setSortedData(incidentsList);
  }, [incidentsList]); 

  return (
    isLoadingSearch ? (
    <LoadingPane defaultWidth="fill" paneTitle="Loading results..." />
    ) : <Pane
        paneTitle={<FormattedMessage id="results-pane.paneTitle"/>}
        id="results-pane"
        defaultWidth="75%"
        {...props}
        renderHeader={renderHeader}
      >
      <GetIncidentTypesDetails context='incidents'/>

      <div style={{ height: '80vh', width: 'auto' }}>
        <MultiColumnList
          autosize
          virtualize
          showSortIndicator 
          sortableFields={sortableFields}
          onHeaderClick={handleSort}
          sortedColumn={sortColumn} 
          sortDirection={sortDirection === 'desc' ? 'descending' : 'ascending'} 
          contentData={sortedData}
          pageAmount={limit} 
          totalCount={totalResults}
          pagingOffset={offset}
          pagingType='prev-next'
          pagingCanGoNext={offset + limit < totalResults}
          pagingCanGoPrevious={offset > 0}
          onNeedMoreData={(askAmount, index) => handlePagination(askAmount, index)} 
          formatter={resultsFormatter}
          visibleColumns={visibleColumns}
          columnMapping={{
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
          onRowClick={handleViewDetails}
        />
      </div>
    </Pane>
  );
};

export default ResultsPane;