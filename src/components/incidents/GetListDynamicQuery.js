import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { getHeaderWithCredentials } from '@folio/stripes/util';
import { IncidentContext } from '../../contexts/IncidentContext';

class GetListDynamicQuery extends React.Component {
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

  componentDidMount() { this.fetchListDynamicQuery(); }
  componentDidUpdate() {
    if (this.context.queryString !== this.lastQuery) this.fetchListDynamicQuery();
  }

  fetchListDynamicQuery = async () => {
    const { stripes } = this.props;
    const credsObj = getHeaderWithCredentials(stripes.okapi);        
    const qs         = this.context.queryString;
    this.lastQuery   = qs;

    this.context.openLoadingSearch();

    const mergedHeaders = {
      ...credsObj.headers, // tenant / token / content-type
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
      this.context.setTotalResults(json.totalRecords);
      this.context.setIncidentsList(json.incidents);
    } catch (err) {
      console.error('incident fetch failed', err);
    } finally {
      this.context.closeLoadingSearch();
    }
  };

  render() { return null; }
};


export default stripesConnect(GetListDynamicQuery,'@spokane-folio/security-incident');
