import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { IncidentContext } from '../../contexts/IncidentContext';

class GetNameCreatedBy extends React.Component {
  static contextType = IncidentContext;
  static manifest = Object.freeze({
    customer: {
      type: 'okapi',
      accumulate: true,
      throwErrors: false // handle 4xx/5xx errors on our own
    },
  });

  static propTypes = {
    context: PropTypes.string,
    uuid: PropTypes.string,
    customer: PropTypes.shape({
      record: PropTypes.object,
    }),
    handleGetCreatedByName: PropTypes.func,
    mutator: PropTypes.shape({
      customer: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  componentDidMount() {
    this.fetchNameCreatedBy(this.props.uuid);
  };

  componentDidUpdate(prevProps) {
    if (this.props.uuid !== prevProps.uuid) {
      this.fetchNameCreatedBy(this.props.uuid);
    }
  };

  fetchNameCreatedBy(paramsId) {
    const idToFetch = paramsId || this.props.uuid

    if (idToFetch !== '') {
      this.props.mutator.customer
      .GET({ path: `users/${this.props.uuid}` })
      .then((response) => {
        if (response && response.httpStatus === 404) {
          console.log(`@GetNameCreatedBy: user for uuid="${this.props.uuid}" not found.`);
          return;
        };

        if (response && response.id) {
          const refinedRecord = {
            id: response.id,
            barcode: response.barcode,
            firstName: response.personal.firstName,
            lastName: response.personal.lastName,
          };
          this.props.handleGetCreatedByName(refinedRecord);
        };
      })
      .catch((error) => {
        // if stripes-connect rejects the promise
        if (error?.httpStatus === 404) {
          console.log(`@GetNameCreatedBy: user for uuid="${this.props.uuid}" not found in.`);
          this.props.handleMissingUsers(this.props.uuid)
          return;
        }
        console.error('@GetNameCreatedBy: unhandled error fetching user:', error);
      })
    } else {
      console.log('@fetchNameCreatedBy - something went wrong - no data');
    };
  };

 render() {
    return null;
  };
};

GetNameCreatedBy.contextType = IncidentContext;
GetNameCreatedBy.propTypes = {
  uuid: PropTypes.string,
  customer: PropTypes.shape({
    record: PropTypes.object,
  }),
  mutator: PropTypes.shape({
    customer: PropTypes.shape({
      GET: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
};

export default stripesConnect(GetNameCreatedBy, '@spokane-folio/security-incident');