import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { IncidentContext } from '../../contexts/IncidentContext';

class GetSelf extends React.Component {
  static contextType = IncidentContext;

  static manifest = Object.freeze({
    self: {
      type: 'okapi',
      accumulate: true,
    },
  });

  static propTypes = {
    self: PropTypes.shape({
      records: PropTypes.object,
    }),
    mutator: PropTypes.shape({
      self: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  componentDidMount() {
    this.fetchSelf();
  }

  componentDidUpdate(prevProps) {
    if (this.props.self !== prevProps.self) {
      this.fetchSelf();
    }
  }

  fetchSelf() {
    this.props.mutator.self
      .GET({ path: `bl-users/_self` })
      .then((records) => {
        const self = records.user;
        const refinedSelf = {
          id: self.id,
          lastName: self.personal.lastName,
          firstName: self.personal.firstName,
          barcode: self.barcode ? self.barcode : '',
        };
        this.context.setSelf(refinedSelf);
      })
      .catch((error) => {
        console.log(
          '@fetchSelf - something went wrong - no data. Error: ',
          JSON.stringify(error, null, 2)
        );
      });
  }

  render() {
    return <></>;
  }
}

GetSelf.contextType = IncidentContext;

export default stripesConnect(GetSelf, '@spokane-folio/security-incident');