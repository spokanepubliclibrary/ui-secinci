import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { IncidentContext } from '../../contexts/IncidentContext';

class GetName extends React.Component {
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
    isCustomWitness: PropTypes.object,
    handleGetWitnessName: PropTypes.func,
    handleGetCustName: PropTypes.func,
    handleGetCreatedByName: PropTypes.func,
    handleGetUpdatedByName: PropTypes.func,
    mutator: PropTypes.shape({
      customer: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  componentDidMount() {
    this.fetchName();
  };

  componentDidUpdate(prevProps) {
    if (this.props.uuid !== prevProps.uuid) {
      this.fetchName();
    }
  };

  fetchName() {
    // if we have a custom witness, skip the network call:
    if (this.props.isCustomWitness) {
      const customWitnessRecord = {
        id: this.props.isCustomWitness.id,
        barcode: this.props.isCustomWitness.barcode,
        firstName: this.props.isCustomWitness.firstName,
        lastName: this.props.isCustomWitness.lastName,
        role: this.props.isCustomWitness.role,
        phone: this.props.isCustomWitness.phone,
        email: this.props.isCustomWitness.email,
        isCustom: this.props.isCustomWitness.isCustom
      };
      this.props.handleGetWitnessName(customWitnessRecord);
      return;
    }

    // fetch customer at /users via uuid
    if (this.props.uuid) {
      this.props.mutator.customer
        .GET({
          path: `users/${this.props.uuid}`,
          throwErrors: false
        })
        .then((response) => {
          if (response && response.httpStatus === 404) {
            console.log(`@GetName: user for uuid="${this.props.uuid}" not found.`);
            return;
          };


          if (response && response.id) {
            const refinedRecord = {
              id: response.id,
              barcode: response.barcode,
              firstName: response.personal.firstName,
              lastName: response.personal.lastName,
              profilePicLinkOrUUID: response.personal.profilePictureLink ? response.personal.profilePictureLink : ''
            };

            if (this.props.context === 'customer') {
              this.props.handleGetCustName(refinedRecord);
            } else if (this.props.context === 'witness') {
              this.props.handleGetWitnessName(refinedRecord);
            } else if (this.props.context === 'createdBy') {
              this.props.handleGetCreatedByName(refinedRecord);
            } else if (this.props.context === 'updatedBy') {
              this.props.handleGetUpdatedByName(refinedRecord);
            } else {
              console.log('@fetchName - something went wrong - no data context recognized');
            }
          };
        })
        .catch((error) => {
          // if stripes-connect rejects the promise
          if (error?.httpStatus === 404) {
            console.log(`@GetName: user for uuid="${this.props.uuid}" not found.`);
            this.props.handleMissingUsers(this.props.uuid)
            return;
          }
          console.error('@GetName: unhandled error fetching user:', error);
        });
    };
  };

  render() {
    return null; 
  };
};

export default stripesConnect(GetName, '@spokane-folio/security-incident');
