import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { IncidentContext } from '../../contexts/IncidentContext';
class GetLocations extends React.Component {
  static contextType = IncidentContext;

  static manifest = Object.freeze({
    locations: {
      type: 'okapi',
      path: 'locations?limit=100',
      accumulate: true,
    },
  });

  static propTypes = {
    locations: PropTypes.shape({
      records: PropTypes.object,
    }),

    context: PropTypes.object,
    mutator: PropTypes.shape({
      locations: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    // not required, used in context of <NewLocationsZones />
    handleFetchedLocations: PropTypes.func 
  };

  componentDidMount() {
    this.fetchLocations();
  }

  fetchLocations() {
    this.props.mutator.locations
      .GET({ path: `locations?limit=100` })
      .then((records) => {
        const data = records.locations;
        const names = data.map((record) => {
          return record.discoveryDisplayName;
        });
        if (this.props.context === 'new-location-zones' || this.props.context === 'opt-in-locations') {
          this.props.handleFetchedLocations(names);
        }
        this.context.setLocations(names);
      });
  }

  render() {
    return <></>;
  }
}

GetLocations.contextType = IncidentContext;

export default stripesConnect(GetLocations, '@spokane-folio/security-incident');