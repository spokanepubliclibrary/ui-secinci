import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
class GetSingleIncidentTypeDetails extends React.Component {
  static manifest = Object.freeze({
    incidentTypes: {
      type: 'okapi',
      path: 'incidents/configurations/incident-types',
      records: 'data.value.incidentTypes',
      throwErrors: false
    },
  });

  static propTypes = {
    resources: PropTypes.object.isRequired,
    detailsId: PropTypes.string.isRequired,
    handleFetchedDetails: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.fetchRecord(this.props.detailsId);
  };

  componentDidUpdate(prevProps) {
    const resourceChanged = 
      this.props.resources.incidentTypes !== 
      prevProps.resources.incidentTypes;
    const idChanged = this.props.detailsId !== prevProps.detailsId;

    if (idChanged || resourceChanged) {
      this.fetchRecord(this.props.detailsId);
    };
  };

  fetchRecord(id) {
    const res = this.props.resources.incidentTypes;
    console.log("res --> ", JSON.stringify(res, null, 2))
    if (!res?.hasLoaded) return; 

    const incTypesRecords = res?.records;
    console.log("incTypesRecords --> ", JSON.stringify(incTypesRecords, null, 2));


    const singleType = incTypesRecords.find((type) => type.id === id);
    this.props.handleFetchedDetails(singleType);
    if (singleType) {
      console.log("singleType --> ", JSON.stringify(singleType, null, 2));
      this.props.handleFetchedDetails(singleType);
    }
  };

  render() {
    return null;
  };
};

export default stripesConnect(
  GetSingleIncidentTypeDetails,
  '@spokane-folio/security-incident'
);