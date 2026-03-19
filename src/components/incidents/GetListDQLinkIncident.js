import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { getHeaderWithCredentials } from '@folio/stripes/util';
import { IncidentContext } from '../../contexts/IncidentContext';

class GetListDQLinkIncident extends React.Component {
  static contextType = IncidentContext;

  constructor(props) {
    super(props);
    const { stripes } = this.props;
    const { okapi } = stripes;
    this.okapiURL = okapi.url;
  };

  static propTypes = {
    stripes: PropTypes.object.isRequired,          
    history : PropTypes.object,
  };

  componentDidMount() { this.fetchListDQLinkIncident(); }
  componentDidUpdate() {
    if (this.props.queryStringLinkIncident !== this.lastQuery) this.fetchListDQLinkIncident();
  }

  fetchListDQLinkIncident = async () => {
    const { stripes } = this.props;
    const credsObj = getHeaderWithCredentials(stripes.okapi);        
    const qs         = this.props.queryStringLinkIncident;
    this.lastQuery   = qs;

    this.context.openLoadingSearch();

    // console.log("@fetchListDQLinkIncident - qs --> ", qs)

    const mergedHeaders = {
      ...credsObj.headers, 
    }

    const options = {
      ...credsObj,
      headers: mergedHeaders
    }

    try {
      const resp = await fetch(
        `${this.okapiURL}/incidents?${qs}`, 
        options
      );

      if (!resp.ok) throw new Error(`server ${resp.status}`);

      const json = await resp.json();

      this.props.setIncidentsListForLink(prev => {
        if (this.props.offset === 0) return json.incidents; // first page replaces
        const next = [...prev, ...json.incidents];
        // dedupe by id 
        const seen = new Set();
        return next.filter(r => {
          const id = r.id || r._id;
          if (!id) return true;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
      });
      this.props.setTotalResultsForLink(json.totalRecords);
      
    } catch (err) {
      console.error('@fetchListDQLinkIncident - incident fetch failed', err);
    } finally {
      this.context.closeLoadingSearch();
    }
  };

  render() { return null; }
};

export default stripesConnect(GetListDQLinkIncident,'@spokane-folio/security-incident');