import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { IncidentContext } from '../../contexts/IncidentContext';

class SearchCustomerOrWitness extends React.Component {
  static contextType = IncidentContext;

  static manifest = Object.freeze({
    customer: {
      type: 'okapi',
      accumulate: true,
    },
  });

  static propTypes = {
    term: PropTypes.string,
    customer: PropTypes.shape({
      records: PropTypes.object,
    }),
    mutator: PropTypes.shape({
      customer: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  componentDidMount() {
    this.fetchCustomer();
  }

  componentDidUpdate(prevProps) {
    if (this.props.term !== prevProps.term) {
      this.fetchCustomer(this.props.term);
    }
  }

  fetchCustomer() {
    if (this.props.term) {
      this.context.openLoadingSearch();
      let cleanedInput = this.props.term.replace(/[^\w\s]/g, '');
      const terms = cleanedInput.split(/\s+/).filter(Boolean);
      let completeQuery = ''

      const searchFields = [
        'personal.firstName',
        'personal.lastName',
        'personal.middleName',
        'barcode'
      ];

      const termQueries = terms.map((term) => {
        const encoded = encodeURIComponent(term);
        const orExpressions = searchFields
          .map((field) => `${field}="${encoded}*"`)
          .join(' or ');
        return `(${orExpressions})`;
      });

      completeQuery = termQueries.join(' and ');

      const finalQuery = `(${completeQuery}) sortby personal.lastName personal.firstName`;
      // console.log('@SearchCustomerOrWitness - finalQuery: ', finalQuery);

      this.props.mutator.customer
        .GET({ path: `users?query=${finalQuery}&limit=1000` })
        .then((records) => {
          const list = records.users;
          const refinedList = list.map((user) => {
            return {
              id: user.id,
              barcode: user.barcode,
              firstName: user.personal.firstName,
              lastName: user.personal.lastName,
              middleName: user.personal.middleName,
              active: user.active,
              profilePicLinkOrUUID: user.personal.profilePictureLink ? user.personal.profilePictureLink : '',
              patronGroup: user.patronGroup
            };
          });
          // console.log("@SearchCustomerOrWitness - refinedList: ", JSON.stringify(refinedList, null, 2))
          this.context.setCustomers(refinedList);
          this.context.closeLoadingSearch();
        });
    } else {
      console.log('@fetchCustomer - something went wrong - no data');
    }
  };

  render() {
    return <></>;
  };
};

SearchCustomerOrWitness.contextType = IncidentContext;
SearchCustomerOrWitness.propTypes = {
  term: PropTypes.string,
  customer: PropTypes.shape({
    records: PropTypes.object,
  }),
  mutator: PropTypes.shape({
    customer: PropTypes.shape({
      GET: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
};

export default stripesConnect(SearchCustomerOrWitness, '@spokane-folio/security-incident');
