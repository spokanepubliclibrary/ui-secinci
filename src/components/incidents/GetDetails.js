import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { IncidentContext } from '../../contexts/IncidentContext';

class GetDetails extends React.Component {
  static contextType = IncidentContext;

  static manifest = Object.freeze({
    incident: {
      type: 'okapi',
      path: (_q, _p, _r, _logger, props) => `incidents/${props.id}`,
      records: '',
      throwErrors: false,
      accumulate: false  
    },
  });

  static propTypes = {
    id: PropTypes.string,
    resources: PropTypes.object.isRequired,
  };

  componentDidMount () { 
    this.trySetRecord(this.props);
  };

  componentDidUpdate(prevProps) {
    if (
      this.props.id !== prevProps.id ||  // navigation
      this.props.resources.incident !== prevProps.resources.incident // load complete
    ) {
      this.trySetRecord(this.props);
    }
  };

  trySetRecord({ resources }) {
    this.context.openLoadingDetails();
    const { incident } = resources;
    if (!incident?.hasLoaded || !incident.records?.length) return;
    // console.log("trySetRecord - incident --> ", JSON.stringify(incident, null, 2));

    // console.log("trySetRecord - incident.records[0] --> ", JSON.stringify(incident.records[0], null, 2));

    this.context.setSingleIncident(incident.records[0]);
    this.context.closeLoadingDetails();
  };

  render() {
    return null;
  };
};

GetDetails.contextType = IncidentContext;
export default stripesConnect(GetDetails, '@spokane-folio/security-incident');