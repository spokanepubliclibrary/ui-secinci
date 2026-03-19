import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { IncidentContext } from '../../contexts/IncidentContext';

class GetPatronGroups extends React.Component {
  static contextType = IncidentContext;

  static manifest = Object.freeze({
    patronGroups: {
      type: 'okapi',
      accumulate: true,
    },
  });

  static propTypes = {
    context: PropTypes.string,
    uuid: PropTypes.string,
    patronGroups: PropTypes.shape({
      records: PropTypes.object,
    }),
    mutator: PropTypes.shape({
      patronGroups: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  componentDidMount() {
   this.fetchPatronGroups();
  };

  fetchPatronGroups() {
    this.props.mutator.patronGroups
    .GET({ path: `groups?query=cql.allRecords=1%20sortby%20group&limit=2000`})
    .then((records) => {
      const titlesAndIds = records.usergroups.map((pg) => {
        return {
          id: pg.id,
          group: pg.group
        }
      });
      this.props.setPatronGroups(titlesAndIds)
    })
  };

  render() {
    return null;
  };
};

export default stripesConnect(GetPatronGroups, '@spokane-folio/security-incident');