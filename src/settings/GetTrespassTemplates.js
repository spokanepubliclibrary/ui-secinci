import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { IncidentContext } from '../contexts/IncidentContext';

class GetTrespassTemplates extends React.Component {
  static contextType = IncidentContext;
  static manifest = Object.freeze({
    trespassTemplates: {
      type: 'okapi',
      path: 'incidents/configurations/trespass-templates',
      records: 'data.value.templates',
      throwErrors: false // prevent error modal if empty on first pass
    },
  });

  static propTypes = {
    resources: PropTypes.object.isRequired,
    handleFetchedTrespassTemplates: PropTypes.func,
  };

  componentDidMount() {
    this.fetchRecords();
  };

  componentDidUpdate(prevProps) {
    const resourceChanged =
      this.props.resources.trespassTemplates !==
      prevProps.resources.trespassTemplates;

    if (resourceChanged) {
      this.fetchRecords();
    };
  }; 

  fetchRecords = () => {
    const res = this.props.resources.trespassTemplates;
    if (!res?.hasLoaded) return; 

    const trespassTemplatesList = res?.records;
    if (!Array.isArray(trespassTemplatesList)) return;

    this.context.setTrespassTemplates(trespassTemplatesList);
  };

  render() {
    return null;
  };
};

export default stripesConnect(GetTrespassTemplates, '@spokane-folio/security-incident');