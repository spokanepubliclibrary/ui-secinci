import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';

class PutLocationsInService extends React.Component {
  static manifest = Object.freeze({
    locationsInServicePUT: {
      type: 'okapi',
      path: `incidents/configurations/locations-in-service`, 
      PUT: {
        path: `incidents/configurations/locations-in-service`, 
      }
    },
  }); 

  static propTypes = {
    data: PropTypes.object,
    mutator: PropTypes.shape({
      locationsInServicePUT: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    setShow: PropTypes.func // optional, passed from LocationsPaneset only
  };

  static defaultProps = {
    setShow: () => {}, // fallback when not supplied
  };

  componentDidMount() {
    if (this.props.data) {
      this.updateLocationsInService(this.props.data);
    }
  };

  updateLocationsInService = (data) => {
    this.props.mutator.locationsInServicePUT
      .PUT(data)
      .then(() => {
        this.props.setShow(true)    
      })
      .catch((error) => {
        console.error('error updating: ', error);
      });
  };

  render() {
    return null;
  };
};

export default stripesConnect(PutLocationsInService, '@spokane-folio/security-incident');