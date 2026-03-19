import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';

class PutIncidentType extends React.Component {
  static manifest = Object.freeze({
    incidentTypes: {
      type: 'okapi',
      path: `incidents/configurations/incident-types`,
      PUT: {
        path: `incidents/configurations/incident-types`,
      },
      accumulate: true,
    },
  });

  static propTypes = {
    data: PropTypes.string,
    mutator: PropTypes.shape({
      incidentTypes: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    handleCloseNew: PropTypes.func.isRequired,
    handleCloseEdit: PropTypes.func.isRequired,
    handleDeleteSuccess: PropTypes.func.isRequired,
    context: PropTypes.string.isRequired,
  };

  componentDidMount() {
    if (this.props.data) {
      this.updateIncidentType(this.props.data);
    }
  }

  updateIncidentType = (data) => {
    console.log("@updateIncidentType - data passed in --> ", JSON.stringify(this.props.data, null, 2))
    this.props.mutator.incidentTypes
      .PUT(data)
      .then(() => {
        if (this.props.context === 'new') {
          this.props.handleCloseNew();
        } else if (this.props.context === 'edit') {
          this.props.handleCloseEdit();
        } else if (this.props.context === 'details') {
          this.props.handleDeleteSuccess();
        }
        console.log('update successful');
      })
      .catch((error) => {
        console.error('error updating: ', error);
      });
  };

  render() {
    return null;
  };
};

export default stripesConnect(PutIncidentType, '@spokane-folio/security-incident');
