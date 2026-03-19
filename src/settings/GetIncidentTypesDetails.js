import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { IncidentContext } from '../contexts/IncidentContext';

class GetIncidentTypesDetails extends React.Component {
  static contextType = IncidentContext;
  static manifest = Object.freeze({
    incidentTypes: {
      type: 'okapi',
      path: 'incidents/configurations/incident-types',
      records: 'data.value.incidentTypes',
      throwErrors: false // prevent error modal if empty on first pass
    },
  });

  static propTypes = {
    resources: PropTypes.object.isRequired,
    context: PropTypes.oneOf(['incidents', 'settings']).isRequired,
    handleIncidentTypes: PropTypes.func, //only passed in 'settings' context
  };

  componentDidMount() {
    // console.log("@GetIncidentTypesDetails - componentDidMount")
    this.fetchRecords();
  };

  componentDidUpdate(prevProps) {
    const resourceChanged = 
    this.props.resources.incidentTypes !==
    prevProps.resources.incidentTypes;

    if (resourceChanged) {
      // console.log("@GetIncidentTypesDetails - componentDidUPDATE")
      this.fetchRecords();
    };
  };

  fetchRecords() {
    const incidentTypesBody = this.props.resources.incidentTypes;
    if (!incidentTypesBody?.hasLoaded) return; 

    const types = incidentTypesBody?.records;

    if (!Array.isArray(types) || !types.length) return;

    // make shape for id, title shape list
    const incTypes = [...types]; 
    const titlesAndIds = incTypes.map((type) => ({
      id: type.id,
      title: type.title,
    }));

    if (titlesAndIds) {
      // set inc types names, ids list for ready use at 
      // <IncidentsPaneset /> (app), < IncidentTypesPaneset/> (Settings)
      this.context.setIncidentTypesNamesIdsList(titlesAndIds);
    }


    if (this.props.context === 'incidents') {
      // set incident types for general application
      this.context.setIncidentTypesList(types);

    } else if (this.props.context === 'settings') {
      /* 
        set full-shape incidentTypes for Settings
        <IncidentTypeDetailsPane />, <IncidentTypeEditPane />,
        and <NewIncidentTypePane />. They pass handleIncidentTypes()
        via props.
      */ 
      if (typeof this.props.handleIncidentTypes === 'function') {
        this.props.handleIncidentTypes(types);
      }
    };
  };

  render() {
    return null;
  };
};

GetIncidentTypesDetails.contextType = IncidentContext;

export default stripesConnect(
  GetIncidentTypesDetails,
  '@spokane-folio/security-incident'
);
