import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { IncidentContext } from '../contexts/IncidentContext';

class GetIncidentCategories extends React.Component {
  static contextType = IncidentContext;
  static manifest = Object.freeze({
    incidentCategories: {
      type: 'okapi',
      path: 'incidents/configurations/incident-categories',
      records: 'data.value.categories',
      throwErrors: false // prevent error modal if empty on first pass
    },
  });

  static propTypes = {
    resources: PropTypes.object.isRequired,
    handleFetchedCategories: PropTypes.func,
  };

  componentDidMount() {
    this.fetchRecords();
  };

  componentDidUpdate(prevProps) {
   const resourceChanged = 
    this.props.resources.incidentCategories !==
    prevProps.resources.incidentCategories;

   if (resourceChanged) {
    this.fetchRecords();
   };
  };

  fetchRecords = () => {
    const incidentCategoriesBody = this.props.resources.incidentCategories;
    // console.log("incidentCategoriesBody --> ", JSON.stringify(incidentCategoriesBody, null, 2));

    if (!incidentCategoriesBody?.hasLoaded) return; 

    const categories = incidentCategoriesBody?.records;
    this.context.setIncidentCategories(categories)  
  };

  render() {
    return null;
  };
};

GetIncidentCategories.contextType = IncidentContext;

export default stripesConnect(
  GetIncidentCategories,
  '@spokane-folio/security-incident'
);
