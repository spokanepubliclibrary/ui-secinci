import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { getHeaderWithCredentials } from '@folio/stripes/util';
import { IncidentContext } from '../../contexts/IncidentContext';

class GetSummary extends React.Component {
  static contextType = IncidentContext;

  static propTypes = {
    stripes: PropTypes.object.isRequired,
    ids: PropTypes.arrayOf(PropTypes.string).isRequired, 
    onResult: PropTypes.func.isRequired,                  
  };

  constructor(props) {
    super(props);
    this.okapiURL = props.stripes.okapi.url;
    this._isMounted = false;
    this._lastIdsSignature = this.makeIdsSignature(props.ids);
    this._abortController = null;
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetchIncidentSummaries(this.props.ids);
  }

  componentDidUpdate(prevProps) {
    const prevSig = this.makeIdsSignature(prevProps.ids);
    const nextSig = this.makeIdsSignature(this.props.ids);

    if (prevSig !== nextSig) {
      this._lastIdsSignature = nextSig;
      this.fetchIncidentSummaries(this.props.ids);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this._abortController) this._abortController.abort();
  }

  makeIdsSignature = (idsInput) => {
    // normalize -> sort unique array -> JSON string
    const arr = Array.isArray(idsInput) ? idsInput : Array.from(idsInput || []);
    const uniqSorted = Array.from(new Set(arr)).sort();
    return JSON.stringify(uniqSorted);
  };

  fetchIncidentSummaries = async (idsInput) => {
    const ids = Array.isArray(idsInput) ? idsInput : Array.from(idsInput || []);
    if (!ids.length) {
      this.props.onResult([]);
      return;
    }

    // cancel any in-flight batch
    if (this._abortController) this._abortController.abort();
    this._abortController = new AbortController();

    const credsObj = getHeaderWithCredentials(this.props.stripes.okapi);
    const headers = { ...credsObj.headers }; 

    try {
      // TODO set open for loading spinner on linkedTo UI list 

      const fetchOne = async (id) => {
        const resp = await fetch(`${this.okapiURL}/incidents/${id}`, {
          ...credsObj,
          headers,
          signal: this._abortController.signal,
        });
        if (!resp.ok) throw new Error(`GET /incidents/${id} -> ${resp.status}`);
        const json = await resp.json();

        // prefer server-provided preview; fallback builds a minimal preview
        const customers =
          (json.previewForLinkedToUI?.customers) ||
          (json.customers || []).map(c => c.customerNameLabel || '').filter(Boolean);

        return {
          id: json.previewForLinkedToUI?.id || json.id,
          createdDate:
            json.previewForLinkedToUI?.createdDate ||
            json.metadata?.createdDate ||
            null,
          customers,
        };
      };

      const summaries = await Promise.all(ids.map(fetchOne));

      if (this._isMounted) this.props.onResult(summaries);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('GetSummary: fetch failed', err);
        if (this._isMounted) this.props.onResult([]);
      }
    } finally {
      // TODO set close for loading spinner on linkedTo UI list 
    }
  };

  render() {
    return null; 
  };
};

export default stripesConnect(GetSummary, '@spokane-folio/security-incident');
