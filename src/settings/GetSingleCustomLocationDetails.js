import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';

class GetSingleCustomLocationDetails extends React.Component {
  static manifest = Object.freeze({
    customLocations: {
      type: 'okapi',
      path: 'configurations/entries?query=module==security-incident and configName=custom-locations and enabled=true',
      accumulate: true,
    },
  });

  static propTypes = {
    customLocations: PropTypes.shape({
      records: PropTypes.arrayOf(PropTypes.object),
    }),
    detailsId: PropTypes.string.isRequired,
    handleFetchedDetails: PropTypes.func.isRequired,
    mutator: PropTypes.shape({
      customLocations: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  componentDidMount() {
    this.fetchCustomLocationDetails(this.props.detailsId);
  }

  componentDidUpdate(prevProps) {
    if (this.props.detailsId !== prevProps.detailsId) {
      this.fetchCustomLocationDetails(this.props.detailsId);
    }
  }

  fetchCustomLocationDetails(id) {
    this.props.mutator.customLocations
      .GET({ path: 'configurations/entries?query=module==security-incident and configName=custom-locations and enabled=true' })
      .then((records) => {
        const valueObject = JSON.parse(records.configs[0].value);
        const locations = valueObject.customLocations;
        const singleLocation = locations.find((loc) => loc.id === id);
        this.props.handleFetchedDetails(singleLocation);
      })
      .catch((error) => {
        // placeholder
        console.log('error fetching single custom location: ', error.message);
      });
  }

  render() {
    return <></>;
  }
}

export default stripesConnect(
  GetSingleCustomLocationDetails,
  '@spokane-folio/security-incident'
);
