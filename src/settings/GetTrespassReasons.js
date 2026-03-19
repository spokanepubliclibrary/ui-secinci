import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { IncidentContext } from '../contexts/IncidentContext';

class GetTrespassReasons extends React.Component {
  static contextType = IncidentContext;
  static manifest = Object.freeze({
    trespassReasons: {
      type: 'okapi',
      path: 'incidents/configurations/trespass-reasons',
      records: 'data.value.trespassReasons',
      throwErrors: false
    },
  });

  static propTypes = {
    resources: PropTypes.object.isRequired,
    handleFetchedTrespassReasons: PropTypes.func,
    reloadKey: PropTypes.number // not required (invoked by Settings <TrespassReasonsPaneset> on new tr)
  };

  componentDidMount() {
    this.fetchRecords();
  };

  componentDidUpdate(prevProps) {
    // if parent bumped reloadKey make stripes refetch now
    if (this.props.reloadKey !== prevProps.reloadKey) {
      this.props.mutator.trespassReasons.reset?.();
      this.props.mutator.trespassReasons.GET?.();
      return;
    }
   const resourceChanged = 
    this.props.resources.trespassReasons !==
    prevProps.resources.trespassReasons;

   if (resourceChanged) {
    this.fetchRecords();
   };
  };

  fetchRecords = () => {
    const trBody = this.props.resources.trespassReasons;
    if (!trBody?.hasLoaded || trBody?.isPending) return; // don't hit trespassReasons context value w/ partial

    const reasons = trBody?.records;
    if (Array.isArray(reasons)) {
      this.context.setTrespassReasons(reasons)  
    } else {
      console.error(
        `Error: skip setter, records not array`
      );
    }
  };

  render() {
    return null;
  };
};

GetTrespassReasons.contextType = IncidentContext;

export default stripesConnect(
  GetTrespassReasons,
  '@spokane-folio/security-incident'
);