import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { IncidentContext } from '../contexts/IncidentContext';
import alphabetize from './helpers/alphabetize';

class GetLocationsInService extends React.Component {
  static contextType = IncidentContext;
  static manifest = Object.freeze({
    locationsInService: {
      type: 'okapi',
      path: 'incidents/configurations/locations-in-service', 
      records: 'data.value.locationsInService',
      throwErrors: false // prevent error modal if empty on first pass
    },
  });

  static propTypes = {
    resources: PropTypes.object.isRequired,
    handleFetchedLocationsInService: PropTypes.func,
  };

  componentDidMount() {
    this.fetchRecords();
  };

  componentDidUpdate(prevProps) {
    const resourceChanged = 
      this.props.resources.locationsInService !== 
      prevProps.resources.locationsInService;

    if (resourceChanged) {
      this.fetchRecords();
    };
  };

  fetchRecords() {
    const res = this.props.resources.locationsInService;
    if (!res?.hasLoaded) return; 

    const locationsInServiceList = res?.records;
    if (!Array.isArray(locationsInServiceList)) return;

    this.context.setLocationsInService(alphabetize(locationsInServiceList))
  };

  render() {
    return null;
  };
};

GetLocationsInService.contextType = IncidentContext;

export default stripesConnect(GetLocationsInService, '@spokane-folio/security-incident');