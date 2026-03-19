import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { IncidentContext } from '../contexts/IncidentContext';

class GetIncidentTypesIds extends React.Component {
  static contextType = IncidentContext;
  /* 
    'incTypesIds' named manifest key so no collision with 'incidentTypes' manifest key at GetIncidentTypesDetails.
    GetIncidentTypesIds requests at the same /incident-types endpoint that
    GetIncidentTypesDetails utilizes. GetIncidentTypesIds is for convenience. 
  */ 
  static manifest = Object.freeze({
    incTypesIds: {
      type: 'okapi',
      path: 'incidents/configurations/incident-types'
    },
  });

  static propTypes = {
    resources: PropTypes.object.isRequired,
    // not required, used in context of <IncidentTypesPaneset />
    handleGetTypesList: PropTypes.func,
    // leave use of oneOf for future addition
    contextTypeProp: PropTypes.oneOf(['incident-types-paneset'])
  };

  componentDidMount() {
    this.fetchRecords();
  };

  componentDidUpdate(prevProps) { 
    const resourceChanged = 
    this.props.resources.incTypesIds !== 
    prevProps.resources.incTypesIds;
    if (resourceChanged) {
     this.fetchRecords();
    };
  };

  fetchRecords() {
    // console.log("this.props.resources --> ", JSON.stringify(this.props.resources, null, 2))
    const incTypesIdsBody = this.props.resources.incTypesIds;
    // console.log("incTypesIdsBody --> ", JSON.stringify(incTypesIdsBody, null, 2))
    if (!incTypesIdsBody?.hasLoaded) return; 
    
    const incTypes = incTypesIdsBody?.records[0]?.data?.value?.incidentTypes;
    // console.log("incTypes --> ", JSON.stringify(incTypes, null, 2));
    
    if (incTypes) {
      const types = incTypes;
      const titlesAndIds = types.map((type) => ({
        id: type.id,
        title: type.title,
      }));

      // console.log("titlesAndIds --> ", JSON.stringify(titlesAndIds, null, 2));

      if (this.props.contextTypeProp === 'incident-types-paneset') {
        this.props.handleGetTypesList(titlesAndIds);
      };

      this.context.setIncidentTypesNamesIdsList(titlesAndIds);
    };
  };

  render() {
    return null;
  };
};

GetIncidentTypesIds.contextType = IncidentContext;

export default stripesConnect(GetIncidentTypesIds, '@spokane-folio/security-incident');
